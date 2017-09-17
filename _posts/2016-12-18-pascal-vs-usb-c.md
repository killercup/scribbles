---
title: "Pascal vs. USB-C"
categories:
- tech
discussions:
  "Twitter": "https://twitter.com/killercup/status/810599973419151368"
---
**Update:** Got the laptop, and some adapters. Updated the post below with concrete tests and benchmarks where appropriate.

I'm gonna buy a 15″ MacBook with 4 Thunderbolt 3 Ports because
(a) I need new laptop,
(b) I want to continue to use macOS (without hassle), and
(c) I really like the premise of USB-C with alternate modes and Thunderbolt 3 with 40Gb/s.
Sadly, that means that I'll need adapters to connect all the hardware I currently own.

How hard can it be to find some adapter-y dock-y things[^adapters-n-docks] that I can actually afford? Let's find out!

[^adapters-n-docks]: What is an adapter and what is dock? I'm using these terms pretty loosely. One way to differentiate might be to say an adapters is passive, while a dock has chips that actively transforms protocols for other physical ports. Or, a dock is large and expensive while you can buy a cheaper adapter that fits in your pocket. Or, a dock has more ports that are faster. For USB-C, these seem mostly equivalent, assuming that turning one USB-C connection with multiple alternate modes into a bunch of ports is not an "active" transformation as the host computer does all the hard work. Thus, a thing that has USB-C on one side, and HDMI or DisplayPort or the other, is an adapter. It gets fuzzy when an adapter has an ethernet port, as that most certainly means it has a dedicated chip for doing network stuff (that could also be USB 3.0 ethernet thing). Does this mean it becomes a dock? I'll say no. So, I'll settle on a simpler way to differentiate docks and adapters here: Docks are expensive. And good docks use Thunderbolt 3. That should make everything clear…

## Contents
{:.no_toc}

* Table of contents
{:toc}

## What I want to connect

### Home office

Static setup, I put devices where I want them to be and they stay there.

- Dell 4k display (3840×2160 @ 60 Hz) via HDMI 2.0, DisplayPort, or Mini DisplayPort
- USB-A for display's USB 3 hub (mouse and keyboard as well as charging cables attached)
- USB-A for external hard drives and such
- Gigabit ethernet
- Headphones via 3.5mm jack
- USB-C charger

### Actual office

