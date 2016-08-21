---
title: README-driven Development
categories:
- tech
---
Like most other `(\w)DD` techniques[^1], "README-driven Development" wants to guide your approach to software development. This approach works best for small, self-contained projects or libraries, whose API surface is no larger than what fits on a bunch of post-it notes. And of course for projects that you might not want to write _right now_ but just thought about in the shower that seemed like a good idea.

The premise is simple:

> **Before writing any code, write a README file that describes what your software should do.**

(I tend to call the file `README.md` and use Markdown syntax, but you can of course do whatever you want.)

## tl;dr
{:.no_toc}

* Table of contents
{:toc}


## Describe everything

Aside from the usual meta information like

- a general description of the project,
- the name of the authors,
- links to other pages (e.g. generated API documentation),
- the license this is published under,
- and maybe the current build status,

your README file must contain a pretty precise description on how to use this software.

These questions might help:

- What do you need to write to show how to use this?
- What features do you need to show so a user (and the implementor!) understand what you were aiming for?
- How do you _want_ your program/library to be used?

The brilliant thing is this: You don't describe the current state of an existing project, but the ideal state you would love to have.

### With an example

Let's say you want to write a library that can extract the most dominant colors from an image file[^2]: You need to show

1. how to load the library,
2. which functions/data structures the user can use,
3. how to load an image,
4. and then what kind of data you get back.

Imagine the most convenient API for this, and write it down.

## That you want your software to do

Treat your README as a test file—literally! Structure the (code) examples in a way that they can actually be run and will work (once you wrote the code).

You can use tools like [skeptic](https://crates.io/crates/skeptic) to extract code blocks from Markdown files and run them as unit tests.

## And publish the README

After you wrote the README file, you should publish it. Probably with a big "THIS IS JUST AN IDEA SO FAR" warning. Maybe just as a [Gist](https://gist.github.com), but definitely in a place where you (or others) can easily start implementing the features you described.

- - -

After posting this, Salty Rando [informed me](https://twitter.com/iwhitney/status/767464762749747200) that Tom Preston-Werner already [wrote about](http://tom.preston-werner.com/2010/08/23/readme-driven-development.html) Readme Driven Development in 2010!


[^1]: E.g., [Test-driven Development](https://en.wikipedia.org/wiki/Test-driven_development), [Behavior-driven Development](https://en.wikipedia.org/wiki/Behavior-driven_development), or [Calendar-driven Development](https://www.reddit.com/r/rust/comments/37b6oo/the_calendar_example_challenge/crlkfec).
[^2]: Been there, [done that](https://github.com/killercup/vibrant-rs). (That README is pretty bad, though.)
