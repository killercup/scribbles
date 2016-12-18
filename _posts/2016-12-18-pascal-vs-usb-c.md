---
title: "Pascal vs. USB-C"
categories:
- tech
---
I'm gonna buy a 15″ MacBook with 4 Thunderbolt 3 Ports because (a) I need new laptop, (b) I want to continue to use macOS (without hassle), and (c) I really like the premise of USB-C  with alternate modes and Thunderbolt 3 with 40Gb/s. Sadly, that means that I'll need adaptors to connect all the hardware I currently own.

How hard can it be to find some adaptor-y dock-y things that I can actually afford? Let's find out.

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

Semi-static setup. Will probably only need to move to another place when I least expect it.

- Cinema Display or similar, 1920×1200 @ 60 Hz, HDMI or DVI connector
- USB-A for mouse and keyboard (mouse actually plugged into Apple keyboard to one USB-A port should suffice)
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

There are active and passive USB-C cables, as well as those that allow the full range of power over power delivery.

A bunch of people seem to really enjoy testing USB-C cables. Good for them! Two rather famous gentlemen is this scene are [Nathan K.], and [Benson Leung]. Nathan has a nice [table comparing USB-C cables][usb-cables].

[Nathan K.]: https://plus.google.com/102612254593917101378
[Benson Leung]: https://plus.google.com/+BensonLeung
[usb-cables]: https://docs.google.com/spreadsheets/d/1vnpEXfo2HCGADdd9G2x9dMDWqENiY2kgBJUu29f_TX8/pubhtml

For some reason there is no cable that does it all (Thunderbolt 3 speed and 100 W power). Maybe I just missed a details there, though. 100 W power always come from 5 A at 20 V, but 60 W can come from either 12 V with 5 A, or 20 V with 3 A. Additionally, making long, 100 W USB-C cables capable of transferring 10Gb/s seems to be hard: Half of them are rated "bad". (The one from Apple is 2 m long but only supports USB 2.0 speed).

### DisplayPort

According to [Wikipedia][usb-c-alternate-modes], USB-C supports DisplayPort up to protocol version 1.3 ([DisplayPort versions][dp-versions]). 1.2 and higher support 4k (3840 × 2160) with up to 75 Hz, so we don't need to worry about anything.

[dp-versions]: https://en.wikipedia.org/w/index.php?title=DisplayPort&oldid=755497571#Resolution_and_refresh_frequency_support_for_DisplayPort

If I understand Wikipedia correctly, it also shows that while using DisplayPort alternate mode, it is *always* possible to additionally use PowerDelivery and USB 2.0 over a USB-C cable. Furthermore it allows an additional USB 3.1 connection if the DisplayPort mode only uses 2 lanes. I have no idea when that is the case, though. (4k @ 60 Hz over DP 1.2 sure uses a lot of bandwidth already!)

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

Damn, that sounds… bad. But let's backtrack a bit. What are these abbreviations we saw int he quote earlier?

TMDS
:	Transition Minimized Differential Signaling
:	"interleaves video, audio and auxiliary data"

DDC
:	Display Data Channel

CEC
:	Consumer Electronic Control

HEC
:	HDMI Ethernet Channel

ARC
:	Audio Return Channel

Okay, of those we can probably get rid of HEC and ARC, as we want to do Ethernet over RJ-45 (i.e., another port on the adapter), and while an audio return channel (i.e. audio input over HDMI) is nice, I'd be surprised if the MacBook knows how to handle it. Sadly, the same is probably true for CEC -- which I'd like to have! Adjusting my AV receiver's volume without using the remote would be amazing.

What does that leave us with? The hope to at least have HDMI, ethernet, and maybe even USB 3.0 (5Gb/s)!

What's crazy is this: There are adapters that have all these ports. HDMI, ethernet, *multiple* USB 3.0 (USB-A) ports, even SD card slots, and \*gasp\* VGA. How does that work? Has anyone tested this and measured what throughput they get over the USB-A ports?