Semi-static setup. Will probably only need to move to another place when I least expect it (per Murphy's law).

- Cinema Display or similar, 1920×1200 @ 60 Hz, HDMI or DVI connector
- USB-A for mouse and keyboard (mouse actually plugged into Apple keyboard so one USB-A port should suffice)
- Gigabit ethernet
- Headphones via 3.5mm jack
- USB-C charger

### On the road

It's a laptop. I want to use it at random other places.

- HDMI beamer
- USB drives with USB-A
- USB-C charger

## Understanding USB-C and its limitations

### Cables

There are active and passive USB-C cables, as well as those that allow the full range of possible voltages and wattages of power delivery (5 V, 12 V, and 20 V for up to 100 W).

A bunch of people seem to really enjoy testing USB-C cables. Good for them! Two rather famous gentlemen in this scene are [Nathan K.], and [Benson Leung]. Nathan has a nice [table comparing USB-C cables][usb-cables].

[Nathan K.]: https://plus.google.com/102612254593917101378
[Benson Leung]: https://plus.google.com/+BensonLeung
[usb-cables]: https://docs.google.com/spreadsheets/d/1vnpEXfo2HCGADdd9G2x9dMDWqENiY2kgBJUu29f_TX8/pubhtml

For some reason there is no cable that does it all (Thunderbolt 3 with full 40Gb/s and 100 W power). Maybe I just missed some details there, though. 100 W power always come from 5 A at 20 V, but 60 W can come from either 12 V with 5 A, or 20 V with 3 A. Making long, 100 W USB-C cables capable of transferring 10Gb/s seems to be hard: Half of them are rated "bad", and they are a most 1 m. (The one from Apple is 2 m long but only supports USB 2.0 speed).

### DisplayPort

According to [Wikipedia][usb-c-alternate-modes], USB-C supports DisplayPort up to protocol version 1.3 (handy [DisplayPort versions overview][dp-versions]). 1.2 and higher support 4k (3840 × 2160) with up to 75 Hz, so we don't need to worry about anything.

[dp-versions]: https://en.wikipedia.org/w/index.php?title=DisplayPort&oldid=755497571#Resolution_and_refresh_frequency_support_for_DisplayPort

If I understand the Wikipedia page correctly, it also says that while using DisplayPort alternate mode, it is *always* possible to additionally use PowerDelivery and USB 2.0 over a USB-C cable. *Spoiler alert:* I'd really like to have this but there are currently no adapters that have USB Type C on one side and DisplayPort as well as another Type C port for Power Delivery on the other side. The closest I could find was the [Arc Hub][arc] (see table below for specs) but it ships early 2017 and there are no reviews available yet.

Furthermore it allows an additional USB 3.1 connection if the DisplayPort mode only uses 2 lanes. I have no idea when that is the case, though. (4k @ 60 Hz over DP 1.2 uses up to 21.6Gb/s of bandwidth already!)

### Deep dive into HDMI alternate mode

According to [Wikipedia][usb-c-alternate-modes], USB-C's HDMI Alternate Mode only supports HDMI 1.4b. Thus, passive docks/adapters that have HDMI ports will only support HDMI 1.4b. Which *does not* support 4k @ 60 Hz ([HDMI version comparison]). That's bad.

[usb-c-alternate-modes]: https://en.wikipedia.org/w/index.php?title=USB_Type-C&oldid=754888380#Alternate_Mode
[HDMI version comparison]: https://en.wikipedia.org/w/index.php?title=HDMI&oldid=755507256#Version_comparison

HDMI 1.4b *does* support some cool stuff like Consumer Electronic Control (CEC; remotes work across devices), 3D video, Dolby TrueHD, and an Ethernet channel. I'm not sure how much of that will actually work through adapters, though. According to reviews, some adapters don't even support 4k with 30 Hz.

Wikipedia [mentions][hdmi-alternate-mode] some other quite interesting details:

[hdmi-alternate-mode]: https://en.wikipedia.org/w/index.php?title=HDMI&oldid=755507256#HDMI_Alternate_Mode_for_USB_Type-C

> From a HDMI video source, 3 TMDS channels and TMDS clock signal are carried over the USB Type-C super-speed data pins. The DDC clock, DDC data, CEC signals are carried over 1 configuration pin. The HEC/ARC, HPD signals are carried over 2 side-band pins on the USB Type-C connector.

If you know the USB-C layout, this sounds like it pretty much uses the whole thing. And, Wikipedia goes on:

> Hence HDMI alternate mode provides a simultaneous video out and USB 2.0 data transfer facility. The USB 3.1 data transfer modes will be only available when video out is not in use, as they need the super-speed pins for these modes.

Damn, that sounds… bad. But let's backtrack a bit. What are these abbreviations we just read?

TMDS
:  Transition Minimized Differential Signaling
:  "interleaves video, audio and auxiliary data"

DDC
:  Display Data Channel

CEC
:  Consumer Electronic Control

HEC
:  HDMI Ethernet Channel

ARC
:  Audio Return Channel

Okay, of those we can probably get rid of HEC and ARC, as we want to do Ethernet over RJ-45 (i.e., another port on the adapter), and while an audio return channel (i.e. audio input over HDMI) is nice, I'd be surprised if the MacBook knows how to handle it. Sadly, the same is probably true for CEC -- which I'd like to have! Adjusting my AV receiver's volume without using the remote would be amazing.

What does that leave us with? The hope to at least have HDMI, ethernet, and maybe even USB 3.0 (5Gb/s)!

#### It's a conspiracy!

What's crazy is this: There are adapters that have all these ports. HDMI, ethernet, *multiple* USB 3.0 (USB-A) ports, even SD card slots, and \*gasp\* VGA[^hdmi-vga]. How does that work? Has anyone tested this and measured what throughput they get over the USB-A ports?

[^hdmi-vga]: Like Dell's "470-ABRY DA200" adapter. Even Dell itself [mentions][dell470] that you can only use one of HDMI and VGA at the same time, though.

Or, and here's a crazy idea: These are actually active adapters using _DisplayPort_ alternate mode and convert to HDMI! You want proof? Here the product description of i-Tec's "USB C Travel Docking Station" (from [their website][itec]):

> Hardware requirements: notebook, tablet, PC or smartphone with OS Windows, Mac or Google with a free USB-C port with "DisplayPort Alternate Mode" and "Power Delivery" support or Thunderbolt 3 port

No HDMI alternate mode mentioned anywhere. I'm fairly certain this description is plain wrong, though. A bit earlier it says this is "1x HDMI, max. resolution 1920x1080 / 60Hz" and "it allows to transfer video and stereo audio". Surely, they did not build a converter from DisplayPort to HDMI, _and_ added an external sound card, _and_ convert all that to an HDMI compatible TMDS stream, when they could just use HDMI alternate mode. They wouldn't, would they?

#### Update with benchmarks

Using the i-tech dock (see below), I can connect my TV (1920×1080 @ 60 Hz) over HDMI, and still use Ethernet as well as two USB 3 ports without any problems (one just connects to the USB 3 hub in my main display, with mouse and keyboard connected). Benchmarking two external USB 3 drives (one 2.5″ 2TB HDD from Segate, and one Sandisk SSD with a separate SATA 3 to USB 3 adapter), I can't find any difference between connected the drives using an Apple USB-C-to-A adapter and connecting them to the dock (with HDMI and Ethernet also connected). Both drives are not _that_ fast, though: The SSD's top speed was 235 MB/s which is still well below the theoretical top speed of 5 GB/s (625 MB/s) of USB 3. Oh, and did I mention my 4k display also works with this dock (@ 30 Hz, of course)?

### MHL

Oh, you thought I was done talking about displays? Sorry!

There is also an MHL alternate mode over USB-C which seems to support everything you can possible want from a display connector (up to 8k @ 60 Hz with power delivery and USB 3.1 Gen 2 data). The [official "USB Type C" page][usbc-mhl] has a FAQ with these claims, but their product page does not currently list any Apple devices.

[usbc-mhl]: http://www.mhltech.org/usbtype-c.aspx

### DVI

A lot of the displays I use are older Cinema Displays that have DVI-D cables. But that's okay, single-link DVI-D is supported when using HDMI over USB-C (according to [Wikipedia][usb-c-alternate-modes]). And [apparently][dvi-specs] single-link is all we need: It supports 1920×1200 @ 60 Hz (or "WUXGA" if you want to sound crazy).

**Oh!** This is _not_ 1080p, this is a bit more: It's 120px higher, as the display's aspect ratio is 16:10 instead of 16:9. So, if there are adapters from HDMI to single-link DVI-D, does that mean HDMI 1.4b can also transfer 1920×1200 at full 60 Hz? I _really_ hope so! Otherwise I will either be dragging

1. that USB-C-to-DisplayPort adapter as well as an DisplayPort-to-DVI adapter,
2. or a USB-C-to-DVI adapter

with me _everywhere_! Why am I even considering the first option? Because USB-C-to-DVI adapter are new and there are a ton of reviews that say only 30 Hz are supported for everything above 720p. DVI seems to be as much of a conspiracy as HDMI.

**Update:** Using the i-tech dock's HDMI port (see below) and an (Apple?) HDMI-to-DVI adapter, I can use the old Cinema Display with 1920×1200 @ 60 Hz without any problems.

[dvi-specs]: https://en.wikipedia.org/w/index.php?title=Digital_Visual_Interface&oldid=755496857#Digital

### Ethernet

Ethernet seems to work fine, but there are chipsets that don't need any special drivers on macOS (good) and there ones that do (less good).

In theory, I could also use a USB 3.0 to Ethernet adapter (there are a lot of those).

**Update:** The Ethernet ports of both the i-tech dock and the Dell adapter (see below) work perfectly with macOS Sierra, without installing any drivers.

### Power delivery

USB-C specifies power delivery of up to 100 W (5 A at 20 V), but most adapters tap out at 60 W. While the 15″ MacBook's charger outputs 87 W, using one of these adapters in between, the MacBook will charge with 60 W (but slower).

Also, I could not find *any* charger that outputs ≥87 W except for the one from Apple.

### Thunderbolt 3

An active adapter that supports Thunderbolt 3 with 40Gb/s should be able to do pretty much everything I could possible want. It will also cost a lot more and not be very portable.

One of the displays Apple recommends has 5k resolution and is driven by **2** 4k DisplayPort 1.2 channels over Thunderbolt 3.

## What devices can I buy?

So, from what I've gathered so far, it looks like:

- Charging at full speed using any adapter will be a problem.
- The surest way to get my 4k display working is to get a separate USB-C to DisplayPort adapter.
- There are a lot of adapters out there that have HDMI and USB 3.0, but less that *also* have Ethernet.
- If I'm willing to wait for Thunderbolt 3 docks to become available, and pay for one of them, I could probably get everything (with 60 W power) in one device.

So, looks like I'll still need 2–3 cables.

### Charging

I'll buy another Apple power adapter and either one of their USB-C charging cables (2 m), or one of the shorter, [recommended][usb-cables] cables once they are available in Germany. Also, I'll not pay Apple 25€ for an extension cable but just buy a 10€ one from some other manufacturer. I trust they figured out how to make simple, white 230V power cords by now.

### 4k display

I'll just buy a USB-C to DisplayPort adapter from Aukey (18€ on [amazon.de][ade-aukey-dp],
$10 on [amazon.com][acom-aukey-dp]).

