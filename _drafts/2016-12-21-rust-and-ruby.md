---
title: Programming cross-pollination with Rust and Ruby
categories:
- rust
- programming
- incomplete
---
I hear a lot of people new to Rust are Ruby programmers. I'm kinda the opposite. While I've been semi-involved with Ruby (mostly Rails) projects from time to time since at least 2011, I've never been _that much_ into Ruby the language. Rust, on the other handy, I've been _loving_ since 2014.

Now, I've been writing Ruby for a new Rails project for the last 6 month and want to share with you which of Rust's features I've recently "recognized" in Ruby and which I've missed to most.

Completely by accident, the [January 2017 meetup of the Rust user group][meetup-2017-01] in Cologne is in cooperation with the local Ruby user group. I'd love to see you there!

[meetup-2017-01]: http://rust.cologne/2017/01/18/ruby-meets-rust.html

## Contents
{:.no_toc}

* Table of contents
{:toc}

## First things first

Rust is a programming language with a focus on being able to do high performance, possibly low-level things, without overhead. Its most popular feature is an innovative type system that tracks ownership of resources, which offers memory safety guarantees and eliminates data races in concurrent code while not impacting runtime performance. Said type system is also powerful enough to allow pretty high-level abstractions with some really nice properties.

I've previously written about [Rust's ownership and borrowing][ownership] and its [trait systems][traits].

[ownership]: {% post_url 2016-08-02-rust-ownership-and-borrowing-in-150-words %}
[traits]: {% post_url 2016-12-13-trait-driven-development-in-rust %}

Now, with that out of the way, I'm not gonna explain the language to you (read the official book, it's awesome). This will be about emulating cool stuff from Rust in Ruby and vice versa to make both languages better.

## Adapting Rust-isms

### Traits are like mixins

Rust is not object-oriented in the way Ruby is. There is no "class" concept, and no inheritance. But as I described in [Trait Driven Development][traits], Rust's trait system is quite powerful.

Using traits to define what behavior your data types can have is really nice. And it's not that uncommon in Ruby to try to share common methods between classes that do not inherit from one another. Mixins (or more specifically, "concerns" in Rails) as a programming concept are also very similar to some of the aspects of traits. Sadly, Ruby can't enforce you implement the right methods and only access attributes that actually exist on your type, so be careful.

Having written a lot of Rust, I want to use concerns all over the place. Traits are pretty grandiose and I don't think I can do them justice in a few sentences here. I'll leave this topic with a funny quote I read [recently](https://www.reddit.com/r/rust/comments/5gxrka/a_spot_of_humor_including_how_others_view_our/) (but which was deleted by the author since then):

>> But aren't we all just objects in a global scope?
>
> Not in Rustland. We only have good Traits.

#### not impl'd

Have you ever written an "abstract" class with a method like this?

```ruby
def foobar
  raise NotImplementedError
end
```

This way, every class that inherits from it responds to the same method calls, and it is easily testable that some did not implement this one method while also specifying the interface that classes need to implement.

Rust can do this at compile time, using traits. If you want to go even deeper, have a look at [session types].

[session types]: {% post_url 2016-07-21-elegant-apis-in-rust %}#session-types

### enum

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

#### `std::cmp::Ordering`

Do you know Ruby's "spaceship operator" `<=>`? `x <=> y` returns the "ordering" of `x` and `y`. `-1` if `x < y`, `0` if `x == y`, and `1` if `x > y`. Why does it return one of `{-1,0,1}`? Instead, it could easily return a custom data type that gives you some more information, or methods to continue comparing. Like `enum std::cmp::Ordering {Less, Equal, Greater}` in Rust.

### No nil surprises

In Rust there is no such thing as `nil`[^nil], there is only `Option`:

[^nil]: Or `null`, or `undefined`. A type that unifies all other types. ~~Satan's reincarnation in a type system~~ The corner stone of [the billion dollar mistake][null].

[null]: https://www.infoq.com/presentations/Null-References-The-Billion-Dollar-Mistake-Tony-Hoare

```rust
enum Option<T> { Some(T), None }
```

The `T` above is a placeholder for any other type (yay, generics!). To get the value out of an `Option` you need to either use `match` (like `switch`, but with pattern matching on types and enum variants), or use one of the nice methods implemented on `Option`, like:

```rust
let optional_x = Some(42);
let x = optional_x.unwrap_or(0);
```

The `unwrap_or` gives you the value, or, if the `Option` is `None`, the default you specified.

### Explicit is better than implicit

In Rust, you need to be very explicit if you want to:

- declare mutable variables,
- import parts of a library,
- convert between types,
- or even just dynamically allocate memory.

Ruby, on the other hand, does those things without you knowing it. Still, having written a lot of Rust, I continue to think about these kinds of things, and a lot of others as well. I'm very wary of methods that implicitly save something to the database, or call out to an API without "saying so". I think this leads to more maintainable code.

### Dependency management

Cargo and Bundler were both co-authored by Yehuda Katz, and they "feel" similar. IMHO, compared to Gem and Bundler, Cargo has a better design, though. Cargo:

- has the ability to deal with multiple versions of transitive dependencies easily,
- generates nice documentation for your library (through rustdoc),
- can run your unit, integration, and doc tests,
- allows libraries to specify feature toggles to enable optional functionalities,
- is extensible with arbitrary subcommands like `clippy` or `rustfmt` (or any other program that is called `cargo-$name` really),
- is really fast and compiles libraries using all available CPU cores.

Cargo also assumes a (pretty nice) directory layout to put your source files into. Just the right amount of convention-over-configuration to make it work smoothly.

### Error messages

Oh god, do I miss rustc's error messages. Rubocop is nice and all, but rustc just catches a whole lot more application errors. In combination with [clippy], it's just uncanny how helpful these errors are.

[clippy]: https://github.com/Manishearth/rust-clippy

## Adapting Ruby-isms

What I learned by this: A surprisingly large number of Ruby features can be adapted using Rust's macros.

### `delegate`

For resources that contain multiple sub-resources, it is common to use ActiveSupport's [`delegate`] to pass through certain fields to a sub-resource. For example:

[`delegate`]: http://api.rubyonrails.org/classes/Module.html#method-i-delegate

```ruby
class SpecificProduct < ApplicationRecord
  delegate :color, to: :variant, prefix: false
  delegate :availability, to: :variant, prefix: true
end
```

I implemented a simple version of this as macro in a few minutes: [`delegate!`]. Sadly, it's limited by the power of Rust's current macro system. I think a bit of this can also be done using the `Deref` trait, but I haven't found a good use case yet.

[`delegate!`]: https://play.rust-lang.org/?gist=432651935f3bb53ee5b62b5cec242fc7&version=stable&backtrace=0

### `%w(…)`

You know how in Ruby, `%w(foo bar)` is the same as `["foo", "bar"]`? I wrote that as a macro in Rust in 2 minutes: [`w!`].

[`w!`]: https://gist.github.com/killercup/8b71c62ab51585b7e977d95601ba1a08

```rust
w![foo bar baz]
```

