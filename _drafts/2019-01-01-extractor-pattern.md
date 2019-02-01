---
title: The Extractor pattern
categories:
- rust
---
Let's assume we receive some kind of data:

```rust
struct Blob { header: String, content: Vec<u8>, }

let incoming_data = Blob {
    header: "Lorem ipsum\nDolor sit amet".into(),
    content: r#"{"text": "Hello world"}"#.into()
};
```

We can write custom functions
that try to get some of the information
out of this `Blob`:

```rust
fn get_topic(input: &Blob) -> String {
    if let Some(line) = input.header.lines().next() {
        line.to_string()
    } else {
        String::from("[no topic set]")
    }
}
```

This is easy enough to use:

```rust
let topic = get_topic(&incoming_data);
println!("{:?}", topic);
```

This works but is quite imperative:
For every piece of data we want,
we have to call a function (or method) like this.

It would be super neat if we could instead write a list of the data we need,
and have these functions called for us.
This is what the extractor pattern is all about.

Since this pattern makes heavy use of generic programming
and introducing abstractions,
we'll look at it step by step.

Let's start with something that looks simple:
A function called `extract`.
This is what we'll call internally eventually,
but for now we'll do it explicitly.

It is not a _typical_ function, though:
In addition to the blob we also need to specify a type parameter.

```rust
let topic = extract::<Topic>(&incoming_data).unwrap();
println!("{:?}", topic);

fn extract<E: Extractor>(input: &Blob) -> Result<E::Target, Error> {
    E::extract_from(input)
}
```

```rust
trait Extractor {
    type Target;
    
    fn extract_from(input: &Blob) -> Result<Self::Target, Error>;
}
type Error = Box<dyn std::error::Error>;
```

```rust
struct Topic;

impl Extractor for Topic {
    type Target = String;
    
    fn extract_from(input: &Blob) -> Result<Self::Target, Error> {
        if let Some(line) = input.header.lines().next() {
            Ok(line.to_string())
        } else {
            Err(String::from("no topic set").into())
        }
    }
}
```

```rust
let message = extract::<Json<Message>>(&incoming_data).unwrap();
println!("{:?}", message);

#[derive(Debug, serde_derive::Deserialize)]
struct Message {
    text: String,
}

struct Json<T> { target: std::marker::PhantomData<T> }

impl<T: serde::de::DeserializeOwned> Extractor for Json<T> {
    type Target = T;
    
    fn extract_from(input: &Blob) -> Result<Self::Target, Error> {
        let res = serde_json::from_slice(&input.content)?;
        Ok(res)
    }
}
```

<!--

Goal: `fn foo(topic: Topic, message: Json<Message>) {}`

Issues:
- Type to impl extract on is type of parameter
- Generic impls for function only with macros

-->
