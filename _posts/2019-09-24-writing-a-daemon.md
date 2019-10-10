---
title: Notes on proper systemd services
categories:
- systemd
- linux
---
Despite my best efforts,
I end up logging into Linux servers and checking how they're doing
way too often.
In recent projects
I've also been responsible for adding way too many [.service] files
and making sure they work.
All of that was based on a vague understanding of how systemd works,
without ever _really_ looking into the finer details
and the constant feeling that there are a lot of features I was missing.
With this post,
I want to explore some of these aspects
and figure out how to write better daemons.
See it as a set of notes
on the things I want to at in more depth.

[.service]: https://www.freedesktop.org/software/systemd/man/systemd.service.html

## Proper status updates

Services can let systemd know what their internal state is,
and to have it restart them when they don't respond.

### Readiness

As far as I can tell,
by default, systemd services are of type `simple`,
and are assumed to be ready immediately after they are started.
This might not be the case for a program that requires some time to start up,
or that waits for a connection to be initialized.

To allow the service to notify systemd of its state,
you need to set the type to `notify`:

```
[Service]
Type=notify
```

To tell systemd that the service is ready, you trigger a notification.
The easiest to test with is:

```
/bin/systemd-notify --ready
```

In a real service,
you'd call [sd_notify] (or [rust-notify] in Rust)
with a string starting with `READY=1`.
This string can contain various newline delimited values,
as described in the Description section [here][sd_notify].
You can, for example, append `STATUS=Good to go!`.

Sending `RELOADING=1` and `STOPPING=1`
will tell systemd that the service is reloading or exiting respectively.

[systemd-notify]: https://www.freedesktop.org/software/systemd/man/systemd-notify.html
[sd_notify]: https://www.freedesktop.org/software/systemd/man/sd_notify.html
[rust-notify]: https://docs.rs/systemd/0.4.0/systemd/daemon/fn.notify.html

### Health

The same notification system can also be used to
let systemd make sure your service is doing fine.
Specifically, by adding something like `WatchdogSec=5`,
systemd will expect you to send `WATCHDOG=1` notifications
less then every 5 seconds.

[watchdogs]: http://0pointer.de/blog/projects/watchdog.html

## Logging

[journald] allows structured log messages,
and using [slog-journald] (for example)
can set common [fields][journal-fields] automatically.

[journald]: https://www.freedesktop.org/software/systemd/man/systemd-journald.service.html
[journal-fields]: https://www.freedesktop.org/software/systemd/man/systemd.journal-fields.html
[slog-journald]: https://github.com/slog-rs/journald

## Sockets

You can define the sockets your services will consume
and let systemd manage them for you.
The advantages are:

1. Your socket will stay alive even through service restarts
   (if I understand correctly)
2. You can set your service to only start once there is traffic on the socket
   ("[socket activation]", also used by macOS' launchd for example)

The easiest way is to define a [.socket] file
with the same name as your [.service] file.
Using the [listenfd] crate,
you can then quickly get the socket(s) available.

[.socket]: https://www.freedesktop.org/software/systemd/man/systemd.socket.html
[socket activation]: http://0pointer.de/blog/projects/socket-activation.html
[listenfd]: https://crates.io/crates/listenfd

## Limiting Capabilities

By default,
your services run in an environment similar to just executing them with bash
as the correct user.
That is convenient to get stuff running,
but might be a bit much if you're security conscious.
They are, however, a bunch of neat things you can set
to limit what your process can do.
Here's a few examples:

```
[Service]
PrivateTmp=yes
InaccessibleDirectories=/home
ReadOnlyDirectories=/var
CapabilityBoundingSet=~CAP_SYS_PTRACE
DeviceAllow=/dev/null rw
TemporaryFileSystem=/var:ro
BindReadOnlyPaths=/var/foo/data
```

More in [this post][security]
and the docs for [systemd.exec].

[security]: http://0pointer.de/blog/projects/security.html
[systemd.exec]: https://www.freedesktop.org/software/systemd/man/systemd.exec.html