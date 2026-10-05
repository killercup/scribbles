---
title: 'Nice CLI Crash Reports in Rust'
publishDate: '2026-10-05'
updatedAt: '2026-10-05'
categories:
  - rust
  - cli
---
While working on [Rastair] (see also [my post]),
I got back into one of my favorite niches in Rust:
Making nice CLI tools.
Rastair's job is to run as part of a bioinformatics pipeline
so very often people are just setting up the command once
and then it runs for their workloads on some cluster somewhere
whenever they need it.
That means that correctness and performance are critical[^fast],
but it would feel wrong not also to focus on ergonomics.

[Rastair]: https://www.rastair.com/ "Rastair, a variant and methylation caller"
[my post]: https://deterministic.space/rastair.html

[^fast]: Correctness is for the biologists to decide
  (we're doing quite well in benchmarks)
  but I'm proud to say that Rastair is already *super* fast
  and about to be even faster in the next release
  (with the current feature set).

## General ergonomics

First, Rastair has a lot of options
so we should deliver good documentation.
We are already using [clap], and thanks to [clap-markdown][clap-markdown]
we could get the entire CLI help as a nice documentation page
(which you can see [here][rastair-cli]).

[clap]: https://docs.rs/clap/4.6.7/clap/ "Command Line Argument Parser for Rust"
[clap-markdown]: https://docs.rs/clap-markdown/0.1.5/clap_markdown/
[rastair-cli]: https://www.rastair.com/cli.html

Second, I felt it was important to have decent logging,
but for me when developing but also when running the tool unattended
and later trying to make sense of what happens.
We're using [tracing] with its structured fields and `instrument` annotations,
and by default Rastair emits only a few lines per invocation:

[tracing]: https://docs.rs/tracing/0.1.44/tracing/ "Tracing is a framework for instrumenting Rust programs to collect structured, event-based diagnostic information"

```text {.wide}
2026-09-20T10:02:08.125068Z  WARN rastair::io::vcf_writer: Could not determine format from file extension, defaulting to VCF format without compression. filename="/dev/null"
2026-09-20T10:02:11.151326Z  INFO rastair::progress: Runtime estimate time_left=14s done_at=2026-09-20T10:02:26.131067123Z
2026-09-20T10:02:25.783904Z  INFO rastair::call::writer: Wrote VCF output file="/dev/null"
2026-09-20T10:02:25.784087Z  INFO rastair: Call finished duration=17.815028333s
```

You can also see one more goodie: A runtime estimate.
Not sure how valuable this is for most users,
but when testing this on my laptop, I often have to look at the output
and it's neat to know how long the run is going to take[^macos-ctrl-t].
As a bonus for users of terminals that support `OSC 9;4` progress bars:
Rastair now also emits those,
using the same library as `cargo`.
Would be cool if more environments could make use of this information.

[^macos-ctrl-t]: You can also press `ctrl+t` on macOS or send `SIGUSR1` on Linux
  to have Rastair print a new estimate.

But even if all of this is nice,
we need to think about one more aspect:
Making errors and *especially* crashes nice.

## How I handle errors in Rastair

When I started my implementation of Rastair last year,
I picked [color-eyre] for all my `Result` types:
It is similar to the very simple and popular `anyhow` crate
and adds a lot of niceties on top,
e.g. adding custom sections to your errors,
and capturing both spans from `tracing` as well as regular backtraces.

[color-eyre]: https://docs.rs/color-eyre/0.6.5/color_eyre/ "colorful, consistent, and well formatted error reports"

To get the most of it,
I keep adding `.wrap_err` to a lot of my calls
so that whenever possible the original error gets wrapped
with some more helpful context.
A typical example would be to add the position at which an error occurred
or the input file name.

Scrolling through my code I have to admit that
sometimes this turns a little silly when I overdo it,
e.g. [here](https://github.com/bsbludwig/rastair/blob/e1cc29b3775b8034d9c1d0fd7ff63834fda72699/src/bed/rastair1/vcf_to_bed.rs#L30-L36):

```rust {.wide}
let contig = r
  .rid()
  .wrap_err("Record has no ID")
  .and_then(|id| r.header().rid2name(id).wrap_err("Header does not contain ID"))
  .and_then(|name| str::from_utf8(name).wrap_err("Contig name is not valid UTF-8"))
  .map(SmolStr::new)
  .wrap_err("Could not fetch contig name")?;
```

The idea is that at the end everything is wrapped in the last `"Could not fetch contig name"`,
with the inner calls just being chained but without any early return.
So an example output would be:

```text
Error:
   0: Could not fetch contig name
   1: Header does not contain ID
   2: ID 7 not found in BCF/VCF header

Location:
   src/bed/rastair1/vcf_to_bed.rs:33
```

## This is a bug

Rust has two main ways of error propagation:
Returning `Result`s and unwinding the thread ("panicking").
When I hit an unrecoverable error situation,
I get to choose between these two.
Use a panicking method, which practically crashes the thread/program,
or treating it as a regular `Result` with an error.
There are pros and cons to both,
but in Rastair, I went with the latter.
I want to build up an error type with annotations and context,
so it feels a bit like a waste to just call `unwrap` on it afterwards[^considerations].

[^considerations]: And at which point do I unwrap/crash?
  At the inner most and rely on `tracing` spans to provide context?
  Or at an outer layer of the call tree, after I can add context?
  If the latter, then what's the difference between that
  and just bubbling up the error type to `main` and printing it there?

But now my "default errors" (e.g., file not found)
and "program errors" (e.g., index 5 not found after building a list)
are very similar!
So one specific annotation I like to add to errors is "this is a bug",
to indicate that this is *my* fault, not the user's.
This basically looks like this:

```rust {.wide}
pub trait ThisIsABug<T> {
    /// Note to user that this is a bug in the program not an expected error,
    /// and offer a pre-filled issue link for it.
    fn this_is_a_bug(self) -> Result<T, Report>;
}

impl<T, E> ThisIsABug<T> for Result<T, E> where E: Into<Report> {
  // ...
}
```

In Rastair's [implementation](https://github.com/bsbludwig/rastair/blob/3e6653536c0c881331687b5290fbe5cdb8061beb/src/utils/logging.rs#L129),
this wraps an error in a new `Bug` type
so that we can later differentiate the reporting.

## Crash reports

Avoiding `panic`s in your own code[^panic]
doesn't mean there are none in the code.
Libraries can still choose to panic on invalid input for example.
This means we should think about and handle panics in our program
regardless of our own coding style.

[^panic]: Typical ways to "panic":
 Using `.unwrap()` or `.expect(msg)`, indexing,
 `panic!(msg)`, or `todo!()`.

`color-eyre` provides two things, actually:
The error handling type (`Report`)
but also a panic handler.
By default, Rust prints panics like this
([playground](https://play.rust-lang.org/?version=stable&mode=debug&edition=2024&gist=24b5aa1715df84b19225583abf1e5455)):

```text {.wide}
thread 'main' (14) panicked at src/main.rs:2:5:
not yet implemented
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

but with a call to `color_eyre::install()?;` added, we get:

```text
The application panicked (crashed).
Message:  not yet implemented
Location: examples/crash.rs:4
```

This is a little more readable,
and we can customize it further.
In Rastair,
I add a few more additional flags to print a URL to open a new issue directly,
in case of a panic or a "bug" error:

```text {.wide}
The application panicked (crashed).
Message:  Injected panic at writer (time 3) via RASTAIR_INJECT_PANIC
Location: src/call/writer.rs:93

This is a bug in Rastair.

Consider reporting this error using this URL: https://github.com/bsbludwig/rastair/issues/new…
```

This URL is very long and, by default,
`color-eyre` doesn't try to limit it.
This becomes a problem when it includes a backtrace:
The URL grows to about 30 kB, far over the roughly 8 kB GitHub accepts.
Our work-around for now is to turn off `color-eyre`'s backtrace capturing
and instead print our own backtrace (with `-v` or `RUST_BACKTRACE`)
as a separate section, which does not end up in the URL.

### Testing crashes

Writing non-trivial code for handling crashes
means that I can add bugs to it,
which means I should write tests for this.
Rastair has a decent amount of CLI snapshot tests,
so why not also test what crashes look like?
Well, for that the program needs to crash
and we're usually doing our best to prevent that.
But maybe we can force it somehow?

Maybe you already saw it in the error message above:
Rastair (in debug builds) now reads a set of environment variables
at a few fixed points[^failpoint-vars]
and can inject crashes[^nih].
This allows us to write property-based tests for our crashes,
which is really cool:
We run Rastair with some data in a temporary directory
and construct a "scenario" which is a combination of fail points
(as environment variables).
Then, we assert that Rastair crashes, in the expected way.

[^failpoint-vars]: E.g., `RASTAIR_INJECT_ERROR=worker@6` or `RASTAIR_INJECT_SIGNAL=TERM:writer`
[^nih]: I saw the [fail](https://docs.rs/fail/0.5.1/fail/) crate also does this
  but with cargo features and some setup steps
  and is also stringly typed…
  so I made a very simple version for myself.

## Thinking about threads and writing files

One more thing that we have to consider in Rastair
is our usage of threads.
We have a [rayon] thread pool for our "workers"[^workers],
one (optional) thread coordinating GPU work,
and also one "writer" thread that receives finished data in order[^ordair]
and writes to the output file(s).

[rayon]: https://docs.rs/rayon/1.12.0/rayon/

[^workers]: We chunk up the input data and process small segments of it in parallel.
[^ordair]: I also finally made a crate for Rastair's specific use, called [ordair](https://github.com/Softleif/ordair). I might write about it in a future post.

We try to prevent a lot of issues by checking stuff before any processing happens,
e.g. making sure the ML model can be loaded,
the combination of CLI flags makes sense[^cli-sanity],
and that a GPU is available if requested (print warning and fall back to CPU).
But we can never catch everything.
What should happen when one of the workers crashes,
(e.g. because the input file is gone)?

[^cli-sanity]: CLI params are well-typed and clap parses them or exits with a nice error.
  In some cases we might "correct" them and print a warning,
  e.g. when the default output flag is used for a non-default file format.

There are a few possible answers:
- Crash the entire application.
  The output file is half written.
  This is what Rastair 2.2 does.
- Catch panic in worker, print a warning, and skip that segment.
  The output file looks complete but has missing segments.
  This can mean potentially crashing for every segment,
  and printing hundreds of warnings,
  until we're "done".
- Catch panic, skip segment, but also count how often this happens.
  Crash the application when it happens more than `n` times.

Historically, we have some missing features in Rastair
that caused it to crash at the very end[^end-crash].
This was pretty frustrating
but also not *that* critical since the output file was 99% there.
Except crashing the application means that all threads are killed by the operating system,
and that includes the writer thread,
and it might be writing a compressed file,
which really needs to be finished with a proper ending
or the entire last block is invalid.

[^end-crash]: This is where some unexpected segments in the input file were.

So, we should never *directly* crash the program when a worker crashes,
but instead first tell the writer to finish up,
and then exit the program cleanly,
with the right error code.
When there is an error in a segment,
we now skip the segment but also log it,
and fail the run once all other segments are done.

### Partial file writes

Here is one more thought:
In Rastair 2.2, we write the output file directly to the desired path.
This is easy and means it's the same code as writing to `stdout`.
But that means that if you don't look at the exit code or Rastair's logs
you might see an output file of a reasonable size
and assume it's complete.

To prevent confusing a half-finished file with a finished one,
we now first write `output.bcf.partial`,
and then after the writer got the last segment successfully,
it can rename the file.
(This also applies to index files we write next to the output.)

## Cancelling the run

Rastair can also be interrupted,
e.g. by the user pressing `ctrl+c`
or running `scancel` on the job.
A typical solution is to register a signal handler that sets a flag,
and gracefully stop processing data.
Receiving the signal again stops the program immediately.
For now, I decided against this in Rastair.
It would add more complexity but its main gain would be to
close one more compressed block into the partial file.
I assumed that a quicker exit and less code is better
than having a few more rows in a file that the user most likely will discard.
Since users will only find a `.partial` file, there is also nothing to confuse.

Since we assume people also use Rastair to pipe its output into other tools,
we also handle our `stdout` pipe being closed
by the program after us
in the same way.
We currently only write uncompressed output to `stdout`
so we can be interrupted at any time.

## What a crash now looks like

First, this is what an error looks like:

```text {.wide}
WARN rastair::runtime::segments: Output is incomplete: stopped before all segments were written written=2 total=20
WARN rastair::runtime::partial_output: VCF output left behind under its partial name file=b.vcf.gz.partial
Error:
   0: Failed to process regions in parallel
   1: Failed to write the output
   2: Injected error at writer (time 3) via RASTAIR_INJECT_ERROR

Note: Output files are incomplete and were left under their `.partial` names
```

And this is what a crash looks like:

```text {.wide}
2026-10-05T09:30:10.216603Z ERROR rastair::runtime::threads: A thread panicked, its crash report follows when the run ends panic="Injected panic at writer (time 3) via RASTAIR_INJECT_PANIC" location=src/call/writer.rs:93:9
2026-10-05T09:30:10.256757Z  WARN rastair::runtime::segments: Output is incomplete: stopped before all segments were written written=2 total=20
2026-10-05T09:30:10.257507Z  WARN rastair::runtime::partial_output: VCF output left behind under its partial name file=out.vcf.gz.partial

The application panicked (crashed).
Message:  Injected panic at writer (time 3) via RASTAIR_INJECT_PANIC
Location: src/call/writer.rs:93

This is a bug in Rastair.

Consider reporting this error using this URL: https://github.com/bsbludwig/rastair/issues/new?title=%3Cautogenerated-issue%3E&body=%23%23+Error%0A%60%60%60%0AInjected+panic+at+writer+%28time+3%29+via+RASTAIR_INJECT_PANIC%0A%60%60%60%0A%0A%23%23+Metadata%0A%7Ckey%7Cvalue%7C%0A%7C--%7C--%7C%0A%7C**version**%7C2.2.0%7C%0A%7C**pileup+backend**%7Chtslib%7C%0A%7C**location**%7Csrc%2Fcall%2Fwriter.rs%3A93%3A9%7C%0A

Error: 
   0: Failed to process regions in parallel
   1: Writing the output panicked (see the crash report above)

Note: Output files are incomplete and were left under their `.partial` names
```

Oh and we also support recovering from one kind of panic:
When the user wants to use a GPU,
but there is none configured:

```text {.wide}
ERROR rastair::runtime::threads: A thread panicked and recovered panic="Injected panic at gpu-dispatch (time 2) via RASTAIR_INJECT_PANIC" location=src/call/process/inference.rs:223:17 note="This is a bug in Rastair."
WARN process_region_wrapper{region=chr19:6102801-6104200}: rastair::call::process::inference: GPU inference failed, scoring the rest of the run on the CPU error="The GPU inference thread stopped before it returned scores"
```

## Conclusion

All of this will be in the next release of Rastair.
I hope nobody ever sees these errors outside of this blog post,
but if they do,
I hope they are helpful.
(And I'm looking forward to getting reports with enough details to be able to quickly fix bugs!)

If you have any questions
or want to read more about a specific topic,
ping me on Bluesky!
