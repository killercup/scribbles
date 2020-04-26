---
title: Long-form Texts on Interesting Details of Computers
entries:
- title: Learn Rust With Entirely Too Many Linked Lists
  type: book
  url: https://rust-unofficial.github.io/too-many-lists/index.html
  author: Alexis Beingessner
  archive: 20200416132847
  pages: 180
  updated: 2019-03-21
  niches: [data structures, linked lists, rust, smart pointers]
  summary: |
    The premise of this book is that
    writing a linked list is a beginner's exercise in C
    but quite difficult to get right in Rust.
    So it takes that as an opportunity to do just what the title says:
    It teaches you Rust by implementing a linked list type in Rust,
    in five (as of April 2020) different ways.
- title: Programming Algorithms
  type: book
  url: https://leanpub.com/progalgs/read
  author: Vsevolod Domkin
  pages: 300
  archive: 20200416131734
  updated: 2020-04-16
  niches: [data structures, algorithms, lisp]
  summary: |
    Book covering a lot of different data structures and algorithms.
    "Its aim is to systematically explain how to write efficient programs and,
    also, the approaches and tools for determining why the program isn’t efficient enough."
- title: Amos' Intro to Rust
  type: series
  author: Amos Wenger
  niches: [rust]
  parts:
  - title: A half-hour to learn Rust
    url: https://fasterthanli.me/blog/2020/a-half-hour-to-learn-rust/
    archive: 20200416203813
    updated: 2020-01-27
    summary: Whirlwind tour through Rust as a language.
  - title: Declarative memory management 
    url: https://fasterthanli.me/blog/2019/declarative-memory-management/
    archive: 20200416202910
    updated: 2019-09-19
    pages: 60
    summary: |
      Introducing the complexities of memory management and
      the ways Rust tries to represent them in a nice roundabout way.
  - title: Working with strings in Rust 
    author: Amos Wenger
    url: https://fasterthanli.me/blog/2020/working-with-strings-in-rust/
    archive: 20200416203533
    updated: 2020-02-19
    summary: |
      Following the memory management post,
      this looks at how strings are actually pretty complicated
      and what Rust does about them.
- title: Reading files the hard way
  type: series
  author: Amos Wenger
  summary: |
    Writing files seems like a solved problem.
    But that doesn't mean we can't solve it again from scratch.
  niches: [POSIX, file systems, syscalls]
  parts:
  - title: Part 1 (node.js, C, rust, strace)
    url: https://fasterthanli.me/blog/2019/reading-files-the-hard-way/
    archive: 20200416203146
  - title: Part 2 (x86 asm, linux kernel) 
    url: https://fasterthanli.me/blog/2019/reading-files-the-hard-way-2/
    archive: 20200416203148
  - title: Part 3 (ftrace, disk layouts, ext4)
    url: https://fasterthanli.me/blog/2019/reading-files-the-hard-way-3/
    archive: 20200416203157
- title: Making our own ping
  type: series
  author: Amos Wenger
  parts:
  - title: A short (and mostly wrong) history of computer networking 
    url: https://fasterthanli.me/blog/2019/making-our-own-ping/
    archive: 20200416134726
  - title: Windows dynamic libraries, calling conventions, and transmute
    url: https://fasterthanli.me/blog/2019/making-our-own-ping-2/
    archive: 20200416145917
  - title: FFI-safe types in Rust, newtypes and MaybeUninit
    url: https://fasterthanli.me/blog/2019/making-our-own-ping-3/
    archive: 20200416145936
  - title: Designing and implementing a safer API on top of LoadLibrary
    url: https://fasterthanli.me/blog/2019/making-our-own-ping-4/
    archive: 20200416145936
  - title: A simple ping library, parsing strings into IPv4 address
    url: https://fasterthanli.me/blog/2019/making-our-own-ping-5/
    archive: 20200416145942
  - title: The builder pattern, and a macro that keeps FFI code DRY
    url: https://fasterthanli.me/blog/2019/making-our-own-ping-6/
    archive: 20200416145943
  - title: Finding the default network interface through WMI
    url: https://fasterthanli.me/blog/2019/making-our-own-ping-7/
    archive: 20200416145943
  - title: Binding C APIs with variable-length structs and UTF-16
    url: https://fasterthanli.me/blog/2019/making-our-own-ping-8/
    archive: 20200416150009
  - title: Consuming Ethernet frames with the nom crate
    url: https://fasterthanli.me/blog/2019/making-our-own-ping-9/
    archive: 20200416150006
  - title: Improving error handling - panics vs. proper errors
    url: https://fasterthanli.me/blog/2019/making-our-own-ping-10/
    archive: 20200416150009
  - title: Parsing IPv4 packets, including numbers smaller than bytes
    url: https://fasterthanli.me/blog/2019/making-our-own-ping-11/
    archive: 20200416150021
  - title: Parsing and serializing ICMP packets with cookie-factory.
    url: https://fasterthanli.me/blog/2019/making-our-own-ping-12/
    archive: 20200416150207
  - title: Crafting ARP packets to find a remote host's MAC address
    url: https://fasterthanli.me/blog/2019/making-our-own-ping-13/
    archive: 20200416150054
  - title: Crafting ICMP-bearing IPv4 packets with the help of bitvec
    url: https://fasterthanli.me/blog/2019/making-our-own-ping-14/
    archive: 20200416150207
