---
title: "JSON schema, again"
categories:
- idea
---
For some reason, I really like the idea behind JSON Schema.

JSON? Well, JSON is ugly to write as a human, but we can also use (subsets of) YAML, or CSON, or TOML.
Some editors (like vscode) can use JSON schema to offer autcompletion. It'd be great if we can use that.

- https://pascalhertleif.de/artikel/silicon-zucchini/

## TypeScript

- https://www.npmjs.com/package/json-schema-to-typescript

- https://github.com/lbovet/typson --> https://github.com/YousefED/typescript-json-schema
- https://github.com/lbovet/docson JSON schema docs

- Really interesting: In [io-ts](https://github.com/gcanti/io-ts), you write runtime validators (`t.interface({name: t.string})`) and use TS's magic with a custom constructor (`t.TypeOf<typeof Person>`) to get the interfaces at compile time

## Rust

- https://github.com/evestera/json_typegen - JSON code generation tools for Rust
- https://github.com/Marwes/schemafy - Create Rust types from a JSON schema
  - Support YAML because it's human writable
  - Support validation
    - add `new` method that validates params
    - use builder pattern and validate params in final `build() -> Result<Self, InvalidParams>`
    - Also use serde validation, cf. <https://github.com/serde-rs/serde/issues/939>
