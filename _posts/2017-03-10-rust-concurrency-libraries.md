---
title: Rust Concurrency Libraries
categories:
- rust
---

A short overview.

# I/O

- Model data flow with [futures]
- Let [tokio]'s event loop handle non-blocking I/O
- Use libraries built on [tokio] that implement the protocols you need

# Parallel processing

- Use [rayon] to make your iterators use all CPU cores
- Use [crossbeam]'s scoped threads to manually execute things in parallel

# Data structures

- Use [crossbeam]'s data lock-free data structures if you need to access data from multiple threads

[futures]: https://crates.io/crates/futures
[tokio]: https://tokio.rs
[rayon]: https://crates.io/crates/rayon
[crossbeam]: https://crates.io/crates/crossbeam