- title: Making our own executable packer
  type: series
  author: Amos Wenger
  parts:
  - title: What's in a Linux executable?
    url: https://fasterthanli.me/blog/2020/whats-in-a-linux-executable/
    archive: 20200416203931
  - title: Running an executable without exec
    url: https://fasterthanli.me/blog/2020/running-an-executable-without-exec/
    archive: 20200416203942
  - title: Position-independent code
    url: https://fasterthanli.me/blog/2020/position-independent-code/
    archive: 20200416203931
  - title: ELF relocations
    url: https://fasterthanli.me/blog/2020/elf-relocations/
    archive: 20200416203942
  - title: The simplest shared library
    url: https://fasterthanli.me/blog/2020/the-simplest-shared-library/
    archive: 20200416203942
  - title: Loading multiple ELF objects 
    url: https://fasterthanli.me/blog/2020/loading-multiple-elf-objects/
    archive: 20200416203946
  - title: Dynamic symbol resolution
    url: https://fasterthanli.me/blog/2020/dynamic-symbol-resolution/
    archive: 20200416203951
  - title: Dynamic linker speed and correctness
    url: https://fasterthanli.me/blog/2020/dynamic-linker-speed-and-correctness/
    archive: 20200416203951
  - title: GDB scripting and Indirect functions
    url: https://fasterthanli.me/blog/2020/gdb-scripting-and-indirect-functions/
    archive: 20200416203954
  - title: Safer memory-mapped structures
    url: https://fasterthanli.me/blog/2020/safer-memory-mapped-structures/
    archive: 20200416204004
  - title: More ELF relocations
    url: https://fasterthanli.me/blog/2020/more-elf-relocations/
    archive: 20200416204015
  - title: A no_std Rust binary
    url: https://fasterthanli.me/blog/2020/a-no-std-rust-binary/
    archive: 20200426170253
  - title: Thread-local storage
    url: https://fasterthanli.me/blog/2020/thread-local-storage/
    archive: 20200426170407
- title: Parsing
  type: series
  author: Aleksey Kladov
  niches: [parsers]
  summary: |
    Not a real series of articles but a collection of posts by someone whose
    Github bio reads "Stuck writing parsers".
  parts:
  - title: Modern Parser Generator
    url: https://matklad.github.io/2018/06/06/modern-parser-generator.html
    archive: 20200426170539
  - title: Simple but Powerful Pratt Parsing
    url: https://matklad.github.io/2020/04/13/simple-but-powerful-pratt-parsing.html
    archive: 20200416155208
  - title: From Pratt to Dijkstra
    url: https://matklad.github.io/2020/04/15/from-pratt-to-dijkstra.html
    archive: 20200416155220
- title: JavaScript Allongé
  type: book
  author: Reg “raganwald” Braithwaite
  url: https://leanpub.com/javascriptallongesix/read
  archive: 20200416145246
  updated: 2019-04-26
  pages: 530
  niches: [functional programming, obscure JavaScript]
- title: Crafting Interpreters
  type: book
  author: Robert Nystrom
  url: http://craftinginterpreters.com/contents.html
  archive: 20200411062649
  updated: 2020-04-05
  pages: 800
- title: A relatively simple Datalog engine in Rust
  type: post
  author: Frank McSherry
  url: https://github.com/frankmcsherry/blog/blob/81e9555bbee110954f2c3d35caf86ea7e7612fa6/posts/2018-05-19.md
  summary: Building a datalog engine in Rust.
  niches: [datalog]
  pages: 20
  archive: 20200423163205
