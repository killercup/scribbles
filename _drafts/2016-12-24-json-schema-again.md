---
title: "JSON schema, again"
categories:
- idea
---
For some reason, I really like the idea behind JSON Schema.

JSON? Well, JSON is ugly to write as a human, but we can also use (subsets of) YAML, or CSON, or TOML.
Some editors (like vscode) can use JSON schema to offer autcompletion. It'd be great if we can use that.

## Notes

- https://pascalhertleif.de/artikel/silicon-zucchini/

### TypeScript

- https://www.npmjs.com/package/json-schema-to-typescript

- https://github.com/lbovet/typson --> https://github.com/YousefED/typescript-json-schema
- https://github.com/lbovet/docson JSON schema docs

- Really interesting: In [io-ts](https://github.com/gcanti/io-ts), you write runtime validators (`t.interface({name: t.string})`) and use TS's magic with a custom constructor (`t.TypeOf<typeof Person>`) to get the interfaces at compile time

### Rust

- https://github.com/evestera/json_typegen - JSON code generation tools for Rust
- https://github.com/Marwes/schemafy - Create Rust types from a JSON schema
  - Support YAML because it's human writable
  - Support validation
    - add `new` method that validates params
    - use builder pattern and validate params in final `build() -> Result<Self, InvalidParams>`
    - Also use serde validation, cf. <https://github.com/serde-rs/serde/issues/939>

## Everything but the kitchensink

I've been meaning to write a "faker" crate to generate test data based on data types.
Sadly, plain Rust data types are not quite precise enough to contain validation data such as patterns…
but something like JSON Schema is!
And there is [a crate][schemafy] to generate structs/enums from a JSON Schema file.
It just needs to also annotate the validations
(like "min", "max", or "pattern"),
so [serde][]
(there's [an open issue][serde-939] to add a `validate` attribute)
as well as a new `#[derive(Faker)]` can use it.

[schemafy]: https://crates.io/crates/schemafy
[serde]: https://serde.rs
[serde-939]: https://github.com/serde-rs/serde/issues/939

### Example

In the end this should work like this.

First, let'syou define a schema.
Here, it's written in YAML because that's far easier to type than JSON.

```yaml
$schema: http://json-schema.org/draft-04/schema
type: object
description: Geographical coordinates
properties:
  latitude:
    type: number
    minimum: -90.0
    maximum: +90.0
  longitude:
    type: number
    minimum: -180.0
    maximum: +180.0
```

With a magical macro you can include this at compile-time to generate Rust types:

```rust
mod geo {
  include_json_schema!("src/types/geo.json");
}
```

The generated code will probably look something like this:

```rust
/// Geographical coordinates
#[derive(Debug, Serialize, Deserialize, Faker)]
struct Geo {
  #[serde(validate(min=-90.0, max=90.0))]
  latitude: f64,
  #[serde(validate(min=-180.0, max=180.0))]
  longitude: f64,
}
```

### Open questions

- Should fields be `pub` by default? Should there be an extra flag in the schema to set this?
- How about using [arbitrary](https://crates.io/crates/arbitrary)?
