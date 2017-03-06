---
title: Ideas for an Extendable Test Runner in Rust
categories:
- rust
- incomplete
---
Rust has a built-in testing framework that allows you to write simple unit tests like

```rust
#[test]
fn time_is_linear() {
	let x = now();
	let y = now();
	assert!(x >= y, "DANGER! Causality broken!");
}
```

This is very nice and really convenient. Sadly, this only gives us human readable output, though.

## Machine readable tests


## TAP
