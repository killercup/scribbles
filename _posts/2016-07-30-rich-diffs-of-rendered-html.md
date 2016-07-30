---
title: Rich diffs of rendered HTML
categories:
- idea
---
Have you ever seen the way Github allows you to see rendered diffs for code they can render as HTML? Like [this "rich" diff](https://github.com/killercup/scribbles/commit/dc7d6070ee7645c5afffbc40eacd294bb46ca44c?short_path=37b0d28#diff-37b0d286ed28750e62a9e0b93888457a), as they call it?

For some reason I wanted something similar (probably for [Silicon Zucchini](https://pascalhertleif.de/artikel/silicon-zucchini/)), but couldn't find a good library that did that nicely. Now I have a nice idea how to implement this.

"Virtual DOM" is a nice abstraction of how to render HTML entities to the DOM[^1] – and how to quickly update them. The idea is to find a quick way to compare two virtual DOM trees and only update the differences. Thus, any virtual DOM implementation contains a way to diff two HTML trees!

Assuming we can render a file to HTML and build a virtual DOM, we can then construct _two_ virtual DOM trees from two versions of this files and compare them. Instead of updating the real DOM by replacing DOM nodes, we

1. take the old nodes, label them (e.g. with a class to make them red),
2. take the new nodes, add them after the old ones, and label them as well (e.g. with a class to make them green), and finally
3. render all this to a new HTML string.

[^1]: Or anything else really, see [this note]({% post_url 2016-07-23-impl-virtual-dom-cli-libui %}).
