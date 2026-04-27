---
title: 'Building Seqair'
publishDate: '2026-04-30'
updatedAt: '2026-04-30'
draft: true
---
Over the last couple years,
I've tried several LLMs and coding agents based on them.
My success rate was so-so overall.
The first of its kind that I used was "Tabnine" around 2019,
and I got access to Github Copilot at some point but didn't make much use of it.
End of 2025,
I gave Claude Code a try,
and was impressed by what I could get out of it,
given enough hand-holding.
To me, the issue was always the same:
If you know what you're doing,
and you spend some time writing out your thoughts[^rubber],
then it works great.
If you skip this part and hope for the best…
then I guess
"the next generation of models will be so much better"
is what you hear a lot.

[^rubber]:
    It's the classic [rubber duck] approach,
    where describing your problems and your thoughts
    leads you to the solution.

[rubber duck]: https://en.wikipedia.org/wiki/Rubber_duck_debugging

### Getting solid code from LLMs

For this specific project,
I felt like using LLMs would be a good use-case
(as well as test case to see if they improved).
Not only can I feed it specifications,
but I can also set up cross-validation tests
against _htslib_ and noodles.
So I can both verify that the code follows the spec as written
(this is what tracey provides)
and also validate the new implementation against real world tools.
In addition, I prioritized adding property tests
and later fuzz tests.

On top of this,
I also made sure to enable quite strict [`clippy`] lints.
You can see a snapshot of the list [here][lints].
My "favorites" by how annoying/good at preventing issues in seqair
are probably:

1. `arithmetic_side_effects`, which disallows using typical math operators like `+` and `-`,
   because they can overflow/panic.
   Instead, they force you to use precise wrapping semantics
   like `.saturating_sub(n)` or `.checked_add(1)`
   and deal with overflow possibility.
   I think half of what the fuzzer caught, this lint also caught.
2. `indexing_slicing`, which disallows `x[2]`.
   This is another source of panics that are really annoying to catch.
   In some parts of the code we deal with fixed-size arrays, so there we allow this (after assertions!).
   But in general, I prefer `x.get(n).ok_or(SomeError::ThingOutOfBounds)?`[^slicing-perf].
3. `cast_lossless`, `cast_possible_truncation`, `cast_possible_wrap`, and friends.
   They disallow using `x as y` for numeric values where you lose precision accidentally.

[`clippy`]: https://doc.rust-lang.org/1.95.0/clippy/ "800+ lints to catch common mistakes and improve Rust code"
[lints]: https://github.com/Softleif/seqair/blob/bfee3fd13ecb862ba6d7546646488af63373f793/Cargo.toml#L19-L67

[^slicing-perf]:
    I wonder if LLVM is clever enough to elide this in as many cases as bounds checks.
    And, if it can't, is the code for this case simpler/faster than the panicking slicing?

This does not mean that the code coming out is fantastic,
but it makes me way more confident
than just "vibe coding" something that I am quite serious about.

### Notes on LLM rewrites

It seems bioinformatics is having a LLM-powered "Rewrite it in Rust" moment.
There's an entire website, [rewrites.bio] dedicated to it.
It seems that a couple companies in the field found
that tools in slow but approachable languages
can be rewritten in faster languages quite easily now.
They pick Rust a lot, for its speed
but I guess also since its strictness is good immediate feedback for LLMs
as I described above.

[rewrites.bio]: https://rewrites.bio/ "Principles for rewriting bioinformatics tools with AI"

Even Heng Li, creator of samtools, [commented][lh3] on it.
Since what I'm doing here is based on a lot of Li's work,
I'm happy to see the positive tone in the post:

> From a purely technical standpoint, I believe AI rewrites, especially in Rust, benefit the field.
> […]
> Legally speaking, permission for rewriting is governed by the software license.
> […]
> Finally, I always welcome forks and rewrites of my tools whether I am involved or not. If you want to rewrite my tools with AI, please feel free to do so.

I want to be helpful to the community,
and not pile on "slopware" that presents itself as super amazing
but then is full of holes and will not be maintained.
That's why I'm not presenting this new library
as anything more than what it is, an experiment.
I'm publishing seqair under both the MIT and Apache 2.0 license,
so that others can build on it just like I could on previous work.
If you want to give it a try, please do so.
If you see it's useful to you and your company benefits from this,
feel free to reach out.

[lh3]: https://lh3.github.io/2026/04/17/the-ai-rewrite-dilemma "The AI Rewrite Dilemma - Heng Li's blog"
