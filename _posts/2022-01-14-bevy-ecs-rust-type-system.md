---
title: The type level tricks that make the system functions in Bevy's ECS work
categories:
- rust
- bevy
discussions:
  # "Reddit": "https://www.reddit.com/r/rust/comments/s0fg3m/how_bevy_uses_rust_traits_for_labeling/"
  # "Twitter": "https://twitter.com/killercup/status/1480460379960528896"
---

[Bevy] is a game engine written in [Rust]
that is known for featuring a very ergonomic entity-component-system (ECS).
This post will explain how this is implemented using neat Rust's type system tricks.

**Aside:**
This pattern is very generic
-- you can easily apply it to any other Rust project.
In fact, web servers like Rocket and Poem use this pattern for their route handler methods.

You can see this post as a follow-up to my previous post
on [the implementation of Bevy's labels][labels post].

[Bevy]: https://bevyengine.org/
[Rust]: https://www.rust-lang.org/
[labels post]: {% post_url 2022-01-10-bevy-labels %}

## The user-facing API of the ECS system functions

When I need to design an API,
I like to first draft some usage examples.
This way, I have a clear guide of where I want to end up,
without limiting myself with a possible implementation.
With this in mind, let's look at how Bevy's ECS is used
and try to work backwards from that.

Here's a small Bevy app with an example system:

```rust
use bevy::prelude::*;

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .add_system(move_player)
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
    if let Ok((mut player_position,)) = player.get_single_mut() {
        player_position.translation.x += 1.0;
    }
}
```

As you can see,
we can pass a regular Rust function to `add_system`
and Bevy knows what to do with it.
Even better,
our function parameters are used to tell Bevy which components we want to query.

## Step 1: What can we call `add_system` with?

The `add_system` function is defined like this:

```rust
fn add_system<Params>(&mut self, system: impl IntoSystemDescriptor<Params>) -> &mut Self { … }
```

Read this as:
You can call `add_system` with anything that implements the `IntoSystemDescriptor` trait.

The signature might be slightly confusing as it uses both
a named generic parameter `Params`
as well an unnamed generic parameter using the "impl trait syntax".

We could rewrite this as

```rust
fn add_system<Desc: IntoSystemDescriptor<Params>, Params>(&mut self, system: Desc) -> &mut Self {
```

without changing the behavior.

## Step 2: Defining `IntoSystemDescriptor`

This is the full definition of `IntoSystemDescriptor`
from the [API documentation][`IntoSystemDescriptor`]:

```rust
pub trait IntoSystemDescriptor<Params> {
    fn into_descriptor(self) -> SystemDescriptor;
}
```

**Aside:**
Avid Rust users will recognize this trait follows a common pattern:
It starts with `Into`, continues with `SystemDescriptor`
and its only method converts the given type into a `SystemDescriptor`.
This is very similar to or example `IntoIterator` from the standard library.

This means that anything that implements this trait
can be converted into a `SystemDescriptor`.
In practice
Bevy can thus call `into_descriptor` on anything you pass into `add_system`
and get a known type out of it.

And here is the magical part:
`IntoSystemDescriptor` is implemented on a bunch of stuff!
Looking at [the documentation][`IntoSystemDescriptor`]
I don't see it implemented on functions, though!
That would look something like
`impl IntoSystemDescriptor for FnOnce(&mut Foo) {}`.
What is making us able to pass in functions?

There is one `impl` block that seems to be hiding this:

```rust
impl<Params, S> IntoSystemDescriptor<Params> for S
where
    S: IntoSystem<(), (), Params>,
{ … }
```

So we need to go one level deeper still.
What is `IntoSystem`?


[`IntoSystemDescriptor`]: https://docs.rs/bevy/0.6.0/bevy/ecs/schedule/trait.IntoSystemDescriptor.html


## Step 3: One more conversion trait -- `IntoSystem`

Similar to how `IntoSystemDescriptor` converts a type into a `SystemDescriptor`,
`IntoSystem` converts a type into a [`System`].
What's the difference? The [documentation][`System`] says:

> Systems are executed in parallel, in opportunistic order; data access is
> managed automatically. It’s possible to specify explicit execution order
> between specific systems, see `SystemDescriptor`.

Aha, so the system's description contains more metadata for the scheduler.
Let's not worry about this for now.

`IntoSystem` has two implementations,
one that contains the type name `AlreadyWasSystem` in its definition
(so I will ignore it)
and another that is truly magnificent:

```rust
impl<In, Out, Param, Marker, F> IntoSystem<In, Out, (IsFunctionSystem, Param, Marker)> for F
where
    In: 'static,
    Out: 'static,
    Param: SystemParam + 'static,
    Marker: 'static,
    F: SystemParamFunction<In, Out, Param, Marker> + Send + Sync + 'static,
{
    type System = FunctionSystem<In, Out, Param, Marker, F>;
    fn system(self) -> Self::System { … }
}
```

This is a lot of noise to appease the Rust compiler,
but the most interesting part is the `SystemParamFunction` line:
This sounds very much like the trait we were looking for!


[`System`]: https://docs.rs/bevy/0.6.0/bevy/ecs/system/trait.System.html


## Step 4: We're getting closer with `SystemParamFunction`

Just have a look at [the documentation of `SystemParamFunction`][`SystemParamFunction`].
It's a beautiful mess.
Let's make some sense of it.

A reduced version of the trait shows
that it expresses a callable system:

```rust
trait SystemParamFunction<In, Out, Param: SystemParam, Marker> {
  fn run(&self, In, …) -> Out;
}
```

And if you scroll down on that page,
you can see its implemented for a lot of very long types.
But that too is just a beautiful mess:
It's generated with a macro
and just iterates the number of tuple elements
for the `Param` generic parameter.

The only constraint on `Param` is that it implements `SystemParam`.


[`SystemParamFunction`]: https://docs.rs/bevy/0.6.0/bevy/ecs/system/trait.SystemParamFunction.html
[`SystemParam`]: https://docs.rs/bevy/0.6.0/bevy/ecs/system/trait.SystemParam.html


## Step 5: Are we there yet, `SystemParam`?

This a curious trait:
[`SystemParam`] is defined like this:

```rust
trait SystemParam: Sized {
    type Fetch: for<'w, 's> SystemParamFetch<'w, 's>;
}
```

So it just defines an associated type,
not even a method.

But looking at the implementors in the [API docs][`SystemParam`],
we see that *finally* we have arrived a trait that is related to our function's parameters:
There is a wonderful `impl<…> SystemParam for Query<…>`
as well as `impl<…> SystemParam for Res<…>`.


## Step 6: End of the line: `SystemParamFetch`

<!--
TODO: Write this

basically same impls as SystemParam
used internally to execute a param

-->


## So how does it run?

<!--
TODO: Write this

call IntoSystem::system -> get descriptor
call SystemParamFunction::run -> internally calls `get_param` on all params then calls actual function with their result

-->

## Bonus: Collecting metadata for the scheduler

<!--
TODO: Write this

This is what the System and descriptor thingy is for
SystemMeta?

-->
