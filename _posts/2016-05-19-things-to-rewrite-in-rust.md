---
title: Things to rewrite in Rust
categories:
- rust
---

Some people wrote posts about stuff they want to see rewritten in Rust[^1], but that's not this is about. I want to rewrite stuff in Rust to learn more Rust, learn more about the projects and their fields, and, well, just for fun.

[^1]: For example: libpng, musl, life, the Linux kernel, the universe, and everything.

## A list of probably interesting things to (re)write in Rust

- A [TOML](https://github.com/toml-lang/toml) reader/writer that does not change the layout of the file when adding fields. There's some discussion of cargo-edit's specific use-case [here](https://github.com/killercup/cargo-edit/issues/15).
- [Butteraugli](https://github.com/google/butteraugli) – a tool for measuring differences between images (C++, [Go port](https://github.com/jasonmoo/go-butteraugli))
- [FLIF](https://github.com/FLIF-hub/FLIF) – Free Lossless Image Format (C++)
  - FLIF's "Maniac" encoding ([part](https://github.com/FLIF-hub/FLIF/tree/0f0041079dba5195ea88235ba6ff1656b16dfc47/src/maniac) of FLIF's repo)
  - **[@panicbit](https://github.com/panicbit) is working on [it](https://github.com/panicbit/flif-rs)**
- [story-graph](https://github.com/incrediblesound/story-graph) – The Graph that Generates Stories (JavaScript)
- A virtual DOM thingy with adaptors for libui and CLI [as described in this note]({% post_url 2016-07-23-impl-virtual-dom-cli-libui %})
- [A Twitter bot]({% post_url 2016-07-16-twitter-bot-driven-twitter-bot %})
- [git-guilt](https://bitbucket.org/tpettersen/git-guilt) using libgit2 (with the [git2](https://crates.io/crates/git2) crate) instead of spawning `git blame` processes