### MHL

Oh, you thought I was done talking about displays? Sorry!

There is also an MHL alternate mode over USB-C which seems to support everything you can possible want from a display connector (up to 8k @ 60 Hz with power delivery and USB 3.1 Gen 2 data). The [official "USB Type C" page][usbc-mhl] has a FAQ with these claims, but their product page does not currently list any Apple devices.

[usbc-mhl]: http://www.mhltech.org/usbtype-c.aspx

### DVI

A lot of the displays are older Cinema Displays that have DVI-D cables. But that's okay, single-link DVI-D is supported when using HDMI over USB-C (according to [Wikipedia][usb-c-alternate-modes]). And [apparently][dvi-specs] single-link is all we need: It supports 1920 × 1200 @ 60 Hz (or "WUXGA" if you want to sound crazy).

[dvi-specs]: https://en.wikipedia.org/w/index.php?title=Digital_Visual_Interface&oldid=755496857#Digital

### Ethernet

They are seem to work fine, but there are chipsets that don't need any special drivers on macOS (good) and there ones that do (less good).

In theory, I could also use a USB 3.0 to Ethernet adapter (there are a lot of those).

### Power deliver

USB-C specifies power delivery of up to 100 W (5 A at 20 V), but most adapters tap out at 60 W. While the 15″ MacBook's charger outputs 87 W, the MacBook will charge with 60 W (but slower).

Also, I could not find *any* charger that outputs ≥87 W except for the one from Apple.

### Thunderbolt 3

An active adapters that supports Thunderbolt 3 with 40Gb/s should be able to do pretty much everything I could possible want. It will also cost a lot more and not be very portable.

## What devices can I buy?

So, from what I've gathered so far, it looks like:

- Charging at full speed using any adapter will be a problem.
- The surest way to get my 4k display working is to get a separate USB-C to DisplayPort adapter.
- There are a lot of adapters out there that have HDMI and USB 3.0, but less that *also* have Ethernet.
- If I'm willing to wait for Thunderbolt 3 docks to become available, and pay for one of them, I could probably get everything (with 60 W power) in one device.

So, looks like I'll still need 2–3 cables.

### Charging

I'll buy another Apple power adapter and either one of their USB-C charging cables (2 m), or one of the shorter, [recommended][usb-cables] cables once they are available in Germany.

### 4k display

I'll just buy a USB-C to DisplayPort adapter from Aukey ([amazon.de][ade-aukey-dp],
[amazon.com][acom-aukey-dp]).

[ade-aukey-dp]: https://www.amazon.de/gp/product/B01AR81YXQ/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=1638&creative=6742&creativeASIN=B01AR81YXQ&linkCode=as2&tag=killercblog-21
[acom-aukey-dp]: https://www.amazon.com/AUKEY-DisplayPort-Adapter-MacBook-Chromebook/dp/B01AT2V26E/ref=as_li_ss_tl?ie=UTF8&qid=1482091574&sr=8-1&keywords=AUKEY+USB+C+displayport&linkCode=ll1&tag=pascahertl-20&linkId=33c0ed89fdc129ef6c0d5c050fe0b7cd

### USB-C adapters

| Name                                       | HDMI | USB 3.0 | Ethernet | Power delivery | Others    | amazon.de            | amazon.com            | Notes |
| ------------------------------------------ | :--: | :-----: | :------: | -------------- | --------- | -------------------: | --------------------: | ----- |
| [Dell 470-ABRY DA200][dell470]             | 1    | 1       | 1        | No             | VGA       | [67€][ade-dell470]   | [$60][acom-dell470]   | Looks quite small |
| [i-tec USB C Travel Docking Station][itec] | 1    | 2       | 1        | 60 W           | USB-C 3.1 | [57€][ade-itec]      | N/A                   | Larger than Dell but still light, probably a rebrnad |
| ProLink-Adapter USB Typ C                  | 1    | 1       | 1        | Yes (??? W)    |           | [45€][ade-prolink]   | N/A                   | Looks cheap, badly translated description |
| AUKEY USB C Hub                            | 1    | 4       | **0**    | [55 W][aukey-hub-review] | | [38€][ade-aukey-hub] | [$43][acom-aukey-hub] |       |
| [Cable Matters USB-C Multiport][cm-multi]  | 1    | 1       | 1        | No             | VGA       | [50€][ade-cm-multi]  | [$50][acom-cm-multi]  | Looks ugly, needs Ethernet driver |

