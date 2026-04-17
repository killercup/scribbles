---
title: 'Random Forest ML on GPU'
publishDate: '2026-04-17'
updatedAt: '2026-04-17'
categories:
- rust
- bioinformatics
atUri: "at://did:plc:x67qh7v3fd7znbdhauc45ng3/site.standard.document/3mjopknuz472z"
---
In [my recent post on Rastair][rastair-post],
we looked at some performance best-practices and optimizations
for [Rastair], a bioinformatics tool that I'm currently working on.
One of the slowest parts of the tool
is running machine-learning inference on a Random Forest model.
In this post,
I want to describe what we use ML for,
and how we moved inference to a GPU compute shader
to make it fast.

[rastair-post]: https://deterministic.space/rastair.html "Notes on Rastair, a variant and methylation caller"

## Context

Rastair needs to make decisions on data that is prone to errors:
We analyze short genome sequencing reads
which have been stochastically aligned to a reference
and that give us many points of evidence for what base a position in a sample actually is.
They include some quality metrics (per-read and per-position),
information on possible insertions and deletions,
and many other flags.
We also know a general error rate for the instruments used.
But some evidence we look at can also be interpreted in two different ways.

The typical case in Rastair is this:
We have a position that is `C` in the reference
and we have 30 reads at this position.
Some show `C` (agree with the reference),
but some show `T`.
Since Rastair deals with [TAPS] sequence data,
we know that a change from `C` to `T` can also be evidence for methylation[^m].
So we now need to decide:
Is this a variant, or is this a methylation position, or can it even be both?

[TAPS]: https://www.nature.com/articles/s41587-019-0041-2 "TAPS paper in Nature Biotechnology"
[^m]: Simply put: A flag on a position.

For some cases we can pretty directly decide:
We know, e.g., that the `C` to `T` conversion only happens in `CG` contexts,
and on the original top strand (a flag on the read).
This helps *exclude* cases,
but it doesn't yet help us be certain about when a position is truly one or the other.

## Using ML

We can filter out some obvious cases with hard thresholds,
but for the ambiguous positions
we want something that can weigh many pieces of evidence at once.
This is where machine learning comes in.

