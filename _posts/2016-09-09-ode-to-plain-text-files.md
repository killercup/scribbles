---
title: I <3 plain text files
categories:
- tech
---
I really enjoy working with plain text files. More software should work with plain text files. It obviously depends on what kind/amount of information you want to store, but I think for a lot of use cases text files are a very good solution.

## Version control everything

Text files can easily be put into a git repository to be versioned, compared, tracked, and shared.

I have not seen a database system that easily allows you all of that.

## App configs need not be complex

Instead of putting configuration values into huge XML files (XML != 'plain') that cannot be edited by regular humans, it makes sense to choose a readable (approaching 'plain') text format, like YAML or TOML. JSON is okay, but not as nice as TOML.

## Autocomplete with JSON Schema

VSCode supports autocomplete based on JSON Schema files. Doing the same for similar formats should be doable.

## Sanity check, linters

When human and machine want to read, edit, and understand the same file, it usually pays off to let the machine a bit of sanity checking. Linters and formatters are your friend.
