---
title: Custom test runners in Rust
categories:
- rust
---
The dev tools team recently discussed
enhancing Rusts's testing story.

## Nomenclature

definitions by manish (see [irc log])

[irc log]: https://mozilla.logbot.info/rust-dev-tools/20180116#c14138184-c14138189

test framework
:	the thing generating stuff

test harness
:	 basically the main() function you generate

test runner
:	runtime support you have inside a test (currently: you can panic)

test output
:	whatever your test harness outputs
:	we want to unify this across different test frameworks, e.g. so IDEs can depend on a JSON output format

## Open issues

- how to define tests
	- support fancy stuff like macros in rspec style
- what to output
	- see above, we want human readable output as well as json
	- json should be "the same" across test frameworks
		- as in: a common parser should work
		- there might be special fields that are safe to ignore
- ship test framework with rust
- support "unusual" tests, e.g. quickcheck, fuzz
- allow to define test cases at runtime
	- have a test registry that gets seeded with test functions to run
	- but also allow to register new/more tests at runtime by injecting the registry into tests
		- e.g. `#[test] fn foo(r: &TestRegistry) { for file in glob("fixtures/") { r.start_test(f.filename()); ... r.end_test(f.filename(), status); } }`

## Current design work

- [forum thread][internals-thread]
- [Manish's eRFC][erfc]

[internals-thread]: https://internals.rust-lang.org/t/past-present-and-future-for-rust-testing/6354
[erfc]: https://gist.github.com/Manishearth/a3b561406f5fe21357e4e3408e0cec49