[ade-aukey-dp]: https://www.amazon.de/gp/product/B01AR81YXQ/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=1638&creative=6742&creativeASIN=B01AR81YXQ&linkCode=as2&tag=killercblog-21
[acom-aukey-dp]: https://www.amazon.com/AUKEY-DisplayPort-Adapter-MacBook-Chromebook/dp/B01AT2V26E/ref=as_li_ss_tl?ie=UTF8&qid=1482091574&sr=8-1&keywords=AUKEY+USB+C+displayport&linkCode=ll1&tag=pascahertl-20&linkId=33c0ed89fdc129ef6c0d5c050fe0b7cd

**Update:** I ended up buying [this][itech-dp] DisplayPort adapter from i-tech instead ([20€ on amazon.de][ade-itech-dp], I also got their dock, see below), which worked perfectly. The first cable I tried didn't work with my 4k display (probably a hardware defect), but the second one I tried (from Delock, [10€ on amazon.de][ade-dp-cable]) works like charm.

[itech-dp]: https://www.i-tec-europe.eu/?lng=en&t=3&v=422
[ade-itech-dp]: https://www.amazon.de/gp/product/B01M1DEJ8Z/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=1638&creative=6742&creativeASIN=B01M1DEJ8Z&linkCode=as2&tag=killercup-21
[ade-dp-cable]: https://www.amazon.de/gp/product/B001TGVSDM/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=1638&creative=6742&creativeASIN=B001TGVSDM&linkCode=as2&tag=killercup-21

