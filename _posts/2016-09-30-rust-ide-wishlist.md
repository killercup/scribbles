---
title: Rust IDE Features Wishlist
categories:
- rust
---
Some ideas for editor/IDE features to make working on Rust code more pleasant.

## Reading code

- Go to definition
- Show where a function is used
- Show documentation
- Show type on hover

## Writing code

- Show errors/warnings inline (including those from external lints like [clippy](https://github.com/Manishearth/rust-clippy))
- Autocomplete (stand-alone tool: [racer](https://github.com/phildawes/racer))
- Automatic code formatting (using [rustfmt](https://github.com/rust-lang-nursery/rustfmt))
- Insert the usual boilerplate code for `impl`s (the method signatures from the trait definition)
- Add missing imports/use statements (when they can be guessed)
- Apply suggestions for "Did you mean …?" errors (e.g. for typos in identifier names)

## Refactoring code

- Apply suggestions from ([clippy](https://github.com/Manishearth/rust-clippy)) lints (experimental tool: [rustfix](https://github.com/killercup/rustfix)), e.g.:
	- Remove unneeded return statements and redundant closures
	- Replace `.or_insert(Vec::new())` with `.or_insert_with(Vec::new)`
	- Use `list.iter().enumerate` instead of `for i in 0..list.len()`
- Replace glob imports with a concrete list of used imported items
- Extract `impl Type` into a new trait
- Replace a function argument with a type parameter
	(e.g., with shortcuts for `fn foo(x: i32)` → `fn foo<T: Into<i32>>(x: T)`)
- Move type definition and `impl`s into new module
	(i.e., move parts of a large module into new file)
- Move `#[test]` functions into a `#[cfg(test)] mod test`

- - -

Some of these things already work with [RustyCode](https://github.com/saviorisdead/RustyCode), the extension for VSCode I'm currently using.

The official and most promising effort for implementing the features mentioned above in a way that editor/IDE plugins can easily use them is the plan for a Rust Language Server:

- [RFC #1317](https://github.com/rust-lang/rfcs/blob/1f5d3a9512ba08390a2226aa71a5fe9e277954fb/text/1317-ide.md)
- [rustls](https://github.com/jonathandturner/rustls) (experimental implementation, not to be confused with the [Rust TLS stack](https://crates.io/crates/rustls))
- [rustls_vscode](https://github.com/jonathandturner/rustls_vscode) (VSCode extension using language server)
