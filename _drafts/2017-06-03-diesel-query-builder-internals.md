---
title: How Diesel implements type-safe SQL queries
categories:
- rust
---

One of the main selling points of using Diesel's query builder (instead of writing raw SQL) is that it prevents invalid queries at compile time. This is in line with the general aspiration of the Rust community to prevent runtime errors, and, like many other libraries with this goal, Diesel makes use of Rust's type system to accomplish this. This article will present the internal structure of the query builder, hoping to give the reader a general idea of how this results in the public interface and behavior Diesel exposes.

## Mapping between SQL types and Rust types

## Automatically generating types and modules representing database tables

## Building ASTs for queries

## Constraints
