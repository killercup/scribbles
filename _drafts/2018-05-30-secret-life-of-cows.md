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

## Organizing data

This is what it all comes down to:
People want to have a good, precise way to organize their data.
And they want their programming language to support them.
That's why a lot of newer languages include a bunch of data structures
and that is also why software developers are dealing with API documentation so often.
It's essential to know which piece of data is represented in which way.

In systems programming languages,
this is in some regards even more important:

1. You want to know _exactly_ where your data lives,
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

Making sure our data gets removed from memory so we don't use up too much memory and slow down the system is easy in Rust.
Rust uses the ownership model of automatically `drop`ping resources when they go out of scope,
so it doesn't need to periodically run a garbage collector to free memory.
You can still waste memory, of course, but allocating too much of it manually,
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
Let's image we want to replace some characters in a string.
Do we always need to copy it over with the characters swapped out?
Or can we be clever and return some pointer to the original string if there was no replacement needed?
Indeed, in Rust we can! This is what `Cow` is all about.

## What is a Cow anyway

In Rust, the abbreviation "Cow" stands for "clone on write"[^clone].
It is an enum with two states: `Borrowed` and `Owned`.
This means you can use it to abstract over
whether you own the data or just have a reference to it.
This is especially useful when you want to _return_ a type
from a function that may or may not need to allocate.

With that in mind, let's look at [the actual definition of `Cow`][std::borrow::Cow]:

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
  We cannot have a Cow to refers to already freed memory,
  and rustc will us when that is possible by mentioning that the Cow outlives it's `'a`.
- `ToOwned` is a trait that defines a method to convert borrowed data into owned data
  (by cloning it and giving us ownership of the new allocation, most likely).
  The type we receive from this method is an associated type on the trait,
  and it's name is `Owned` (yep, the same name as the Cow variant, sorry).
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


[std::borrow::Cow]: https://doc.rust-lang.org/1.26.1/std/borrow/enum.Cow.html

[^clone]: Yes, that's right: _Clone_ on write, not _copy_ on write. That's because in Rust, the `Copy` trait is guaranteed to by a simple `memcpy` operation, while `Clone` can also do custom logic (like recursively clone a `HashMap<String, String>`.
