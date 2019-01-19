---
title: How to order Rust code
categories:
- rust
discussions:
  "Reddit": "https://www.reddit.com/r/rust/comments/ahgaqo/how_to_order_rust_code/"
  "Twitter": "https://twitter.com/killercup/status/1086013848807718913"
---
**Note:**
This post is about how I arrange the code I write in Rust.
If you wanted to "order" Rust code
in the "hire someone to write code" sense,
you should still keep on reading
as this is excellent material for a job interview.
(Not the opinion I present but having an opinion on the topic.)

## Arrange code to be in the suggested reading order

I try to order the functions/modules/items in my source files
going from most high-level to most-concrete/small-scope.
You might call it **`fn main` first**.

I do this so that when someone opens the file and starts reading
they can get the general idea of what this file is about very quickly
and then, if needed, dive into the details they are looking for.
I think this works especially well for the entry files in a project.

The opposite position would be to start with
the generic helpers, then introduce domain specific types and functions,
and finally have a `main` function
that calls all the things you've defined above it.
I tend to read these files by scrolling to the end
and then moving upwards;
so it just feels weird to someone used to reading European languages.

## This is not necessarily the order I write code in

I typically don't sit down,
write code from top to bottom,
and end up with a perfectly structured and arranged file.
That is not the goal at all:
It's easy enough to copy and paste parts of a file into another,
or use editor/language plugin features to quickly navigate between sections of files
when I'm looking for something specific.
Remember:
My goal of arranging code in the way described above is
for when you read it for the first time.

## Some specifics about Rust code

The order of items usually doesn't matter in Rust
(macros are a weird edge-case).
There are some things to decide though:

### How to order type definitions (struct, enums) and their implementations?

There are two obvious choices:

- Define all the types first and then list all the implementations?
- Interleave the implementations with the types?

I personally am fine with both,
and tend to go with the latter.
I might however split `impl` blocks up
and define some methods (especially private ones)
right next to the functions they are needed for.
(This sometimes feels like ad-hoc single-instance traits.)

[@matklad] had another interesting comment:

> [I] love to read types upfront
> (if you know the set of fields, you know all potential methods that can exists)

### Where to put `use` statements?

To use an item (type, trait, function, etc.) that is not in scope
you can either refer to it by its full path
(e.g., `std::collections::HashMap`)
or import it using
`use std::collections::HashMap;`
after which you can refer it as just `HashMap`.
The issue is:
Where to put these `use` statements?

One typical approach is to put them all at the top of the file.
This "wall of imports"
is what you also see in many other programming languages.
This is a good idea if the only location you can put import statements
is at the root level
and especially if the file contains one "main item"
(e.g., if `foo.java` contains import statements followed by `class Foo { … }`).
In Rust, however,
you don't often have just one item at the root level.
You have a `foo.rs`
that contains a `struct Foo { … }`,
various `impl Bar for Foo { … }` blocks,
possibly some free functions,
and in many cases even unit tests.
So, we should rethink where to put these `use` lines!

One approach I've taken previously is
to keep `use`s as close to the area they are needed as possible.
If I have a function that reads five files,
I add a `use std::fs::File;` at the beginning _of that function._
Sadly,
this breaks down when you want to import a type
to use it in a function's/method's signature or as a field type in a struct:
In that case,
the use `use` needs to be on the level _above_ the usage point
(i.e., on the level of the function/trait/struct definition).
Additionally,
if you have `use std::sync::Arc` above one struct,
it becomes available in the general scope.
So, your next struct that uses `Arc`
doesn't need to have a second instance of that `use` line.

This all lead me to the point where
I often just go back to collecting `use`s at the top of the file.
I will however not write single `use` lines for all the items I want to use,
but instead

- only import the module when I use various items but each of them only a few times (e.g. `use std::sync;` and refer to `sync::Arc` and `sync::Mutex`.)
- make use of Rust's nested imports (e.g. `use std::{error::Error, fs, io::{self, Read}};)`.

### Split public and private interfaces

When the entry file of a package or module[^1] gets to long,
you want to split it up.
A solid approach is to move implementation details are in a separate file,
which might end up being an "helpers" file
or actually be most of the code split up in modules
that are not exposed to the outside.

[^1]: "Package or module"? Yes, and also "application" and "function": This is a fractal property.

In languages that allow specifying the visibility of items on a very granular level
you can very precisely mark only parts of your code as "public interface".
But this means also means that there is a non-public interface:
Indeed, most abstractions have two interfaces:
A public, consumer-facing one,
and an internal one, for "producers".
Consciously separating the two by the layout of your code
will help create maintainable and comprehensible code bases.

### Abstractions on top of abstractions

Often, you end up writing structures that are only used internally
but then get converted into other structures for the consumers of your package/module.
I don't have a good recipe on how to deal with that,
except that I would recommend trying to
the boilerplate/conversion part "obvious"/invisible and
thus highlight the differentiating details.

[@matklad]: https://github.com/matklad
