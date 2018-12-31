---
title: Cool academic research used in the Rust compiler
categories:
- rust
- list
---
At [RustRush 2018] I gave a talk ([slides]) about
how the Rust community is good at looking at (and using) existing research
and how we should continue to do so.
In this post I want to give a short overview of
slightly obscure or hidden things that the Rust compiler and standard library use.

[RustRush 2018]: https://rustrush.ru/program-eng
[slides]: https://killercup.github.io/presentation-rust-approach/index.html

- [datafrog](https://github.com/rust-lang-nursery/datafrog):
  A [datalog](https://en.wikipedia.org/wiki/Datalog) engine
  based on [differential-dataflow](https://github.com/frankmcsherry/differential-dataflow).
  [Here's](https://github.com/frankmcsherry/blog/blob/78d73ca8c9bc42b90af5b308f4cf5d9ed24d387a/posts/2018-05-19.md)
  a blog post by Frank McSherry introducing it.
- chalk
- polonius
- swisstable
- timsort adaptation, whatever sort_unstable is based on
