---
title: "No biggie Markdown slideshows"
categories:
- idea
---
Some time ago I [forked][biggie-fork] [biggie], a small tool to generate slideshow from markdown where the text is shown as big as the screen allows. Now, let's make it even easier to generate slideshows from arbitrary Markdown sources.

[biggie]: http://www.macwright.org/biggie/
[biggie-fork]: http://killercup.github.io/biggie/

## Idea

1. Go to `killercup.github.io/no-biggie`
2. Enter URL to Gist or Github file
3. Get biggie-style slideshow

## Tech notes

1. Load Markdown file using Github's API
2. Split it into slides
3. Render slides just like [biggie]
4. ???
5. PROFIT!

### URL Structure

Start page with a simple form field where user can paste in an URL:

	/

Pages that actually show rendered slideshow:

	/gists/<user>/<id>[/<file>]
	/gists/killercup/8bb589927006471b6e4fc1b21c625bb3[/playground.rs]

	/github/<user>/<repo>/blob/<branch>/<filepath>
	/github/killercup/scribbles/blob/gh-pages/_posts/2010-02-10-paper-plane-iphone-game.md

### Technology

I'd like to use this as a chance to experiment with these things:

- [TypeScript 2.1]
- [Cycle.js] with [most.js] (if small enough and not in the way)
- [Github's API]

[TypeScript 2.1]: https://blogs.msdn.microsoft.com/typescript/2016/12/07/announcing-typescript-2-1/
[Cycle.js]: https://github.com/cyclejs/cyclejs
[most.js]: https://github.com/cujojs/most
[Github's API]: https://developer.github.com/v3/gists/
