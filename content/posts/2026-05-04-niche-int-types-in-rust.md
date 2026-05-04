---
title: 'Niches for integer types in Rust'
publishDate: '2026-05-04'
updatedAt: '2026-05-04'
categories:
- rust
- type-system
atUri: "at://did:plc:x67qh7v3fd7znbdhauc45ng3/site.standard.document/3mkzwpee6d422"
discussions:
  Bluesky: https://bsky.app/profile/deterministic.space/post/3mkzwpegfyu2k
  Mastodon: https://mastodon.social/@killercup/116516902709168589
---
While working on [seqair]
(see [my post here][seqair-post]),
I also wrote a bunch of wrapper types
for the domain we work in.
One example is `Base` (a DNA base),
which is a fairly straightforward enum.
Another is `Pos`, a position in a DNA sequence,
which I'd like to talk about here.

The value range for a position is effectively `u31`.
We only support the positions that the BAM file format supports,
which store positions as `i32`.
But positions are always positive!
In C, one would use `-1` to indicate "no position", "invalid position"
(or a whole list of error cases)
but in Rust, I'd prefer not to do that.
Can we make use of this in some other way?

[seqair]: https://seqair.softleif.se/ "Pure-Rust BAM/SAM/CRAM/FASTA reader with a pileup engine and BCF/BAM writing."
[seqair-post]: https://deterministic.space/seqair.html "Seqair, a custom htslib reimplementation"

## Simple position type

So here is what we have as a start.
We also track if it is zero- or one-based using a type parameter
because some file formats count from `1` for human convenience.

```rust {.wide}
pub struct Pos<S> {
    value: u32,
    _system: PhantomData<S>,
}

pub struct Zero;
pub struct One;

impl TryFrom<i32> for Pos<Zero> {
    type Error = InvalidPosition;

    fn try_from(value: i32) -> Result<Self, Self::Error> {
        if value < 0 { return Err(InvalidPosition); }
        Ok(Self { value: value as u32, _system: PhantomData })
    }
}

#[derive(Debug, thiserror::Error)]
#[error("Invalid position")]
struct InvalidPosition;
```

which we can use like this:

```rust {.wide}
let record = get_raw_bam_record();
let position: Pos<Zero> = record.pos.try_into()?;
```

## Type niches

Let's look at `Option<T>`.
It is typically two things in memory:
a discriminant (is this `Some` or `None`?)
and the payload.
For `Option<u32>`, that means 8 bytes:
4 for the tag[^alignment] and 4 for the `u32` value.
But the compiler is smarter than that
when the inner type has _invalid_ bit patterns.
A reference `&T` can never be null,
so `Option<&T>` uses the null pointer pattern to represent `None`
and stays pointer-sized[^null].

The standard library's [`NonZero<u32>`] works the same way:
the value `0` is invalid,
so `Option<NonZero<u32>>` fits in 4 bytes.
These invalid bit patterns are called "niches".

[^alignment]: Because of alignment to 32 bits.
[^null]: That means it is as efficient to use `Option` in Rust
  as it is to use a null pointer in C.

You can verify this with `size_of`:

```rust {.wide}
assert_eq!(size_of::<Option<u32>>(), 8); // no niche
assert_eq!(size_of::<Option<NonZero<u32>>>(), 4); // niche
```

Our `Pos` type wraps a plain `u32`, so `Option<Pos<Zero>>` is 8 bytes.
That's wasteful:
we know positions only go up to `i32::MAX`,
which means half the `u32` range is invalid.
That's billions of niches, and we can't use a single one!

## On stable: the `NonZero` bias trick

[`NonZero<T>`] is the only niche-bearing integer type
available on stable Rust (1.95.0).
We can use it by storing `value + 1` internally:
the position `0` maps to `NonZero(1)`,
and `i32::MAX` maps to `NonZero(0x8000_0000)`.
The `0` bit pattern is never used, giving us our niche.

