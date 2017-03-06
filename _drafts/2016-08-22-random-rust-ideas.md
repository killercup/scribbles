---
title: Random Rust Ideas
categories:
- tech
- incomplete
---

## Super-simple HTTP API

```rust
let test_data: Future<SomeStruct> =
  http::get("https://json.api/test.json")
  .parse();
```

`http::get` returns a `RequestBuilder` (or similar), `parse` is implemented on this as "send request as is and try to parse response body according to mime type and type annotation".

## JSON Schema validator

Parse JSON Schema in a `build.rs` and generate code for structs and enums according to it. Include validation methods with nice errors.
