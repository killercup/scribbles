---
title: Using CSS vars to style SVG symbols
publishDate: 2026-04-14
updatedAt: 2026-04-14
categories:
- web
- css
- svg
atUri: "at://did:plc:x67qh7v3fd7znbdhauc45ng3/site.standard.document/3mjhv3hwmmz26"
---
Styling SVG symbols that are defined using `<symbol id="x">`
and included using `<use href="#x">`.

## SVG symbol sprites

In a web frontend project I'm working on,
we need to show a lot of icons in different configurations on a drawing.
The symbols are SVGs exported from Figma
and they have different layers
that can be styled and enabled depending on the symbol's status.
E.g., we want to set the `bg` layer to green for showing the "success" state.

The structure we have looks like this:
We have a `symbols.svg` which is basically just a list of definitions:

```xml
<svg xmlns="http://www.w3.org/2000/svg">
  <defs>
    <symbol id="symbol-42" width="16" height="16" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="7" class="bg"/>
      <!-- ... -->
    </symbol>
  </defs>
</svg>
```

To use the symbols,
we inline this SVG into our HTML (hidden, so it doesn't render on its own)
and then reference individual symbols by ID:

```html
<svg class="symbol-wrap">
  <use href="#symbol-42" />
</svg>
```

You can also keep the sprite as an external file
and reference it with `<use href="symbols.svg#symbol-42" />`,
but inlining avoids CORS issues
and is what most bundlers and frameworks do by default.

## It's a shadow root

Now, naively I thought that
styling the symbols would be as simple as writing a little CSS:

```css
.success .symbol-wrap .bg {
  fill: green;
}
```

This does not work, however.
When the symbols get injected,
the DOM structure becomes

```html
<svg class="symbol-wrap">
  <use href="#symbol-42">
     #shadow-root
       <symbol id="symbol-42">
         ...
```

and our CSS selector can't go past that `#shadow-root`. 
This is the dev tools indicator for a [`ShadowRoot`],
which is (simplified) its own rendering context.
This is the system used for implementing [Web Components] as well.

[`ShadowRoot`]: https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot "ShadowRoot on MDN web docs"
[Web Components]: https://developer.mozilla.org/en-US/docs/Web/API/Web_components "Web Components on MDN web docs"

## Styling inner symbols

What can get through to the element in this `ShadowRoot` then?
As it turns out, CSS variables!
This means we can set `style="--bg-fill: green"` on our `.symbol-wrap`
and in our `symbols.svg` we can use it.

The one missing piece to make this convenient is to,
in the `symbols.svg`,
add a `<style>` that will pick up the variable
and set the properties for our classes:

```xml
<svg xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .bg { fill: var(--bg-fill, currentColor); }
    </style>
    <symbol id="symbol-42" width="16" height="16" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="7" class="bg"/>
      <!-- ... -->
    </symbol>
  </defs>
</svg>
```

The `currentColor` fallback means symbols render sensibly
even when no variable is set.
They just inherit the text color of their container.

CSS custom properties are the one thing
that crosses the `<use>` shadow boundary,
so this pattern scales to as many layers and states as you need.
