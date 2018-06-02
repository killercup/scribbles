---
title: The Secret Life of Cows
categories:
- rust
---

A lot of people at RustFest Paris mentioned Cows.
But still, the bovine super powers of Rust's standard library [appear][1] to be a well-kept secret.
This post will dig into this very useful pointer type
and tries to present it in a way that is easy to understand,
even if you're not a Rust programmer.

[1]: https://twitter.com/KevinHoffman/status/1001075501358776322

## Contents
{:.no_toc}

1. Table of contents
{:toc}

## Organizing Data

This is what it all comes down to:
People want to have a good, precise way to organize their data.
And they want their programming language to support them.
That's why a lot of newer languages include a bunch of data structures
optimized for different use cases,
and that is also why software developers are dealing with API documentation so often.
It's essential to know which piece of data is represented in which way.

In systems programming languages,
this is in some regards even more important.
You want to know:

1. _exactly_ where your data lives,
2. that it is efficiently stored,
3. that it is removed as soon as you stop using it,
4. and that you don't copy it around needlessly.

Ensuring all these properties is a great way to write fast programs.
Let's look at how we can do this in Rust:

If you know what you will do with your data,
you can probably figure out how to best store it.
If you for example always iterate through a known list of values, an array (or a `Vec`) is the way to go.
If you need to look up values by known keys, and don't care about the order they are stored in, a hash map sounds good.
If you need a stack to put data onto from different threads, you can use [crossbeam-deque].
This is just to give you a few examples -- there are books on this topic and you should read them.

[crossbeam-deque]: https://crates.io/crates/crossbeam-deque

