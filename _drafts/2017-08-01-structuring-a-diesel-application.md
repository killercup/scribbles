---
title: Structuring a Diesel application
---

IMHO, [Diesel] is a library, not a framework. It gives you tools to interact with your database, and these tools have assumption about your code structure (e.g., that some related item are in scope), but as a whole, Diesel does not tell you how to structure your code. Whether you put your inferred database schema in a single `schema` module or add `table!` macro calls for a `users` table to a `user_management` module -- Diesel is fine with it.

Nevertheless, it makes sense to think a bit about how to structure an application so your coworkers (as well as your future self) will enjoy working with the codebase.

## Modules

- mod api
- mod schema
- mod queries
	- Also consider views for complicated queries

## Conventions

- Plural table names
- Singular Rust struct names (they represent one row)
- One struct with `#[derive(Insertable)]` per user insert/update action
- Always derive/impl *ALL* the standard traits, incl. Hash, Default, Des/Serialize. Controversial: increases compile time, might suggest impls are used
- Do not impl query builder helper methods on your `#[derive(Queryable)]` struct, introduce new types/modules for that (e.g. called `FooQueries`)
- Import the query dsl only in function scope, never on a module level
