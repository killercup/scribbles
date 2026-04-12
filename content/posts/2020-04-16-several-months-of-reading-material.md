---
title: Long-form Texts on Interesting Details of Computers
publishDate: 2020-04-16
updatedAt: 2020-04-16
atUri: "at://did:plc:x67qh7v3fd7znbdhauc45ng3/site.standard.document/3mjcdvawoep2t"
---
It seems especially recently I’ve come across more and more *long-form* texts (think: hour-long blog posts; free books; series of posts). I especially like the ones that go into the very fine details of some niche topic and maybe also ramble a bit about completely unrelated but highly entertaining asides. And while I will probably never have enough time to read them all, I decided to at least collect some of them here for future reference. I’ll do my best to add summaries, and to update this list semi-regularly.


## “Learn Rust With Entirely Too Many Linked Lists” by Alexis Beingessner

(~180 pages; [archived](https://web.archive.org/web/20200416132847/https://rust-unofficial.github.io/too-many-lists/index.html))

The premise of this book is that writing a linked list is a beginner’s exercise in C but quite difficult to get right in Rust. So it takes that as an opportunity to do just what the title says: It teaches you Rust by implementing a linked list type in Rust, in five (as of April 2020) different ways.

Niches: data structures; linked lists; rust; smart pointers

Last update I saw: 2019-03-21

## “Programming Algorithms” by Vsevolod Domkin

(~300 pages; [archived](https://web.archive.org/web/20200416131734/https://leanpub.com/progalgs/read))

Book covering a lot of different data structures and algorithms. “Its aim is to systematically explain how to write efficient programs and, also, the approaches and tools for determining why the program isn’t efficient enough.”

Niches: data structures; algorithms; lisp

Last update I saw: 2020-04-16

## “Aspects of Rust” by multiple people

Several stand-alone posts by various people whose only connection is that they cover nice aspects of Rust.

Niches: rust

1. [A half-hour to learn Rust](https://fasterthanli.me/blog/2020/a-half-hour-to-learn-rust/) ([archived](https://web.archive.org/web/20200416203813/https://fasterthanli.me/blog/2020/a-half-hour-to-learn-rust/))
	Whirlwind tour through Rust as a language by Amos Wenger.
2. [Diving into Rust with a CLI](https://kbknapp.dev/rust-cli/) ([archived](https://web.archive.org/web/20200624084218/https://kbknapp.dev/rust-cli/))
	Small tutorial by Kevin Knapp on how to write a XKCD downloader tool in Rust.
3. [Typed Key Pattern](https://matklad.github.io/2018/05/24/typed-key-pattern.html) ([archived](https://web.archive.org/web/20200426170858/https://matklad.github.io/2018/05/24/typed-key-pattern.html))
	By Aleksey Kladov.
4. [The Secret Life of Cows](https://deterministic.space/secret-life-of-cows.html) ([archived](https://web.archive.org/web/20200426171212/https://deterministic.space/secret-life-of-cows.html))
	The Clone-on-Write smart pointer explained by yours truly.
5. [Newtype Index Pattern](https://matklad.github.io/2018/06/04/newtype-index-pattern.html) ([archived](https://web.archive.org/web/20200426170901/https://matklad.github.io/2018/06/04/newtype-index-pattern.html))
	By Aleksey Kladov.
6. [How to implement a trait for `&str` and `&[&str]`](https://deterministic.space/return-type-based-dispatch.html) ([archived](https://web.archive.org/web/20200426171311/https://deterministic.space/return-type-based-dispatch.html))
	Some musing on traits and borrows by yours truly.
7. [Declarative memory management](https://fasterthanli.me/blog/2019/declarative-memory-management/) ([archived](https://web.archive.org/web/20200416202910/https://fasterthanli.me/blog/2019/declarative-memory-management/))
	By Amos Wenger. Introducing the complexities of memory management and the ways Rust tries to represent them in a nice roundabout way.
8. [Return-type based dispatch](https://deterministic.space/return-type-based-dispatch.html) ([archived](https://web.archive.org/web/20200426171311/https://deterministic.space/return-type-based-dispatch.html))
	By yours truly. By specifying at some later point in the code which type you want your function to return, the compiler can go back and fill in the blanks.
9. [Working with strings in Rust](https://fasterthanli.me/blog/2020/working-with-strings-in-rust/) ([archived](https://web.archive.org/web/20200416203533/https://fasterthanli.me/blog/2020/working-with-strings-in-rust/))
	By Amos Wenger. Following the memory management post, this looks at how strings are actually pretty complicated and what Rust does about them.
10. [Writing Non-Trivial Macros in Rust](http://adventures.michaelfbryan.com/posts/non-trivial-macros/) ([archived](https://web.archive.org/web/20200624084806/http://adventures.michaelfbryan.com/posts/non-trivial-macros/))
	By Michael F. Bryan.

## “Command Line Applications in Rust” by Pascal Hertleif

(~45 pages; [archived](https://web.archive.org/web/20200624083756/https://rust-cli.github.io/book/print.html))

A tutorial on how to write CLI apps in Rust, learning many aspects of the ecosystem along the way.

Last update I saw: 2020-06-12

## “Learn Rust the Dangerous Way” by Cliff L. Biffle

Rust explained for low-level developers without a CS background. If you’ve been writing firmwares or kernels or game engines and want to dip your toes into Rust, this a good start. Full index of series [here](https://cliffle.com/p/dangerust/).

Niches: rust; systems programming; memory management

1. [Why Learn Rust the Dangerous Way?](https://cliffle.com/p/dangerust/0/) ([archived](https://web.archive.org/web/20200618094401/https://cliffle.com/p/dangerust/0/))
2. [You Can’t Write C in Just Any Ol’ Language](https://cliffle.com/p/dangerust/1/) ([archived](https://web.archive.org/web/20200618094447/https://cliffle.com/p/dangerust/1/))
3. [References Available Upon Request](https://cliffle.com/p/dangerust/2/) ([archived](https://web.archive.org/web/20200618094458/https://cliffle.com/p/dangerust/2/))
4. [Measure What You Optimize](https://cliffle.com/p/dangerust/3/) ([archived](https://web.archive.org/web/20200618094503/https://cliffle.com/p/dangerust/3/))
5. [A More Perfect Union](https://cliffle.com/p/dangerust/4/) ([archived](https://web.archive.org/web/20200618094533/https://cliffle.com/p/dangerust/4/))
6. [Making Safe Things From Unsafe Parts](https://cliffle.com/p/dangerust/5/) ([archived](https://web.archive.org/web/20200618094538/https://cliffle.com/p/dangerust/5/))
7. [Let The Compiler Do The Work](https://cliffle.com/p/dangerust/6/) ([archived](https://web.archive.org/web/20200618094544/https://cliffle.com/p/dangerust/6/))

## “Reading files the hard way” by Amos Wenger

Writing files seems like a solved problem. But that doesn’t mean we can’t solve it again from scratch.

Niches: POSIX; file systems; syscalls

1. [Part 1 (node.js, C, rust, strace)](https://fasterthanli.me/blog/2019/reading-files-the-hard-way/) ([archived](https://web.archive.org/web/20200416203146/https://fasterthanli.me/blog/2019/reading-files-the-hard-way/))
2. [Part 2 (x86 asm, linux kernel)](https://fasterthanli.me/blog/2019/reading-files-the-hard-way-2/) ([archived](https://web.archive.org/web/20200416203148/https://fasterthanli.me/blog/2019/reading-files-the-hard-way-2/))
3. [Part 3 (ftrace, disk layouts, ext4)](https://fasterthanli.me/blog/2019/reading-files-the-hard-way-3/) ([archived](https://web.archive.org/web/20200416203157/https://fasterthanli.me/blog/2019/reading-files-the-hard-way-3/))

## “Making our own ping” by Amos Wenger

1. [A short (and mostly wrong) history of computer networking](https://fasterthanli.me/blog/2019/making-our-own-ping/) ([archived](https://web.archive.org/web/20200416134726/https://fasterthanli.me/blog/2019/making-our-own-ping/))
2. [Windows dynamic libraries, calling conventions, and transmute](https://fasterthanli.me/blog/2019/making-our-own-ping-2/) ([archived](https://web.archive.org/web/20200416145917/https://fasterthanli.me/blog/2019/making-our-own-ping-2/))
3. [FFI-safe types in Rust, newtypes and MaybeUninit](https://fasterthanli.me/blog/2019/making-our-own-ping-3/) ([archived](https://web.archive.org/web/20200416145936/https://fasterthanli.me/blog/2019/making-our-own-ping-3/))
4. [Designing and implementing a safer API on top of LoadLibrary](https://fasterthanli.me/blog/2019/making-our-own-ping-4/) ([archived](https://web.archive.org/web/20200416145936/https://fasterthanli.me/blog/2019/making-our-own-ping-4/))
5. [A simple ping library, parsing strings into IPv4 address](https://fasterthanli.me/blog/2019/making-our-own-ping-5/) ([archived](https://web.archive.org/web/20200416145942/https://fasterthanli.me/blog/2019/making-our-own-ping-5/))
6. [The builder pattern, and a macro that keeps FFI code DRY](https://fasterthanli.me/blog/2019/making-our-own-ping-6/) ([archived](https://web.archive.org/web/20200416145943/https://fasterthanli.me/blog/2019/making-our-own-ping-6/))
7. [Finding the default network interface through WMI](https://fasterthanli.me/blog/2019/making-our-own-ping-7/) ([archived](https://web.archive.org/web/20200416145943/https://fasterthanli.me/blog/2019/making-our-own-ping-7/))
8. [Binding C APIs with variable-length structs and UTF-16](https://fasterthanli.me/blog/2019/making-our-own-ping-8/) ([archived](https://web.archive.org/web/20200416150009/https://fasterthanli.me/blog/2019/making-our-own-ping-8/))
9. [Consuming Ethernet frames with the nom crate](https://fasterthanli.me/blog/2019/making-our-own-ping-9/) ([archived](https://web.archive.org/web/20200416150006/https://fasterthanli.me/blog/2019/making-our-own-ping-9/))
10. [Improving error handling - panics vs. proper errors](https://fasterthanli.me/blog/2019/making-our-own-ping-10/) ([archived](https://web.archive.org/web/20200416150009/https://fasterthanli.me/blog/2019/making-our-own-ping-10/))
11. [Parsing IPv4 packets, including numbers smaller than bytes](https://fasterthanli.me/blog/2019/making-our-own-ping-11/) ([archived](https://web.archive.org/web/20200416150021/https://fasterthanli.me/blog/2019/making-our-own-ping-11/))
12. [Parsing and serializing ICMP packets with cookie-factory.](https://fasterthanli.me/blog/2019/making-our-own-ping-12/) ([archived](https://web.archive.org/web/20200416150207/https://fasterthanli.me/blog/2019/making-our-own-ping-12/))
13. [Crafting ARP packets to find a remote host’s MAC address](https://fasterthanli.me/blog/2019/making-our-own-ping-13/) ([archived](https://web.archive.org/web/20200416150054/https://fasterthanli.me/blog/2019/making-our-own-ping-13/))
14. [Crafting ICMP-bearing IPv4 packets with the help of bitvec](https://fasterthanli.me/blog/2019/making-our-own-ping-14/) ([archived](https://web.archive.org/web/20200416150207/https://fasterthanli.me/blog/2019/making-our-own-ping-14/))

## “Making our own executable packer” by Amos Wenger

1. [What’s in a Linux executable?](https://fasterthanli.me/blog/2020/whats-in-a-linux-executable/) ([archived](https://web.archive.org/web/20200416203931/https://fasterthanli.me/blog/2020/whats-in-a-linux-executable/))
2. [Running an executable without exec](https://fasterthanli.me/blog/2020/running-an-executable-without-exec/) ([archived](https://web.archive.org/web/20200416203942/https://fasterthanli.me/blog/2020/running-an-executable-without-exec/))
3. [Position-independent code](https://fasterthanli.me/blog/2020/position-independent-code/) ([archived](https://web.archive.org/web/20200416203931/https://fasterthanli.me/blog/2020/position-independent-code/))
4. [ELF relocations](https://fasterthanli.me/blog/2020/elf-relocations/) ([archived](https://web.archive.org/web/20200416203942/https://fasterthanli.me/blog/2020/elf-relocations/))
5. [The simplest shared library](https://fasterthanli.me/blog/2020/the-simplest-shared-library/) ([archived](https://web.archive.org/web/20200416203942/https://fasterthanli.me/blog/2020/the-simplest-shared-library/))
6. [Loading multiple ELF objects](https://fasterthanli.me/blog/2020/loading-multiple-elf-objects/) ([archived](https://web.archive.org/web/20200416203946/https://fasterthanli.me/blog/2020/loading-multiple-elf-objects/))
7. [Dynamic symbol resolution](https://fasterthanli.me/blog/2020/dynamic-symbol-resolution/) ([archived](https://web.archive.org/web/20200416203951/https://fasterthanli.me/blog/2020/dynamic-symbol-resolution/))
8. [Dynamic linker speed and correctness](https://fasterthanli.me/blog/2020/dynamic-linker-speed-and-correctness/) ([archived](https://web.archive.org/web/20200416203951/https://fasterthanli.me/blog/2020/dynamic-linker-speed-and-correctness/))
9. [GDB scripting and Indirect functions](https://fasterthanli.me/blog/2020/gdb-scripting-and-indirect-functions/) ([archived](https://web.archive.org/web/20200416203954/https://fasterthanli.me/blog/2020/gdb-scripting-and-indirect-functions/))
10. [Safer memory-mapped structures](https://fasterthanli.me/blog/2020/safer-memory-mapped-structures/) ([archived](https://web.archive.org/web/20200416204004/https://fasterthanli.me/blog/2020/safer-memory-mapped-structures/))
11. [More ELF relocations](https://fasterthanli.me/blog/2020/more-elf-relocations/) ([archived](https://web.archive.org/web/20200416204015/https://fasterthanli.me/blog/2020/more-elf-relocations/))
12. [A no\_std Rust binary](https://fasterthanli.me/blog/2020/a-no-std-rust-binary/) ([archived](https://web.archive.org/web/20200426170253/https://fasterthanli.me/blog/2020/a-no-std-rust-binary/))
13. [Thread-local storage](https://fasterthanli.me/blog/2020/thread-local-storage/) ([archived](https://web.archive.org/web/20200504104021/https://fasterthanli.me/blog/2020/thread-local-storage/))

## “Parsing” by Aleksey Kladov

Not a real series of articles but a collection of posts by someone whose Github bio reads “Stuck writing parsers”.

Niches: parsers

1. [Modern Parser Generator](https://matklad.github.io/2018/06/06/modern-parser-generator.html) ([archived](https://web.archive.org/web/20200426170539/https://matklad.github.io/2018/06/06/modern-parser-generator.html))
2. [Simple but Powerful Pratt Parsing](https://matklad.github.io/2020/04/13/simple-but-powerful-pratt-parsing.html) ([archived](https://web.archive.org/web/20200416155208/https://matklad.github.io/2020/04/13/simple-but-powerful-pratt-parsing.html))
3. [From Pratt to Dijkstra](https://matklad.github.io/2020/04/15/from-pratt-to-dijkstra.html) ([archived](https://web.archive.org/web/20200416155220/https://matklad.github.io/2020/04/15/from-pratt-to-dijkstra.html))

## “JavaScript Allongé” by Reg “raganwald” Braithwaite

(~530 pages; [archived](https://web.archive.org/web/20200416145246/https://leanpub.com/javascriptallongesix/read))

Niches: functional programming; obscure JavaScript

Last update I saw: 2019-04-26

## “Crafting Interpreters” by Robert Nystrom

(~800 pages; [archived](https://web.archive.org/web/20200411062649/http://craftinginterpreters.com/contents.html))

Last update I saw: 2020-04-05

## “A relatively simple Datalog engine in Rust” by Frank McSherry

(~20 pages; [archived](https://web.archive.org/web/20200423163205/https://github.com/frankmcsherry/blog/blob/81e9555bbee110954f2c3d35caf86ea7e7612fa6/posts/2018-05-19.md))

Building a datalog engine in Rust.

Niches: datalog

## “Non-lexical lifetimes” by Niko Matsakis

One of the main features of the Rust language is the concept of ownership and lifetimes. This series of posts by Niko Matsakis, one of the designers of the Rust language, is about the theory and practical implementation of a revamped and more complete way of this in the Rust compiler. It starts in early 2016 and goes all the way to after they feature landed (end of 2018).

1. [Introduction](https://smallcultfollowing.com/babysteps/blog/2016/04/27/non-lexical-lifetimes-introduction/) ([archived](https://web.archive.org/web/20200416170054/https://smallcultfollowing.com/babysteps/blog/2016/04/27/non-lexical-lifetimes-introduction/))
2. [Non-lexical lifetimes based on liveness](http://smallcultfollowing.com/babysteps/blog/2016/05/04/non-lexical-lifetimes-based-on-liveness/) ([archived](https://web.archive.org/web/20190917065228/http://smallcultfollowing.com/babysteps/blog/2016/05/04/non-lexical-lifetimes-based-on-liveness/))
3. [Adding the outlives relation](https://smallcultfollowing.com/babysteps/blog/2016/05/09/non-lexical-lifetimes-adding-the-outlives-relation/) ([archived](https://web.archive.org/web/20200416170116/https://smallcultfollowing.com/babysteps/blog/2016/05/09/non-lexical-lifetimes-adding-the-outlives-relation/))
4. [Using liveness and location](https://smallcultfollowing.com/babysteps/blog/2017/02/21/non-lexical-lifetimes-using-liveness-and-location/) ([archived](https://web.archive.org/web/20200416170119/https://smallcultfollowing.com/babysteps/blog/2017/02/21/non-lexical-lifetimes-using-liveness-and-location/))
5. [Nested method calls via two-phase borrowing](https://smallcultfollowing.com/babysteps/blog/2017/03/01/nested-method-calls-via-two-phase-borrowing/) ([archived](https://web.archive.org/web/20200416170122/https://smallcultfollowing.com/babysteps/blog/2017/03/01/nested-method-calls-via-two-phase-borrowing/))
6. [Draft RFC and prototype available](https://smallcultfollowing.com/babysteps/blog/2017/07/11/non-lexical-lifetimes-draft-rfc-and-prototype-available/) ([archived](https://web.archive.org/web/20200416170125/https://smallcultfollowing.com/babysteps/blog/2017/07/11/non-lexical-lifetimes-draft-rfc-and-prototype-available/))
7. [An alias-based formulation of the borrow checker](https://smallcultfollowing.com/babysteps/blog/2018/04/27/an-alias-based-formulation-of-the-borrow-checker/) ([archived](https://web.archive.org/web/20200416170128/https://smallcultfollowing.com/babysteps/blog/2018/04/27/an-alias-based-formulation-of-the-borrow-checker/))
8. [MIR-based borrow check (NLL) status update](https://smallcultfollowing.com/babysteps/blog/2018/06/15/mir-based-borrow-check-nll-status-update/) ([archived](https://web.archive.org/web/20200416170132/https://smallcultfollowing.com/babysteps/blog/2018/06/15/mir-based-borrow-check-nll-status-update/))
9. [MIR-based borrowck is almost here](https://smallcultfollowing.com/babysteps/blog/2018/10/31/mir-based-borrowck-is-almost-here/) ([archived](https://web.archive.org/web/20200416170139/https://smallcultfollowing.com/babysteps/blog/2018/10/31/mir-based-borrowck-is-almost-here/))
10. [Interprocedural conflicts](https://smallcultfollowing.com/babysteps/blog/2018/11/01/after-nll-interprocedural-conflicts/) ([archived](https://web.archive.org/web/20200416170144/https://smallcultfollowing.com/babysteps/blog/2018/11/01/after-nll-interprocedural-conflicts/))
11. [Polonius and region errors](https://smallcultfollowing.com/babysteps/blog/2019/01/17/polonius-and-region-errors/) ([archived](https://web.archive.org/web/20200416170147/https://smallcultfollowing.com/babysteps/blog/2019/01/17/polonius-and-region-errors/))
12. [Polonius and the case of the hereditary harrop predicate](https://smallcultfollowing.com/babysteps/blog/2019/01/21/hereditary-harrop-region-constraints/) ([archived](https://web.archive.org/web/20200416170150/https://smallcultfollowing.com/babysteps/blog/2019/01/21/hereditary-harrop-region-constraints/))

## “Shifgrethor” by Without Boats

A proposed API for a GC in Rust.

1. [Garbage collection as a Rust library](https://boats.gitlab.io/blog/post/shifgrethor-i/) ([archived](https://web.archive.org/web/20200416172628/https://boats.gitlab.io/blog/post/shifgrethor-i/))
2. [Notes on tracing garbage collectors](https://boats.gitlab.io/blog/post/shifgrethor-ii/) ([archived](https://web.archive.org/web/20200416172630/https://boats.gitlab.io/blog/post/shifgrethor-ii/))
3. [Rooting](https://boats.gitlab.io/blog/post/shifgrethor-iii/) ([archived](https://web.archive.org/web/20200416172636/https://boats.gitlab.io/blog/post/shifgrethor-iii/))
4. [Tracing](https://boats.gitlab.io/blog/post/shifgrethor-iv/) ([archived](https://web.archive.org/web/20200416172639/https://boats.gitlab.io/blog/post/shifgrethor-iv/))

## “Rayon/Parallel Iterators” by Niko Matsakis

Niches: concurrency

1. [Rayon: Data parallelism in Rust](https://smallcultfollowing.com/babysteps/blog/2015/12/18/rayon-data-parallelism-in-rust/) ([archived](https://web.archive.org/web/20200423162646/https://smallcultfollowing.com/babysteps/blog/2015/12/18/rayon-data-parallelism-in-rust/))
2. [Parallel Iterators Part 1: Foundations](https://smallcultfollowing.com/babysteps/blog/2016/02/19/parallel-iterators-part-1-foundations/) ([archived](https://web.archive.org/web/20200423162647/https://smallcultfollowing.com/babysteps/blog/2016/02/19/parallel-iterators-part-1-foundations/))
3. [Parallel Iterators Part 2: Producers](https://smallcultfollowing.com/babysteps/blog/2016/02/25/parallel-iterators-part-2-producers/) ([archived](https://web.archive.org/web/20200423162653/https://smallcultfollowing.com/babysteps/blog/2016/02/25/parallel-iterators-part-2-producers/))
4. [Parallel Iterators, part 3: Consumers](https://smallcultfollowing.com/babysteps/blog/2016/11/14/parallel-iterators-part-3-consumers/) ([archived](https://web.archive.org/web/20200423162650/https://smallcultfollowing.com/babysteps/blog/2016/11/14/parallel-iterators-part-3-consumers/))

## “How Rust optimizes async/await” by Tyler Mandry

Niches: compilers; memory layout

1. [Part I](https://tmandry.gitlab.io/blog/posts/optimizing-await-1/) ([archived](https://web.archive.org/web/20200417142143/https://tmandry.gitlab.io/blog/posts/optimizing-await-1/))
2. [Part II: Program analysis](https://tmandry.gitlab.io/blog/posts/optimizing-await-2/) ([archived](https://web.archive.org/web/20200417142149/https://tmandry.gitlab.io/blog/posts/optimizing-await-2/))

## “Writing an OS in Rust” by Philipp Oppermann

Niches: operating systems, assembler

1. [A Freestanding Rust Binary](https://os.phil-opp.com/freestanding-rust-binary/) ([archived](https://web.archive.org/web/20200419114640/https://os.phil-opp.com/freestanding-rust-binary/))
2. [A Minimal Rust Kernel](https://os.phil-opp.com/minimal-rust-kernel/) ([archived](https://web.archive.org/web/20200419114644/https://os.phil-opp.com/minimal-rust-kernel/))
3. [VGA Text Mode](https://os.phil-opp.com/vga-text-mode/) ([archived](https://web.archive.org/web/20200419114648/https://os.phil-opp.com/vga-text-mode/))
4. [Testing](https://os.phil-opp.com/testing/) ([archived](https://web.archive.org/web/20200419114651/https://os.phil-opp.com/testing/))
5. [CPU Exceptions](https://os.phil-opp.com/cpu-exceptions/) ([archived](https://web.archive.org/web/20200419114838/https://os.phil-opp.com/cpu-exceptions/))
6. [Double Faults](https://os.phil-opp.com/double-fault-exceptions/) ([archived](https://web.archive.org/web/20200419114841/https://os.phil-opp.com/double-fault-exceptions/))
7. [Hardware Interrupts](https://os.phil-opp.com/hardware-interrupts/) ([archived](https://web.archive.org/web/20200419114844/https://os.phil-opp.com/hardware-interrupts/))
8. [Introduction to Paging](https://os.phil-opp.com/paging-introduction/) ([archived](https://web.archive.org/web/20200419115000/https://os.phil-opp.com/paging-introduction/))
9. [Paging Implementation](https://os.phil-opp.com/paging-implementation/) ([archived](https://web.archive.org/web/20200419115003/https://os.phil-opp.com/paging-implementation/))
10. [Heap Allocation](https://os.phil-opp.com/heap-allocation/) ([archived](https://web.archive.org/web/20200419115006/https://os.phil-opp.com/heap-allocation/))
11. [Allocator Designs](https://os.phil-opp.com/allocator-designs/) ([archived](https://web.archive.org/web/20200419115009/https://os.phil-opp.com/allocator-designs/))
12. [Async/Await](https://os.phil-opp.com/async-await/) ([archived](https://web.archive.org/web/20200419115012/https://os.phil-opp.com/async-await/))

## “Learning Parser Combinators With Rust” by Bodil Stokke

(~60 pages; [archived](https://web.archive.org/web/20200423162949/https://bodil.lol/parser-combinators/))

Assuming you know Rust, this teaches you the fundamentals of parser combinators in a very hands-on way.

Niches: parsers

## “Manish vs. ASCII” by Manish Goregaokar

Several posts on why assuming text is ASCII is unhelpful.

Niches: unicode

1. [Let’s Stop Ascribing Meaning to Code Points](https://manishearth.github.io/blog/2017/01/14/stop-ascribing-meaning-to-unicode-code-points/) ([archived](https://web.archive.org/web/20200430223156/https://manishearth.github.io/blog/2017/01/14/stop-ascribing-meaning-to-unicode-code-points/))
	tl;dr you should not index into a Unicode text, like, ever.
2. [Breaking Our Latin-1 Assumptions](https://manishearth.github.io/blog/2017/01/15/breaking-our-latin-1-assumptions/) ([archived](https://web.archive.org/web//https://manishearth.github.io/blog/2017/01/15/breaking-our-latin-1-assumptions/))
	Examples for scripts/languages that really don’t work if you assume you have ASCII text.
3. [Picking Apart the Crashing iOS String](https://manishearth.github.io/blog/2018/02/15/picking-apart-the-crashing-ios-string/) ([archived](https://web.archive.org/web/20200430223226/https://manishearth.github.io/blog/2018/02/15/picking-apart-the-crashing-ios-string/))
	Fun analysis of a Unicode rendering bug that crashed iOS devices.

## “The Wayland Protocol” by Drew DeVault

(~156 pages; [archived](https://web.archive.org/web/20200505182132/https://wayland-book.com/))

“Wayland is the next-generation display server for Unix-like systems\[…\] This book will help you establish a firm understanding of the concepts, design, and implementation of \[it\]”.

Niches: wayland; graphics; protocols; unix

“Specific, actionable ways to make your code cleaner.” Targeting intermediate programmers who are looking for entertaining writing they can learn something from.

Full index of series [here](https://robertheaton.com/pfab/).

1. [Programming Feedback for Advanced Beginners #0](https://robertheaton.com/2019/11/08/programming-feedback-for-advanced-beginners-0/) ([archived](https://web.archive.org/web/20200124163258/https://robertheaton.com/2019/11/08/programming-feedback-for-advanced-beginners-0/))
2. [Define your boundaries](https://robertheaton.com/2019/11/11/pfab1/) ([archived](https://web.archive.org/web/20200514081403/https://robertheaton.com/2019/11/11/pfab1/))
3. [How to structure your programs](https://robertheaton.com/2019/11/30/pfab2-how-to-structure-your-programs/) ([archived](https://web.archive.org/web/20200722100710/https://robertheaton.com/2019/11/30/pfab2-how-to-structure-your-programs/))
4. [How to rigorously analyze your journey to work](https://robertheaton.com/2019/12/07/pfab3-analyze-commute/) ([archived](https://web.archive.org/web/20200420013909/https://robertheaton.com/2019/12/07/pfab3-analyze-commute/))
5. [Exception handling and coping with failure](https://robertheaton.com/2019/12/14/pfab4-exception-handling-dealing-with-failure/) ([archived](https://web.archive.org/web/20200514081403/https://robertheaton.com/2019/12/14/pfab4-exception-handling-dealing-with-failure/))
6. [How to make your programs shorter](https://robertheaton.com/2019/12/21/ppab5-how-to-make-your-programs-shorter/) ([archived](https://web.archive.org/web/20200420014641/https://robertheaton.com/2019/12/21/ppab5-how-to-make-your-programs-shorter/))
7. [Real-world debugging practice](https://robertheaton.com/2019/12/28/pfab6-real-world-debugging-practice/) ([archived](https://web.archive.org/web/20200420022451/https://robertheaton.com/2019/12/28/pfab6-real-world-debugging-practice/))
8. [How to write a library](https://robertheaton.com/2020/01/04/pfab7-how-to-write-a-library/) ([archived](https://web.archive.org/web/20200514081403/https://robertheaton.com/2020/01/04/pfab7-how-to-write-a-library/))
9. [Input validation - tradeoffs between convenience and surprise](https://robertheaton.com/2020/01/26/pfab8-input-validation/) ([archived](https://web.archive.org/web/20200620023529/https://robertheaton.com/2020/01/26/pfab8-input-validation/))
10. [Batch vs Stream processing](https://robertheaton.com/2020/02/08/pfab9-batch-vs-stream-processing/) ([archived](https://web.archive.org/web/20200514081403/https://robertheaton.com/2020/02/08/pfab9-batch-vs-stream-processing/))
11. [First-class functions and dependency injection](https://robertheaton.com/2020/02/23/pfab10-first-class-functions-dependency-injection/) ([archived](https://web.archive.org/web/20200514081403/https://robertheaton.com/2020/02/23/pfab10-first-class-functions-dependency-injection/))
12. [Separating logic and data](https://robertheaton.com/2020/03/07/pfab11-separating-logic-and-data/) ([archived](https://web.archive.org/web/20200523211150/https://robertheaton.com/2020/03/07/pfab11-separating-logic-and-data/))
13. [Systems design for advanced beginners](https://robertheaton.com/2020/04/06/systems-design-for-advanced-beginners/) ([archived](https://web.archive.org/web/20200721134054/https://robertheaton.com/2020/04/06/systems-design-for-advanced-beginners/))
14. [When code is too clever to be clean](https://robertheaton.com/2020/04/19/pfab13-when-code-is-too-clever-to-be-clean/) ([archived](https://web.archive.org/web/20200525215035/https://robertheaton.com/2020/04/19/pfab13-when-code-is-too-clever-to-be-clean/))
15. [Evil `eval`](https://robertheaton.com/2020/05/03/pfab14-evil-eval/) ([archived](https://web.archive.org/web/20200606185502/https://robertheaton.com/2020/05/03/pfab14-evil-eval/))
16. [Don’t overwork your functions](https://robertheaton.com/2020/05/17/pfab15-dont-overwork-your-functions/) ([archived](https://web.archive.org/web/20200525051606/https://robertheaton.com/2020/05/17/pfab15-dont-overwork-your-functions/))
17. [How to make your code faster and why you often shouldn’t bother](https://robertheaton.com/pfab16-how-to-make-your-code-faster/) ([archived](https://web.archive.org/web/20200621085446/https://robertheaton.com/pfab16-how-to-make-your-code-faster/))
18. [pre-computation sounds like cheating but isn’t](https://robertheaton.com/pfab17-precomputation-sounds-like-cheating-but-isnt/) ([archived](https://web.archive.org/web/20200717182014/https://robertheaton.com/pfab17-precomputation-sounds-like-cheating-but-isnt/))
19. [Adventures in shrinking serialized data](https://robertheaton.com/pfab18-shrinking-serialized-data/) ([archived](https://web.archive.org/web/20200722101312/https://robertheaton.com/pfab18-shrinking-serialized-data/))
