---
title: The Secret Life of Cows
categories:
- rust
discussions:
  "Reddit": "https://www.reddit.com/r/rust/comments/8o1pxh/the_secret_life_of_cows/"
  "Twitter": "https://twitter.com/killercup/status/1002950105400475649"
  "Twitter again two years later": "https://twitter.com/mgattozzi/status/1229422594371268609"
---

A lot of people at RustFest Paris mentioned Cows
-- which may be surprising if you've never seen [`std::borrow::Cow`][std::borrow::Cow]!

`Cow` in this context stands for "Clone on Write" and
is a type that allows you to reuse data if it is not modified.
Somehow, these bovine super powers of Rust's standard library
[appear][kevins-tweet] to be a well-kept secret
even though they are [not new][llogiqs-post].
This post will dig into this very useful pointer type by
explaining why in systems programming languages you need such fine control,
explain Cows in detail,
and compare them to other ways of organizing your data.

[std::borrow::Cow]: https://doc.rust-lang.org/1.26.1/std/borrow/enum.Cow.html
[kevins-tweet]: https://twitter.com/KevinHoffman/status/1001075501358776322
[llogiqs-post]: https://llogiq.github.io/2015/07/10/cow-redux.html

## Contents
{:.no_toc}

1. Table of contents
{:toc}

## Organizing Data

This is what it all comes down to:
People want to have a good, precise way to organize their data.
And they want their programming language to support them.
That's why a lot of newer languages include a bunch of data structures
optimized for different use cases,
and that is also why software developers are dealing with API documentation so often.
To ensure that your code has the performance characteristics you expect,
it is essential to know which piece of data is represented in which way.

In systems programming languages,
this is in some regards even more important.
You want to know:

1. _exactly_ where your data lives,
2. that it is efficiently stored,
3. that it is removed as soon as you stop using it,
4. and that you don't copy it around needlessly.

Ensuring all these properties is a great way to write fast programs.
Let's look at how we can do this in Rust.

### Where Does Our Data Live

It is quite explicit where your data lives.
By default, primitive types and structs containing primitive types are allocated on the stack,
without any dynamic memory allocation.
If you want to store data of a size only known at runtime
(say the text content of a file),
you need to use a type that dynamically allocates memory (on the heap),
for example [`String`], or [`Vec`].
You can explicitly allocate a data type on the heap by wrapping it in a [`Box`].

(If you're unfamiliar with the notion of "Stack and Heap",
you can find a good explanation in
[this chapter][rust-book-ownership]
of the official Rust book.)

[rust-book-ownership]: https://doc.rust-lang.org/1.26.1/book/second-edition/ch04-01-what-is-ownership.html
[`String`]: https://doc.rust-lang.org/1.26.1/std/string/struct.String.html
[`Vec`]: https://doc.rust-lang.org/1.26.1/std/vec/struct.Vec.html
[`Box`]: https://doc.rust-lang.org/1.26.1/std/boxed/struct.Box.html

Note: Creating a new (not-empty) `String` means allocating memory,
which is a somewhat costly operation.
A language like Rust gives you quite a few options to
skip some allocations,
and doing so can speed up performance-critical parts of your code significantly.
(Spoiler: `Cow` is one of these options.)

### Structuring Data

If you know what you will do with your data,
you can probably figure out how to best store it.
If you for example always iterate through a known list of values, an array (or a [`Vec`]) is the way to go.
If you need to look up values by known keys, and don't care about the order they are stored in, a [hash map] sounds good.
If you need a stack to put data onto from different threads, you can use [crossbeam-deque].
This is just to give you a few examples -- there are books on this topic and you should read them.
A `Cow` doesn't really help you here per-se, but you can use it _inside_ your data structures.

[hash map]: https://doc.rust-lang.org/1.26.1/std/collections/struct.HashMap.html
[crossbeam-deque]: https://crates.io/crates/crossbeam-deque

### Dropping Data

