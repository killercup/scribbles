---
title: Serve archived static files over HTTP
categories:
- tools
- rust
discussions:
  "Twitter": https://twitter.com/killercup/status/1061676996852363270
---
Say you want to store a huge number of very small files
that you will only access over HTTP.
For example:
You are using `rustdoc` to render the documentation of a library.
Without much work you'll end up with about 100k HTML files
that are about 10kB each.
As it turns out,
this number of small files is very annoying for any kind of file system performance.
Best case: making copies/backups is slow.
Worst case: You're using an anti virus software and it takes ages.

Except for convenience when implementing software,
and people being used to having folders of files they can look into,
there is little reason to store these files individually.
Indeed, it will save much space and time to store files like these
in compressed form in one continuous archive.
All that is needed to make this work is
some well-designed and discoverable software.

[static-filez] is a prototype for that piece of software.

[static-filez]: https://github.com/killercup/static-filez

## Contents
{:.no_toc}

1. Table of contents
{:toc}

## Storing and serving compressed data

The way you use static-filez is twofold:
First, you tell it to create an archive file from a directory,
that will contain all the individual files in compressed form.
Then, you use the same tool to start a server
that takes an archive file as input
and serves its content.

One main insight was this:
You never need to decompress the individual files.
If we store the files inside the archive
as individual gzip or deflate streams we can serve them directly over HTTP.
(Using the [Content-Encoding] and [Content-Disposition] headers.)

[Content-Encoding]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding
[Content-Disposition]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition

## Current implementation of the index/archive format

At first,
I used [bincode] to serialize a `HashMap<FilePath, CompressedFileContent>` to a file.
This means that to deserialize from the file
we also have to use bincode,
and it'll read the whole archive into memory
(at least in my implementation).

