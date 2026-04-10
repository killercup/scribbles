---
title: The Rust features that make Bevy’s systems work
categories:
- rust
- bevy
canonical: https://blog.logrocket.com/rust-bevy-entity-component-system/
discussions:
---

[Bevy](https://bevyengine.org/) is a game engine written in [Rust](https://www.rust-lang.org/) that is known for featuring a very ergonomic entity-component-system. In the ECS pattern *entities* are unique things (e.g. objects in a game world) that are made up of *components*. *Systems* process these entities and control the behavior of the application. What makes Bevy’s API so elegant is that users can write regular functions in Rust, and Bevy will know how to call them by their type signature, dispatching the correct data.

There is already a good amount of documentation on how to *use* this to build your own game (e.g. in [here](https://bevy-cheatbook.github.io/programming/ecs-intro.html) in the Unofficial Bevy Cheat Book). Instead, this post will explain *how this is implemented* in Bevy itself. To do so, we’re going to build a small Bevy-like API from scratch that accepts arbitrary system functions.

This pattern is very generic and you can apply it to your own Rust projects. To illustrate this, the last section of this post goes into more detail on how the Axum web framework uses this pattern for its route handler methods.

**This post is for you if** you are interested in type system tricks and are familiar with Rust. You can see it as a follow-up to my previous post on [the implementation of Bevy's labels](https://deterministic.space/bevy-labels.html).

**Note:** This post uses Bevy version 0.8.

## The user-facing API of Bevy’s system functions

First off, let's look at how Bevy's API is used so that we can work backward from it to recreate it ourselves.
Here's a small Bevy app with an example system:

```rust
use bevy::prelude::*;

fn main() {
    App::new()
        .add_plugins(DefaultPlugins) // includes rendering and keyboard input
        .add_system(move_player) // this is ours
        // in a real game you'd add more systems to e.g. spawn a player
        .run();
}

#[derive(Component)]
struct Player;

/// Move player when user presses space
fn move_player(
    // Fetches a resource registered with the `App`
    keyboard: Res<Input<KeyCode>>,
    // Queries the ECS for entities
    mut player: Query<(&mut Transform,), With<Player>>,
) {
    if !keyboard.just_pressed(KeyCode::Space) { return; }

    if let Ok(player) = player.get_single_mut() {
        // destructure the `(&mut Transform,)` type from above to access transform
        let (mut player_position,) = player;
        player_position.translation.x += 1.0;
    }
}
```

What you can see here is that we can pass a regular Rust function to `add_system` and Bevy knows what to do with it. Even better, our function parameters are used to tell Bevy which components we want to query: We want the `Transform`s from all entities that also have the custom `Player` component.
Behind the scenes, Bevy even infers which systems can run in parallel based on the function signature.

## Let’s start humble: We just want `add_system`

Bevy has a lot of API surface; after all it is a full game engine with a scheduling system, 2D and 3D renderer, and many other things in addition to its entity-component-system. We’re gonna ignore most of this and instead just focus on one thing: We want to add functions as systems and call them.

Following Bevy’s example, we’re gonna call the  item we add the systems to `App`, and give it just two methods, `new`, and `add_system`:

```rust
struct App {
    systems: Vec<System>,
}

impl App {
    fn new() -> App {
        App { systems: Vec::new() }
    }
    
    fn add_system(&mut self, system: System) {
        self.systems.push(system);
    }
}

struct System; // What is this?
```

Oh, this leads to the first problem: What is a system? In Bevy, we can just call the method with a function that has some useful arguments, but how do we do that in our own code?

## Add functions as systems

One of the main abstractions in Rust is `trait`s. They are similar to interfaces or type classes in other languages. We can define a trait and then implement it for arbitrary types so that the trait’s methods become available on these types. Let’s create a `System` trait that allows us to run arbitrary systems:

```rust
trait System {
    fn run(&mut self);
}
```

Now we have a trait for our systems, but to implement it on functions we need to use two additional features of the type systems.


> **Rust type system tricks:**
> Rust uses “traits” for abstracting over behavior.
> Functions implement some traits like [`FnMut`](https://doc.rust-lang.org/1.62.1/std/ops/trait.FnMut.html) automatically.
> We can implement traits for all types that fulfill a “constraint”.

Let’s use this:

```rust
impl<F> System for F where F: Fn() -> () {
    fn run(&mut self) {
        self(); // Yup, we're calling ourselves here
    }
}
```

If you’re not used to Rust, this might look quite unreadable. That’s okay, this is not something you see in an everyday Rust code base. You can read the first line as “Implement the system trait for all types that are functions without arguments that return nothing” and the following as “the `run` function takes the item itself and — since that is a function — calls it”.

This works, but is quite useless — you can only call a function without arguments. But before we go deeper into this, let’s fix up this example and make it runnable.

## Interlude: Runnable example

The definition of `App` above was just a quick draft. To make it use our new `System` trait, we need to make it a bit more complex.

Since `System` is now a trait and not a type, we can’t directly store it anymore. Why? Because we can’t even know the size of what a `System` is because it could be anything!
Instead, we need to put it behind a pointer, or, as Rust calls it, put it in a `Box`. This means that instead of storing the concrete thing that implements `System`, you just store a pointer.


> **Rust type system tricks:**
> You can use “trait objects” to store arbitrary items that implement a specific trait.

First, our App now needs to store a list of boxes that contain things that are `System`s. In practice it looks like this:

```rust
struct App {
    systems: Vec<Box<dyn System>>,
}
```

Our `add_system` method now also needs to accept anything that implements the `System` trait, and then put it into that list. The argument type is now generic: We use `S` as a placeholder for anything that implements `System`; and since Rust wants us to make sure that it is a thing valid for the entirety of the program, we are also asked to add `'static`.
And while we’re at it, let’s also add a method to actually run the app!

```rust
impl App {
    fn new() -> App { // same as before
        App { systems: Vec::new() }
    }
    
    fn add_system<S: System + 'static>(mut self, system: S) -> Self {
        self.systems.push(Box::new(system));
        self
    }
    
    fn run(&mut self) {
        for system in &mut self.systems {
            system.run();
        }
    }
}
```

With this, we can now write a small example:

```rust
fn main() {
    App::new()
        .add_system(example_system)
        .run();
}

fn example_system() {
    println!("foo");
}
```

You can play with the full code so far [here](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=3fe777f4a178aac4568c05dd621644b6).
Now, back to the problem of having more complex system functions.

## System functions with parameters

Let’s make this function a valid `System`:

```rust
fn another_example_system(q: Query<Position>) {}

// Use this to fetch entities
struct Query<T> { output: T }

// The position of an entity in 2D space
struct Position { x: f32, y: f32 }
```

The seemingly easy option would be to add another implementation for `System` to add functions with one parameter. But sadly, the Rust compiler will tell us that there’s two issues:

1. If we add an implementation for a concrete function signature, the two implementations would conflict (code [here,](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=851bba8bbe9b29df018b2d30c8d9f838) press run to see the with error).
2. If we made the function they accept generic, it would be an “unconstrained type parameter” (code [here](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=ddc7b3af90e6af418bc99fd9b351c9ee)).

We’ll need to approach this differently.

Let’s first introduce a trait for the parameters we accept:

```rust
trait SystemParam {}

impl<T> SystemParam for Query<T> {}
```

To distinguish the different `System` implementations, we can add type parameters, which become part of its signature:

```rust
trait System<Params> {
    fn run(&mut self);
}

impl<F> System<()> for F where F: Fn() -> () {
    //         ^^ this is "unit", a tuple with no items
    fn run(&mut self) {
        self();
    }
}

impl<F, P1: SystemParam> System<(P1,)> for F where F: Fn(P1) -> () {
    //                             ^ this comma makes this a tuple with one item
    fn run(&mut self) {
        eprintln!("totally calling a function here");
    }
}
```

But now the issue becomes that in all the places where we accept `System`, we need to add this type parameter! And, even worse, when we try to store the `Box<dyn System>`, we’d have to add one there, too:

```console
error[E0107]: missing generics for trait `System`
  --> src/main.rs:23:26
    |
23 |     systems: Vec<Box<dyn System>>,
    |                          ^^^^^^ expected 1 generic argument
…
error[E0107]: missing generics for trait `System`
  --> src/main.rs:31:42
    |
31 |     fn add_system(mut self, system: impl System + 'static) -> Self {
    |                                          ^^^^^^ expected 1 generic argument
…
```

(By the way: If you make all instances `System<()>` and comment out the `.add_system(another_example_system)`, this compiles.)

## Storing generic systems

Our challenge is now this — get all three:

1. We need to have a generic trait that knows its parameters.
2. We need to store generic systems in a list.
3. We need to be able to call these systems when iterating over them.

This is a good place to look at Bevy’s code. When you start digging in, you’ll see:

- Functions do not implement [`System`](https://docs.rs/bevy/0.8.0/bevy/ecs/system/trait.System.html), but [`SystemParamFunction`](https://docs.rs/bevy/0.8.0/bevy/ecs/system/trait.SystemParamFunction.html)!
- [`add_system`](https://docs.rs/bevy/0.8.0/bevy/app/struct.App.html#method.add_system) does not take an `impl System`, but an [`impl IntoSystemDescriptor`](https://docs.rs/bevy/0.8.0/bevy/ecs/schedule/trait.IntoSystemDescriptor.html). This in turn uses a [`IntoSystem`](https://docs.rs/bevy/0.8.0/bevy/ecs/system/trait.IntoSystem.html) trait.
- And actually, the thing that does implement `System` is [`FunctionSystem`](https://docs.rs/bevy/0.8.0/bevy/ecs/system/struct.FunctionSystem.html), a struct.

Let’s take inspiration from that and make our `System` trait simple again. The code from above gets to continue on as a new trait called `SystemParamFunction`.
We’ll also introduce an `IntoSystem` trait which our `add_system` function will accept:

```rust
trait IntoSystem<Params> {
    type Output: System;

    fn into_system(self) -> Self::Output;
}
```


> **Rust type system tricks:**
> We use an [associated type](https://doc.rust-lang.org/1.62.1/book/ch19-03-advanced-traits.html) to define what kind of `System` type this conversion will output.

This conversion trait still outputs a concrete “system”… but what is that? Here comes the magic: We add a struct `FunctionSystem` that will implement `System` and we’ll add an `IntoSystem` implementation that creates it:

```rust
/// A wrapper around functions that are systems
struct FunctionSystem<F, Params: SystemParam> {
    /// The system function
    system: F,
    // TODO: Do stuff with params
    params: core::marker::PhantomData<Params>,
}

/// Convert any function with only system params into a system
impl<F, Params: SystemParam + 'static> IntoSystem<Params> for F
where
    F: SystemParamFunction<Params> + 'static,
{
    type System = FunctionSystem<F, Params>;

    fn into_system(self) -> Self::System {
        FunctionSystem {
            system: self,
            params: PhantomData,
        }
    }
}

/// Function with only system params
trait SystemParamFunction<Params: SystemParam>: 'static {
    fn run(&mut self);
}
```

(As you can see, `SystemParamFunction` is the generic trait we called `System` in the last chapter.)

**Note:** As you can see, we’re not doing anything with the function parameters yet. We’ll just keep them around so everything is generic and then “store” them in the [`PhantomData`](https://doc.rust-lang.org/1.62.1/core/marker/struct.PhantomData.html) type.

To fulfill the constraint from `IntoSystem` that its output has to be a `System`, we now implement the trait on our new type:

```rust
/// Make our function wrapper be a System
impl<F, Params: SystemParam> System for FunctionSystem<F, Params>
where
    F: SystemParamFunction<Params> + 'static,
{
    fn run(&mut self) {
        SystemParamFunction::run(&mut self.system);
    }
}
```

Now we’re almost ready! Let’s update our `add_system` function and then we can see how this all works:

```rust
impl App {
    fn add_system<F: IntoSystem<Params>, Params: SystemParam>(mut self, function: F) -> Self {
        self.systems.push(Box::new(function.into_system()));
        self
    }
}
```

Our function now accepts everything that implements `IntoSystem` with a type parameter that is a `SystemParam`.
To accept systems with more than one parameter we can implement `SystemParam` on tuples of items that are themselves system parameters:

```rust
impl SystemParam for () {} // sure, a tuple with no elements counts
impl<T1: SystemParam> SystemParam for (T1,) {} // remember the comma!
impl<T1: SystemParam, T2: SystemParam> SystemParam for (T1, T2) {} // A real two-ple
```

But what do we store now? Actually the same as earlier:

```rust
struct App {
    systems: Vec<Box<dyn System>>,
}
```

But now it works! How?

## Boxing up our generics

The trick is that we’re now storing a generic `FunctionSystem` as a [trait object](https://doc.rust-lang.org/1.62.1/book/ch17-02-trait-objects.html). That means our `Box<dyn System>` is a “fat pointer”: It points to both the `FunctionSystem` in memory as well as a lookup table of everything related to `System` trait for this instance of the type.


> **Rust type system tricks:**
> When using generic functions and data types, the compiler will “monomorphize” them to generate code for the types that are actually used. That also means that if you use the same generic function with three different concrete types, it will be compiled three times.

This means that we have all three now: We have our trait implemented for generic functions, we store a generic `System` box, and we still call `run` on it.

## Fetching parameters

Sadly, this doesn’t work just yet: We have no way of fetching the parameters and calling the system functions with them. But that’s okay — in the implementations for `run` we can just print a line instead of calling the function. This way we can prove that it compiles and runs *something*.

The result would look somewhat like this:

```rust
fn main() {
    App::new()
        .add_system(example_system)
        .add_system(another_example_system)
        .add_system(complex_example_system)
        .run();
}

fn example_system() {
    println!("foo");
}

fn another_example_system(_q: Query<&Position>) {
    println!("bar");
}

fn complex_example_system(_q: Query<&Position>, _r: ()) {
    println!("baz");
}
```


```console
    Compiling playground v0.0.1 (/playground)
    Finished dev [unoptimized + debuginfo] target(s) in 0.64s
      Running `target/debug/playground`
foo
TODO: fetching params
TODO: fetching params
```

You can [find the full code from this post here](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=3f79222eaafc289088e730cff4cb658a) — press play and you’ll see this output (and some more). Feel free to play with it, try some combinations of systems, and maybe add some other things!

We’ll end this post here. Maybe in a follow-up, we’ll talk all about fetching the parameters from a `World`. For now, if you want to look at how Bevy does it, check out the [`SystemParamFetch`](https://docs.rs/bevy/0.8.0/bevy/ecs/system/trait.SystemParamFetch.html#) trait.

## Bonus: Same pattern, different framework — Extractors in Axum

We’ve now seen how Bevy can accept quite a wide range of functions as systems. But as teased in the intro, other libraries and frameworks also use this pattern.

One example is the Axum web framework, which allows you to define “handler functions” for specific routes. This is an example from [their documentation](https://docs.rs/axum/0.5.13/axum/extract/index.html):

```rust
async fn create_user(Json(payload): Json<CreateUser>) { todo!() }

let app = Router::new().route("/users", post(create_user));
```

There is a `post` function that accepts functions (even `async` ones) where all parameters are “extractors”, like a `Json` type here. As you can see this is a bit more tricky than what we’ve seen Bevy do so far. Axum has to take into account the return type and how it can be converted, as well as supporting async functions (i.e., those that return futures).

But the general principle is the same:

1. The [`Handler`](https://docs.rs/axum/0.5.13/axum/handler/trait.Handler.html) [trait](https://docs.rs/axum/0.5.13/axum/handler/trait.Handler.html) is implemented for functions
    1. whose parameters implement [`FromRequest`](https://docs.rs/axum/0.5.13/axum/extract/trait.FromRequest.html) and
    2. whose return type implements [`IntoResponse`](https://docs.rs/axum/0.5.13/axum/response/trait.IntoResponse.html).
2. It gets wrapped in a [`MethodRouter`](https://docs.rs/axum/0.5.13/axum/routing/struct.MethodRouter.html) struct
3. and stored in a `HashMap` on the router.
4. When called, `FromRequest` is [used](https://github.com/tokio-rs/axum/blob/329bd5f9b4e3747d6601773895a99899169e2ba5/axum/src/handler/mod.rs#L238-L252) to extract the values of the parameters so the underlying function can be called with them. (This is a spoiler for how Bevy works too!)

For more on how extractors in Axum work, have a look at [this talk by David Pedersen](https://youtu.be/ETdmhh7OQpA?t=333).

----------

This post was originally written by [Pascal Hertleif](https://deterministic.space/). Help and review on [the Bevy Discord](https://discord.com/invite/bevy) by Joy and Logic was much appreciated.
