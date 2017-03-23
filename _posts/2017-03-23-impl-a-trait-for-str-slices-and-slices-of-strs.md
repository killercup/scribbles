---
title: "How to implement a trait for &str and &[&str]"
categories:
- rust
discussions:
- "/r/rust": https://www.reddit.com/r/rust/comments/6134oc/how_to_implement_a_trait_for_str_and_str/
---

Rust has a pretty powerful type system, but some things are not that easy to express. Follow me on a journey where we try to implement a bit of method overloading by using traits with funny constraints and discover some interesting ways to convince Rust that everything is fine.

**Note:** This post assumes a general understanding of Rust. There will also be some hairy type signatures -- don't be afraid of those! Just skip the parts you don't understand.

So, let's get started! Our goal is this: We want to have a function that can take both string slices as well a slice of string slices:

```rust
foo("Hello World");
foo(&["Hello", "World"]);
```

The actual use case is that the string slice can internally be split into subslices – or the user can do it themselves (to make sure it's correct, or to do it programmatically).

We do this by implementing a new trait[^traits] `ToFoo` for both types, so our `foo` function can take any argument that implements `ToFoo` and use it to convert it to something it can use:

[^traits]: For information about traits, read [this post][tdd], [this chapter][book] in the book, or [this chapter][book2] the in-progress second edition of the book.

[book]: https://doc.rust-lang.org/book/traits.html
[book2]: http://rust-lang.github.io/book/second-edition/ch10-00-generics.html
[tdd]: {% post_url 2016-12-13-trait-driven-development-in-rust %}

```rust
trait ToFoo {
    fn to_foo(&self) -> Vec<String>;
}
```

## First try

Sounds easy enough, right? Let's write it down ([playpen][play1]):

[play1]: https://play.rust-lang.org/?gist=a29484d0546d76e09fd3b789df4bf77b&version=stable&backtrace=0

```rust
trait ToFoo<'a> {
    fn to_foo(&'a self) -> Vec<String>;
}

impl<'a> ToFoo<'a> for &'a str {
    fn to_foo(&'a self) -> Vec<String> { unimplemented!() }
}

impl<'a, 'b> ToFoo<'a> for &'a [&'b str] {
    fn to_foo(&'a self) -> Vec<String> { unimplemented!() }
}

fn main() {
    println!("{:?}", "yay".to_foo());
    println!("{:?}", (&["yay"]).to_foo());
}
```

Sorry about the whole `'a` noise[^lifetimes]! Please ignore this for a minute!

[^lifetimes]: If you are not used to Rust: This is not how most Rust code looks. What are these "tick a" things for? I'm glad you asked! One of Rust's defining features is that it is able to ensure that references to `x` (`&x`) are valid only as long as the resource `x` is valid. This prevents some pretty serious bugs! The `'a` syntax allows us to give name to these life times so we can, for example, define references `&'a x` and `&'b y` and specify that `'a` is valid for (at least) as long as `'b` by writing `'a: 'b`. And usually, it has some pretty nice inference rules for that; in trait definitions however, Rust requires us to be explicit.

But wait -- this doesn't compile!

```text
no method named `to_foo` found for type `&[&'static str; 1]` in the current scope
```

Sadly, we implemented our trait on a slice (that `&[_]` thing), but gave it a `&[_; 1]`. The difference? `&[_; 1]` is a reference to an array with a known size.

We have two options: Either add `[..]` (create slice with open range, i.e., all elements) to the parameter, or implement the trait this array type. The first option is perfectly valid if it is you who writes writes that `foo(&["bar"][..])`, but what I am aiming for here is to present a nice API to the user of this theoretical library; and I don't to tell people to add some magic characters at the end of their argument.

Sadly, as of Rust 1.16[^rust-version] we would need to write implementations for _all_ array types we want to support. So, one for `&[_; 1]`, another for `&[_; 2]`, and so on. We could do that in a macro, but it'll just generate a whole bunch of code and not be very elegant. Also, it should be trivial to represent some `&[_, n]` as slice, right?

[^rust-version]: rustc 1.16.0 (30cf806ef 2017-03-10)

Let's try something else instead!

## Second try

Rust has a pretty nice collection of conversion traits (see [std::convert]), and one of them is [AsRef], which does "reference-to-reference conversion". Basically, you give it an `&x` and it returns a `&y` of a compatible type to you:

[std::convert]: https://doc.rust-lang.org/std/convert/index.html
[AsRef]: https://doc.rust-lang.org/std/convert/trait.AsRef.html

```rust
pub trait AsRef<T> where T: ?Sized {
    fn as_ref(&self) -> &T;
}
```

Note that it is not `... for &T` but `... for T` and then has a method that takes `&self`. Okay, here's a simplified new version ([playpen][play2]):

[play2]: https://play.rust-lang.org/?gist=9bc7e3895ea82f5842fea82c6d689bb5&version=stable&backtrace=0

```rust
trait ToFoo {}

impl<'a> ToFoo for &'a str {}
impl<'a, T> ToFoo for T where T: AsRef<[&'a str]> {}
```

Aaaand it does not compile:

```text
error[E0119]: conflicting implementations of trait `ToFoo` for type `&str`:
 --> <anon>:4:1
  |
3 | impl<'a> ToFoo for &'a str {}
  | ----------------------------- first implementation here
4 | impl<'a, T> ToFoo for T where T: AsRef<[&'a str]> {}
  | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ conflicting implementation for `&str`
```

What? "Conflicting implementation for `&str`"? Where? Ohhhhh… There's this `impl` in `std`:

```rust
impl<'a, T, U> AsRef<U> for &'a T where
    T: AsRef<U> + ?Sized, U: ?Sized
```

So, Rust is clever enough to see that both `&_` and `&[_]` match that `AsRef` implementation, but not clever enough differentiate the `impl AsRefs`s to recognize that our second `impl ToFoo` should only ever work for `&[_]`.

So, the `&` is the problem, right?

## Third time's the charm

First of all, let's repeat our trait signature again, so you don't have to scroll up:

```rust
trait ToFoo {
    fn to_foo(&self) -> Vec<String>;
}
```

Now, let's implement our trait for `str` instead of `&str`. By the way: `str` is a type that we don't know the size of -- but let's not get hung up on that now.

```rust
impl ToFoo for str {
    fn to_foo(&self) -> Vec<String> { unimplemented!() }
}
```

See, we're only ever using `&str` anyway, as our method is taking `&self`. No need to worry.

Next: Implement the trait for each `T` where a _reference_ to it implements `AsRef<[&str]>`:

```rust
impl<'a, T> ToFoo for T where T: AsRef<[&'a str]> {
    fn to_foo(&self) -> Vec<String> { unimplemented!() }
}
```

It took me quite a while to get to this point. Now, we can use it like this ([playpen][play3]):

[play3]: https://play.rust-lang.org/?gist=82e565d5c1e97f5a8f3635d2672a8beb&version=stable&backtrace=0

```rust
fn foo<'a, T: ToFoo + ?Sized>(_x: &'a T) {
    unimplemented!()
}
```

(The `?Sized` is to allow the `str` impl.)

Nice!

Finally, you can find the real-life code that uses this pattern [in this commit][commit].

[commit]: https://github.com/killercup/assert_cli/commit/a04a0e1a57ee83c7634e6ff1fa8494a8a73b54cd
