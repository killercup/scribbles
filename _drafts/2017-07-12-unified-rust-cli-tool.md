---
title: "A unified rust CLI tool"
categories:
- rust
- idea
---

from diesel-contributors gitter:

> so, did i ever tell you about my grand idea to make rustup, rustc, cargo, rustfmt, the default test, and all other tools post 'events' as json documents to stdout, and to have a new rust tool that calls the tools internally and presents a nice, unified cli?
> it could do shenanigans like an interactive display of which crate cargo is downloading/type checking/compiling
> or, pipe error message suggestions to rustfmt before rendering
> i originally came up with the idea in the context of custom error message filters

cli shenanigans:

- fancy cargo progress indiciator with https://docs.rs/indicatif
- rustfix ui 2.0 with https://docs.rs/dialoguer