[Benjamin] designed a set of features
that capture the relevant information about a position:
things like base quality, mapping quality, depth ratios,
the surrounding sequence context, and so on.
We feed these into a Random Forest model
that outputs a score for each position,
which we then convert into a probability
using [Platt scaling][platt] (also Benjamin's work).

[Benjamin]: https://www.ludwig.ox.ac.uk/team/benjamin-schuster-bockler "Benjamin Schuster-Böckler"
[platt]: https://en.wikipedia.org/wiki/Platt_scaling "Platt scaling on Wikipedia"

We actually run three separate models:
one for methylation in `CG` context,
one for *de-novo* methylation[^denovo],
and one for everything else (variants).
Each model is trained on data where we know the ground truth.

[^denovo]: A position where a variant creates a new `CG` site.
  For example: A `G` is changed to `C` and the following base is also `G`.
  Then in this sample, there is now a `CG` where in the reference it was `GG`.
  This `CG` can be methylated.

### What's a Random Forest

A Random Forest is an ensemble of decision trees.
A single decision tree is simple:
at each node, you look at one feature,
compare it to a threshold,
and go left or right.
When you reach a leaf, you get a prediction.
Easy to understand, fast to evaluate.
But a single tree tends to "overfit"[^of].

[^of]: It learns the training data too well and then makes poor predictions on new data
  because it memorized noise rather than the underlying pattern.

The "forest" part fixes this:
you train many trees (e.g., 400),
each on a slightly different random subset of the training data
and a random subset of features.
At inference time,
you run the input through all the trees
and average their predictions.
This is surprisingly effective[^rf]
and gives you a model that generalizes well
without needing a lot of tuning.

[^rf]: It's one of those techniques that is easy to underestimate because it's conceptually simple.
  I had never used this before this project and I'm amazed how quickly it yielded great results.

For our use case, this is a good fit:
The model is fast to evaluate (just comparisons and a mean),
it handles mixed feature types well,
and it doesn't require a GPU or a deep learning framework to train,
just some data in arrays.

There are many Rust crates that can train and run a RF.
We ended up using the [biosphere] crate,
because it seemed simple and purposeful enough
while also being quite fast.

[biosphere]: https://github.com/mlondschien/biosphere/ "biosphere: Simple, fast random forests."

### How to verify

How do we know the model actually makes good calls?
We compare against [Genome in a Bottle][giab] (GIAB),
a well-characterized reference dataset
that serves as a "ground truth" for benchmarking variant callers.
Benjamin wrote R scripts to evaluate our calls against this reference,
and I later ported that comparison to Rust.
This basically works by reading in the VCF file from GIAB
and the in the one that Rastair produces,
and comparing overlap, false-positive, and false-negative count.

Looking at 45× coverage data
at high-confidence regions of the GIAB reference call set,
Rastair achieves an F1 score of 98.9%.
Thich is on par with other state-of-the-art tools.
See our [paper] for more details.

[giab]: https://www.nist.gov/programs-projects/genome-bottle "Genome in a Bottle Consortium"
[paper]: https://www.biorxiv.org/content/10.64898/2026.03.19.712983v1 "Rastair: an integrated variant and methylation caller"

## Using a Compute Shader

So we have a Random Forest model that makes good predictions.
The problem is that we need to run it a *lot*:
Rastair processes millions of positions,
and for each position we might have multiple alternative alleles
that each need to be scored.
When profiling with [samply],
we saw that most time was spent in `biosphere`
doing float comparisons and pointer chasing.
Since Rastair already parallelizes across CPU cores
(see [my previous post][rastair-post] for details),
CPU usage is at 100% and our only options to make it faster are:
Do less work or do it somewhere else.
We already tried to do less work by adding some very broad filters[^prefilter].
So the question was:
Can we throw a GPU at this?

[samply]: https://github.com/mstange/samply/ "samply is a command line CPU profiler which uses the Firefox profiler as its UI"
[^prefilter]: E.g., don't run ML on positions with too little coverage because it would just say "no".

Random Forest inference is a good candidate for GPU acceleration:
each `(sample, tree)` pair is completely independent,
the operation is simple (comparisons and memory lookups),
and we have large batches to amortize the overhead.
We went with [wgpu],
which compiles compute shaders written in [WGSL] to Metal, Vulkan, and DX12.
This means the same code runs on my MacBook (Metal),
a Linux workstation with an NVIDIA or AMD card (Vulkan),
or even a Windows machine (DX12, untested).

[wgpu]: https://wgpu.rs/ "wgpu is a safe and portable graphics library for Rust based on the WebGPU API. It is suitable for general purpose graphics and compute on the GPU."
[WGSL]: https://www.w3.org/TR/WGSL/ "WebGPU Shading Language"

### Flattening the forest

The original `RandomForest` in `biosphere`
stores trees as heap-allocated recursive structure.
This makes building them easy when training,
but it's not great for shipping to a GPU.
The first step was to convert each tree
into a flat array of nodes in BFS (breadth-first) order
with explicit child indices
([code][flat_forest.rs]).
Each node is 16 bytes:

[flat_forest.rs]: https://github.com/Softleif/biosphere/blob/1d7c621fa54860a9b1d1807f0d6137b0c4aaafea/src/flat_forest.rs#L50-L57

```rust
#[repr(C)]
struct FlatNode {
    left: i32,     // child index, or -1 for leaves
    right: i32,
    feature_index: u32,
    value: f32,    // split threshold or leaf prediction
}
```

The `#[repr(C)]` is doing real work here:
it guarantees a fixed memory layout
so we can use [bytemuck] to cast the entire node slice to raw bytes
and upload it directly to the GPU.
The WGSL shader defines the same struct layout,
so the same bytes are interpreted identically on both sides
with no serialization or conversion step needed.

[bytemuck]: https://docs.rs/bytemuck/1.25.0/bytemuck/ "bytemuck, a crate for mucking around with piles of bytes"

The `value` field does double duty:
it's the split threshold for internal nodes
and the leaf prediction for leaf nodes.
`left < 0` tells you which case you're in.
This keeps the struct at exactly 16 bytes,
which means 4 nodes fit in a single 64-byte cache line.

Crucially, we use explicit child indices
rather than the implicit `2*i+1` / `2*i+2` layout
you might remember from textbook binary heaps.
Our real decision trees are rarely balanced,
and the implicit layout would require exponential padding
for deep, sparse trees.
With explicit indices, any tree shape works
without wasting memory.

I used Claude Code to implement this step.
It's the kind of well-defined data structure transformation
that works well with AI assistance,
and it works basically first try.

One more tweak:
All trees are padded to the same `max_tree_size`
so the GPU can index into them uniformly:
tree `t`, node `n` lives at `nodes[t * max_tree_size + n]`.
The padding slots are dummy leaves with `value = 0.0`,
so even if traversal somehow lands on one, it contributes nothing.

### The shaders

The GPU work happens in two compute shaders, both written in [WGSL].

Traverse
: Dispatch as `(ceil(n_samples / wg_size), n_trees, 1)`.
  Each GPU thread handles one (sample, tree) pair:
  it walks the flat node array from root to leaf,
  comparing features to thresholds,
  and writes the leaf value to a per-tree prediction buffer.

Reduce
: Dispatch as `(ceil(n_samples / wg_size), 1, 1)`.
  Each thread averages all per-tree predictions for one sample
  into the final output.

The shaders are short[^shaders] and I was pleasantly surprised
at how straightforward WGSL is for this kind of work.
The traverse kernel is essentially the same loop
as the CPU version,
just with GPU thread indexing instead of a for loop over samples.

[^shaders]: ~100 lines in total.
  Claude Code helped write these, so I didn't have to look up too much of the syntax.
  [code](https://github.com/Softleif/biosphere/tree/1d7c621fa54860a9b1d1807f0d6137b0c4aaafea/src/gpu/shaders)

### Multithreading and pipelining

Rastair is already multithreaded with Rayon,
and we want to keep the GPU busy
while the CPU threads prepare the next batch of features.
The `GpuForest` API supports this with two mechanisms,
forking and pipelined sumbission.

First, each worker thread calls `gpu.fork(batch_size)`
to get its own handle.
The forked handle shares the compiled pipelines and uploaded tree data
but has its own inference buffers,
so threads don't step on each other.

Then, we also support pipelined submission.
Instead of `predict()` (which blocks),
threads can call `predict_submit()` to start GPU work
and get back a `PredictHandle`.
We submit all three models (CpG, de-novo, others) before collecting any results,
which lets the GPU work on them concurrently.

### Verifying GPU results

Switching to GPU means switching to `f32`:
The GPU shaders operate entirely in 32-bit floats[^f32].
To make sure this doesn't change our results,
we first switched the CPU inference path to `f32` as well.
The `FlatForest` type casts feature values to `f32` before comparison
so that split decisions are identical to the GPU path.

[^f32]: I looked into this a bit and there is some `f64` support,
  but for this case it does not make much of a difference
  so I didn't pursue it.

The only remaining difference is accumulation precision:
`FlatForest` on CPU sums leaf values in `f64`,
while the GPU shader sums in `f32`.
We have tests that verify GPU and CPU predictions match
within this tolerance across various batch sizes,
including tricky workgroup boundary conditions.
If I remember correctly,
in our test there were less than 100 positions
that had any different results when switching.

### Unified memory

One more nice optimization
that makes a real difference on Apple Silicon:
unified memory.
On a discrete GPU,
data needs to be copied from CPU memory to GPU memory and back.
This means extra staging buffers and explicit copy commands.
But on "unified-memory architectures"
(which some APUs like Apple Silicon have)
the CPU and GPU share the same physical memory.

We detect this at startup
by checking for the `MAPPABLE_PRIMARY_BUFFERS` feature in wgpu.
When it's available,
we skip the staging buffers entirely:
the feature buffer gets `MAP_WRITE` usage (CPU writes directly),
and the output buffer gets `MAP_READ` (CPU reads directly).
On Metal, this maps to `MTLStorageModeShared`
which means zero-copy access from both sides.

This is a neat trick
that reduces memory pressure
and eliminates redundant data movement.
Typical HPC servers with discrete GPUs don't offer this,
so they pay for the staging copies,
but they also have much more raw compute to compensate.
In the end, this makes my laptop even more competitive with a server!

## What's next

If you work in this field and want to try Rastair,
check out the [website][Rastair] and the [paper][paper].
The `--gpu` flag enables GPU-accelerated ML predictions
on any machine with a Metal, Vulkan, or DX12 capable GPU.

I'll continue to write about interesting implementation details as they come up.
If you have questions or suggestions, let me know!

[Rastair]: https://www.rastair.com/ "Rastair website"
