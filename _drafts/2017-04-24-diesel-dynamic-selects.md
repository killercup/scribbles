---
title: Select columns dynamically in Diesel
categories:
- rust
---
[This StackOverflow question][so]
asks how to write [Diesel] queries
whose columns to select depend on a parameter
given by the user.
This is typically the case when implementing something like [JSON API], and its [Sparse Fieldsets].

[so]: http://stackoverflow.com/q/42557528/1254484
[Diesel]: http://diesel.rs
[JSON API]: http://jsonapi.org
[Sparse Fieldsets]: http://jsonapi.org/format/#fetching-sparse-fieldsets

So, we want to do something like:

```rust
posts.select(some_columns_the_user_supplied).order(title.desc());
```

A "simple" approach might be to do something like this:

```rust
table! {
  posts {
    id: Number,
    title: Text,
    content: Text
  }
}

use diesel::query_source::Column;

struct UnknownColumnError;

fn select_from_str(input: &str) -> Result<Vec<Column>, UnknownColumnError> {
  input.split(',').map(posts::column_from_str).collect()
}
```

where `column_from_str` is something like

```rust
fn column_from_str<C: Column>(column: &str) -> Result<C, UnknownColumnError> {
  match column {
    "id" => Ok(posts::id),
    "title" => Ok(posts::title),
    "content" => Ok(posts::content),
    _ => Err(UnknownColumnError),
  }
}
```

What needs to happen to support this?

1. Extend `table!` macro to generate `column_from_str` function
2. Make sure `select` works with a `Vec` of `Column`
3. Probably some other things.

**Speculation ahead:**
The second point is sadly not trivial to implement,
as treating the list of columns as a Vector of trait object looses important type information.
We need another structure to do that nicely.
One approach is to use HLists
that were discussed in [this pull request][hlists-pr]
and might allow use to write the really generic code we need here.
Or, we opt in to use BoxedQuery (using [into_boxed][BoxedDsl]).

[hlists-pr]: https://github.com/diesel-rs/diesel/pull/747
[BoxedDsl]: http://docs.diesel.rs/diesel/prelude/trait.BoxedDsl.html