Luckily, in Rust it is easy to
make sure our data gets removed from memory
as soon as possible
(so we don't use up too much memory and slow down the system).
Rust uses the ownership model of automatically [dropping][rust-book-memory-and-allocation] resources when they go out of scope,
so it doesn't need to periodically run a garbage collector to free memory.
You can still waste memory, of course, by allocating too much of it manually,
or by building reference cycles and leaking it.

[rust-book-memory-and-allocation]: https://doc.rust-lang.org/1.26.1/book/second-edition/ch04-01-what-is-ownership.html#memory-and-allocation

### No Needless Copying

One important step towards being a responsible citizen in regard to memory usage is to not copy data more than necessary.
If you for example have a function that removes whitespace at the beginning of a string,
you could create a new string that just contains the characters after the leading whitespace.
(Remember: A new string means a new memory allocation.)
Or, you could return a _slice_ of the original string, that starts after the leading whitespace.
The second options requires that we keep the original data around,
because our new slice is just referencing it internally.
This means that instead of copying however many bytes your string contains,
we just write two numbers:
A pointer to the point in the original string after the leading whitespace,
and the length of the remaining string that we care about.
(Carrying the length with us is a convention in Rust.)

But what about a more complicated function?
Let's imagine we want to replace some characters in a string.
Do we always need to copy it over with the characters swapped out?
Or can we be clever and return some pointer to the original string if there was no replacement needed?
Indeed, in Rust we can! This is what `Cow` is all about.

## What is a Cow Anyway

In Rust, the abbreviation "Cow" stands for "clone on write"[^clone].
It is an enum with two states: `Borrowed` and `Owned`.
This means you can use it to abstract over
whether you own the data or just have a reference to it.
This is especially useful when you want to _return_ a type
from a function that may or may not need to allocate.

[^clone]: Yes, that's right: _Clone_ on write, not _copy_ on write. That's because in Rust, the `Copy` trait is guaranteed to be a simple `memcpy` operation, while `Clone` can also do custom logic (like recursively clone a `HashMap<String, String>`.

### A std Example

Let's look at an example.
Say you have a [`Path`] and want to convert it to a string.
Sadly, not every filesystem path is valid UTF-8
(Rust strings are guaranteed to be UTF-8 encoded).
Rust has a handy function to get a string regardless:
[`Path::to_string_lossy`].
When the path is valid UTF-8 already,
it will return a reference to the original data,
otherwise it will create a new string
where invalid characters are replaced with the `�` character.

[`Path`]: https://doc.rust-lang.org/1.26.1/std/path/struct.Path.html
[`Path::to_string_lossy`]: https://doc.rust-lang.org/1.26.1/std/path/struct.Path.html#method.to_string_lossy

```rust
use std::borrow::Cow;
use std::path::Path;

let path = Path::new("foo.txt");
match path.to_string_lossy() {
    Cow::Borrowed(_str_ref) => println!("path was valid UTF-8"),
    Cow::Owned(_new_string) => println!("path was not valid UTF-8"),
}
```

### A Beefy Definition

With that in mind, let's look at [the actual definition of `Cow`][std::borrow::Cow]:

```rust
enum Cow<'a, B: ToOwned + ?Sized + 'a> {
    /// Borrowed data.
    Borrowed(&'a B),
    /// Owned data.
    Owned(<B as ToOwned>::Owned),
}
```

As you can see, it takes some convincing to have Rust accept this type
in a way we can work with it.
Let's go through it one by one.

- `'a` is the [lifetime][rust-book-lifetime] that we need our data to be valid for.
  For the `Owned` case it's not very interesting
  (to Cow own the data -- it's valid until the Cow goes out of scope),
  but in case the Cow contains `Borrowed` data,
  this lifetime is a restriction set by the data we refer to.
  We cannot have a Cow that refers to already freed memory,
  and rustc will us know when that is possible by mentioning that the Cow outlives its `'a`.
- [`ToOwned`] is a trait that defines a method to convert borrowed data into owned data
  (by cloning it and giving us ownership of the new allocation, most likely).
  The type we receive from this method is an [associated type][rust-book-advanced-traits] on the trait,
  and its name is `Owned` (yep, the same name as the Cow variant, sorry).
  This allows us to refer to it in `Owned(<B as ToOwned>::Owned)`.

  To make this a bit more concrete, let's assume we have a Cow that's storing a `&str` (in the `Borrowed` case).
  The `ToOwned` implementation of `str` has `type Owned = String`, so `<&str as ToOwned>::Owned == String`.
- [`?Sized`][rust-book-sized] is a funny one.
  By default, Rust expects all types to be of a known size,
  which it expresses by having an implicit constraint on the [`Sized` marker trait].
  You can explicitly opt-out of this by adding a "constraint" on `?Sized`.

  The thing is: Not all possible types have a known size.
  For example, `[u8]` is an array of bytes somewhere in memory, but we don't know its length.
  In your application code you won't see a type like this directly,
  you'll see it behind _references_ instead.
  And note: In Rust, the reference itself can contain the length.
  (See what I wrote [above](#no-needless-copying) about slices!)

  But how does that relate to Cow again?
  You see, the `B` in Cow's definition is behind a reference:
  Once directly visible in the `Borrowed` variante,
  and the second type hidden in the [`ToOwned::Owned`] (which is of type [`Borrow<Self>`]).
  Since a Cow should be able to contain a `&[u8]`,
  its definition need to work for `&'a B` where `B = [u8]`.
  That in turn means need to say:
  "we don't require this to be `Sized`, we know it's behind a reference anyway"
  -- which is exactly what the `?Sized` syntax does.

[rust-book-lifetime]: https://doc.rust-lang.org/1.26.1/book/second-edition/ch10-03-lifetime-syntax.html
[`Sized` marker trait]: https://doc.rust-lang.org/1.41.0/std/marker/trait.Sized.html
[`ToOwned`]: https://doc.rust-lang.org/1.26.1/std/borrow/trait.ToOwned.html
[`ToOwned::Owned`]: https://doc.rust-lang.org/1.41.0/std/borrow/trait.ToOwned.html#associatedtype.Owned
[`Borrow<Self>`]: https://doc.rust-lang.org/1.41.0/std/borrow/trait.Borrow.html
[rust-book-advanced-traits]: https://doc.rust-lang.org/1.26.1/book/second-edition/ch19-03-advanced-traits.html
[rust-book-sized]: https://doc.rust-lang.org/1.26.1/book/second-edition/ch19-04-advanced-types.html#dynamically-sized-types--sized

Alright, so far so good!
Let me just point out one thing though:
If you want to store a `&'input str` in a Cow (Using `Cow::Borrowed(&'input str)` for example), what is the concrete type of the Cow?
(The generic one is `Cow<'a, T>`.)

Right! `Cow<'input, str>`!
The type definition for the `Borrowed` variant contains `&'a T`,
so our generic type is the type we refer to.
This also means that `ToOwned` doesn't need to be implemented for references,
but for concrete types, like `str` and `Path`.

Let me note something about that lifetime the Cow carries with it real quick:
If you want to replace the type of `bar` in
`struct Foo { bar: String }`
with a `Cow`,
you'll have to specify the lifetime of the reference the `Cow` can include:
`struct Foo<'a> { bar: Cow<'a, str> }`.
This means that every time you now _use_ `Foo` that lifetime will be tracked,
and every time you take or return `Foo` you might just need to annotate it.

One easy way around this is to use [`'static'`][rust-book-static-lifetime]:
You can omit the lifetime annotation on your struct,
but your Cow can only contain references to static memory.
This might sound less useful than a generic lifetime
-- that's because it is --
but in case of functions and types that either contain or return
new data or static defaults known at compile-time
it can be enough.

[rust-book-static-lifetime]: https://doc.rust-lang.org/1.26.1/book/second-edition/ch10-03-lifetime-syntax.html#the-static-lifetime

## Cows in the Wild

Knowing Cows in theory is fine and dandy,
but the examples we've seen so far
only give you a small glance at when they can be used in practice.
Sadly, as it turns out, not many Rust APIs expose Cows.
Maybe, because they are seen as a thing you can introduce when you have a performance bottleneck,
or maybe it's because people don't want to add lifetime annotations to their `struct`s
(and they don't want to or can't use `Cow<'static, T>`).

### Mixed Static and Dynamic Strings

One very cool use-case for Cows is
when dealing with functions that
either return static strings (i.e., strings you literally write in your source code)
or dynamic strings that get put together at run time.
The [Programming Rust] book by Jim Blandy and Jason Orendorff
contains an example like this:

[Programming Rust]: http://shop.oreilly.com/product/0636920040385.do

```rust
use std::borrow::Cow;

fn describe(error: &Error) -> Cow<'static, str> {
    match *error {
        Error::NotFound => "Error: Not found".into(),
        Error::Custom(e) => format!("Error: {}", e).into(),
    }
}
```

**Small aside:**
See how we are using the [`Into`] trait here
to make constructing cows super concise?
`Into` is the inverse of [`From`]
and is implemented for all types that implement `From`.
So, the compiler knows that we want a `Cow<'static, str>`,
and gave it a `String` or a `&'static str`.
Lucky for us,
`impl<'a> From<&'a str> for Cow<'a, str>`
and `impl<'a> From<String> for Cow<'a, str>`
are in the standard library,
so rustc can find and call these!

[`Into`]: https://doc.rust-lang.org/1.26.1/std/convert/trait.Into.html
[`From`]: https://doc.rust-lang.org/1.26.1/std/convert/trait.From.html

Why is this a very cool example?
Reddit user [0x7CFE][/u/0x7CFE] put it like [this][reddit-e03032q]:

[/u/0x7CFE]: https://www.reddit.com/user/0x7CFE
[reddit-e03032q]: https://www.reddit.com/r/rust/comments/8o1pxh/the_secret_life_of_cows/e03032q/

> The most important thing is that since `Cow<'static, str>` derefs[^deref] to `&str`
> it may act as a drop-in replacement everywhere, where `&str` is expected.
> So, if last error variant was added to an already existing code base,
> all would just work without any major refactoring.
> 
> In other languages like C++ you'd probably have to decide,
> [either] to return allocating version like `std::string` everywhere
> or get rid of the details and suffer from poor ergonomics,
> where you'd need to use such [a] method.
> Even worse, error entry with extra details may be very rare
> and yet, you'd need to make everything allocate just to stick it all in.
> 
> Rust provides a solution that is zero cost for cases where extra details are not needed.
> It's a brilliant example of "pay only for what you use" principle in action.

[^deref]: Thanks to an implementation of the [`Deref`] trait, you can use a reference to a `Cow<'static, str>` in place of a `&str`. That means, a `Cow<'static, str>` can be seen a reference to a string without having to convert it.

[`Deref`]: https://doc.rust-lang.org/1.26.1/std/ops/trait.Deref.html

### Benchmarks

One example for improving program performance by using a Cow is
[this part][regex-redux-cow] of the Regex Redux micro-benchmark.
The trick is to store a reference to the data at first
and replace it with owned data during the loop's iterations.

[regex-redux-cow]: https://github.com/TeXitoi/benchmarksgame-rs/blob/f78f21bffc68cb42dd9311694913ea798535e674/src/regex_redux.rs#L72-L79

### Serde

A great example for how you can use the super powers of Cows
in your own structs
to refer to input data instead of copying it over
is [Serde's][serde] `#[serde(borrow)]` attribute.
If you have a struct like

[serde]: https://serde.rs

```rust
#[derive(Debug, Deserialize)]
struct Foo<'input> {
    bar: Cow<'input, str>,
}
```

Serde will by default fill that `bar` Cow with an owned `String` ([playground][p1]).
If you however write it like

```rust
#[derive(Debug, Deserialize)]
struct Foo<'input> {
    #[serde(borrow)]
    bar: Cow<'input, str>,
}
```

Serde will try to create a borrowed version of the Cow ([playground][p2]).

This will only work, however, when the input string doesn't need to be adjusted.
So, for example,
when you deserialize a JSON string that has escaped quotes in it[^json-quotes]
Serde will have to allocate a new string to store the unescaped representation,
and will thus give you a `Cow::Owned` ([playground][p3]).

[p1]: http://play.rust-lang.org/?gist=c3997391e5bcb2834674c9c3e49e2f0c&version=stable&mode=debug
[p2]: http://play.rust-lang.org/?gist=2247b7e6431010122f0a779531a8ff89&version=stable&mode=debug
[p3]: http://play.rust-lang.org/?gist=31491f2a3e9124f61d03972c9a1dad39&version=stable&mode=debug

[^json-quotes]: `"\"Escaped strings contain backslashes\", he said."`

- - - -

Thanks to Robert Balicki, Alex Kitchens, and Matt Brubeck for reviewing this post!
And also thanks to Brad Gibson for [asking][issue18] about a better explanation on the `?Sized` business
-- which took me less than two years to resolve!

[issue18]: https://github.com/killercup/scribbles/issues/18
