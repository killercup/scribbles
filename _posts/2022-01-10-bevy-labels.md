---
title: How Bevy uses Rust traits for labeling
categories:
- rust
- bevy
discussions:
  "Reddit": "https://www.reddit.com/r/rust/comments/s0fg3m/how_bevy_uses_rust_traits_for_labeling/"
  "Twitter": "https://twitter.com/killercup/status/1480460379960528896"
---
Out of curiosity I've recently started following the development of [Bevy],
a game engine written in [Rust].
Today I want to talk about how Bevy uses Rust traits to let users very conveniently label elements.

**Note:** The implementation we arrive at is actually very generic
-- you can easily apply it to any other Rust project.


[Bevy]: https://bevyengine.org/
[Rust]: https://www.rust-lang.org/

## How to bevy

Bevy really wants you to use its entity-component-system (ECS) architecture
to structure your games.
What is boils down to is writing functions ("systems")
that use queries to fetch and update components and resources.
You define what you app/game is by telling Bevy which systems exists
and how they might be combined.

**Aside:** These "systems functions" are super interesting in themselves:
They are just regular Rust functions with specific parameters
and through type-system magic (read: traits) Bevy knows how to call them.
I wrote a separate article on them [here][ecs post].

[ecs post]: {% post_url 2022-09-15-bevy-ecs-rust-type-system %}

Here's a simple Bevy 0.6 app:

```rust
use bevy::prelude::*;

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .add_system(clock)
        .run();
}

fn clock(time: Res<Time>) {
  println!("Started {}s ago", time.seconds_since_startup());
}
```

*Spoiler:* This will spam your terminal with how long the app has been running.

## Defining system relationships using labels

Bevy has a very neat scheduler
that is able to run all systems that operate on disjoint data in parallel.
If you want to specify that some systems have to run before others,
you have to annotate this.

Here's another, slightly more complex example.
Note that to not be immediately presented with a wall of text,
we have changed the `add_system` to `add_startup_system`.
This means the system is only run once, at start-up.

```rust
use bevy::prelude::*;

fn main() {
    App::new()
        .add_plugins(MinimalPlugins)
        .add_startup_system(setup_world.label("world"))
        .add_startup_system(spawn_player.after("world"))
        .run();
}

fn setup_world() {
    println!("one")
}
fn spawn_player() {
    println!("two")
}
```

The idea is that we first setup the world with its map
and then spawn the component(s) that represent our player.
If you run this, you will see two lines "one", "two", in that order.

The important two lines of code are the where we give our system the `label("world")`,
and where the other system can refer to that label
and declare it wants to run `after("world")`.

**Aside:** How does this work internally?
Well, long story short, that [`after`][`ParallelSystemDescriptorCoercion`] method turns your system function into a [`ParallelSystemDescriptor`]
with metadata that the scheduler can pick up and build a graph from.

Feel free to play with this!
Change it to `before("world")`,
change the order in which the systems are added,
add more systems, etc.

Imagine this:
It's a bit later in the month and
we have a whole game built using dozens of systems.
But for some reason the player movement seems a bit broken,
like it's rendering one frame too late.
What is the issue?
After two hours and too much coffee we realize[^warn] that
we wrote `.after("imput")`.

How can we make sure that a simple typo won't break our game again?


[^warn]: To be fair, with the `LogPlugin` Bevy prints a *warning* on start-up about an unknown label.
But our example immediately starts printing a lot of other things,
and I guess in this imaginary scenario drinking all this coffee didn't make us more alert after all.


[`ParallelSystemDescriptorCoercion`]: https://docs.rs/bevy/0.6.0/bevy/ecs/schedule/trait.ParallelSystemDescriptorCoercion.html
[`ParallelSystemDescriptor`]: https://docs.rs/bevy/0.6.0/bevy/ecs/schedule/struct.ParallelSystemDescriptor.html

## Get me out of this stringly-typed mess

So far we've used strings to define and refer to labels,
but if you look at the definition of the `label`, `before`, and `after` methods [here][`ParallelSystemDescriptorCoercion`]
you will see they actually accept anything that implements [`SystemLabel`].

If you go to Bevy's API docs you can see [`SystemLabel`] is a trait and defined as 

