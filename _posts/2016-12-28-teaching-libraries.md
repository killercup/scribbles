---
title: Teaching libraries through good documentation
categories:
- rust
---
How do you teach people how to use a complex framework or library[^framework-or-library]? Here's what comes to mind: Tutorials (guides), API documentation, great error messages, or forums/chats. Maybe video tutorials, and books, too. Since guides are one of the most effective ways to get people started, I've been musing about them for a while.

[^framework-or-library]: When does a library become a framework? When it defines your application's structure?

## Guides

Recently, Sergio Benitez released the [Rocket] web framework for Rust. There are other frameworks/libraries for writing web application servers, but what really sets Rocket apart is the very nice API[^nightly] and documentation thereof. Reading the guide, it looks quite easy to write a simple application (there is a guide to write a pastebin that takes about 15 min to follow).

[Rocket]: https://rocket.rs

[^nightly]: Sadly, Rocket's API depends on unstable compiler features. I hope to see the most important ones ([specialization] and [procedural macros]) becoming stable in 2017, though.

[specialization]: https://github.com/rust-lang/rfcs/blob/90240c53f2a223fd0c24712fcce50ccd0b8bc850/text/1210-impl-specialization.md
[procedural macros]: https://github.com/rust-lang/rfcs/blob/90240c53f2a223fd0c24712fcce50ccd0b8bc850/text/1566-proc-macros.md

This is in stark contrast to [iron], a more minimalistic and very modular framework/set of libraries that allow you to build middleware-based web applications. This means that for each aspect you want to add to your application (routing, cookies, etc.), you include another library and compose them all together. Getting started with iron up to the point that you can build a pastbin with it, is a lot harder. Obviously, one could write a guide on how to write that with iron (and maybe someone already did), but you still need to familiarize yourself with the design principles of iron, what modules are available, and understand how they compose. Rocket gives you that in one opinionated package and you can *just start writing code.*

[iron]: http://ironframework.io

I'm more skeptical when it comes to more complex things that the guide does not cover, though. Not just in Rocket, but in most other complex libraries/frameworks as well. Because, at some point, you need to leave the nicely written guides and tutorials behind and dive into the raw and unvarnished truth that is the API documentation[^rustdoc]. And nobody told you how to find anything in there.

[^rustdoc]: Oh, and I'm not talking about some weird, shabby API docs from the 1990s built on HTML3 framesets and tables. Rocket's (as well as Diesel's) API docs are rendered by rustdoc, which offers a pretty good search, nicely rendered descriptions, and (once you get used to it) is easy to navigate.

I try to help out people who come to [diesel's][diesel] [Gitter channel][diesel-gitter]. A lot of questions are on how to get into more difficult stuff, after having read the guide (like Rocket, diesel has a guide on how to write a sample application). Most people are quite clever, know what they want, and see that it's quite likely that all parts are already there. But it's still hard to find this in the API documentation, because the library is *very* generic and it's not always obvious how things work together.

[diesel]: http://diesel.rs
[diesel-gitter]: https://gitter.im/diesel-rs/diesel

Some tricky cases (with answers):

- > How do you add multiple predicates to a `where` clause?

	Calling `.filter` twice `AND`s both predicates together. (You can find it in the description of [`FilterDsl`].)
- > I saw `.or` used in an example. What can I use it with?

	You can call `.or` on everything that:
	1. can be turned into an expression, and where 
	2. that expression is boolean. 

	You can see this by searching for `or`, find [`BoolExpressionMethods`], and then look at what `BoolExpressionMethods` is implemented on: `impl<T: Expression<SqlType=Bool>> BoolExpressionMethods for T` (and guessing what `Expression` means).

[`FilterDsl`]: https://docs.rs/diesel/0.9.1/diesel/prelude/trait.FilterDsl.html
[`BoolExpressionMethods`]: https://docs.rs/diesel/0.9.1/diesel/expression/expression_methods/bool_expression_methods/trait.BoolExpressionMethods.html

Luckily, a lot of these cases "just work" as I would expect them to work. That's nice, but you shouldn't rely on that. This is why I ask people if they want to write some of what they discovered/learnt/accomplished down as a short blog post/tutorial/guide/etc. Here are a few things I have on my "maybe write a tutorial on that" list:

- How to use associations
- Using diesel with a more complex schema (e.g., we recently introduced composite primary keys)
- Using custom data types (e.g., making `ToSql` and `FromSql` work for a `Point` struct)
- A "larger roundtrip": Like the current "Getting Started" guide, but aside from defining a schema and doing some CRUD, also add validation, (de)serialization, and great error handling.

## Guides are integration tests

(This section was added after a [talking to][issue4] [@fasiha]. Thank you for the inspiration!)

[issue4]: https://github.com/killercup/scribbles/issues/4
[@fasiha]: https://github.com/fasiha

Thinking more about it, I had an epiphany: *Guides are like integration tests!* In fact:

| Unit tests        | Integration tests      |
| API documentation | Guides and tutorials   |
| ================= | ====================== |
| Singular aspects  | The library as a whole |

So, let's make writing guides as easy as writing integration tests![^cargo-tests]

[^cargo-tests]: Rust's package manager Cargo makes it really easy to put a bunch of source files in a `tests/` directory and treat each of these files as an application that depends on your library.

## Merging two worlds

Here are some ideas on how to make these guides even better:

- Treating code snippets in guides as doc tests to make sure the examples in the guide always work
- Easy/automatic linking to the API docs
	- In the prose when mentioning a struct/trait/macro
	- In code examples when hovering over an item
- Easily turn guides into example projects and vice versa: A lot of libraries already include an `examples/` directory with code we can build guides on. We can e.g. use literate programming[^rs-md], if we need to manage to
	- somehow embed all necessary meta data files (like `Cargo.toml`),
	- restrict the code in the guide to be _additive_ (i.e., we can't easily write a partial implementation and then later replace that; we can however wrap code in modules like `mod try_1 { … }` and `mod try_2 { … }` and so on),
	- and make rustdoc and [tango] work together nicely.

[^rs-md]: Basically, teach the compiler to treat markdown files as Rust code.

[tango]: https://github.com/pnkfelix/tango

I'm thinking about making this work with rustdoc, which already has a lot of these capabilities. Making rustdoc work as a library, or adding some features of [mdBook] to rustdoc would probably take as 90% of the way.

[mdBook]: https://github.com/azerupi/mdBook

I've also been thinking about making API docs better/more structured by specifying [some guidelines][doc-lints]. It will also be interesting to see if enforcing some of these guidelines, like "each public method/function needs an example", can further ensure that all parts of an API are documented and easy to grasp.

Jimmy Cuadra wrote [an RFC][rfc-pr-1713] on the topic, but it was closed as he didn't have to time to revise it. I would love to see a new RFC (with my suggestions); and maybe I'll have some time in the new year to write one.

[doc-lints]: {% post_url 2016-08-17-machine-readable-inline-markdown-code-cocumentation %}
[rfc-pr-1713]: https://github.com/rust-lang/rfcs/pull/1713
