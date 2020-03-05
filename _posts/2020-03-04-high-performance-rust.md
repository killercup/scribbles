---
title: Cheap tricks for high-performance Rust
categories:
- rust
discussions:
  "Reddit": "https://www.reddit.com/r/rust/comments/fdbszu/cheap_tricks_for_highperformance_rust/"
  "Twitter": "https://twitter.com/killercup/status/1235127402520604672"
---
So you're writing Rust but it's not fast enough?
Even though you're using `cargo build --release`?
Here's some small things you can do to increase the runtime speed of a Rust project
– practically without changing any code!

Please remember that the following suggestions **do not** replace actual profiling and optimizations!
I also think it goes without saying that the only way to detect if any of this helps
is having benchmarks that represent how your application behaves under real usage.

## Tweaking our `release` profile

Let's first of all enable some more optimizations
for when we do `cargo build --release`.
The deal is pretty simple:
We enable some features that make building release builds even slower
but get more thorough optimizations as a reward.

We add the flags described below to our main `Cargo.toml` file,
i.e., the top most manifest file in case you are using a [Cargo workspace].
If you don't already have a section called `profile.release`, add it:

```toml
[profile.release]
```

### Link-time optimization

The first thing we'll do is enable [link-time optimization] (LTO).
It's a kind of whole-program or inter-module optimization as it runs as the very last step
when linking the different parts of your binary together.
You can think of it as allowing
better inlining across dependency boundaries
(but it's of course more complicated that that).

Rust can use multiple linker flavors,
and the one we want is "optimize across all crates", which is called "fat".
To set this, add the [`lto`] flag to your profile:

```toml
lto = "fat"
```

### Code generation units

Next up is a similar topic.
To speed up compile times, Rust tries to split your crates into small chunks
and compile as many in parallel as possible.
The downside is that there's less opportunities for the compiler
to optimize code across these chunks.
So, let's [tell it][`codegen-units`] to do one chunk per crate:

```toml
codegen-units = 1
```

### Setting a specific target CPU

By default, Rust wants to build a binary that works on as many machines
of the target architecture as possible.
However, you might actually have a pretty new CPU with cool new features!
To [enable][`target-cpu`] those, we add

```console
-C target-cpu=native
```

as a "Rust flag",
i.e. the environment variable `RUSTFLAGS`
or the target's `rustflags` field in your [`.cargo/config`].

### Aborting

Now we get into some of the more unsafe options.
Remember how Rust by default uses [stack unwinding]
(on the most common platforms)?
That costs performance!
Let's skip stack traces and the ability to catch panics
for reduced code size and better cache usage:

```toml
panic = "abort"
```

Please note that some libraries might depend on unwinding
and will explode horribly if you enable this!

## Using a different allocator

One thing many Rust programs do is allocate memory.
And they don't just do this themselves but actually use an (external) library for that:
an allocator.
Current Rust binaries use the default system allocator by default,
previously they included their own with the standard library.
(This change has lead to smaller binaries and better debug-abiliy
which made some people quite happy).

Sometimes your system's allocator is not the best pick, though.
Not to worry, we can change it!
I suggest giving both [jemalloc] and [mimalloc] a try.

### jemalloc

[jemalloc] is the allocator that Rust previously shipped with
and that the Rust compiler still uses itself.
Its focus is to reduce memory fragmentation and support high concurrency.
It's also the default allocator on FreeBSD.
If this sounds interesting to you, let's give it a try!

First off, add the [`jemallocator`] crate as a dependency:

```toml
[dependencies]
jemallocator = "0.3.2"
```

Then in your applications entry point (`main.rs`),
set it as the global allocator like this:

```rust
#[global_allocator]
static GLOBAL: jemallocator::Jemalloc = jemallocator::Jemalloc;
```

Please note that jemalloc doesn't support all platforms.

### mimalloc

Another interesting alternative allocator is [mimalloc].
It was developed by Microsoft, has quite a small footprint,
and some innovative ideas for free lists.

It also features configurable security features
(have a look at [its `Cargo.toml`][`mimalloc` features]).
Which means we can turn them off more performance!
Add the [`mimalloc` crate] as a dependency like this:

```toml
[dependencies]
mimalloc = { version = "0.1.17", default-features = false }
```

and, same as above, add this to your entry point file:

```rust
#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;
```

## Profile Guided Optimization

This is a neat feature of LLVM
but I've never used it.
Please read [the docs][pgo].

## Actual profiling and optimizing your code

Now this is where you need to actually adjust your code
and fix all those `clone()` calls.
Sadly, this is a topic for another post!
(While you wait another year for me to write it, you can read about [cows]!)

**Edit:** People keep asking for those actual tips on how to optimize Rust code.
And luckily ~~I tricked them~~ they had some good material for me to link to:

- The very convenient [`cargo flamegraph`](https://github.com/flamegraph-rs/flamegraph) (also works as a standalone tool)
- Christopher Sebastian recently published [How To Write Fast Rust Code](https://likebike.com/posts/How_To_Write_Fast_Rust_Code.html)
- Robin Freyler's [Fastware Workshop](http://troubles.md/posts/rustfest-2018-workshop/) from RustFest 2018


[Cargo workspace]: https://doc.rust-lang.org/1.41.1/book/ch14-03-cargo-workspaces.html
[link-time optimization]: https://llvm.org/docs/LinkTimeOptimization.html
[`lto`]: https://doc.rust-lang.org/1.41.1/rustc/codegen-options/index.html#lto
[`codegen-units`]: https://doc.rust-lang.org/1.41.1/rustc/codegen-options/index.html#codegen-units
[`target-cpu`]: https://doc.rust-lang.org/1.41.1/rustc/codegen-options/index.html#target-cpu
[panic flag]: https://doc.rust-lang.org/1.41.1/rustc/codegen-options/index.html#panic
[`opt-level`]: https://doc.rust-lang.org/1.41.1/rustc/codegen-options/index.html#opt-level
[jemalloc]: https://github.com/jemalloc/jemalloc
[`jemallocator`]: https://docs.rs/jemallocator
[mimalloc]: https://github.com/microsoft/mimalloc
[`mimalloc` crate]: https://docs.rs/mimalloc
[`mimalloc` features]: https://github.com/purpleprotocol/mimalloc_rust/blob/c6bf4578d3258a0b6a28696196ede6d50e5ee8c2/Cargo.toml#L25-L28
[stack unwinding]: https://doc.rust-lang.org/1.41.1/nomicon/unwinding.html
[pgo]: https://doc.rust-lang.org/1.41.1/rustc/profile-guided-optimization.html
[cows]: {% post_url 2018-06-02-secret-life-of-cows %}
[`.cargo/config`]: https://doc.rust-lang.org/1.41.1/cargo/reference/config.html
