---
title: Machine Readable Inline Markdown Code Documentation
categories:
- rust
---
In [Rust RFC 1713][rfc-pr-1713], a set of documentation 'tags' is proposed, to document functions in a similar fashion to e.g. JavaDoc or JSDoc. I recently [saw][swift-doc-markup] that Swift uses plain Markdown for documentation. Xcode is able to parse this and show contextual information based on it.

Since Rust's [current documentation conventions][rfc-1574] already wants you to use common names for Markdown headlines to structure your code documentation, I think it would be very nice to continue in this style and use plain Markdown with specific conventions.

## Markdown formatting conventions

The following sections are treated specially and are expected to be in the described format.

### Common headlines

These are the common headlines from [RFC 1574][rfc-1574]:

Examples
: Must contain at least one Rust code snippet
: Should use sub-headlines when multiple examples are given. Each sub-section should have a headline, followed by a short paragraph explaining the examples, and at least one Rust code block.

Panics
: Explains when a function panics, should always be included when `panic!`, `assert!` or similar are used/when any branch of the function can directly return `!`

Errors
: Explain when an error value is returned (see also "Returns" in the next section)

Safety
: Describes the safety requirements of this function

Aborts
: Similar to panic

Undefined Behavior
: Describes for which inputs the function behavior is not defined

### Specific machine readable sections

This is aimed at documenting functions and methods, but should also work for documenting type parameters and lifetime parameters of `struct`s, `enum`s, and `trait`s.

Parameters
: (always plural)
: List of parameter names with description

Returns
: (read either as 3rd person singular form or plural "return [values]")
: Plain text description
: can be followed by a list of valid `enum` variants for the return type and descriptions
: Alternatively, allow regular pattern matching syntax instead of enum variant names

Type parameters
: List of generic type parameters (the `T` in `fn foo<T>()`) and description (can also be used to describe trait bounds in where clauses)

Lifetimes
: (alternatively "Lifetime parameters")
: List of valid lifetime identifiers (without leading `'`) and description

### List syntax

All lists mentioned above must be written like this:

```markdown
- `$name`: $explanation
```

That is: A Markdown list where each list items

- starts with an inline code snippet containing a valid Rust identifier (`$name`),
- optionally followed by a colon and a space, which is followed by valid Markdown text (`$explanation`, can be multi-line, but must be correct in list-item position).

### Lints

All conventions listed above should be checked by lints.

## Example

```rust
/// Fooify a `Foo` with a label
///
/// # Parameters
///
/// - `label`: A string labelling the foo
/// - `magic`: A `Foo` that will be labeled
///
/// # Returns
///
/// A `Result` which is:
///
/// - `Ok`: A `Bar` that is the labeled `Foo` and thus lives as long as the
///     `Foo` given in `magic`.
/// - `Err`: Returns the number of gravely appalled people (per half-century
///     per country) if you were to use that label *and* `Foo`'s acceptance
///     indicator is less than it.
///
/// # Type parameters
///
/// - `T`: A type that can be converted into a `FooLabel`, e.g. a `String`, a
///     `BananaPeelRope`, or a `Cow<str>`.
///
/// # Lifetimes
///
/// - `floof`: The life time of the given foo as determined by the floof source
///     it was originally loaded from.
///
/// # Examples
///
/// ```rust
/// assert_eq!(fooify("lorem", Foo::extract_from_global_floof_resource()).label(),
///            Bar::with_label("lorem"))
/// ```
///
fn fooify<'floof, T>(label: T, magic: Foo<'floof>) -> Result<Bar<'floof>, i32>
    where T: Into<FooLabel>
{
    unimplemented!();
}
```


[rfc-pr-1713]: https://github.com/rust-lang/rfcs/pull/1713
[rfc-1574]: https://github.com/rust-lang/rfcs/blob/30221dc3e025eb9f8f84ccacbc9622e3a75dff5e/text/1574-more-api-documentation-conventions.md
[swift-doc-markup]: https://developer.apple.com/library/tvos/documentation/Xcode/Reference/xcode_markup_formatting_ref/AddingMarkup.html#//apple_ref/doc/uid/TP40016497-CH3-SW1