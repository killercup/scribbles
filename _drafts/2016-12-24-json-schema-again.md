---
title: "JSON schema, again"
categories:
- idea
---
For some reason, I really like the idea behind JSON Schema.

- https://pascalhertleif.de/artikel/silicon-zucchini/

## TypeScript

- https://www.npmjs.com/package/json-schema-to-typescript

- https://github.com/lbovet/typson --> https://github.com/YousefED/typescript-json-schema
- https://github.com/lbovet/docson JSON schema docs

## Rust

- https://github.com/evestera/json_typegen - JSON code generation tools for Rust
- https://github.com/Marwes/schemafy - Create Rust types from a JSON schema
  - Support YAML because it's human writable
  - Support validation
    - add `new` method that validates params
    - use builder pattern and validate params in final `build() -> Result<Self, InvalidParams>`
