---
title: High-performance Rust
categories:
- rust
---
Small things you can do to increase the runtime speed of a Rust project
– many with 0-5 lines of code!

## Optimizations, optimizations, optimizations

```toml
[profile.release]
lto = "fat"
codegen-units = 1
target-cpu = "native"
```

## jemalloc

```toml
jemallocator = "0.1"
```

```rust
#[global_allocator]
static ALLOC: jemallocator::Jemalloc = jemallocator::Jemalloc;
```
