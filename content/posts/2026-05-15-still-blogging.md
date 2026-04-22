---
title: Still blogging
publishDate: '2026-05-15'
updatedAt: '2026-05-15'
draft: true
categories:
- meta
---
All of a sudden
I published three posts on this blog just in April.
Before that, I've published 3 posts since May 2020.
Going back to freelance work
and having an interesting [bioinformatics project][rastair]
made me want to write again,
but the blog had to feel usable first.
This site has been around since 2016[^older],
and it was always just Markdown files in a git repo.
Let's update the toolchain around it as a little spring cleaning for 2026.

[rastair]: https://deterministic.space/rastair.html "Notes on Rastair, a variant and methylation caller"

[^older]: Some of the content is even older, imported from a previous site.

## Hugo

The blog ran on [Jekyll] from its inception until last month.
I chose it because GitHub Pages shipped it by default
and I wanted to publish something.
That worked in 2016,
and I'm glad it's actually still supported today.
But, in 2026, getting Jekyll to build locally
means fighting `bundler`, native extensions,
and a Ruby toolchain I haven't used for anything else in years.
I could publish blindly and just see what I get out of it,
but that's no fun.

[Jekyll]: https://jekyllrb.com/ "Jekyll: Transform your plain text into static websites and blogs"

So, I looked for something else:
Stable, usable, and likely to be maintained for the next years.
[Hugo] looked like a great option.
It's a single binary, one `brew install` away.
You run it, and the site builds in about 60 milliseconds.
The expected content is Markdown with YAML frontmatter,
so that I already had.
If I move to something else in 2036,
I expect a similar afternoon of find-and-replace.

[Hugo]: https://gohugo.io/ "Hugo: The world's fastest framework for building websites"

Of course, I also wanted to make my own theme.
At first I copy-pasted the one I had in Jekyll
but I knew I wanted to take it further.
Hugo's templating language is Go templates.
They have a pipe syntax that looks clean at first,
but some functions don't compose well in pipelines
so you end up wrapping things in parentheses.[^gotmpl]
It gets the job done.

[^gotmpl]: For example, `{{ .Title | truncate 50 }}` reads naturally. But conditionally wrapping output requires nesting `{{ if }}` blocks or calling `printf` with parenthesized arguments instead of piping. Not awful, just occasionally surprising.

A nice thing Hugo has is [render hooks]
that let you customize how individual Markdown elements get rendered
(e.g., links, images, code blocks)
without touching the main templates.
I wish they went further, though.
The table of contents, for example,
is generated as a blob of HTML
with no hook to customize its structure.[^toc]

[render hooks]: https://gohugo.io/render-hooks/introduction/ "Introduction to render hooks in Hugo"

[^toc]: Unless I missed something.
  You can set `startLevel` and `endLevel` in the config, and that's about it.
  I'd love to be able to control the markup or wrap individual entries.

## The theme

The design is loosly based on a personal website I had around 2015.
That one had sidenotes, a serif font, and a lot of whitespace.
When I started the new theme,
I went for something quite clean and polished,
with a lot of focs on typography.
I now use [Piazzolla], a really nice serif font[^piazzolla].

Then, my wife looked at it and said the older one was better.
More nerdy and authentic, less magazine.
She was right.
What made the old site feel like mine
was that the rendered HTML looked a bit like the Markdown source
and was basically just about the content,
in full monospace glory.

[^piazzolla]: By Juan Pablo del Peral at [Huerta Tipográfica], who also made [Alegreya], which I used before.

[Piazzolla]: https://piazzolla.huertatipografica.com/ "Piazzolla: a variable font family with old-style proportional numerals"
[Huerta Tipográfica]: https://huertatipografica.com/
[Alegreya]: https://www.huertatipografica.com/en/fonts/alegreya-ht-pro

### Markdown style

So I combined the two.
I added a CSS `@layer markdown-look`:
Headings get prefixed with `##`,
inline code gets wrapped in backtick markers,
lists use `–` instead of bullets,
horizontal rules render as `---`.
and footnotes get `[^x]` styling.

```css
h2::before {
  content: "## " / "";
  color: var(--md-marker);
}

code::before,
code::after {
  content: "`" / "";
  color: var(--md-marker);
}

