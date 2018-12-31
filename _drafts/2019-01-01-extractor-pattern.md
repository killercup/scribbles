---
title: The Extractor pattern
categories:
- rust
---
A very good questions.
There are no nasty code generation or unsafe shenanigans as far as I know,
just good old Rust traits.
It uses something often called "extractor pattern".
You can find a high-level overview on the usage
[here](https://actix.rs/docs/extractors/)
but you have probably already seen that.

Let's dig into the docs!
(I believe it's helpful to see how I came to understand this
by clicking through the API docs.
Skip the next 3 paragraphs if you only care about the "magic" way
actix-web allows you to extract data from requests.)

The example you linked to contains
`App::new().resource("/{name}/{id}/index.html", |r| r.with(index))`.
Typing `App::resource` into the doc search
gives use the [right method](https://docs.rs/actix-web/0.7.17/actix_web/struct.App.html#method.resource) it seems.
The interesting part here is the closure type
(`FnOnce(&mut Resource<S>) -> R`)
because it tells use the `r` is a reference to a `Resource`.
Clicking on that
and scrolling down
leads us to [`Resource::with`](https://docs.rs/actix-web/0.7.17/actix_web/dev/struct.Resource.html#method.with).
Nice. But now it gets complicated.

The full signature for `with` is:

    pub fn with<T, F, R>(&mut self, handler: F) where
        F: WithFactory<T, S, R>,
        R: Responder + 'static,
        T: FromRequest<S> + 'static,

Let's unwrap that a bit.
The parameter we give to `with` has to be something that implements the `WithFactory` trait.
But now it gets weird:
This trait is private!
So, from the docs,
we can only infer that it has three type parameters.
The first is something that implements `FromRequest`,
the second (`S`) is probably some state (guessing from the name only),
and the last one is something that implements `Responder`.
So I'd guess we are dealing with something that
takes some data from a request,
some state,
and returns something new
that can be used as a response.
Sounds useful in the context of a web framework.

The part we are interested in is [`FromRequest`](https://docs.rs/actix-web/0.7.17/actix_web/trait.FromRequest.html).
This is a trait that abstracts over extracting data from a request structure
(its two methods are `from_request` and `extract`!).

This is a long docs page.
The part you ask about is almost at the bottom in the "Implementors" section.
For example,
[`impl<T, S> FromRequest<S> for Form<T>`](https://docs.rs/actix-web/0.7.17/actix_web/trait.FromRequest.html#impl-FromRequest%3CS%3E-18),
or [`impl<T, S> FromRequest<S> for Path<T>`](https://docs.rs/actix-web/0.7.17/actix_web/trait.FromRequest.html#impl-FromRequest%3CS%3E-20).
And this is basically all there is to it!
These types allow you to use them in a context
where you want to extract data from a request!

The concrete usage of that
and the way that the obscure `WithFactory` comes into play is also quite interesting.
I wrote above that "no code generation magic" was used
-- I might have lied a bit.
To support *multiple* parameters/extractors in the functions you pass to `with`
the `WithFactory` trait must be implemented for functions/closures
that have multiple parameters.
For that, the actix developers use [a macro](https://github.com/actix/actix-web/blob/0745a1a9f8d43840454c6aae24df5e2c6f781c36/src/with.rs#L291-L306) internally
to generate implementations of `WithFactory`
for functions that take tuples of up to 10 fields that implement `FromRequest`.

I couldn't find this documented in the API docs,
but the website contains user documentation, too,
and as mentioned above has a page on [Extractors](https://actix.rs/docs/extractors/)
with [this section](https://actix.rs/docs/extractors/#multiple-extractors)
showing an example of using a function with multiple extractors.
So, all in all,
this means that you can write `.with(index)` and have this functions:

    fn index((path, query): (Path<(u32, String)>, Query<Info>)) -> String {
        format!("Welcome {}!", query.username)
    }

I hope this explained the pattern well enough!
