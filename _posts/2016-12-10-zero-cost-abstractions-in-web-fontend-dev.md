---
title: Zero-cost abstractions in web frontend dev
categories:
- tech
- webdev
- incomplete
---
One of the most amazing features of compilers is their ability to not just transform code into machine-readable things but also to _optimize away abstractions_.

Languages like C++ and Rust advertise something called "zero-cost abstractions":

> In general, C++ implementations obey the zero-overhead principle: What you don’t use, you don’t pay for […]. And further: What you do use, you couldn’t hand code any better.
>
> – Bjarne Stroustrup[^stroustrup2012foundations]

[^stroustrup2012foundations]: Stroustrup, B. (2012, March). Foundations of C++. In European Symposium on Programming (pp. 1-25). Springer Berlin Heidelberg.

This can be very powerful, like iterators that compile to machine instructions equivalent to those of hand-coded loops (or `goto`s), or a Futures library that compile down to state-machines[^futures]. The "zero-cost" is meant as "not cost at runtime"; you usually have to pay for these features in term of compile-time, implementation complexity (of a compiler or library), or knowledge you need to have as a developer. The same level of optimizations is usually not possible in interpreted languages like JavaScript or Ruby. Some implementations of JIT compilers are able to optimize away surprisingly complex code[^luafun], but as a developer, you can't rely on it.

[^futures]: See [Zero-cost futures in Rust](https://aturon.github.io/blog/2016/08/11/futures/)
[^luafun]: For example: The amazing LuaJIT's tracing just-in-time compiler can optimize complex functional code using [luafun] (a library for writing functional Lua) to _really_ efficient machine code (see their [Readme][luafun-readme]).

[luafun]: https://github.com/rtsisyk/luafun
[luafun-readme]: https://github.com/rtsisyk/luafun/blob/5c0a3db1fb6c3e9c6ba432cb47774f18b3916ada/README.md

## The problem of bloat

Knowing this, it is sometimes quite hard to see what web frontend development ist like.

Let's say you want to build a new static website for you gardening business. Easy: Add the bootstrap CSS framework for alignment and the navigation bar, some new shiny JavaScript gallery that also brings some images and CSS code, and then, when you decide to really embrace modern web standards, include several polyfills for stuff like `picture` tags, smooth scrolling, and the Fetch API. This, of course, all adds up, and you'll end up with a lot of stuff that gets loaded if though the current page doesn't need it. If you think this is bad, try to imagine what those fancy $40 WordPress themes include, or how many JavaScript needs to be included for a state-of-the-art single-page app.

I think this can be improved up, and some of the technology to do that already exists. For example, tools like [critical css], and [Closure Compiler] can already get rid of some of the unused CSS/JS. Using that to our advantage is not that easy though, and certainly not the default for most developers.

[critical css]: https://github.com/addyosmani/critical
[Closure Compiler]: https://developers.google.com/closure/compiler/

## Tracking precise dependencies

My first assertion is this: If we were to better **specify what the elements of our website[^static-for-now] depend** upon, we could get a lot more abstractions for free. Assuming our "main navigation" element specifies that it needs bootstrap's grid (and only the grid), its own small JavaScript module (that only depends on a media query library with no external dependencies), and its own CSS module (there is [CSS modules] spec), we can resolve all these dependencies and only get what we actually need.

[^static-for-now]: I'm only thinking about static pages here, and hope we can built from that.

[CSS modules]: https://github.com/css-modules/css-modules

## Better compilers

The next step is to use **better compilers** and build tools.

For JavaScript, [babel] is nice to transpile ES2017 code to something that Internet Explorer 11 can parse, and [UglifyJS2] is a nice minimizer for saving precious bytes of file size, but both are no match to optimizing compilers like Google's [Closure Compiler]. The comparison is not really fair anyway: Closure Compiler needs a lot of annotations to be able to use all its optimizations (like rigorous dead-code elimination and inlining). Luckily, I see little to no reason why these annotations can't be generated from the type information available when writing code in TypeScript.

[babel]: http://babeljs.io
[UglifyJS2]: https://github.com/mishoo/UglifyJS2

Targeting CSS, I'm come to like how powerful [SASS] is. Sadly, it has no notion of dependency tracking like [CSS modules], which means that writing `@import "logo"` twice means the code gets injected twice. [PostCSS] looks like solid base to write CSS code transformers on, but I have not used it.

[SASS]: http://sass-lang.com
[PostCSS]: http://postcss.org

In the end, CSS will need to be de-duplicated, relevant assets inlined, and optimized when the whole page has been built.

## Great developer experience

To me, this means basically two things:

1. Quick, incremental builds
2. Readable, meaningful errors that are easy to debug

I'm not even talking about hot code reloading or writing a whole bunch of documentation. Just, make it fast during development (not JS optimizations), and output debuggable code (with SourceMaps).

- - - -

More content to be added.
