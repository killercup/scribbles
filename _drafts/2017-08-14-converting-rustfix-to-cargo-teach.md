---
title: Converting Rustfix to cargo teach
category:
- rust
---

## User story examples

### Binary tree

Inspired by [this post][mre-tree] by [Matthias Endler][mre].

```rust
struct Tree {
  root: i64,
  left: Tree,
  right: Tree,
}
```

```sh
cargo check
```

```
error[E0072]: recursive type `Tree` has infinite size
 --> src/main.rs:1:1
  |
1 | struct Tree {
  | ^^^^^^^^^^^ recursive type has infinite size
  |
  = help: insert indirection (e.g., a `Box`, `Rc`, or `&`) at some point to make `Tree` representable
```

```sh
cargo teach
```

```
==> Hi there! Let me have a look at that nice `$CRATE_NAME` code!
  > ...done!
  > This looks pretty good! You'll need to tweak a few things to make it work, though.
  > Let's get started!

==> Have a look at `src/main.rs`:
  |
1 | struct Tree {
2 |     root: i64,
3 |     left: Tree,
4 |     right: Tree,
5 | }
  |

==> Sadly, this doesn't work, because: Recursive type `Tree` has infinite size.
  > When defining a recursive struct or enum, any use of the type being defined
  > from inside the definition must occur behind a pointer (like `Box` or `&`).
  > This is because structs and enums must have a well-defined size, and without
  > the pointer, the size of the type would need to be unbounded.

  ( ) I don't get it. Explain some more?
  (x) I see! What should I do?

==> Thanks for asking!
  > I'd suggest you insert indirection (e.g., a `Box`, `Rc`, or `&`) at some point to make `Tree` representable
```

This uses:

- Quoted code showing the whole item (not just the header here)
- Error messages, transformed to work in sentence
- First paragraph of `rustc --explain E0072`
- Suggestion

[mre]: https://matthias-endler.de/
[mre-tree]: https://matthias-endler.de/2017/boxes-and-trees/