- title: Non-lexical lifetimes
  type: series
  author: Niko Matsakis
  summary: |
    One of the main features of the Rust language is the concept of ownership and lifetimes.
    This series of posts by Niko Matsakis, one of the designers of the Rust language,
    is about the theory and practical implementation
    of a revamped and more complete way of this
    in the Rust compiler.
    It starts in early 2016 and goes all the way to after they feature landed
    (end of 2018).
  parts:
  - title: Introduction
    url: https://smallcultfollowing.com/babysteps/blog/2016/04/27/non-lexical-lifetimes-introduction/
    archive: 20200416170054
  - title: Non-lexical lifetimes based on liveness
    url: http://smallcultfollowing.com/babysteps/blog/2016/05/04/non-lexical-lifetimes-based-on-liveness/
    archive: 20190917065228
  - title: Adding the outlives relation
    url: https://smallcultfollowing.com/babysteps/blog/2016/05/09/non-lexical-lifetimes-adding-the-outlives-relation/
    archive: 20200416170116
  - title: Using liveness and location
    url: https://smallcultfollowing.com/babysteps/blog/2017/02/21/non-lexical-lifetimes-using-liveness-and-location/
    archive: 20200416170119
  - title: Nested method calls via two-phase borrowing
    url: https://smallcultfollowing.com/babysteps/blog/2017/03/01/nested-method-calls-via-two-phase-borrowing/
    archive: 20200416170122
  - title: Draft RFC and prototype available
    url: https://smallcultfollowing.com/babysteps/blog/2017/07/11/non-lexical-lifetimes-draft-rfc-and-prototype-available/
    archive: 20200416170125
  - title: An alias-based formulation of the borrow checker
    url: https://smallcultfollowing.com/babysteps/blog/2018/04/27/an-alias-based-formulation-of-the-borrow-checker/
    archive: 20200416170128
  - title: MIR-based borrow check (NLL) status update
    url: https://smallcultfollowing.com/babysteps/blog/2018/06/15/mir-based-borrow-check-nll-status-update/
    archive: 20200416170132
  - title: MIR-based borrowck is almost here
    url: https://smallcultfollowing.com/babysteps/blog/2018/10/31/mir-based-borrowck-is-almost-here/
    archive: 20200416170139
  - title: Interprocedural conflicts
    url: https://smallcultfollowing.com/babysteps/blog/2018/11/01/after-nll-interprocedural-conflicts/
    archive: 20200416170144
  - title: Polonius and region errors
    url: https://smallcultfollowing.com/babysteps/blog/2019/01/17/polonius-and-region-errors/
    archive: 20200416170147
  - title: Polonius and the case of the hereditary harrop predicate
    url: https://smallcultfollowing.com/babysteps/blog/2019/01/21/hereditary-harrop-region-constraints/
    archive: 20200416170150
- title: Shifgrethor
  type: series
  author: Without Boats
  summary: "A proposed API for a GC in Rust."
  parts:
  - title: Garbage collection as a Rust library
    url: https://boats.gitlab.io/blog/post/shifgrethor-i/
    archive: 20200416172628
  - title: Notes on tracing garbage collectors
    url: https://boats.gitlab.io/blog/post/shifgrethor-ii/
    archive: 20200416172630
  - title: Rooting
    url: https://boats.gitlab.io/blog/post/shifgrethor-iii/
    archive: 20200416172636
  - title: Tracing
    url: https://boats.gitlab.io/blog/post/shifgrethor-iv/
    archive: 20200416172639
- title: Stacked Borrows
  type: series
  _incomplete: true
  author: Ralf Jung
  niches: [compilers, memory management]
  parts:
  - title: 'Stacked Borrows: An Aliasing Model For Rust'
    url: https://www.ralfj.de/blog/2018/08/07/stacked-borrows.html
    archive: 20200417142605
  - title: 'Stacked Borrows Implemented'
    url: https://www.ralfj.de/blog/2018/11/16/stacked-borrows-implementation.html
    archive: 20200417142616
  - title: 'Barriers and Two-phase Borrows in Stacked Borrows'
    url: https://www.ralfj.de/blog/2018/12/26/stacked-borrows-barriers.html
    archive: 20200417142618
  - title: 'Stacked Borrows 2'
    url: https://www.ralfj.de/blog/2019/04/30/stacked-borrows-2.html
    archive: 20200417142407
  - title: 'Putting the stack back into Stacked Borrows'
    url: https://www.ralfj.de/blog/2019/05/21/stacked-borrows-2.1.html
    archive: 20200417142500
  - title: 'Stacked Borrows: An Aliasing Model for Rust (the paper)'
    url: https://www.ralfj.de/blog/2019/11/18/stacked-borrows-paper.html
    archive: 20200417142510
