---
title: A way to customize Rust error messages
categories:
- rust
- idea
---
Rust's error messages are pretty amazing. There is no way to format library-specific errors, though. I'm suggesting a way to implement this on stable Rust.

## Contents
{:.no_toc}

1. Table of contents
{:toc}

## Precursor

If you have never seen one of the error messages Rust gives you, here are some (in real life, they are even in color):

```
error[E0507]: cannot move out of indexed content
  --> tests/migration_generate.rs:42:21
   |
42 |     let migration = migrations[0];
   |         ---------   ^^^^^^^^^^^^^ cannot move out of indexed content
   |         |
   |         hint: to prevent move, use `ref migration` or `ref mut migration`

error: cannot borrow immutable local variable `down` as mutable
  --> src/main.rs:98:13
   |
97 |             let down = fs::File::create(down_path).unwrap();
   |                 ---- use `mut down` here to make mutable
98 |             down.write_all(b"hello").unwrap();
   |             ^^^^ cannot borrow mutably
```

Nevertheless, there are also some errors that are less helpful to newcomers, for example this one (excerpt):

```
19 |     let results = users::table.load::<UserModel>(&connection);
   |                                ^^^^ the trait `diesel::types::FromSqlRow<(diesel::types::Uuid, diesel::types::Timestamp, diesel::types::Timestamp, diesel::types::Text, diesel::types::Text), _>` is not implemented for `(uuid::Uuid, std::string::String, std::string::String)`
```

What this error actually wants to tell you is:

```
`diesel::types::FromSqlRow` cannot be used to convert the SQL types

`(Uuid, Timestamp, Timestamp, Text, Text)`

to these Rust types

`(Uuid, String, String)`
```

I omitted the namespaces when I added the "SQL types" and "Rust types" annotations. This makes it easier to read, but also reminds people of what `FromSqlRow` does. (You should note, though, that the two `Uuid` types are _not_ the same.)

And maybe even:

```
The following SQL type to Rust type conversions are available:

SQL type                   | Rust type                
-------------------------- | --------------------------
`diesel::type::Uuid`       | `uuid::Uuid`
`diesel::type::Text`       | `std::string::String`
`diesel::types::Timestamp` | `chrono::NaiveDateTime`
```

## Adding hooks and filters to Rust's error output

You should know: Aside from the human-readable error messages I've shown above, Rust can also output the same information as JSON. I suggest making a new CLI tool that uses Rust's (and maybe also Cargo's) JSON output to allow custom filters.

1. Make a library to parse Rust's JSON output ([these](https://github.com/rust-lang/rust/blob/bae454edc5e18e81b831baf4a7647bf2dda620a8/src/libsyntax/json.rs) are the structs).
2. Pull the human readable error formatting out of the rust-lang/rust repository (I think it lives [here](https://github.com/rust-lang/rust/tree/bae454edc5e18e81b831baf4a7647bf2dda620a8/src/librustc_errors)) and make it a library.
3. Make a tool (let's call it `burnish` for now) that works like `cargo build --message-format json | burnish`, i.e. it reads the JSON and renders the human readable representation.
4. Add a `--filter <bin>` argument that can be used (multiple times) like `burnish --filter diesel_errors --filter clippy_explainer`, that pipes the JSON to the supplied binary (`<bin>`) before making it human readable.
5. Auto-discover the libraries used in the current project, and automatically install and apply useful filters.

Instead of the last two steps, one could also integrate all filters into the tool itself.

The filters could be as simple as matching a regular expressing and as complex as parsing the source file referenced in the JSON.

The obvious downside of this approach is the need to stay up-to-date with Rust's diagnostic output (neither JSON nor the human readable representation are stable as far as I know) as well as with the errors that the filters need to recognize.

