---
title: The secret life of Cows
categories:
- rust
---

A lot of people at RustFest Paris mentioned CoWs.
But nevertheless the bovine super powers of Rust's standard library are [apparently][1] to be a well-kept secret.
This post wants to dig into them
and present them in a way that is easy to understand,
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
You want to know _exactly_ where your data lives,
that it is efficiently stored,
that it is removed as soon as you stop using it,
and that you don't copy it around needlessly.
Ensuring all these properties is a great way to write fast programs.
Let's look at how we can do this in Rust:

If you know what you will do with you data,
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

"Cow" is an abbreviation that in Rust stands for "clone on write"[^clone].
It is an enum with two states: `Borrowed` and `Owned`.
This means you can use it to abstract over
whether you own the data or just have a reference to it.

[^clone]: Yes, that's right: _Clone_ on write, not _copy_ on write. That's because in Rust, the `Copy` trait is guaranteed to by a simple `memcpy` operation, while `Clone` can also do custom logic (like recursively clone a `HashMap<String, String>`.
