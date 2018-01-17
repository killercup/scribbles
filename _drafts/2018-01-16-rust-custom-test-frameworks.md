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

## Goals

- Allow people to author test frameworks in a flexible way
- Continue to ship test framework with rust
	- keep `#[test]` and `#[bench]`
	- add compiletest?
- support "unusual" test frameworks
	- e.g. port criterion, quickcheck, fuzz

## Open issues

- how to write test frameworks
	- like proc-macros
	- support fancy stuff like macros in rspec style
- what to output
	- see above, we want human readable output as well as json
	- json should be "the same" across test frameworks
		- as in: a common parser should work
		- there might be special fields that are safe to ignore
- allow to define test cases at runtime ("dynamic tests")
	- have a test registry that gets seeded with test functions to run
	- but also allow to register new/more tests at runtime by injecting the registry into tests
		- something like

		  ```rust
		  #[test]
		  fn foo(r: &TestRegistry) {
		      for f in glob("fixtures/") {
		          r.run_test(f.filename(), || { /* test code */ });
		       }
		  }
		  ```
		  
		  (assuming we extend the default `#[test]` so that it supports injecting the `TestRegistry`)

## Current design work

- [forum thread][internals-thread]
- [Manish's eRFC][erfc]


[internals-thread]: https://internals.rust-lang.org/t/past-present-and-future-for-rust-testing/6354
[erfc]: https://gist.github.com/Manishearth/a3b561406f5fe21357e4e3408e0cec49