/* ... */
```

*Neat little bonus:*
The `/ ""` in the `content` value is an
[alternative text][content-a11y]
so screen readers don't announce the decoration.

[content-a11y]: https://developer.mozilla.org/en-US/docs/Web/CSS/content#alternative_text "CSS content alternative text on MDN"

### Sidenotes

I write a lot of footnotes[^footnotes]
and having them at the bottom of the page
always felt too far away.
Parentheses are too noisy.
[Tufte-style] sidenotes sit right next to the text,
which is where you want the context.

[^footnotes]: tangents, caveats, small jokes, stuff too long to put in parantheses, just like this one here

[Tufte-style]: https://edwardtufte.github.io/tufte-css/ "Tufte CSS: Dave Liepmann's take on Edward Tufte's layout ideas"

On wide viewports (`72rem` and up),
footnotes move into the right margin.
Links that have `title` attribute
also get pulled into the margin as annotations,
showing the domain and the title text.
The table of contents sticks to the left.
And on narrow screens, everything is just one column.

The implementation is about 60 lines of JavaScript.
It runs before first paint and
clones both Hugo's footnote content and links with a `title` attribute
into `<span>` elements next to each reference
and floats them into the margin.

The CSS is actually quite simple
and has been done many times before.
It's just more fun with CSS features from 2026.

```css {.wide}
.sidenote {
  float: right;
  clear: right;
  width: var(--sidenote-width, 12rem);
  /* The negative margin pulls them out of the content column.  */
  margin-right: calc(
    -1 * (var(--sidenote-width, 12rem) + var(--sidenote-gap, 2rem))
  );
  font-size: var(--text-xs);
  color: var(--text-secondary);
}
```

Oh, and there's a also a `.wide` class
to make tables and some code blocks easier to read.

### Colors and dark mode

On big gap in the old blog design was that it was just black and white and pink links.
Now, all colors are in [oklch],
a pretty neat color space that works well when adjusting lightness and blending colors.
My entire accent palette actually comes from one (pink) `--hue` variable.
Super satisfying that I can do this directly in code
and get nice colors from some math.

[oklch]: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch "oklch() on MDN"

Dark mode (a new feature)
follows `prefers-color-scheme` by default
with a `[data-theme]` attribute for manual override (currently unused).
Both themes use the same token names, different oklch values.
`color-mix()` handles the subtler bits,
like blending the accent with transparency for link underlines:

```css {.wide}
a {
  text-decoration-color:
    color-mix(in oklch, var(--accent) 40%, transparent);
}
```

There are a few other 2025/2026 CSS features in here
that I'm happy to finally use:
`text-wrap: balance` on headings to avoid orphaned words,
`text-wrap: pretty` on body text,
and `scroll-state()` container queries[^scroll-state]
for showing the table of contents header
only when it's stuck to the top of the viewport.

[^scroll-state]: `@container scroll-state(stuck: top)` landed in Chrome 133 and Safari 18.4
  and as of May 2026 doesn't work in Firefox.

## Open Social Stuff

I like the idea of having a simple website
that serves content directly
on a domain that I own.
Feel nicer than to publish
on Medium[^medium], dev.to, Substack,
or some social media channel.

This blog has an RSS feed,
and as someone who uses a feedreader daily,
this is important to me.
I also looked into publishing the content
as an ActivityPub account.
Let's say it's a work-in-progress.

Publishing on the "ATmosphere"[^at] was quite simple.
You can follow this blog [here][bsky] on bluesky.

[^medium]: Is that still a thing people use?
[^at]: This is what Blusky is built on, the AT protocol.
  I used [`sequoia`](https://sequoia.pub/) and it was very easy.
  
[bsky]: https://bsky.app/profile/deterministic.space "This blog on bluesky"

## More writing

It's fun to write!
Maybe right now I'm a bit obsessed with putting on my thoughts into text after not doing it much for a while,
but my hope is that this will last for a while.
I've always been keen on clarifying my thoughts by phrasing them out
and I read a lot of posts from other people every day.

Please let me know what you'd like me to write more about
and what you thought of this and my recent posts!
