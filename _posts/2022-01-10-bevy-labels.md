---
title: How Bevy uses Rust traits for labelling
categories:
- rust
- bevy
---
Out of curiosity I've recently started following the development of [Bevy],
a game engine written in [Rust] that.
Today I want to talk about how Bevy uses Rust traits to let users very conveniently label elements.

**Note:** The implementation we arrive at is actually very generic
-- you can easily apply it to any other Rust project.
So if you don't care about Bevy, you can skip the first two motivational sections.

## How to bevy

Bevy really wants you to use its entity component system architecture
to structure your games.
What is boils down to is writing functions ("systems")
that use queries to fetch and update components and resources.
You define what you app/game is by telling Bevy which systems exists
and how they might be combined.

**Aside:** These "systems functions" are super interesting in themselves:
They are just regular Rust functions with specific parameters
and through type-system magic (read: traits) Bevy knows how to call them.

Here's a simple Bevy 0.6 app:

```rust
use bevy::prelude::*;

fn main() {
    App::new()
        .add_plugins(MinimalPlugins)
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
Not that to not be immediately presented with a wall of text,
we have changed the `add_system` to `add_startup_system`.
This means the system is only run once, at start-up.

```rust
use bevy::prelude::*;

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .add_startup_system(setup_world.label("world"))
        .add_startup_system(spawn_player.before("world"))
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
Well, long story short, that [`after`] method turns your system function into a [`ParallelSystemDescriptor`]
with metadata that the scheduler can pick up and build a graph from.

[`after`]: https://docs.rs/bevy/0.6.0/bevy/ecs/schedule/trait.ParallelSystemDescriptorCoercion.html
[`ParallelSystemDescriptor`]: https://docs.rs/bevy/0.6.0/bevy/ecs/schedule/struct.ParallelSystemDescriptor.html

Feel free to play with this!
Change it to `before("world")`,
change the order in which the systems are added,
add more systems, etc.

Imagine this:
By now we have a whole game built using dozens of systems.
But for some reason the player movement seems a bit broken,
like it's rendering one frame too late.
What is the issue?
After two hours and too much coffee we realize that
we wrote `.after("imput")`.

How can we make sure that a simple typo won't break or game again?
This is where we look a bit deeper into what a [`SystemLabel`] actually is.

[`SystemLabel`]: https://docs.rs/bevy/0.6.0/bevy/ecs/schedule/trait.SystemLabel.html

## Get me out of this stringly-typed mess




[Bevy]: https://bevyengine.org/
[Rust]: https://www.rust-lang.org/