[dell470]: http://accessories.euro.dell.com/sna/productdetail.aspx?c=de&l=de&s=dhs&cs=dedhs1&sku=470-ABRY
[ade-dell470]: https://www.amazon.de/gp/product/B012DT6KW2/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=1638&creative=6742&creativeASIN=B012DT6KW2&linkCode=as2&tag=killercup-21
[acom-dell470]: https://www.amazon.com/gp/product/B012DT6KW2/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&tag=pascahertl-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=B012DT6KW2&linkId=16b26e96f07cc42929498d77e738de5d
[itec]: https://www.i-tec-europe.eu/?t=3&v=424
[ade-itec]: https://www.amazon.de/gp/product/B01M9A5ZQS/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=1638&creative=6742&creativeASIN=B01M9A5ZQS&linkCode=as2&tag=killercup-21
[ade-prolink]: https://www.amazon.de/gp/product/B01L2GVEY6/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=1638&creative=6742&creativeASIN=B01L2GVEY6&linkCode=as2&tag=killercup-21
[ade-aukey-hub]: https://www.amazon.de/gp/product/B01BXOW3V0/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=1638&creative=6742&creativeASIN=B01BXOW3V0&linkCode=as2&tag=killercup-21
[acom-aukey-hub]: https://www.amazon.com/gp/product/B01LYBZFV5/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&tag=pascahertl-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=B01LYBZFV5&linkId=58918b33147beec562477d30f45bfd37
[aukey-hub-review]: https://www.amazon.de/gp/customer-reviews/RDNNX0R6LZM9V/ref=cm_cr_arp_d_rvw_ttl?ie=UTF8&ASIN=B01BXOW3V0
[cm-multi]: http://www.cablematters.com/pc-686-114-usb-c-to-hdmi-vga-ethernet-usb-multiport-4k-uhd-adapter-thunderbolt-3-port-compatible.aspx
[ade-cm-multi]: https://www.amazon.de/gp/product/B01C316EIK/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=1638&creative=6742&creativeASIN=B01C316EIK&linkCode=as2&tag=killercup-21
[acom-cm-multi]: https://www.amazon.com/gp/product/B01C316EIK/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&tag=pascahertl-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=B01C316EIK&linkId=44582ece95c717dd883113d141785789

I'll probably try both the Dell and the i-tec.

### Thunderbolt 3 adapters

There's three I know of, and not one of them is shipping right now:

- [OWC's Thunderbolt 3 dock][owc] has basically everything incl. a SD card reader and a sound card, but costs $279 and ships in February 2017.
- Plugable's Flagship Thunderbolt 3 dock [TBT3-UDV] does about the same as the OWC, looks cheaper, ships Q1 2017.
- Belkin's Thunderbolt 3 [Express Dock HD][belkin-tb3] looks quite pretty, includes a 170 W power adapter (delivering up to 85 W to the computer), but has neither audio in nor a delivery date. It is rumored to cost around €400.

I won't be buying any of those in the short term but will be looking forward to reviews when they finally ship.

[owc]: https://www.owcdigital.com/products/thunderbolt/thunderbolt-3-dock-overview
[TBT3-UDV]: http://plugable.com/thunderbolt-3/
[belkin-tb3]: http://www.belkin.com/us/p/F4U095au/