### USB-C adapters

| Name                                       | HDMI | USB 3.0 | Ethernet | Power delivery | Others    | amazon.de            | amazon.com            | Notes |
| ------------------------------------------ | :--: | :-----: | :------: | -------------- | --------- | -------------------: | --------------------: | ----- |
| [Dell 470-ABRY DA200][dell470]             | 1    | 1       | 1        | No             | VGA       | [66€][ade-dell470]   | [$60][acom-dell470]   | Looks nice, quite small |
| [i-tec USB C Travel Docking Station][itec] | 1    | 2       | 1        | 60 W           | USB-C 3.1 | [48€][ade-itec]      | N/A                   | Larger than Dell but still light, never heard of this brand |
| [i-tec USB C Docking Station][itec2]       | 1    | 3       | 1        | 60 W           | 2⨉USB-C 3.1, SD | [65€][ade-itec2]      | N/A            | Bascially the dock version of the one above |
| ProLink-Adapter USB Typ C                  | 1    | 1       | 1        | Yes (??? W)    |           | [45€][ade-prolink]   | N/A                   | Looks cheap, badly translated description |
| AUKEY USB C Hub                            | 1    | 4       | 0        | [55 W][aukey-hub-review] | | [38€][ade-aukey-hub] | [$40][acom-aukey-hub] | I don't think those USB ports are going to be fast |
| [Cable Matters USB-C Multiport][cm-multi]  | 1    | 1       | 1        | No             | VGA       | [53€][ade-cm-multi]  | [$45][acom-cm-multi]  | Looks ugly, needs Ethernet driver |
| [Anker Premium USB-C Hub (HDMI)][anker-h]  | 1    | 2       | 0        | Yes (??? W)    |           | [48€][ade-anker-h]   | [$40][acom-anker-h]   | People have problems with WiFi and HDMI |
| [Anker Premium USB-C Hub (RJ45)][anker-e]  | 0    | 2       | 1        | Yes (??? W)    |           | [46€][ade-anker-e]   | [$50][acom-anker-e]   | Same as above but with Ethernet instead of HDMI |
| [HooToo USB-C Hub HT-UC001][hootoo]        | 1    | 3       | 0        | 60 W           | SDXC      | [65€][ade-hootoo]    | [$82][acom-hootoo]    | Space grey aluminium

