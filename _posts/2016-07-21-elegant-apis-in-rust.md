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

### Liberal usage of `Into<T>`, `AsRef<T>`, `FromStr` , and similar

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

If you are dealing with a lot of things that may or may not need to be allocated, you should also look into [`Cow<'a, B>`](https://doc.rust-lang.org/std/borrow/enum.Cow.html) which allows you to abstract over borrowed and owned data.

#### Example: [`std::convert::Into`](https://doc.rust-lang.org/std/convert/trait.Into.html)

| `fn foo(p: PathBuf)` | `fn foo<P: Into<PathBuf>>(p: P)` |
| ------------------- | ------------------------------- |
| Users needs to convert their data to a `PathBuf` | Library can call `.into()` for them |
| User does allocation | Less obvious: Library might need to do allocation |
| User needs to care about what a `PathBuf` is and how to get one | User can just give a `String` or an `OsString` or a `PathBuf` and be happy |


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