Luckily, in Rust it is easy to
make sure our data gets removed from memory
as soon as possible
(so we don't use up too much memory and slow down the system).
Rust uses the ownership model of automatically `drop`ping resources when they go out of scope,
so it doesn't need to periodically run a garbage collector to free memory.
You can still waste memory, of course, by allocating too much of it manually,
or by building reference cycles and leaking it.

One important step towards being a responsible citizen in regard to memory usage is to not copy data more than necessary.
If you for example have a function that removes whitespace at the beginning of a string,
you could create a new string that just contains the characters after the leading whitespace.
Or, you could return a _slice_ of the original string, that starts after the leading whitespace.
The second options requires that we keep the original data around,
because our new slice is just referencing it internally.
This means that instead of copying however many bytes your string contains,
we just write to numbers:
A pointer to the point in the original string after the leading whitespace,
and the length of the remaining string that we care about.
(Carrying the length with us is a convention in Rust.)

But what about a more complicated function?
Let's imagine we want to replace some characters in a string.
Do we always need to copy it over with the characters swapped out?
Or can we be clever and return some pointer to the original string if there was no replacement needed?
Indeed, in Rust we can! This is what `Cow` is all about.

## What is a Cow Anyway

In Rust, the abbreviation "Cow" stands for "clone on write"[^clone].
It is an enum with two states: `Borrowed` and `Owned`.
This means you can use it to abstract over
whether you own the data or just have a reference to it.
This is especially useful when you want to _return_ a type
from a function that may or may not need to allocate.

[^clone]: Yes, that's right: _Clone_ on write, not _copy_ on write. That's because in Rust, the `Copy` trait is guaranteed to by a simple `memcpy` operation, while `Clone` can also do custom logic (like recursively clone a `HashMap<String, String>`.

With that in mind, let's look at [the actual definition of `Cow`][std::borrow::Cow]:

[std::borrow::Cow]: https://doc.rust-lang.org/1.26.1/std/borrow/enum.Cow.html

```rust
enum Cow<'a, B: ToOwned + ?Sized + 'a> {
    /// Borrowed data.
    Borrowed(&'a B),
    /// Owned data.
    Owned(<B as ToOwned>::Owned),
}
```

As you can see, it takes some convincing to have Rust accept this type
in a way we can work with it.
Let's go through it one by one.

- `'a` is the lifetime that we need our data to be valid for.
  For the `Owned` case it's not very interesting
  (to Cow own the data -- it's valid until the Cow goes out of scope),
  but in case the Cow contains `Borrowed` data,
  this lifetime is a restriction set by the data we refer to.
  We cannot have a Cow that refers to already freed memory,
  and rustc will us know when that is possible by mentioning that the Cow outlives its `'a`.
- `ToOwned` is a trait that defines a method to convert borrowed data into owned data
  (by cloning it and giving us ownership of the new allocation, most likely).
  The type we receive from this method is an associated type on the trait,
  and its name is `Owned` (yep, the same name as the Cow variant, sorry).
  This allows us to refer to it in `Owned(<B as ToOwned>::Owned)`.

  To make this a bit more concrete, let's assume we have a Cow that's storing a `&str` (in the `Borrowed` case).
  The `ToOwned` implementation of `str` has `type Owned = String`, so `<&str as ToOwned>::Owned == String`.
- `?Sized` is a funny one.
  By default, Rust requires types to be of a known size.
  But that doesn't have to be the case:
  `[u8]` is an array of bytes, but we don't know its length.
  You'd never use it directly, but if you have a reference to it, the reference itself can contain the length.
  (See what I wrote above about slices!)
  Since a Cow should be able to contain a `&[u8]`, we need to say "we don't require this to be `Sized`" -- which is exactly what the `?Sized` syntax does.

Alright, so far so good!
Let me just point out one thing though:
If you want to store a `&'input str` in a Cow (Using `Cow::Borrowed(&'input str)` for example), what is the concrete type of the Cow?
(The generic one is `Cow<'a, T>`.)

Right! `Cow<'input, str>`!
The type definition for the `Borrowed` variant contains `&'a T`,
so our generic type is the type we refer to.
This also means that `ToOwned` doesn't need to be implemented for references,
but for concrete types, like `str` and `Path`.

Let me note something about that lifetime the Cow carries with it real quick:
If you want to replace the type of `bar` in
`struct Foo { bar: String }`
with a `Cow`,
you'll have to specify the lifetime of the reference the `Cow` can include:
`struct Foo<'a> { bar: Cow<'a, str> }`.
This means that every time you now _use_ `Foo` that lifetime will be tracked,
and every time you take or return `Foo` you might just need to annotate it.

One easy way around this is to use `'static'`:
You can omit the lifetime annotation on your struct,
but your Cow can only contain references to static memory.
This might sound less useful than a generic lifetime
-- that's because it is --
but in case of functions and types that either contain or return
new data or static defaults known at compile-time
it can be enough.

## Examples of Cows in the Wild

Knowing Cows in theory is fine and dandy,
but the examples we've seen so far
only give you a small glance at when they can be used in practice.
Sadly, as it turns out, not many Rust APIs expose Cows.
Maybe, because they are seen as a thing you can introduce when you have a performance bottleneck,
or maybe it's because people don't want to add lifetime annotations to their `struct`s
(and they don't want to or can't use `Cow<'static, T>`).

One example for improving program performance by using a Cow is
[this part][regex-redux-cow] of the Regex Redux micro-benchmark.
The trick is to store a reference to the data at first
and replace it with owned data during the loop's iterations.

[regex-redux-cow]: https://github.com/TeXitoi/benchmarksgame-rs/blob/f78f21bffc68cb42dd9311694913ea798535e674/src/regex_redux.rs#L72-L79

A great example for how you can use the super powers of Cows
in your own structs
to refer to input data instead of copying it over
is [Serde's][serde] `#[serde(borrow)]` attribute.
If you have a struct like

[serde]: https://serde.rs

```rust
#[derive(Debug, Deserialize)]
struct Foo<'input> {
    bar: Cow<'input, str>,
}
```

Serde will by default fill that `bar` Cow with an owned `String` ([playground][p1]).
If you however write it like

```rust
#[derive(Debug, Deserialize)]
struct Foo<'input> {
    #[serde(borrow)]
    bar: Cow<'input, str>,
}
```

Serde will try to create a borrowed version of the Cow ([playground][p2]).

This will only work, however, when the input string doesn't need to be adjusted.
So, for example,
when you deserialize a JSON string that has escaped quotes in it[^json-quotes]
Serde will have to allocate a new string to store the unescaped representation,
and will thus give you a `Cow::Owned` ([playground][p3]).

[p1]: http://play.rust-lang.org/?gist=c3997391e5bcb2834674c9c3e49e2f0c&version=stable&mode=debug
[p2]: http://play.rust-lang.org/?gist=2247b7e6431010122f0a779531a8ff89&version=stable&mode=debug
[p3]: http://play.rust-lang.org/?gist=31491f2a3e9124f61d03972c9a1dad39&version=stable&mode=debug

[^json-quotes]: `"\"Escaped strings contain backslashes\", he said."`