[dell470]: http://accessories.euro.dell.com/sna/productdetail.aspx?c=de&l=de&s=dhs&cs=dedhs1&sku=470-ABRY
[ade-dell470]: https://www.amazon.de/gp/product/B012DT6KW2/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=1638&creative=6742&creativeASIN=B012DT6KW2&linkCode=as2&tag=killercup-21
[acom-dell470]: https://www.amazon.com/gp/product/B012DT6KW2/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&tag=pascahertl-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=B012DT6KW2&linkId=16b26e96f07cc42929498d77e738de5d
[itec]: https://www.i-tec-europe.eu/?lng=en&t=3&v=424
[ade-itec]: https://www.amazon.de/gp/product/B01M9A5ZQS/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=1638&creative=6742&creativeASIN=B01M9A5ZQS&linkCode=as2&tag=killercup-21
[itec2]: https://www.i-tec-europe.eu/?lng=en&t=3&v=437
[ade-itec2]: https://www.amazon.de/gp/product/B01N2UZL1D/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=1638&creative=6742&creativeASIN=B01N2UZL1D&linkCode=as2&tag=killercup-21
[ade-prolink]: https://www.amazon.de/gp/product/B01L2GVEY6/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=1638&creative=6742&creativeASIN=B01L2GVEY6&linkCode=as2&tag=killercup-21
[ade-aukey-hub]: https://www.amazon.de/gp/product/B01BXOW3V0/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=1638&creative=6742&creativeASIN=B01BXOW3V0&linkCode=as2&tag=killercup-21
[acom-aukey-hub]: https://www.amazon.com/gp/product/B01LYBZFV5/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&tag=pascahertl-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=B01LYBZFV5&linkId=58918b33147beec562477d30f45bfd37
[aukey-hub-review]: https://www.amazon.de/gp/customer-reviews/RDNNX0R6LZM9V/ref=cm_cr_arp_d_rvw_ttl?ie=UTF8&ASIN=B01BXOW3V0
[cm-multi]: http://www.cablematters.com/pc-686-114-usb-c-to-hdmi-vga-ethernet-usb-multiport-4k-uhd-adapter-thunderbolt-3-port-compatible.aspx
[ade-cm-multi]: https://www.amazon.de/gp/product/B01C316EIK/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=1638&creative=6742&creativeASIN=B01C316EIK&linkCode=as2&tag=killercup-21
[acom-cm-multi]: https://www.amazon.com/gp/product/B01C316EIK/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&tag=pascahertl-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=B01C316EIK&linkId=44582ece95c717dd883113d141785789
[anker-h]: https://de.anker.com/products/A8342041
[ade-anker-h]: https://www.amazon.de/gp/product/B01AT27SKS/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=1638&creative=6742&creativeASIN=B01AT27SKS&linkCode=as2&tag=killercup-21
[acom-anker-h]: https://www.amazon.com/gp/product/B01D0WE99C/ref=as_li_tl?ie=UTF8&tag=pascahertl-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=B01D0WE99C&linkId=cb06b05de8c2e3ac615c984487d134b6
[anker-e]: https://de.anker.com/products/A8302041
[ade-anker-e]: https://www.amazon.de/gp/product/B01D0XTF9U/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=1638&creative=6742&creativeASIN=B01D0XTF9U&linkCode=as2&tag=killercup-21
[acom-anker-e]: https://www.amazon.com/gp/product/B01D0XTF9U/ref=as_li_tl?ie=UTF8&tag=pascahertl-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=B01D0XTF9U&linkId=0d6e595966c1e5950dd0af49926518e5
[hootoo]: http://www.hootoo.com/ht-uc001-usb-type-c-hub-charging-hdmi-apple-pd.html
[ade-hootoo]: https://www.amazon.de/gp/product/B01KF3GTCY/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=1638&creative=6742&creativeASIN=B01KF3GTCY&linkCode=as2&tag=killercup-21
[acom-hootoo]: https://www.amazon.com/gp/product/B01K7C53K2/ref=as_li_tl?ie=UTF8&tag=pascahertl-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=B01K7C53K2&linkId=fecc8f7dccfc692d4f8c6b942b39812e

