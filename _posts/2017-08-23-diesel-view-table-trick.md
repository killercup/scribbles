---
title: "Diesel: Treat View as Table"
categories:
- rust
---

[Diesel] is a type-safe query builder for Rust.
Its goal is to give you an idiomatic interface for interacting with your database
so it's easy to write highly performant and correct queries.
But SQL is quite a complex beast,
and sadly,
this also makes Diesel an inherently complex tool.

[Diesel]: https://diesel.rs

On the implementation side,
one of the most complex parts of Diesel
is the association handling.
We take extra care
to only allow you
to query fields from tables
that are part of the query
(either as from or as join).
But currently, this is limited in some ways.
E.g., we don't have a way
to join the same table twice
(as there is no type-level aliasing).

To work around that,
and similar problems,
and as an alternative to using the raw SQL escape hatch,
you can use this trick:
**Create a view in a migration,
and query this view like a table**
(by writing a `table!` macro call for your view).

## Example

Let's imagine we have a simple schema
with two tables `users` and `follows`
(this is SQLite syntax):

```sql
CREATE TABLE users (
  id    INTEGER  NOT NULL  PRIMARY KEY  AUTOINCREMENT,
  name  TEXT
);

CREATE TABLE follows (
  follower  INTEGER  NOT NULL,
  followee  INTEGER  NOT NULL,
  PRIMARY KEY  (follower, followee),
  FOREIGN KEY  (follower)  REFERENCES  users (id),
  FOREIGN KEY  (followee)  REFERENCES  users (id)
);
```

Here is a SQL query
to get the content of the `follows` table
including the names of the follower/followed user:

```sql
SELECT u1.id AS follower_id, u1.name AS follower,
       u2.id AS followee_id, u2.name AS followee
  FROM follows
       INNER JOIN users AS u1
               ON follows.follower = u1.id
       INNER JOIN users AS u2
               ON follows.followee = u2.id;
```

This is a query you can't currently express in Diesel
without resorting to weird tricks.
But if this is a query you need, you can easily save it as a view:

```sql
CREATE VIEW follows_with_names AS
     SELECT ... -- same as above
```

Then tell Diesel about it:

```rust
table! {
    follows_with_names (follower_id, followee_id) {
        follower_id -> Integer,
        follower -> Text,
        followee_id -> Integer,
        followee -> Text,
    }
}
```

Voilà!
You can now query this like a table.
Postgres even allows you to call insert, update, and delete on simple views like this.

This also works great for aggregate queries,
or to abstract over database-specific operations
your application doesn't need to care about.
