---
title: A sane admin panel for Silicon Zucchini
categories:
- idea
- webdev
- incomplete
---
When I first [wrote about Silicon Zucchini](https://pascalhertleif.de/artikel/silicon-zucchini/) (the code name for my statically-typed CMS, see also [this note]({% post_url 2016-07-26-compile-time-website-checking %})), I mentioned that the JSON schema files that are used to validate the content data could also be used to generate an editor interface. I've been thinking about this some more.

## What's the admin interface

Currently, I think three views are enough for a good admin interface for editing CMS content:

1. General information about the system
	1. When was the last release? (Future: Version control stuff)
	2. Editing instance-specific configuration values (site URL, site name)
	3. Create/compile a new release
2. List/tree of contents grouped by their type
3. Edit view for each content file (edit interface rendered as specified by the type's schema)

Optionally, there could be a 'preview' for the build process, that includes a page tree as described below.

## Routes

How do we go from content files to rendered pages?

### File → URL

A trivial way would be to map each file to a URL and render a HTML file in the right place to get that URL. This is what Jekyll does and I think it works nicely for them.

This way, each piece of content data has a detail page. If you want to have an index page, create a content file for it and use a template that renders a list of files. Same goes for a feed.

Sadly, not all pieces of content map should to a page. Jekyll deals with this by using a custom directory for content files that are 'data'.

### A router

For some time I thought it might make sense to write a custom router. Basically, a map-reduce over all data files that returns a map of URLs and data objects.

The most trivial example would be this: Take all the content files that are of type 'page', and create a route that maps from _path.html_ to _content of file_.

Since this is crazy flexible (you just write code) you could easily to really fancy stuff. A list page for each year/category/author? Done. A list of all tables/images/references? A bit more work, but doable.

### Making this easy to reason about

The biggest issue with this is that it's not easy to see where a page comes from, or what content files it includes. I think this could be solved by keeping track of metadata (each page record also contains a list of references to original files, and reasons why the file was included), and exposing this information in a nice interface (e.g. a page tree that shows you the title, layout, and associated content files of a page).

## Content editing

The edit view can quickly become quite complex. I imagine that one will want to use such a CMS to get rid of "flat" content (just a bunch of HTML/Markdown per page) and use very detailed schemas instead.

### Plain pages: Sections

For 'regular' pages (like special promotion pages for a product), the author may want to influence the layout quite a bit. A nice way to represent that is by using a schema that contains an array of many items that can have different types (algebraic data types in JSON schema, basically). Each such type has a custom editor interface and HTML output.

An editor that is based on the idea of content blocks of different types is [Sir Trevor JS](http://madebymany.github.io/sir-trevor-js/).