- title: Rayon/Parallel Iterators
  type: series
  author: Niko Matsakis
  niches: [concurrency]
  parts:
  - title: 'Rayon: Data parallelism in Rust'
    url: https://smallcultfollowing.com/babysteps/blog/2015/12/18/rayon-data-parallelism-in-rust/
    archive: 20200423162646
  - title: 'Parallel Iterators Part 1: Foundations'
    url: https://smallcultfollowing.com/babysteps/blog/2016/02/19/parallel-iterators-part-1-foundations/
    archive: 20200423162647
  - title: 'Parallel Iterators Part 2: Producers'
    url: https://smallcultfollowing.com/babysteps/blog/2016/02/25/parallel-iterators-part-2-producers/
    archive: 20200423162653
  - title: 'Parallel Iterators, part 3: Consumers'
    url: https://smallcultfollowing.com/babysteps/blog/2016/11/14/parallel-iterators-part-3-consumers/
    archive: 20200423162650
- title: How Rust optimizes async/await
  type: series
  author: Tyler Mandry
  niches: [compilers, memory layout]
  parts:
  - title: Part I
    url: https://tmandry.gitlab.io/blog/posts/optimizing-await-1/
    archive: 20200417142143
  - title: 'Part II: Program analysis'
    url: https://tmandry.gitlab.io/blog/posts/optimizing-await-2/
    archive: 20200417142149
- title: Writing an OS in Rust
  author: Philipp Oppermann
  type: series
  niches: operating systems, assembler
  parts:
  - title: A Freestanding Rust Binary
    url: https://os.phil-opp.com/freestanding-rust-binary/
    archive: 20200419114640
  - title: A Minimal Rust Kernel
    url: https://os.phil-opp.com/minimal-rust-kernel/
    archive: 20200419114644
  - title: VGA Text Mode
    url: https://os.phil-opp.com/vga-text-mode/
    archive: 20200419114648
  - title: Testing
    url: https://os.phil-opp.com/testing/
    archive: 20200419114651
  - title: CPU Exceptions
    url: https://os.phil-opp.com/cpu-exceptions/
    archive: 20200419114838
  - title: Double Faults
    url: https://os.phil-opp.com/double-fault-exceptions/
    archive: 20200419114841
  - title: Hardware Interrupts
    url: https://os.phil-opp.com/hardware-interrupts/
    archive: 20200419114844
  - title: Introduction to Paging
    url: https://os.phil-opp.com/paging-introduction/
    archive: 20200419115000
  - title: Paging Implementation
    url: https://os.phil-opp.com/paging-implementation/
    archive: 20200419115003
  - title: Heap Allocation
    url: https://os.phil-opp.com/heap-allocation/
    archive: 20200419115006
  - title: Allocator Designs
    url: https://os.phil-opp.com/allocator-designs/
    archive: 20200419115009
  - title: Async/Await
    url: https://os.phil-opp.com/async-await/
    archive: 20200419115012
- title: Learning Parser Combinators With Rust
  type: post
  author: Bodil Stokke
  url: https://bodil.lol/parser-combinators/
  summary: |
    Assuming you know Rust, this teaches you the fundamentals of parser combinators
    in a very hands-on way.
  niches: [parsers]
  pages: 60
  archive: 20200423162949
---
It seems especially recently I've come across more and more
_long-form_ texts (think: hour-long blog posts; free books; series of posts).
I especially like the ones that go into the very fine details of some niche topic
and maybe also ramble a bit about completely unrelated but
highly entertaining asides.
And while I will probably never have enough time to read them all,
I decided to at least collect some of them here for future reference.
I'll do my best to add summaries, and to update this list semi-regularly.

## Contents
{:.no_toc}

- Table of contents
{:toc}

{% for entry in page.entries %}
{%- if entry._incomplete -%}{% continue %}{%- endif -%}
{% case entry.type %}
{% when 'book' or 'post' %}

## "[{{entry.title}}]({{entry.url}})" by {{entry.author}}

({% if entry.pages %}~{{entry.pages}} pages; {% endif -%}
[archived](https://web.archive.org/web/{{entry.archive}}/{{entry.url}}))

{{entry.summary}}

{% if entry.niches %}Niches: {{entry.niches | join: "; "}}{% endif %}

{% if entry.updated %}Last update I saw: {{ entry.updated }}{% endif %}

{% when 'series' %}

## "{{entry.title}}" by {{entry.author}}

{{entry.summary}}

{% if entry.niches %}Niches: {{entry.niches | join: "; "}}{% endif %}

{% if entry.updated %}Last update I saw: {{ entry.updated }}{% endif %}

{% for part in entry.parts %}
1. [{{part.title}}]({{part.url}}) ([archived](https://web.archive.org/web/{{part.archive}}/{{part.url}})){% if part.summary %}

    {{part.summary}}{% endif %}
{%- endfor -%}

{% else %}
<!-- Pascal screwed up. There is no way to handle type `{{entry.type}}` -->
{% endcase %}
{% endfor %}
