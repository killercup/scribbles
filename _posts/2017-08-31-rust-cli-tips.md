---
title: 5 Tips for Writing Small CLI Tools in Rust
categories:
- rust
discussions:
  "Twitter": https://twitter.com/killercup/status/903275512184918018
  "Reddit": https://www.reddit.com/r/rust/comments/6x82mw/5_tips_for_writing_small_cli_tools_in_rust/
---

[Rust] is a great language to write small command line tools in. While it gives you some tools for common tasks, allows nice abstractions, it also has a type system and approach to API design that lead you to write robust code. Let me show you some techniques to make this a nice experience.

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

Just use [`error-chain`]. Honestly, it's that good.

Let's pick up our example from before but assume we don't have any CLI options, so we'll hardcode them somehow.

```rust
#[macro_use] extern crate error_chain;

use std::fs::File;

// Short macro to define a main function that allows you to use `?`
quick_main!(|| -> Result<()> {
    // Let's say this is user input
    let source = "./whatever";
    let level = "42";

    // And now, let's convert this to formats that are useful to us
    let source = File::open(source) // can return io::Error
        .chain_err(|| format!("Can't open `{}`", source))?;

    let level = level.parse()?; // can return a ParseIntError

    let source_fanciness = get_fanciness(&source)?; // can return CantDetermineFanciness

    // And now for something cool: An assert that returns an Error
    ensure!(source_fanciness < level, ErrorKind::AlreadyFancy(source_fanciness, level));

    // ...
    Ok(())
});

fn get_fanciness(_source: &File) -> Result<u8> {
    Ok(255) // Let's assume all inputs are fancy
}

// Let's define some errors here
error_chain! {
    errors {
        CantDetermineFanciness {
            description("unable to determine fanciness from source")
        }
        AlreadyFancy(source_level: u8, target_level: u8) {
            description("already fancy enough")
            display("Already fancy enough: Source level {} above target level {}", source_level, target_level)
        }
    }
    foreign_links {
        Io(::std::io::Error);
        InvalidNumber(::std::num::ParseIntError);
    }
}
```

Wow, that's a lot of code. But I think it's quite clear: It has a main function that shows the control flow, followed by a helper function, followed but a full list of possible errors.

And error-chain's `quick_main!` macro gives us nice output on errors:

```
$ cargo run
    Finished dev [unoptimized + debuginfo] target(s) in 0.61 secs
     Running `target/debug/fancify`
Error: Can't open `./whatever`
Caused by: No such file or directory (os error 2)
```

Or:

```
$ touch whatever
$ cargo run
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target/debug/fancify`
Error: Already fancy enough: Source level 255 above target level 42
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

## Many small helper functions

I tend to write a lot of small functions. Here's an example of such a "small helper function":

```rust
fn open(path: &str) -> Result<File> {
    File::open(path).chain_err(|| format!("Can't open `{}`", path))
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

## Lots of structs

In my experience, it really pays off to use a lot of structs. Some scenarios:

- Have the choice between using `serder_json::Value` with a bunch of `match`es or a struct with `#[derive(Deserialize)]`? Choose the struct, get performance, nice errors, and documentation about the shape you expect.
- Pass the same 3 parameters to a bunch of functions? Give them a name and maybe even turn some of these functions into methods.
- See yourself writing a lot of boilerplate code? See if you can write a struct/enum and use a derive.

## Conclusion
{:.no_toc}

These were my five tips for writing small CLI applications in Rust (writing nice libraries is [another topic][elegant APIs]). If you have more tips, let me know!

If you want to dig a little deeper, I'd suggest looking at how to [multi-platform build Rust binaries releases][trust], how to use [`clap`] to get [autocompletion for CLI args], and how to write integration test for your CLI apps (upcoming post).


[Rust]: https://www.rust-lang.org/
[`structopt`]: https://docs.rs/structopt
[`clap`]: https://clap.rs
[`error-chain`]: https://docs.rs/error-chain
[elegant APIs]: {% post_url 2016-07-21-elegant-apis-in-rust %}
[trust]: https://github.com/japaric/trust
[autocompletion for CLI args]: https://blog.clap.rs/complete-me/