#### What I bought

I treated myself to both the Dell adapter and the i-tech dock. While the Dell is indeed very small and perfect to throw into a backpack next to the charger, the i-tech has the right size for the MacBook to rest on it and ellivate it a few centimeters, putting the keyboard and screen at a nice angle and allowing better airflow. Every feature of both adapters works perfectly with the MacBook, without the need to install any drivers.

The i-tech dock's power delivery works exactly as advertised, and the MacBook is able to draw 60 W. This suffices for basically everything I do, though I haven't tested it with gaming. The i-tech's HDMI port is able to connect to my 4k display and output what the display calls "2160p", which is 3840×2160 @ 30 Hz. I haven't tested the Dell with it, but my "1080p" (1920×1080 @ 60 Hz) TV worked fine. So, I ended up connecting two USB C cables at home, one for the dock, the other one for the DisplayPort adapter.

**WiFi problems:** Some people mention having problems using WiFi when some USB C adapters are connected. I can confirm this when using the i-tec dock – at least when using power delivery. I'll contect i-tec to see what they say about this.

### USB-C docks

There are a bunch of docks using USB-C but _not_ Thunderbolt 3. With the exception of the already mentioned [i-tec dock][itec2], buying one of the following are hard to justify – they are all too expensive compared to the adapters listed above, but can't support enough throughput to really get everything across the wire (like multiple _fast_ USB connections as well as 4k @ 60Hz). Nevertheless, they might work for you, so here are some:

- [Arc Hub][arc], no Ethernet, but ~~apparently 4k @ 60Hz using Mini DisplayPort~~ two video outputs (HDMI and MiniDisplayport) that offer up 2560x1440 @ 60Hz/4k @ 30Hz, and you can only use one at a time ([more on that][issue-10] -- thanks [@anton48]). $105 pre-order, ships early 2017.
- CalDigit's "USB-C Dock" ([marketing][caldigit], [193€][ade-caldigit], [$150][acom-caldigit]) at first looks like it just _has_ to use Thunderbolt 3 to make everything work, but it is only said to be "compatible with Thunderbolt 3". Furthermore, the marketing site compares it to OWC's USB-C dock. To add to the mystery, it apparently supports HDMI 2.0, but has problems with driving a 4k display on a Mac that CalDigit blames on macOS missing support for MST (Multi Transport Stream). According [this document][apple-HT206587] by Apple, MacBook Pros since 2013 support MTS. At least the dock seems to support 90 W power delivery which is pretty nice.
- OWC's USB-C Dock ([marketing][owc-usbc], [195€][ade-owc-usbc], [$150][acom-owc-usbc]) has a bunch of USB-A ports, Ethernet, HDMI, an SD slot, as well as audio in/out and 80 W power delivery. But there is a far better successor with Thunderbolt 3 coming in February 2017.

[arc]: https://www.bourgedesign.com
[issue-10]: https://github.com/killercup/scribbles/issues/10
[@anton48]: https://github.com/anton48
[caldigit]: http://www.caldigit.com/usb-3-1-usb-c-dock/
[ade-caldigit]: https://www.amazon.de/gp/product/B0198DS952/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=1638&creative=6742&creativeASIN=B0198DS952&linkCode=as2&tag=killercup-21
[acom-caldigit]: https://www.amazon.com/gp/product/B01AX6J7P4/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&tag=pascahertl-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=B01AX6J7P4&linkId=dae6bb0a83da48d009a4c0195ce8ae83
[apple-HT206587]: https://support.apple.com/en-us/HT206587
[owc-usbc]: https://www.owcdigital.com/products/usb-c-dock/
[ade-owc-usbc]: https://www.amazon.de/gp/product/B013J7TCW2/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=1638&creative=6742&creativeASIN=B013J7TCW2&linkCode=as2&tag=killercup-21
[acom-owc-usbc]: https://www.amazon.com/gp/product/B013J7TCW2/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&tag=pascahertl-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=B013J7TCW2&linkId=0f7134602c5914c7ab209e5e4f303694

