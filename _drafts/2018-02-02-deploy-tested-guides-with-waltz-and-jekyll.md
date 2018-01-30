---
title: Deploy effective documentation websites using literate programming
categories:
- rust
---
I recently started a new project called [quickly],
a small framework for quickly writing CLI apps in Rust.
In contrast to the usual libraries or CLI tools I publish,
this needed a different style of documentation.
I didn't want to just have a list of features,
I wanted to show the user the _feel_ of using quickly.
That's why I went with a writing the first readme file in style of a guide,
a casual descriptions of stuff you need to do
to end up with a simple CLI tool.

[quickly]: https://killercup.github.io/quicli/

The style is very much like this:
Paragraphs of text with code blocks in between.
If you copy and paste all the (relevant) code blocks into the right files,
you end up with a running program.
To make sure the code actually works,
I want to run it on CI.
I've previously written about this
in my ["Teaching libraries through good documentation"][teaching-libraries] post.

[teaching-libraries]: {% post_url 2016-12-28-teaching-libraries %}