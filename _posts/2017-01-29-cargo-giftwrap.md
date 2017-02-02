---
title: "Idea: cargo-giftwrap - giving the gift awesome Rust libraries"
categories:
- rust
- idea
discussions:
  "Twitter": "https://twitter.com/killercup/status/825667449668382721"
  "Github Issue #8": "https://github.com/killercup/scribbles/issues/8"
---
Here are some things in Rust's ecosystem that I really like:

0. The awesome people
1. Well documented libraries by awesome people
2. Automation to help awesome people focus on awesome stuff

I would like to add something to that.

## My thoughts so far

- [Good practices for crates](https://pascalhertleif.de/artikel/good-practices-for-writing-rust-libraries/)
- [Elegant APIs in Rust]({% post_url 2016-07-21-elegant-apis-in-rust %})
- [Doc string style]({% post_url 2016-08-17-machine-readable-inline-markdown-code-cocumentation %})
- [Writing guides with doc tests]({% post_url 2016-12-28-teaching-libraries %})

## cargo-giftwrap

My idea is this: A new `cargo giftwrap`[^naming] subcommand that automatically tries to ensure the Rust library it is executed in is top-notch, i.e.:

- `Cargo.toml` has
	- well-formatted authors
	- license
	- descriptions
	- repository OR website OR documentation (more is better)
	- Readme file name
	- keywords and categories
- `.gitignore` and `.editorconfig`
- `README.md` with
	- Code example(s)
	- Link to API docs (ideally docs.rs)
	- Contribution section
- Has a license
- Has CI integration
- Is documented (`#[deny(missing_docs]`)
- Passes `clippy`
- Has unit and/or integration tests
- Has `examples/` with code that builds and/or `docs/` with guides
- Is formatted with `rustfmt` (`diff == 0`)

Running `cargo giftwrap` will check which of these requirements are and try to add what is missing in an interactive manner. (Ideally, you would run this as a pre-publish hook.)

## So far, this is just an idea

If you want to make it real: That's awesome! Get right on it! (Mentioning me on GitHub, or sending me an email would be great.)



[^naming]: Naming is [hard]. If you don't like "giftwrap", [Matthias Endler][mre] [suggests][mre-names] "tidy", "neat", or "lector".

[hard]: {% post_url 2017-01-20-programming-wisdom %}
[mre]: https://github.com/mre
[mre-names]: https://twitter.com/matthiasendler/status/825707332218847235