While this works for a prototype,
to make this work with larger archives,
it makes sense to use another file structure.
My initial idea was to have an index that gets loaded into memory,
and which maps from a file path to a slice (offset + length) in a "content" file.
The content file can be [mmap'd][mmap] to read.
Should we ever want to add data to the archive,
we can append to the content file,
and write a new index
(see below).

Some time ago,
Andrew Gallant wrote a blog post
called [Index 1,600,000,000 Keys with Automata and Rust][transducers].
In it, Gallant describes the [fst] crate,
which supports building and storing index maps
in a very efficient way.
It uses
-- as the name suggests --
finite state transducers,
i.e.,
the idea of representing the key of the map
as the state transitions
so the bytes of the key drive the transducer.
However, it has some limitations:
It can currently only carry a `u64` as value,
and the key-value pairs have to be added in lexicographical order.

Luckily, we can make this work with the design described above:
Our index is a `fst::Map`
that maps from file path to `(offset as u32, len as u32)`
(using bit shifts to store both in a u64),
and is build by
first having the directory walker we currently use put all paths in a Vec,
sorting it,
and then adding entries to the index
while compressing and writing file contents to another file.

**Note:**
This means we end up with two files:
An "index" file,
and an an "archive" file.
This is not the ideal solution,
but doesn't matter in practice
(the CLI always writes `.index` and `.archive` files and normalizes inputs to also use these file extensions),
and even allows us to extend the archive files
and use them with multiple indices
(see below).

[bincode]: https://docs.rs/bincode
[mmap]: https://en.wikipedia.org/wiki/Mmap
[transducers]: https://blog.burntsushi.net/transducers/
[fst]: https://docs.rs/fst

## Performance

Now, I don't really want to post benchmarks here.
I have done some,
but quit as soon as I saw the following:
On my machine,
static-filez serving its own API documentation
is 2% slower than [hyper]
(the HTTP server library that static-filez uses)
serving "Hello world".
This is much faster than any other static file server
that I could easily set up
and that uses the file system.
You can find more details
[in this pull request][benchmarks].

[hyper]: https://hyper.rs/
[benchmarks]: https://github.com/killercup/static-filez/pull/2#issuecomment-431606554

## Allow larger files

(The following section is copied
from [issue #6][issue6],
which includes this important note:
"Please correct my math, it's late and I had a few beers.")

[issue6]: https://github.com/killercup/static-filez/issues/6

Right now,
the `u64` values that the index gives us is split into two 32-bit integers:
32 bit for the position in the archive,
and 32 bit to specify the length of the file.
This means 4 GB for the archive in general,
and 4 GB max size per file.
Here are some ways to change these limits.

### Increase addressable archive size by enforcing write alignment

If we align the start of each file written to the archive
by `2^n` bytes,
we get `n` more bits to use for addressing.
For example:
Align files so their address ends with `…0000`
and we can shift _all_ addresses by 4 bits,
yielding `2^4=16` times the addressable archive size.
This of course introduces zero-ed gaps in the archive files.

### Using more bits for addressing

Instead of splitting the 64 bit integer into two 32 bit integers,
we might as split it into chunks of varying size,
for example 40 bit and 24 bit
-- shifting the limits to 1 TB archives containing files up to 16 MB.
This should work very well for the rustdoc use case.

This can of course be combined with the alignment option described above,
to yield `2^36 * 2^4 = 1 TB` archive files
containing 4 byte aligned files up to `2^28 = 268 MB`.

### Patching fst to allow other value types

The fst docs [mention][fst-limits] that in the future,
it should be possible to map to something other than a `u64`.
We can make that future happen.
This seems to most complicated and time-consuming of all the options, though. :)

[fst-limits]: https://docs.rs/fst/0.3.2/fst/struct.Map.html#the-future

## How to update files

In a regular static file server it is trivial to change the files.
All you have to do is to, well, change the files.
If you do this in atomic write operations,
the users should always receive the correct contents.
But how would this be implemented in static-filez?

As described above,
we have two files:
One "index file"
containing a map from paths to `(index, size)` pairs,
and another "archive" file
containing the content that these pairs refer to.
In the current implementation
the archive file is [mmap'd][mmap] at the start of the server.

If we wanted to change the files the server sends us
-- without downtime --
we could append new/changed files to the archive file.
Then, we generate a new, separate index file,
and tell the server process to load that.

What does "tell the server to load that" mean, exactly?
It's not implemented yet.
I imagine it working like this:

1. The server receives a message on a socket
   (default: `stdin`):
   "Load index file `X`".
2. It reads the file as a `fst::Map`.
3. It atomically adds the new map
   to the top of a list of "sites"
   it consults when trying to resolve a path.

This is not the most trivial approach:
We introduce a "list of sites"
instead of just replacing the one index map we use for lookups.
The reason is this:
Eventually,
we want to load multiple sets of index/archive files
(see next section).

## Multiple data sources

We should support having multiple index/archive pairs loaded
and using them to resolve files.

### Why?

Imagine this scenario:
You generate the documentation for a library
while on a plane,
and every link to a type in the standard library
points to some external website
(like `doc.rust-lang.org`).
At the same time you know
that you have the current standard library locally installed
(and you can access them with `rustup doc`).
Wouldn't it be neat if the links would point to that?

**Aside:**
That's indeed possible:
If instead of `cargo doc`, you do
`env RUSTDOCFLAGS="-Z unstable-options --extern-html-root-url std=file:///Users/pascal/.rustup/toolchains/nightly-x86_64-apple-darwin/share/doc/rust/html/" cargo doc`
(with the adjusted path to your current toolchain)
it will use that as base path for the std lib links.
You'll probably also want to set this for `core` and other built-in libraries.

How would that work if you used static-filez to serve these docs?
We could try to also put all these files in our single archive.
Or, as you might have guessed after reading the previous section,
we load a second archive.

### How?

Right now,
the server loads one [`Site`],
a simple data type with two fields,
the index map, and the mmap'd archive file.

[`Site`]: https://github.com/killercup/static-filez/blob/f064e20295019aa0d75c9226c0f61267f340ada8/src/site.rs#L12-L15

If we were to extend this to a list of sites,
and go through them one after another
looking for a match on our path
(stopping when we found it),
we can load a generic but toolchain-specific
archive of the standard library
and always use that.

The next step is then to
allow the server to receive messages
on separate channel
(e.g. `stdin` as mentioned above)
that tell it to change this list of sites.
This will allow us to load updates to archives
and also add more archive/index pairs.

## Use case: Central doc server

One specific use case I have in mind
that makes all this talk about
"updatable list of known index/archive pairs"
more reasonable is this:
I want to have a server
that I can start on my machine
that serves all the API docs I have for a project.

(Or maybe even _all_ projects I have!
But that is way more tricky
because of optional features and toolchain versions.)

If `cargo doc-server` was to start a server
using static-filez
that automatically served the documentation of your project/workspace
and also updated it when you save a file,
I would be very happy.

## Downloadable documentation

One last step we could go
was to skip generating documentation for dependencies at all
and instead link to `docs.rs`.
Link to?
I mean download, of course!
If `docs.rs` was using static-filez
it would be easy to offer the index and archives files as downloads
and instead of generating documentation locally,
we could just download it.

There are, of course,
a few issues to consider:
We need to assert that the toolchain and used cargo features
match with what we need.
And someone's gonna have to pay for the bandwidth.

## Experiment: Self-containing binary

Using a bit of linker magic
it might be possible for 
`static-filez build`
to generate only one file
that combines
the index, the archive,
and, most importantly,
also the executable
of `static-filez` itself
so that you can execute this single file.
This is a neat experiment
to make this easier to distribute.

## To consider: File formats

I invented binary formats.
Well, not precisely.
I actually _didn't_ invent formats,
but just wrote bytes into files
and used whatever fst [does][fst-stream-to-file].
And this lack of thought might be a problem.

[fst-stream-to-file]: https://docs.rs/fst/0.3.2/fst/struct.MapBuilder.html#example-stream-to-file

Right now,
I feel like it might be prudent
to reconsider this approach
and add some metadata to each of the files.
For example,
the index file should contain
information on the layout of the values.
This is right now hardcoded to
`(offset as u32, index as u32)`
but could also be
`(offset as u32 shifted by 4 bits, index as u32)`
in the future
(see above).
The archive file is _just_ the file contents right now;
with no way to even get the path of the file.
If this was a use case,
it would be trivial to add the path before the file content.
