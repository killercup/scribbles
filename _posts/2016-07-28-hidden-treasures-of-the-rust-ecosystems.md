---
title: Hidden treasures of the Rust ecosystem
categories:
- rust
- list
---

## The secret life of `std`

- You can call `"text".parse::<T>()` on all types `T` that `impl std::str::FromStr for T`
- You can `.collect()` into a `Result<T, E> where T: FromIterator`

## Wonders of Rust documentation

- [The Little Book of Rust Macros](https://danielkeep.github.io/tlborm/) by Daniel Keep
- [Rust Design Patterns](https://github.com/nrc/patterns), a collection by Nick Cameron
- [Learning Rust With Entirely Too Many Linked Lists](http://cglab.ca/~abeinges/blah/too-many-lists/book/) by Alexis Beingessner
- [Ticki's blog](http://ticki.github.io/blog/) with great posts showing the theoretical CS aspects of Rust

## The ancient treasures of crates.io

- [custom_derive!](https://github.com/DanielKeep/rust-custom-derive) in all its `macro_rules!` glory, by Daniel Keep
- [quick-error](https://github.com/tailhook/quick-error) makes creating error enums easy
- [conv](https://github.com/DanielKeep/rust-conv), a bunch of conversion traits that go beyond what `std::convert` offers, by Daniel Keep
- [difference.rs](https://github.com/johannhof/difference.rs), a text diffing library with built-in diffing assertion, by Johann Hofmann
- [strsim](https://github.com/dguo/strsim-rs): "Implementations of string similarity metrics. Includes Hamming, Levenshtein, Damerau-Levenshtein, Jaro, and Jaro-Winkler." By Danny Guo. I can never remember this crate's name!
- [itertools](https://github.com/bluss/rust-itertools) by bluss, because Iterators are awesome.
- The [contain-rs](https://github.com/contain-rs) GitHub organisation which not only has a funny name but also a bunch of crates for various data structures. (While I have seen [this](https://github.com/michaelwoerister/rs-persistent-datastructures) crate, I'm still looking forward to popular, idiomatic, persistent data structures.)
- [quickcheck](https://github.com/BurntSushi/quickcheck) (and everything else) by Andrew Gallant
- [typenum](https://github.com/paholg/typenum), compile-time numbers in Rust, by Paho Lurie-Gregg and Andre Bogus.
- [timely dataflow](https://github.com/frankmcsherry/timely-dataflow), a low-latency cyclic dataflow computational model. Awesome stuff, like all the other projects by Frank McSherry.

## The private life of Rust work in progress

- [futures-rs](https://github.com/alexcrichton/futures-rs), a WIP implementation of future, promise, and (async) stream types, by Alex Crichton. **Now public!**
- [miri](https://github.com/solson/miri), an interpreter for Rust's mid-level intermediate representation, by Scott Olson.
