---
title: Modeling data with validations in Rust
categories:
- tech
- incomplete
---
I've been building web applications for a lot of years now, and one of the most complex, annoying, and challenging things that I always end up implementing is a bunch of models for data, a bunch of validations for their fields, and then parts of the same stuff again in HTML forms as well as in database schemas.

Thinking about a nice design for a web framework written in Rust, I wanted to find a nice solution to this. Thing is, I already know that a descriptive format like JSON schema would probably give us the most flexibility, but mapping such a schema to Rust types is still a challenge. Especially built-in reflection (i.e., a way to query the validation rules for a field) will be a challenge.

tbd.
