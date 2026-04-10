---
title: Learning Programming Concepts by Jumping in at the Deep End
categories:
- programming
- teaching
- rust
---

There are many different ways to learn something;
one that I enjoy from time to time is what I'd call the "jump in at the deep end":
Look at the solution to a problem and study each of its details
until you understand all the concepts.

This is in contrast to a tutorial-style learning
where you learn one thing after another and gradually build more complex things.
I like the "deep end" approach
because it's a very personal learning style.
It often gives me a way to
discover interesting aspects of things myself,
try to find out how parts work together,
and play around with the material
until I think I've got how it works.
And while the road to understanding might be full of little frustrations and missing knowledge,
I find it a very rewarding exercise.
(Or maybe I'm just one of those people who like to geek out about neat concepts.)

Recently, I came across this task:
Count the individual words in a given text.
The solution I found seemed like a good "deep end" problem to me.
It's short and yet full of different concepts.

Here's what I'd write (in Rust):

```rust
use std::collections::HashMap;

fn count_words(text: &str) -> HashMap<&str, usize> {
    text.split(' ').fold(
        HashMap::new(),
        |mut map, word| { *map.entry(word).or_insert(0) += 1; map }
    )
}
```

It's just 8 lines!
(You can [play with the code here][playground].)

And here are the concepts you should study to fully understand what's going on
(in no particular order;
I tried to add a lot of links):

[playground]: https://play.rust-lang.org/?gist=1c48ef7279a947fcaba9e59ea2673386&version=stable

- [Functions][]: `fn count_words`
- [Modules][] and [imports][]: `use std::…`
- [Strings][] and [characters][]: `&str` and `' '` are guaranteed to be UTF-8
- [Slices][]: views into/references to memory and, in Rust, their lifetimes: the `&str`s in the hash map are slices of the input `text`
- Iterators: `split` returns a type that implements [`Iterator`][]
  - [`fold`][] (a.k.a. `reduce`): A core part of functional programming ([more information][wiki-fold])
  - `Iterator`: a [trait][]
- Map data type: [`HashMap`][]
  - [Hashing][]
  - [Generic data types][generics]: `Split<'a, P>`, `HashMap<K, V>`
- Rust's [entry API][]: A view into a map with the ability to transform/add items
  - Where is the entry API defined? [RFC 216][], [RFC 509][], [RFC 921][]
  - [Enums][]: `enum Entry { Occupied(…), Vacant(…) }`
- [closures][]: `|x, y| { … }`
- Implicit `return`, last expression in a block gets returned: `{ …; map }` returns `map`
  - [statements and expressions]
- Mutable vs. immutable [variable bindings][]: `mut map`
- [References][], [pointers][], [dereferencing][]: `*thingy` and `&thingy`
- [Integer sizes][]: `usize`
- Built-in operators: [`+=`][]

- - -

Note that most of these concepts are not special to Rust.
I've just written this in Rust because it's the language I currently use the most in my free time,
and also because it's a language that exposes you to a lot of interesting concepts.

Just for comparison,
here's the same in JavaScript
(play with it on [JSBin]):

```js
function count_words(text) {
  return text.split(' ')
    .reduce((map, word) => {
      map[word] = map[word] ? map[word] + 1 : 1;
      return map;
    }, {});
}
```

[functions]: https://doc.rust-lang.org/1.20.0/book/second-edition/ch03-03-how-functions-work.html
[modules]: https://doc.rust-lang.org/1.20.0/book/second-edition/ch07-00-modules.html
[imports]: https://doc.rust-lang.org/1.20.0/book/second-edition/ch07-03-importing-names-with-use.html
[strings]: https://doc.rust-lang.org/1.20.0/book/second-edition/ch08-02-strings.html
[characters]: https://doc.rust-lang.org/1.20.0/std/primitive.char.html
[slices]: https://doc.rust-lang.org/1.20.0/book/second-edition/ch04-03-slices.html
[`Iterator`]: https://doc.rust-lang.org/1.20.0/book/second-edition/ch13-02-iterators.html
[`fold`]: https://doc.rust-lang.org/1.20.0/std/iter/trait.Iterator.html#method.fold
[wiki-fold]: https://en.wikipedia.org/wiki/Fold_(higher-order_function)
[trait]: https://doc.rust-lang.org/1.20.0/book/second-edition/ch10-02-traits.html
[`HashMap`]: https://doc.rust-lang.org/1.20.0/book/second-edition/ch08-03-hash-maps.html
[Hashing]: https://en.wikipedia.org/wiki/Hash_function
[generics]: https://doc.rust-lang.org/1.20.0/book/second-edition/ch10-01-syntax.html
[entry API]: https://doc.rust-lang.org/1.20.0/std/collections/hash_map/enum.Entry.html
[RFC 216]: https://github.com/rust-lang/rfcs/blob/a7cd91048eea3d7ae83bec20446e62bad0c45381/text/0216-collection-views.md
[RFC 509]: https://github.com/rust-lang/rfcs/blob/a7cd91048eea3d7ae83bec20446e62bad0c45381/text/0509-collections-reform-part-2.md
[RFC 921]: https://github.com/rust-lang/rfcs/blob/a7cd91048eea3d7ae83bec20446e62bad0c45381/text/0921-entry_v3.md
[Enums]: https://doc.rust-lang.org/1.20.0/book/second-edition/ch06-01-defining-an-enum.html
[closures]: https://doc.rust-lang.org/1.20.0/book/second-edition/ch13-01-closures.html
[statements and expressions]: https://doc.rust-lang.org/1.20.0/book/second-edition/ch03-03-how-functions-work.html#statements-and-expressions
[variable bindings]: https://doc.rust-lang.org/1.20.0/book/second-edition/ch03-01-variables-and-mutability.html
[references]: https://doc.rust-lang.org/1.20.0/book/second-edition/ch04-02-references-and-borrowing.html
[pointers]: https://en.wikipedia.org/wiki/Pointer_(computer_programming)
[dereferencing]: https://doc.rust-lang.org/1.20.0/book/second-edition/ch15-02-deref.html
[Integer sizes]: https://doc.rust-lang.org/1.20.0/book/second-edition/ch03-02-data-types.html#integer-types
[`+=`]: https://doc.rust-lang.org/nightly/std/ops/trait.AddAssign.html
[JSBin]: https://jsbin.com/lahovadamo/1/edit?js,console