```rust {.wide}
#[repr(transparent)]
pub struct Pos<S> {
    value: NonZeroU32, // stores actual_value + 1
    _system: PhantomData<S>,
}

impl TryFrom<i32> for Pos<Zero> {
    type Error = ();

    fn try_from(value: i32) -> Result<Self, Self::Error> {
        if value < 0 { return Err(()); }
        let new_val = value as u32 + 1;
        Ok(Self {
            // SAFETY: Every positive i32 x fits into u32, and so does x+1
            value: unsafe { NonZeroU32::new_unchecked(new_val) },
            _system: PhantomData,
        })
    }
}

impl Pos<Zero> {
    pub const fn get(self) -> i32 {
        (self.value.get() - 1) as i32
    }
}
```

This works, and `Option<Pos<Zero>>` is now 4 bytes.
But every `new` adds 1 and every `get` subtracts 1.
It's a single ALU instruction each time,
so the cost is probably negligible in most code paths.
Still, it's conceptually unsatisfying:
we're contorting the representation
to fit a niche that doesn't match our actual invariant.

[`NonZero<u32>`]: https://doc.rust-lang.org/1.95.0/std/num/struct.NonZero.html "std::num::NonZero"
[`NonZero<T>`]: https://doc.rust-lang.org/1.95.0/std/num/struct.NonZero.html "std::num::NonZero"

## On nightly: declaring the valid range directly

As of Rust 1.95 (May 2026),
there is no stable way to tell the compiler
"this `u32` only holds values `0..=0x7FFF_FFFF`."

~~But internally, the standard library does exactly that for its own types
using the attributes
`rustc_layout_scalar_valid_range_start` and `rustc_layout_scalar_valid_range_end`.~~

**Oh wait -- while I was writing this post,
this exact feature got replaced!**

## On nightly: Pattern types

While researching this,
I came across [this issue][rust-135996]
where [Oli] proposes using a "pattern types" feature.
So it seems there is new way of doing this!
While reading through the [tracking issue][rust-123646] and [Zulip channel],
I found this [pre-RFC document][pre-rfc]
(last updated in 2024 but discussed further in 2025).
What is in the standard library right now
on nightly is a [`pattern_type!`] macro.
[Rust PR 136006] has some usage of this so I could put this together:

[Oli]: https://github.com/oli-obk
[rust-135996]: https://github.com/rust-lang/rust/issues/135996 "Replace rustc_layout_scalar_valid_range_start attribute with pattern types"
[rust-123646]: https://github.com/rust-lang/rust/issues/123646
[pre-rfc]: https://gist.github.com/joboet/0cecbce925ee2ad1ee3e5520cec81e30
[`pattern_type!`]: https://doc.rust-lang.org/1.95.0/core/macro.pattern_type.html "core::pattern_type!"
[Rust PR 136006]: https://github.com/rust-lang/rust/pull/136006
[Zulip channel]: https://rust-lang.zulipchat.com/#narrow/channel/481660-t-lang.2Fpattern-types

```rust {.wide}
#![feature(pattern_types)]
#![feature(pattern_type_macro)]

pub struct Pos(pattern_type!(i32 is 0..=i32::MAX));

impl Pos {
    pub const fn new(value: i32) -> Option<Self> {
        if value < 0 {
            None
        } else {
            // SAFETY: values >=0 fit in pattern
            Some(Self(unsafe { std::mem::transmute(value) }))
        }
    }

    pub const fn get(self) -> i32 {
        // SAFETY: self.0 is subset of i32
        unsafe { std::mem::transmute(self.0) }
    }
}
```

[You can play with the code here.][play2]

[play2]: https://play.rust-lang.org/?version=nightly&mode=debug&edition=2024&gist=d4c7bf6936d2bcef89455e7e271fba76

For now, `transmute` from the underlying type is the only way
to construct the pattern type.
On Zulip, Oli also recommended using inclusive ranges.

## Conclusion

I'm not using any of these nightly features in the real code yet,
but I'm glad to see momentum in this space.
It's a feature I've wanted in a few places already.
Other use cases for patterns type are an "inline length" type,
removing a workaround like the one `SmolStr` uses [here][smol_str len],
or types that have sentinels by specification,
like `INT8` in BAM files which actuallys is `-120..=127`.

[smol_str len]: https://github.com/rust-lang/rust-analyzer/blob/4a244d4c6bf18bae57626dcaf81bf6442ad59380/lib/smol_str/src/lib.rs#L541-L569
