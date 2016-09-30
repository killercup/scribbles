---
title: Elegant Library APIs in Rust
categories:
- rust
- writing
- incomplete
---

## Contents
{:.no_toc}

* Table of contents
{:toc}

## What makes an API elegant?

- Code using the API is easily readable thanks to obvious, self-explanatory method names
- Guessable method names when using the API, so there is less need to read documentation
- Everything has at least some little snippet of documentation
- You need to write little boilerplate code to use it
    - methods accept a wide range of valid input types (where conversions are obvious)
    - Shortcuts to get the 'usual' stuff done quickly
- Clever use of types that prevent you from doing some kind of errors but don't get in your way too much
- Useful errors, clearly documented panic cases

## Techniques

### Liberal usage of `Into<T>`, `AsRef<T>`, `FromStr`, and similar

It's good practice to never have `&String` or `&Vec<T>` as input parameters and instead use `&str` and `&[T]` instead as they allow more types to be passed in. (Basically, everything that `deref`s to a (string) slice).

We can apply the same idea at a more abstract level: Instead of using concrete types for input parameters, try to use generics with precise constraints.

The downside of this is that the documentation will be less readable (as it will be full of generics with complex constraints!)

[`std::convert`](https://doc.rust-lang.org/std/convert/index.html) has some goodies for that:

- `AsMut`: A cheap, mutable reference-to-mutable reference conversion.
- `AsRef`: A cheap, reference-to-reference conversion.
- `From`: Construct Self via a conversion.
- `Into`: A conversion that consumes self, which may or may not be expensive.
- `TryFrom`: Attempt to construct Self via a conversion. (Unstable as of Rust 1.10)
- `TryInto`: An attempted conversion that consumes self, which may or may not be expensive. (Unstable as of Rust 1.10)

You might also enjoy [this article about _Convenient and idiomatic conversions in Rust_](https://ricardomartins.cc/2016/08/03/convenient_and_idiomatic_conversions_in_rust).

#### Cow

If you are dealing with a lot of things that may or may not need to be allocated, you should also look into [`Cow<'a, B>`](https://doc.rust-lang.org/std/borrow/enum.Cow.html) which allows you to abstract over borrowed and owned data.

#### Example: [`std::convert::Into`](https://doc.rust-lang.org/std/convert/trait.Into.html)

| `fn foo(p: PathBuf)` | `fn foo<P: Into<PathBuf>>(p: P)` |
| ------------------- | ------------------------------- |
| Users needs to convert their data to a `PathBuf` | Library can call `.into()` for them |
| User does allocation | Less obvious: Library might need to do allocation |
| User needs to care about what a `PathBuf` is and how to get one | User can just give a `String` or an `OsString` or a `PathBuf` and be happy |

#### `Into<Option<_>>`

[This pull request](https://github.com/rust-lang/rust/pull/34828), which landed in Rust 1.12, adds an `impl<T> From<T> for Option<T>`. While only a few lines long this allows you to write APIs that can be called without typing `Some(…)` all the time.

[Before:](https://play.rust-lang.org/?gist=68645e903a2f903cf43d3070d562a809&version=nightly&backtrace=0)

```rust
// Easy for API author, easy to read documentation
fn foo(lorem: &str, ipsum: Option<i32>, dolor: Option<i32>, sit: Option<i32>) {
    println!("{}", lorem);
}

fn main() {
    foo("bar", None, None, None);               // That looks weird
    foo("bar", Some(42), None, None);           // Okay
    foo("bar", Some(42), Some(1337), Some(-1)); // Halp! Too… much… Some…!
}
```

[After:](https://play.rust-lang.org/?gist=23b98645fa7fd68cb9e28da9425a62f9&version=nightly&backtrace=0)

```rust
// A bit more typing for the API author.
// (Sadly, the parameters need to be specified individually – or Rust would
// infer the concrete type from the first parameter given. This reads not as
// nicely, and documentation might not look as pretty as before.)
fn foo<I, D, S>(lorem: &str, ipsum: I, dolor: D, sit: S) where
    I: Into<Option<i32>>,
    D: Into<Option<i32>>,
    S: Into<Option<i32>>,
{
    println!("{}", lorem);
}

fn main() {
    foo("bar", None, None, None); // Still weird
    foo("bar", 42, None, None);   // Okay
    foo("bar", 42, 1337, -1);     // Wow, that's nice! Gimme more APIs like this!
}
```

#### A note on possibly long compile times

If you have:

1. a lot of type parameters (e.g. for the conversion traits)
2. on a complex/large function
3. which is used a lot

then `rustc` will need to compile a lot of permutations of this function (it monomorphizes generic functions), which will lead to long compile times.

[bluss](https://github.com/bluss) mentioned [on Reddit](https://www.reddit.com/r/rust/comments/556c0g/optional_arguments_in_rust_112/d8839pu?context=1) that you can use "de-generization" to circumvent this issue: Your (public) generic function just calls another, (private) non-generic function, which will only be compiled once.

The examples bluss gave was the implementation of `std::fs::OpenOptions::open` ([source](https://doc.rust-lang.org/1.12.0/src/std/up/src/libstd/fs.rs.html#599-604) from Rust 1.12) and [this pull request](https://github.com/PistonDevelopers/image/pull/518) on the `image` crate, which changed its `open` function to this:

```rust
pub fn open<P>(path: P) -> ImageResult<DynamicImage> where P: AsRef<Path> {
    // thin wrapper function to strip generics before calling open_impl
    open_impl(path.as_ref())
}
```

### Custom traits for input parameters

The Rust way to implement a kind of "function overloading" is by using a generic trait `T` for one input parameter and implement `T` for all types the function should accept.

#### Example: [`str::find`](https://doc.rust-lang.org/std/primitive.str.html#method.find)

`str::find<P: Pattern>(p: P)` accepts a [`Pattern`](https://doc.rust-lang.org/std/str/pattern/trait.Pattern.html) which is implemented for `char`, `str`, `FnMut(char) -> bool`, etc.

```rust
"Lorem ipsum".find('L');
"Lorem ipsum".find("ipsum");
"Lorem ipsum".find(char::is_whitespace);
```

### Session types

Basically: Encode a state machine in the type system. Each state is a different type and implements different methods. There's even a [paper](http://munksgaard.me/laumann-munksgaard-larsen.pdf) on it.

### Builder pattern

Make it easier to make complex API calls by chaining several smaller methods together. Works nicely with session types.

#### Example: [`std::fs::OpenOptions`](https://doc.rust-lang.org/std/fs/struct.OpenOptions.html)

```rust
use std::fs::OpenOptions;
let file = OpenOptions::new().read(true).write(true).open("foo.txt");
```

### Error handling

The official book has an [awesome chapter](https://doc.rust-lang.org/book/error-handling.html) on error handling.

There are a few crates to reduce the boilerplate needed for good error types, e.g., [quick-error](https://crates.io/crates/quick-error), and [error-chain](https://crates.io/crates/error-chain).

### Doc tests

Write documentation with examples and get automatic tests for free – Two birds, one stone.

To enforce that every public API item is documented, use `#![deny(missing_docs)]`.

## Case Studies

tbd
