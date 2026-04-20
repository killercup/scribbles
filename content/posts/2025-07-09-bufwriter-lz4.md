---
title: Rust BufWriter and LZ4 Compression
categories:
- rust
- performance
discussions:
  "Bluesky": https://bsky.app/profile/killercup.de/post/3ltkhuwpt6k2x
  "Mastodon": "https://mastodon.social/@killercup/114824754816997562"
  "Reddit": "https://www.reddit.com/r/rust/comments/1lw5r9x/bufwriter_and_lz4_compression/"
publishDate: 2025-07-09
updatedAt: 2025-07-09
atUri: "at://did:plc:x67qh7v3fd7znbdhauc45ng3/site.standard.document/3mjcdvac5ih27"
---
Recently, I've been working on a Rust project again.
It deals with bioinformatics data, which can be quite large,
so I got to play with profiling and optimizing the code.
I've done some of this in past, but this time it was _actually_ useful.
In this post, I want to talk about a small optimization
in working with LZ4 compression
that made a big difference in runtime performance.

This tool mainly reads in a BAM file
(which contains aligned genome sequence data),
does some processing on it,
and outputs the results in various formats,
chosen by the user.
One of the formats is the internal data structure used by the tool,
which is convient for debugging and testing.
Since this is Rust, all I had to do was add some `#[derive(Serialize, Deserialize)]` annotations,
choose a good format (I picked [MessagePack][msgpack]),
and thanks to [serde][serde],
we have a data format.
Concretely, I made an enum with all the possible structures I want to output,
(which includes header fields)
and serialize and write each structure separately,
so that they are concatenated in the output file.
To read it back in,
I wrote a little helper function[^rmp-stream] that
keeps deserializing these enum values until it reaches the end of the file.
So far, so good.

[msgpack]: https://msgpack.org/ "MessagePack: It's like JSON. but fast and small."
[serde]: https://serde.rs/ "Overview · Serde"

[^rmp-stream]: `serde_json` includes a [`StreamDeserializer`][struct-streamdeserializer] but  `rmp_serde` does not, so I wrote one myself. It's not as feature-complete (I think), but you can find it [here][317].

## Compression with LZ4

However, the output file was quite large
-- it's pretty much everything I have in RAM.
I wanted to compress it,
but I also knew that compression is expensive,
and for my debug output I don't really need to squeeze every byte out of it.
I chose [LZ4][lz4], via the `lz4` crate.
Its [`Encoder`][struct-encoder]
implements `Write`,
so we can just wrap our writer in it and continue to use it as before:

[lz4]: https://lz4.github.io/lz4/ "LZ4 - Extremely fast compression"
[struct-encoder]: https://docs.rs/lz4/1.28.1/lz4/struct.Encoder.html "Encoder in lz4"

<div class="wide">

```rust
let file = std::fs::File::create("output.msgpack.lz4")?;
let encoder = lz4::EncoderBuilder::new().level(4).build(file)?;
```

</div>

Pretty early in my Rust journey,
I learned that file I/O is not buffered by default,
so it's a good idea to wrap the `file` in a `BufWriter`:

<div class="wide">

```rust
let file = std::fs::File::create("output.msgpack.lz4")?;
let file_buffered = std::io::BufWriter::new(file);
let encoder = lz4::EncoderBuilder::new().level(4).build(file_buffered)?;
```

</div>

This then creates a chain like this:

```
MessagePack Serializer -> LZ4 Encoder -> BufWriter -> File
```

## Profiling

When profiling the code (with [samply][samply]),
I noticed that the overhead from LZ4 was quite high.
Even after lowering the compression level to 0,
I wasn't happy.
This was slower than the BGZIP compression I use for BCF files!
And that is based on Deflate, which, while optimized heavily,
is not an algorithm that should play in the same league as LZ4.
What is going on here?

[samply]: https://github.com/mstange/samply/ "mstange/samply: Command-line sampling profiler for macOS, Linux, and Windows"

I saw that there were **many** stacks with calls to `LZ4F_compressUpdateImpl`.
Looking at [the implementation][lz4frame]
with the samples per line,
I see a lot of calls to `LZ4F_selectCompression`, `LZ4F_compressBound_internal`,
`memcpy` (if the temporary block buffer has space and LZ4 wants to buffer),
`LZ4F_makeBlock`, which writes the block header and checksum,
and finally `XXH32_update`, which computes the checksum for the block.
Why is this being called so much and why are there so many blocks being made?

[lz4frame]: https://github.com/lz4/lz4/blob/v1.10.0/lib/lz4frame.c#L977 "lz4/lib/lz4frame.c at v1.10.0 · lz4/lz4"

LZ4 is a block-based compression algorithm,
which means that it compresses data in chunks.
The chunks we are giving it are the serialized MessagePack data,
which is around 250 bytes each.
This means that for every 250 byte chunk,
we're calling calling into LZ4 and ask it to compress it.
And for every 250 byte chunk,
it does the entire round checks and compression, and checksumming.

## Swap the buffer

Knowing that LZ4 works with blocks internally,
I had the idea that I could swap the way I use the buffer:
Instead of buffering writing to the file system,
I could buffer writing to the LZ4 encoder.

<div class="wide">

```rust
let file = std::fs::File::create("output.msgpack.lz4")?;
let encoder = lz4::EncoderBuilder::new().level(4).build(file)?;
let encoder_buffered = std::io::BufWriter::new(encoder);
```

</div>

And indeed, this works!
In my initial benchmark, this made this part of the code 1.83 times faster.
An amazing result for basically just swapping two lines of code.

[struct-streamdeserializer]: https://docs.rs/serde_json/1.0.140/serde_json/struct.StreamDeserializer.html "StreamDeserializer in serde_json"
[317]: https://github.com/3Hren/msgpack-rust/issues/317#issuecomment-3012814957 "Can't deserialize entire file · Issue #317 · 3Hren/msgpack-rust · GitHub"
