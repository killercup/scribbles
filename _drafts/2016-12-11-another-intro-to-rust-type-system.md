---
title: Another intro to Rust's type system
categories:
- rust
---
While writing Rust code, it occurred to me that most of my programs (incl. libraries) were just `Data + Behavior`. I'll try to describe what I mean by this, but this post makes no claim to be an exhaustive description of Rust's type system.

Data is easily defined:

Data
:	Structs (product types)
:	Enums (sum types)

Behavior is a bit trickier to define as there are basically two things that allow us to model behavior:

Behavior
:	Free functions
:	Traits

Traits (sometimes called type classes) is the "interesting" one of the two, as they associate behavior with types. A trait can be implemented on a type by defining the non-optional associated items it includes.

Associated items
:	Associated functions,  
	i.e. methods,  
	i.e. functions defined in a trait
:	Associated types,  
	i.e. type aliases defined in a trait
:	Associated constants,  
	i.e. constants defined in a trait (unstable as of Rust 1.13)

