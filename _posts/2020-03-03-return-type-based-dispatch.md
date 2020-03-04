---
title: Return-type based dispatch
categories:
- rust
discussions:
  "Twitter": "https://twitter.com/killercup/status/1234776754750984193"
---

One surprising feature of type inference in languages like Rust
is defining functions with generic return types.
The idea is that by specifying at some later point in the code
which type you want your function to return,
the compiler can go back and fill in the blanks.

For example, let's have a look at this function:

```rust
fn new<T: Default>() -> T {
  T::default()
}
```

## You pick the output

It has no value parameters, but one type parameter, `T`.
That `T` is its return type and also used in the function body.
You can call it like so:

```rust
let x: u32 = new();
```

Or, being explicit about the type parameter, like this:

```rust
let x = new::<i32>();
```

This is quite neat!

## More generic: `collect`

A promising way to be more generic in Rust
is to use more traits!
Have a look at how the [`Iterator::collect`] method is defined:

```rust
fn collect<B: FromIterator<Self::Item>>(self) -> B // ...
```

You can read this type signature as

> Consume self and return something
> of a type that implements can be made `From [an] Iterator`
> for the type of items we are iterating over.

Like above,
we call this by specifying what kind of output type want.
[Looking][`FromIterator` implementors] at some of the types `FromIterator` is implemented for
is pretty revealing of the use cases.
You can get:

- a `Vec` by collecting any items,
- a `BTreeMap` or `HashMap` by collecting tuples,
- but also `PathBuf` by collecting `Path`s,
- and `String` for strings and string slices.

Note: All these types are what you might call "container" types.

## One more for the road

> More generic? More traits.

There is one more gem hidden in `FromIterator`:

```rust
impl<A, E, V> FromIterator<Result<A, E>> for Result<V, E> where
    V: FromIterator<A>, // ...
```

This means:
You can construct a [`Result`] containing
any type of container of items `A`
by collecting items that are `Result`s of type `A`.
(The first `Err` will make the outer `Result` be an `Err`.)
Here's an example, see [the docs][`FromIterator for Result`] for another one:

```rust
let input: Vec<Result<i32, ()>> = vec![Ok(1), Ok(2)];
let output: Result<Vec<i32>, ()> = input.into_iter().collect();
```

Note: If you like type theory:
What we're building is a `Result<<T<A>, E>>`
by collecting `Result<A, E>`s and specifying `T`.

[`Iterator::collect`]: https://doc.rust-lang.org/1.41.1/std/iter/trait.Iterator.html#method.collect
[`FromIterator` implemtators]: https://doc.rust-lang.org/1.41.1/std/iter/trait.FromIterator.html#implementors
[`Result`]: https://doc.rust-lang.org/1.41.1/std/result/enum.Result.html
[`FromIterator for Result`]: https://doc.rust-lang.org/1.41.1/std/iter/trait.FromIterator.html#method.from_iter-14
