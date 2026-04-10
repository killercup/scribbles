---
title: Trait Driven Development in Rust
categories:
- rust
discussions:
  "/r/rust": "https://www.reddit.com/r/rust/comments/5iarzx/"
---
Actually, the title is a lie: We are just focusing on traits here, but writing Rust can also easily be Test Driven, or Data Driven, or Documentation Driven, or `[A-Z][a-z]*` Driven.

As with almost any language, Rust contains a lot of concepts that can be mixed and which you can focus on. I think traits are the most interesting and most powerful[^what-about-borrock].

[^what-about-borrock]: Ownership and borrowing can be seen as orthogonal to the traits system; in Rust, the features live in symbiosis, e.g. through marker traits.

Instead of doing things the usual OOP way and describing classes of objects by listing their fields and their methods, in Rust you define your data structures (structs, enums) and then implement traits on them.

## Traits and Associated Items

Which is to say, you have a set of things that are associated with a certain trait (a certain kind of behavior) and define what they are for a type. The most basic of these *associated items* is functions[^other-associated-items]. By defining a function `bar` as part of a trait `Foo`, it becomes an *associated function*:

```rust
trait Foo {
    fn bar(x: i32, y: i32) -> i32;
}
```

[^other-associated-items]: Other associated items you can define in a trait are type aliases, and constants (unstable as of Rust 1.13).

This means it can be—in theory—called like `Foo::bar(21, 21)`. In practice, you need to implement the trait on a type to be able to call it:

```rust
trait Foo {
    fn bar(x: i32, y: i32) -> i32;
}

struct Baz {}

impl Foo for Baz {
    fn bar(x: i32, y: i32) -> i32 {
        42
    }
}

#[test]
fn bar_test() {
    let result = Baz::bar(21, 21);
    assert_eq!(42, result);
}
```

See how we called the function with `Baz::` here instead of `Foo::`? We can do even more crazy stuff!

## Methods

Rust has a pretty nice way of determining whether a function in a trait is a method or just a regular associated function: If the first parameter is `self`, it's a method. (`self` has the type the trait is implemented on; a (mutable) reference to `self` is fine as well.)

```rust
struct Amet {}

trait Lorem {
    fn ipsum(&self) -> i32;
}

impl Lorem for Amet {
    fn ipsum(&self) -> i32 {
        42
    }
}

#[test]
fn ipsum_test() {
    let amet = Amet {};
    let result = amet.ipsum();
    assert_eq!(42, result);
}
```

You can still call this with the syntax we've seen before[^ufcs]: `Lorem::ipsum(&amet)`.

[^ufcs]: Using the fully qualified name of the trait and method is often called "Universal function call syntax" (UFCS), but should probably be called "fully qualified trait and method name syntax" (FuQuTraMeNS).

## Everything else

This is basically it. There is a whole lot of more cool stuff to discover, though! Here are some things to start with:

- Anonymous traits implemented on one type (`struct Foo(i32); impl Foo { fn new(x: i32) -> Foo { Foo(x) } }` called like `Foo::new(12)`)
- Generic traits with bounds and where clauses (`impl<T> Foo for Option<T> { … } where T: Eq`)
- Derivable traits (e.g. `Debug`, `PartialEq`, and `Clone`)
- Default implementations for methods (writing the body of an associated function in the trait definition using only other accessible methods)
- Extension traits (traits that are implemented on types that implement another trait)
- Marker traits (special "empty" traits like `Send` and `Sync`)
