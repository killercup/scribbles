---
title: How to order Rust code
categories:
- rust
---
**Note:**
This post is about how I arrange the code I write in Rust.
If you wanted to "order" Rust code
in the "hire someone to write code" sense,
feel free to send me an email, too.
I know a bunch of qualified people!

# `fn main` first

# Notes

cf <https://discordapp.com/channels/509329129070657540/509329654792978432/533676560306143232>

> start with main and then implement all the stuff needed to make it work (order of items doesn't matter in rust; except macros)

> "suggested reading order"

> order types and impls

> love to read types upfront (if you know the set of fields, you know all potential methods that can exists)

>  split `impl B` block into two just because some methods are only required in `impl C`

> "implementation details are in a separate file"

> One thing I've realized recentlish is that every bit of abstraction you create has two interfaces: external, for consumers, and internal, for producers
>
> and that a common problem is accidently mixing the two
> 
> calling a "public" function from an "impl" function might be good at the start, but then, typically, the "impl" function would want to know some additional infoemation, and the "public" function would want to "hide" some info, and you'll get a conflict

> I feel like I've gone too much on that road though: significant part of rust-analyzer is just forwarding stuff from "impl" to "api" withotu changing anything :-)