```rust
pub trait SystemLabel: 'static + DynHash + Debug + Send + Sync { }
```

Look at all these bounds!
You might recognize a few from usual Rust code,
but `DynHash` stands out as one trait defined in `bevy::utils`.
We'll come back to it later, and just treat it as the regular `Hash` trait for now.

`SystemLabel` also looks like an empty trait -- but that's actually an illusion.
Its only item is hidden in the docs.
We can assume that's because its an implementation detail,
and instead of implementing this trait manually,
we are supposed to derive it.
Indeed, there is a [`SystemLabel` derive macro].

Okay, so to get a type to be a `SystemLabel`,
it needs to implement `Debug`, `Hash`
(the compiler will figure `'static + Send + Sync` out for us).
As you might know, to derive `Hash`, we also need to derive `PartialEq + Eq`.
And by experimentation and reading compiler errors,
we can see that the `SystemLabel` derive actually also adds a requirement on `Clone`.

In the end we arrive at something like this:

```rust
#[derive(Debug, Clone, PartialEq, Eq, Hash, SystemLabel)]
enum Setup {
    World,
}
```

Which we can use just like our string previously:

```rust
.add_startup_system(setup_world.label(Setup::World))
.add_startup_system(spawn_player.after(Setup::World))
```


[`SystemLabel`]: https://docs.rs/bevy/0.6.0/bevy/ecs/schedule/trait.SystemLabel.html
[`SystemLabel` derive macro]: https://docs.rs/bevy/0.6.0/bevy/ecs/schedule/derive.SystemLabel.html

## Some notes on the magic

So what is the deal with that [`DynHash`] trait?
If you look at the [API docs][`DynHash`],
you can see that it requires an implementation of `DynEq`
(also from Bevy),
which in turn requires an implementation of `Any`.

Its methods are also kind of strange:
Compared to standard library's [`Hash`] trait,
there are no generics, but a lot of `dyn` keywords.
This looks to me that someone went out of their way to make
an [object-safe] version of `Hash`.

The good news is: Users of the API don't have to care:
`DynHash` is implemented for all types that implement `Hash` and `DynEq`,
and `DynEq` is in turn implemented for all types that implement `Eq` and `Any`,

Another thing that seems magical is that hidden trait method on `SystemLabel`,
which is actually called `dyn_clone`.
Similar to the other dynamic trait implementations,
this allows cloning any `SystemLabel` type,
even if all you have is a `Box<dyn SystemLabel>`.


[`DynHash`]: https://docs.rs/bevy/0.6.0/bevy/utils/label/trait.DynHash.html
[`Hash`]: https://doc.rust-lang.org/1.57.0/core/hash/trait.Hash.html
[object-safe]: https://doc.rust-lang.org/book/ch17-02-trait-objects.html

## Generic label types

Did you think we were done?
Oh no! There one more thing:
`SystemLabel` is not alone!
There is also `StageLabel`, `AmbiguitySetLabel`, and `RunCriteriaLabel`.

These label types are pretty much all the same,
but distinct traits in the type system.
That means you will have to explicitly derive `StageLabel`
if you want to use your type to refer to a stage;
you can't use a `SystemLabel` or any other label for that.

This is another safety guarantee:
We already saw that you can mess up your stringy labels by making typos,
but you can also type everything correctly
and still refer to a "stage label" in place of a "system label".
If you use custom types instead of strings, however,
the compiler will not let you confuse them.

In true Rust fashion all of these labels are implemented using macros.
The macro is called [`define_label`]
and it's used [here][label.rs]
to create all the label traits for the scheduler.

The derive macros are a bit more manual,
and they live in the `bevy_ecs_macros` crate [here][macros].


[`define_label`]: https://docs.rs/bevy/0.6.0/bevy/utils/macro.define_label.html
[label.rs]: https://github.com/bevyengine/bevy/blob/e56685370ba82003af60a491667fac209a0f7897/crates/bevy_ecs/src/schedule/label.rs#L4-L7
[macros]: https://github.com/bevyengine/bevy/blob/8009af3879fcdb8bad70ee19b36f79100da5ea22/crates/bevy_ecs/macros/src/lib.rs#L429-L438

