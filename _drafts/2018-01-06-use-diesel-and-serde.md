---
title: "Writing maintainable code: Why you should use libraries like Diesel and Serde"
categories:
- rust
---
[Diesel] is a query builder and ORM for using SQL-based databases in Rust.
[Serde] is a library for serializing and deserializing in Rust.
On top of this core library,
multiple format-specific libraries exist,
e.g., [serde-json], which allows you to read/write JSON.
It may sound like these libraries do pretty different things,
but let me tell you about one peculiar thing they have in common:
At first, it seems complex to use them
– especially as there are conceptually more lightweight alternatives –
but both will help you write more maintainable code in the long run.

[Diesel]: https://diesel.rs
[Serde]: https://serde.rs
[serde-json]: https://github.com/serde-rs/json

<!--

## Notes

I like custom derives because they enable so much.
serde, diesel, structopt are ways to write maintainable code
because they make a lot of data transformations descriptive.

-->

## Let's output some JSON

Let's start with small an example.
Imagine we have some information about a person
(let's say a name, and a favorite animal)
and we want to output it as JSON.

### The ad-hoc way

The easiest way is to just write the JSON string ourselves,
and insert the values at the right position.
Something like this (in JavaScript):

```javascript
let name = "Pascal";
let favorite_animal = "Domesticated red fox";

let pascal = '{ "name": "' + name + '", "favorite_animal": "' + favorite_animal + '" }';
```

This is not very elegant,
and it is pretty error prone.
What if my name had a quote in it?
E.g., if people called me 'Pascal "Weird Shirts Guy" Hertleif'
(or something less embarrassing).
That's why most languages have libraries or built-in functions to output JSON.

```javascript
let pascal = JSON.stringify({
  name: 'Pascal "Weird Shirts Guy" Hertleif',
  favorite_animal: "Domesticated red fox",
});
```

Let's make this a bit more complex:
Instead of a single favorite animal, a person can have a list of favorite animals.
Luckily,
in a dynamically typed language like JavaScript
it's pretty easy to create a hash map/array,
add the fields with the data you want to output,
and then serialize that to JSON.
Here is it in JavaScript:

```javascript
let pascal = {
  name: "Pascal",
  favorite_animals: ["Domesticated red fox", "Tardigrade"],
};
console.log(JSON.stringify(pascal));
```

But this post is about Rust libraries, not JavaScript.
Thanks to serde-json's `json!` macro
(and its [`Value`][json-value] type)
it's pretty easy to write the same thing in Rust:

[json-value]: https://docs.rs/serde_json/1.0.9/serde_json/enum.Value.html

```rust
#[macro_use] extern crate serde_json;

let pascal = json!({
    "name": "Pascal",
    "favorite_animals": ["Domesticated red fox", "Tardigrade"],
});
    
println!("{}", pascal.to_string());
```

Let's call this the _ad-hoc way_ of writing JSON.
We are defining the structure of our JSON output in the function that generates it.

### The typed way

Rust has a very powerful type system
and it would be a shame to not use it.
Here's where Serde comes in.
In addition to the ad-hoc way,
we can also use our Rust structs and enums to generate JSON structures.

```rust
#[macro_use] extern crate serde;
#[macro_use] extern crate serde_json;

#[derive(Serialize)]
struct Person {
    name: String,
    favorite_animals: Vec<String>,
}

let pascal = Person {
    name: "Pascal".to_string(),
    favorite_animals: vec![
        "Domesticated red fox".to_string(),
        "Tardigrade".to_string(),
    ],
};

println!("{}", serde_json::to_string(&pascal)?);
```

See how we defined a `struct Person` and added `#[derive(Serialize)]`?
This is all you need to do to be able to convert this type
to any format you have a serde-based library for.
([`serde_json::to_string`] is a function that accepts any type that implements `Serialize`.)
In the same manner,
we can derive `Deserialize`
to parse a JSON string and turn it into a `Person`.

[`serde_json::to_string`]: https://docs.rs/serde_json/1.0.9/serde_json/fn.to_string.html

Using a type here has a lot of advantages.

## Aiming for highly maintainable code


[poodr]: http://www.poodr.com "Sandi Metz' book Practical Object-Oriented Design in Ruby (POODR)"
[niko-talk]: https://www.youtube.com/watch?v=_jMSrMex6R0 "Niko Matsakis on 'Diving Into Rust For The First Time'"
[steve-declarative-imperative]: https://twitter.com/steveklabnik/status/958378927449427969
