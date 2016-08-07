---
title: Rust's ownership and borrowing in 150 words
categories:
- rust
---
Recently, I wrote [on reddit](https://www.reddit.com/r/rust/comments/4vfzvc/list_of_rust_books/d5y8i0o?context=3) that a Rust book won't become obsolete in the next years if it focused on explaining concepts instead of current APIs. At basically the same time, I tried to explain some of Rust's concepts to a friend. I think I came up with a quite concise description (maybe even explanation) of ownership in Rust.

- - -

**Ownership and borrowing**, the one that differentiates Rust from pretty much everything. You have an owned resource, and when you are done, that resource gets deallocated.

All **references** to a resource depend on the lifetime of that resource (i.e., the are only valid when the resource has not yet been deallocated).

**Move semantics** means: Giving an owned resource to a function means _giving it away_. You can no longer access it.

To _not_ move a resource, you instead create a reference to it and move _that_. You create a reference, that you own, and then give ownership of that to the function you call. (Nothing new, just both concepts at the same time.)

To manipulate a resource without giving up ownership, you can create one **mutable reference**. During the lifetime of this reference, no other references can be created.

That's it. And it's all checked at compile-time.
