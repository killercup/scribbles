---
title: NixOS notes
categories:
- linux
- nix
---

I think I've come to terms with the fact that
my job will always contain sysadmin work.
Maybe because I'm not too bad at ssh-ing into a Linux box
and messing with it long enough
to have a bunch of interdependent services working;
or maybe because I kinda want to be able to make sure my stuff runs correctly.
(And I have own my personal and very specific definition of "correctly".)
Thus,
I started looking into how to make this less error-prone.
I don't want to manually edit files, restart a thing and pray that it still runs.
I also don't want the current working state to be an accidental result of pressing the right buttons
instead of a correct, reproducible configuration.
Ideally, I even want to have this documented in version control.

On top of all that I also wanted to start using Linux on my desktop again
(after living Mac-only for a while),
and I'd really appreciate if I could take the advantages of this server provisioning setup with me.
Long story short: I looked into NixOS.

(There are a lot of considerations and trade-offs for and against other approaches
but this is not the post to discuss them.)

## The idea

The premise of NixOS is to have a declarative way of setting up your system.
You define what you want your system to be,
run `nixos-rebuild switch`,
and it will make sure your system will be as described.
In an ideal world that means you don't have to ever touch a config file
outside of `/etc/nixos`,
and that you whole machine's configuration can be easily put into a git repo.
(So you don't have to do steps like [these][arch-setup] manually!)

[arch-setup]: https://github.com/mmozeiko/arch-setup

## The Nix Language

NixOS is a Linux distributions based on the `nix` package manager.
For maximum confusion,
the configuration language of the `nix` package manager is also called Nix.
But it's fine,
I just read the former as the suffix of "Unix"
and the latter as the German word for "nothing".
That makes everything much more clear.
(Oh and also the style of writing `nix` vs. Nix.)

Nix is a domain-specific language.
This is a feature I very much appreciate
but that also needs some explaining.
The syntax may seem weird at first,
but it is designed to work well for configuring that state of a system in a concise way:
It allows expressing (and merging) nested properties,
writing paths or URLs as literals,
and has string interpolation without common footguns.
It also features control flow constructs,
curried functions,
and lazy evaluation.

Most of the `nix`-related tooling works by evaluating Nix expressions.

## The package manager and its store

The `nix` package manager has a pretty unique design.
First off, packages are defined as a Nix expression.
Evaluating it returns the full dependency tree,
including all build- and runtime dependencies.
`nix` puts the output (a directory with files)
of each built package into its store,
identified by the hash of all inputs and the package name.

To be able to execute a program from a package,
`nix` creates symlinks to add it (user or system) profiles.
If necessary, the package also includes wrappers to load the necessary dependencies
using their full paths.
This means that adding packages is pretty much an atomic operation
and doesn't change any system files.

## Constructing environments

### Aside: Package-specific FSH environments

## NixOS on the desktop

### Limits of my current setup

### Developing software on NixOS
