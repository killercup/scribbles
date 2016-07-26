---
title: Compile-time website checking
categories:
- idea
- webdev
---
I want a static site generator that enforces a bunch of rules at compile-time so whole classes of errors cannot occur. Similar to [my ideas from last year](https://pascalhertleif.de/artikel/silicon-zucchini/).

## Compile-time checks

1. All templates define their input data structures (e.g. as JSON schema)
	1. Optional fields can only be accessed in an if clause or with explicit defaults, else the compilation will panic (like (implicitly?) calling Rust's `Option::unwrap`).
	2. This includes minimum image dimensions
2. In the same way, content files are validated against content schemas (e.g. JSON schema) as well as the template schemas where they are used.
3. HTML output will be checked with
	1. a HTML5 validator
	2. a simple SEO-sanity validation
		1. Sane outline
		2. Metatags
	3. a validator for Microformats

Whole-page optimisations after the compilation:

- Remove all unused CSS
- Check that all links work

## Other notes

- Build a dependency tree
	- with page templates at root and used partials/required assets as leaves
	- with content pages and content includes
- Pre-compile template variants (code generation)
- Keep as much information as possible to give good errors
- Support auto-reload for templates and assets
	- At first it could be fast enough to always recompile
	- Using code generation and dependency tree: Cache leaves, invalidate up the the tree
- Add simple router facility to generate map of pages
- Ideally, write as stand-alone application
	- node.js currently has best ecosystem, but is hard/impossible to bundle as binary when using native dependencies (which we of course will)
	- Optimisations may depend on stuff like PhantomJS
- [Of course](https://pascalhertleif.de/artikel/silicon-zucchini/):
	- Automatically build editor UIs from content schemas
	- Automatically generate style guides form template filled with random data
