---
title: 5 Tips for Writing Small CLI Tools in Rust
categories:
- rust
discussions:
  "Twitter": https://twitter.com/killercup/status/903275512184918018
  "Reddit": https://www.reddit.com/r/rust/comments/6x82mw/5_tips_for_writing_small_cli_tools_in_rust/
---

[Rust] is a great language to write small command line tools in. While it gives you some tools for common tasks, allows nice abstractions, it also has a type system and approach to API design that lead you to write robust code. Let me show you some techniques to make this a nice experience.

**Update (Jan 2018):** I published a crate (Rust library) that contains a lot of what this post describes: [quicli].

**Update (April 2020):** Changed failure for anyhow.

[quicli]: https://github.com/killercup/quicli

## Contents
{:.no_toc}

1. Table of contents
{:toc}

## Quick CLI argument handling

There are many libraries out there to help you do that. What I've come to enjoy is [`structopt`]: It gives you the power to annotate a `struct` or `enum` and turn its fields/variants into CLI flags:

```rust
extern crate structopt;
#[macro_use] extern crate structopt_derive;

use structopt::StructOpt;

/// Do fancy things
#[derive(StructOpt, Debug)]
#[structopt(name = "fancify")]
struct Cli {
    /// The source, possibly unfancy
    source: String,

    /// Level of fanciness we should aim for
    #[structopt(long = "level", short = "l", default_value = "42")]
    level: u8,

    /// Output file
    #[structopt(long = "output", short = "w", default_value = "/dev/null")]
    output: String,
}

fn main() {
    Cli::from_args();
}
```

This is _very_ concise - but also very powerful! (It uses [`clap`] behind the scenes.)

```
$ cargo run -- --help
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target/debug/fancify --help`
fancify 0.1.0
Pascal Hertleif <killercup@gmail.com>
Do fancy things

USAGE:
    fancify [OPTIONS] <source>

FLAGS:
    -h, --help       Prints help information
    -V, --version    Prints version information

OPTIONS:
    -l, --level <level>      Level of fanciness we should aim for [default: 42]
    -w, --output <output>    Output file [default: /dev/null]

ARGS:
    <source>    The source, possibly unfancy
```

Or:

```
$ cargo run -- whatever --levl
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target/debug/fancify whatever --levl`
error: Found argument '--levl' which wasn't expected, or isn't valid in this context
        Did you mean --level?

USAGE:
    fancify <source> --level <level>

For more information try --help
```

## Error handling

_This was updated April 2020._

In many CLI applications, error handling doesn't have to be complicated.
All you need is a library like [`anyhow`]
that let's you bubble up basically all error types
and optionally add some context (descriptions) to them.

[`anyhow`]: https://docs.rs/anyhow/1.0.28/anyhow/

```rust
use std::fs::File;
use anyhow::Context;

// Anyhow exports a type alias for a Result with its own error type.
// Having main return this makes it print the error as well as a list of causes.
fn main() -> anyhow::Result<()> {
    // Let's say this is user input
    let source = "./whatever";
    let level = "42";

    // Opening a file can fail, but the error message is something like
    // "OS error 2: No such file or directory"…
    let source = File::open(source)
        // …so, let's add a bit of context to it:
        .with_context(|| format!("Can't open `{}`", source))?;

    let level = level.parse()?; // can return a ParseIntError
    let source_fanciness = get_fanciness(&source)?; // returns generic error as well

    // An assert that returns an Error
    anyhow::ensure!(source_fanciness < level, "source is already fancy");

    // Everything is fine, and main returns an empty "okay"
    Ok(())
}

fn get_fanciness(_source: &File) -> anyhow::Result<u8> {
    Ok(255) // Let's assume all inputs are fancy
}
```

This looks easy enough, right?
There's a lot of ways to enhance the way you deal with errors,
for example by writing your own error types.
But for quick CLI tools, this is most often not necessary.

By th way,
here is what the error output looks like:

```
$ cargo run
    Finished dev [unoptimized + debuginfo] target(s) in 0.61 secs
     Running `target/debug/fancify`
Error: Can't open `./whatever`

Caused by:
    No such file or directory (os error 2)
```

Or:

```
$ touch whatever
$ cargo run
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target/debug/fancify`
Error: source is already fancy
```

## Many small crates

Don't be afraid to depend on a lot of crates. Cargo is really good at allowing you not to care about compiling and updating dependency, so let Cargo, and the Rust community, help you!

For example, I recently wrote a CLI tool with 37 lines of code. This is the first block:

```rust
extern crate handlebars;
extern crate structopt;
#[macro_use] extern crate structopt_derive;
#[macro_use] extern crate error_chain;
extern crate serde;
#[macro_use] extern crate serde_derive;
#[macro_use] extern crate serde_json as json;
extern crate serde_yaml as yaml;
extern crate comrak;
```

_Note from the future (April 2020): Since the introduction of Rust 2018, you don't need to write `extern crate` anymore. Yay!_

## Many small helper functions

I tend to write a lot of small functions. Here's an example of such a "small helper function":

```rust
fn open(path: &str) -> Result<File> {
    File::open(path).with_context(|| format!("Can't open `{}`", path))
}
```

Okay, that's a bit underwhelming. How about this one?

```rust
fn read(path: &str) -> Result<String> {
    let mut result = String::new();
    let mut file = open(path)?;
    file.read_to_string(&mut result)?;
    Ok(result)
}
```

It's one level more abstract than the standard library, hides an allocation of a String with unknown length, but… it's really handy.

I know could put the function bodies just inside the main code, but giving these little code blocks names and getting the option of reusing them is really powerful. It also makes the `main` function a tad more abstract and easier to read (no need to see through all the implementation details). Furthermore (but this tends to not really shine in small CLI apps) it makes things easily unit-testable.

And by the way: In most small CLI tools, performance is not that important. Feel free to prefer `.clone()` to sprinkling your code with lifetime parameters.

## Lots of structs

In my experience, it really pays off to use a lot of structs. Some scenarios:

- Have the choice between using `serde_json::Value` with a bunch of `match`es or a struct with `#[derive(Deserialize)]`? Choose the struct, get performance, nice errors, and documentation about the shape you expect.
- Pass the same 3 parameters to a bunch of functions? Group them in a (tuple) struct, give the group a name, and maybe even turn some of these functions into methods.
- See yourself writing a lot of boilerplate code? See if you can write a struct/enum and use a derive.

## Bonus: Logging

And a bonus round: Some logging with [`loggerv`]! (It's really simple, but usually suffices for CLI apps. No need to go all in with streaming JSON logs to logstash for now.)

```rust
#[macro_use] extern crate log;
extern crate loggerv;

#[macro_use] extern crate error_chain;
extern crate structopt;
#[macro_use] extern crate structopt_derive;
use structopt::StructOpt;

/// Do fancy things
#[derive(StructOpt, Debug)]
#[structopt(name = "fancify")]
struct Cli {
    /// Enable logging, use multiple `v`s to increase verbosity
    #[structopt(short = "v", long = "verbose")]
    verbosity: u64,
}

quick_main!(|| -> Result<()> {
    let args = Cli::from_args();

    loggerv::init_with_verbosity(args.verbosity)?;

    // ...
    let thing = "foobar";
    debug!("Thing happened: {}", thing);
    // ...

    info!("It's all good!");
    Ok(())
});

error_chain! {
    foreign_links {
        Log(::log::SetLoggerError);
    }
}
```

Sweet! Let's run it three time with more of less verbosity!

```
$ cargo run
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target/debug/fancify`
$ cargo run -- -v
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target/debug/fancify -v`
fancify: It's all good!
$ cargo run -- -vv
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target/debug/fancify -vv`
fancify: Thing happened: foobar
fancify: It's all good!
```

## Conclusion
{:.no_toc}

These were my five tips for writing small CLI applications in Rust (writing nice libraries is [another topic][elegant APIs]). If you have more tips, let me know!

If you want to dig a little deeper, I'd suggest looking at how to [multi-platform build Rust binaries releases][trust], how to use [`clap`] to get [autocompletion for CLI args], and how to write integration test for your CLI apps (upcoming post).


[Rust]: https://www.rust-lang.org/
[`structopt`]: https://docs.rs/structopt
[`clap`]: https://clap.rs
[`error-chain`]: https://docs.rs/error-chain
[`failure`]: https://boats.gitlab.io/failure/
[cargo-expand]: https://crates.io/crates/cargo-expand
[`loggerv`]: https://docs.rs/loggerv
[elegant APIs]: {% post_url 2016-07-21-elegant-apis-in-rust %}
[trust]: https://github.com/japaric/trust
[autocompletion for CLI args]: https://blog.clap.rs/complete-me/
