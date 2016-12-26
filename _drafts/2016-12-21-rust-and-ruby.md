---
title: Programming cross-pollination with Rust and Ruby
categories:
- rust
- programming
---
I hear a lot of people new to Rust are Ruby programmers. I'm kinda the opposite. While I've been semi-involved with Ruby (mostly Rails) projects from time to time since at least 2011, I've never been _that much_ into Ruby the language. Rust, on the other handy, I've been _loving_ since 2014.

Now, I've been writing Ruby for a new Rails project for the last 6 month and want to share with you which of Rust's features that I've recently "recognized" in Ruby.

Completely by accident, the [January 2017 meetup of the Rust user group][meetup-2017-01] in Cologne is in cooperation with the local Ruby user group. I'd love to see you there!

[meetup-2017-01]: http://rust.cologne/2017/01/18/ruby-meets-rust.html

## First things first

Rust is a programming language with a focus on being able to do high performance, possibly low-level things, without overhead. Its most popular feature is an innovative type system that tracks ownership of resources, which offers memory safety guarantees and eliminates data races in concurrent code while not impacting runtime performance. Said type system is also powerful enough to allow pretty high-level abstractions with some really nice properties.

I've previously written about [Rust's ownership and borrowing][ownership] and its [trait systems][traits].

[ownership]: {% post_url 2016-08-02-rust-ownership-and-borrowing-in-150-words %}
[traits]: {% post_url 2016-12-13-trait-driven-development-in-rust %}

## Traits are like mixins

Rust is not object-oriented in the way Ruby is. There is no "class" concept, and no inheritance. While there is dynamic dispatch (message passing but not string-ly typed), it is no like `.send(:method_name, *args)` in Ruby.

As I described in [Trait Driven Development][traits], Rust's trait system is quite powerful. You can think of an "object" in Rust like a data type (attributes) that implements several traits (which contain methods). By implementing an "anonymous trait", you can add methods to a data type itself. E.g., for a structure `Foo` you can write `impl Foo { fn bar() { println!("bar"); } }` to add a `bar` method to `Foo` that you can call like `Foo::bar()`.

This separation of defining the data types and their behavior is pretty different from how you write Ruby. Imagine a class that includes several mixins (like Rails' concerns). And then, after defining the class, you can add more mixins. And they don't overlap! If two traits have the same method name, you can call both (the compiler will ask you to specify which trait's method you want, though).

Additionally, as this is a statically typed language, you can define bounds on types based on the traits they implement. In Ruby, you might write `x.respond_to?(:<)` if you want to see if you can do `x < y`; in Rust you just write `x < y` and it will fail to compile (instead of fail at runtime) if the types of `x` and `y` can't be compared. Or, if you write generic code, you can add something like `X: Ord` to make sure all parameters of type `X` can be compared[^ord].

[^ord]: It's more complicated than that, of course. Just have a look at [`std::cmp::PartialOrd`].

[`std::cmp::PartialOrd`]: https://doc.rust-lang.org/stable/std/cmp/trait.PartialOrd.html

Traits are pretty grandiose and I don't think I can do them justice in a few sentences here. I'll leave this topic with a funny quote I read [recently](https://www.reddit.com/r/rust/comments/5gxrka/a_spot_of_humor_including_how_others_view_our/) (but which was deleted by the author since then):

>> But aren't we all just objects in a global scope?
>
> Not in Rustland. We only have good Traits.

## enum

Have you ever used ActiveRecord's enum type to represent a field that can only have one of a few different values? Rust has a language feature for this.

```rust
enum Color { Red, Green, Blue }
```

If you encounter a variable of type `Color`, the compiler requires you to consider all variants (or at least explicitly test for one).

To make this more interesting, enum variants can also contain data:

```rust
enum Color { Red, Green, Blue, Other(String) }
```

Hm, a `String`? That doesn't make sense. Let's define a color in RGB notation instead (three 8-bit channels of values from 0 to 255):

```rust
enum Color {
    Red,
    Green,
    Blue,
    Other { r: u8, g: u8, b: u8 }
}
```

## No nil surprises

Rust has an `Option` type, and there is no such thing as `nil` (or `null`, or `undefined`):

```rust
enum Option<T> { Some(T), None }
```

The `T` above is a placeholder for any other type. To get the value out of an `Option` you need to either use `match` (like `switch`, but with pattern matching on types and enum variants), or use one of the nice methods implemented on `Option`, like:

```rust
let optional_x = Some(42);
let x = optional_x.unwrap_or(0);
```

The `unwrap_or` gives you the value, or, if the `Option` is `None`, the default you specified.

## not impl'd

A coworker of mine recently did something clever. He wrote a bunch of models that represented steps in a workflow with several forms.

In some steps, you could access a property called `order_date`, but not in others. So, what did he do?

```ruby
def order_date
  raise NotImplementedError
end
```

This way, every step class responded to the same method calls, and it was easily testable that some did not implement this one method.

Rust can do this at compile time. Session types.

## `delegate` = `Deref`

## `%w(…)`

Worte as a macro in 2min: [`w!`](https://gist.github.com/killercup/8b71c62ab51585b7e977d95601ba1a08):

```rust
w![foo bar baz]
```

## std::cmp::Ordering

Do you know Ruby's "spaceship operator" `<=>`? `x <=> y` returns the "ordering" of `x` and `y`. `-1` if `x < y`, `0` if `x == y`, and `1` if `x > y`. Why does it return one of `{-1,0,1}`? Instead, it could easily return a custom data type that gives you some more information, or methods to continue comparing. Like `enum std::cmp::Ordering {Less, Equal, Greater}` in Rust.