### Thunderbolt 3 docks

These use Thunderbolt 3, which means: Much more throughput (up to two ports offering 4k @ 60 Hz, or more data connectivity), and higher prices.

- [OWC's Thunderbolt 3 dock][owc-tb3] has basically everything incl. a SD card reader and a sound card. It costs [$299][acom-owc-tb3] or [350€][ade-owc-tb3].
- Plugable's Flagship Thunderbolt 3 dock [TBT3-UDV] does about the same as the OWC, but is a bit cheaper: [$190][acom-TBT3-UDV] or [219€][ade-TBT3-UDV].
- Belkin's Thunderbolt 3 [Express Dock HD][belkin-tb3] looks quite pretty, includes a 170 W power adapter (delivering up to 85 W to the computer[^belkin-cable]). It costs [$300][acom-belkin-tb3] or [300€][ade-belkin-tb3].
- Kensington's [SD4600P USB-C Docking Station][sd4600p] seems similar to the other docks, and has both HDMI and DisplayPort. [@anton48][] [confirmed][sd4600p-works] 4k @ 60 Hz works (thanks!). It costs [$165][acom-sd4600p] or [200€][ade-sd4600p].

[^belkin-cable]: 85 W and Thunderbolt 3… wait a second! This sounds like a new cable that is better than the rest! Or maybe it's just the default Belkin Thunderbolt 3 cable with a "85 W" label pasted over the original "60 W" one.

[owc-tb3]: https://www.owcdigital.com/products/thunderbolt/thunderbolt-3-dock-overview
[acom-owc-tb3]: https://www.amazon.com/OWC-Port-Thunderbolt-Dock-Space/dp/B01N51P3BB/ref=sr_1_3?ie=UTF8&qid=1505651385&sr=8-3&tag=killercup-21
[ade-owc-tb3]: https://www.amazon.de/gp/product/B01N51P3BB/ref=s9_acsd_hps_bw_c_x_3_w?ie=UTF8&tag=killercup-21
[TBT3-UDV]: http://plugable.com/thunderbolt-3/
[acom-TBT3-UDV]: https://www.amazon.com/Plugable-Thunderbolt-Compatible-Supports-DisplayPort/dp/B06ZYR66QB/ref=sr_1_3?ie=UTF8&qid=1505651385&sr=8-3&tag=killercup-21
[ade-TBT3-UDV]: https://www.amazon.de/gp/product/B0722Q4ZCP/ref=s9_acsd_hps_bw_c_x_3_w?ie=UTF8&tag=killercup-21
[belkin-tb3]: http://www.belkin.com/us/p/F4U095au/
[acom-belkin-tb3]: https://www.amazon.com/dp/B01MZ2ATGK/ref=sr_1_3?ie=UTF8&qid=1505651385&sr=8-3&tag=killercup-21
[ade-belkin-tb3]: https://www.amazon.de/gp/product/B01MQU5UBN/ref=s9_acsd_hps_bw_c_x_3_w?ie=UTF8&tag=killercup-21
[sd4600p]: https://www.kensington.com/us/us/4491/k38231ww/sd4600p-usbc-universal-dock-with-power
[acom-sd4600p]: https://www.amazon.com/Kensington-Delivery-Charging-Precision-K38231WW/dp/B01FMP3B5S/ref=s9_acsd_hps_bw_c_x_3_w?ie=UTF8&tag=killercup-21
[ade-sd4600p]: https://www.amazon.de/Kensington-SD4600P-Universal-Dockingstation-Stromversorgung-Datenübertragung/dp/B01FMP3B5S/ref=s9_acsd_hps_bw_c_x_3_w?ie=UTF8&tag=killercup-21
[sd4600p-works]: https://github.com/killercup/scribbles/issues/10#issuecomment-329409956
