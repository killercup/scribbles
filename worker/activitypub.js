// Minimal ActivityPub server side for the static actor in static/socialweb/blog.json:
// accept follows, serve the follower count, and push new posts to followers.
//
// KV layout (binding AP):
//   follower:<actor url>  value "", metadata { inbox }   (inbox = sharedInbox if offered)
//   delivered             JSON array of note URLs already pushed to followers

const SITE = "https://deterministic.space";
const ACTOR = `${SITE}/socialweb/blog.json`;
const KEY_ID = `${ACTOR}#main-key`;
const AS_CONTEXT = "https://www.w3.org/ns/activitystreams";
const AP_TYPE = "application/activity+json";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": `${AP_TYPE}; charset=utf-8` },
  });

export async function handleActivityPub(request, env) {
  const { pathname } = new URL(request.url);
  if (pathname === "/activitypub/inbox") {
    if (request.method !== "POST") return new Response(null, { status: 405 });
    return handleInbox(request, env);
  }
  if (pathname === "/activitypub/followers") {
    // ponytail: one KV list per request (free plan: 1000/day); add caching if crawlers hammer it
    const { keys } = await env.AP.list({ prefix: "follower:" });
    return json({
      "@context": AS_CONTEXT,
      id: `${SITE}/activitypub/followers`,
      type: "OrderedCollection",
      totalItems: keys.length,
      orderedItems: [],
    });
  }
  return env.ASSETS.fetch(request);
}

async function handleInbox(request, env) {
  const body = await request.text();
  let activity;
  try {
    activity = JSON.parse(body);
  } catch {
    return new Response("bad json", { status: 400 });
  }

  const isFollow = activity.type === "Follow" && activity.object === ACTOR;
  const isUnfollow =
    activity.type === "Undo" && activity.object?.type === "Follow" && activity.object?.actor === activity.actor;
  // Everything else (mostly Delete broadcasts for remote accounts) is acknowledged and dropped.
  if (!isFollow && !isUnfollow) return new Response(null, { status: 202 });

  let actor;
  try {
    actor = await verifySignature(request, body, activity.actor, env);
  } catch (e) {
    console.log("signature rejected", activity.actor, e.message);
    return new Response("invalid signature", { status: 401 });
  }

  const key = `follower:${activity.actor}`;
  if (isUnfollow) {
    await env.AP.delete(key);
    return new Response(null, { status: 202 });
  }

  const accept = {
    "@context": AS_CONTEXT,
    id: `${SITE}/activitypub/accept/${crypto.randomUUID()}`,
    type: "Accept",
    actor: ACTOR,
    object: activity,
  };
  const res = await signedFetch(env, actor.inbox, accept);
  if (!res.ok) {
    console.log("accept failed", actor.inbox, res.status, await res.text());
    // Make the remote server retry the Follow rather than leave it pending forever.
    return new Response("could not deliver Accept", { status: 502 });
  }
  await env.AP.put(key, "", { metadata: { inbox: actor.endpoints?.sharedInbox ?? actor.inbox } });
  return new Response(null, { status: 202 });
}

// Checks a draft-cavage HTTP signature (what Mastodon & co. send) and that the
// signing key belongs to `actorUrl`. Returns the actor document.
export async function verifySignature(request, body, actorUrl, env) {
  const params = Object.fromEntries(
    [...(request.headers.get("Signature") ?? "").matchAll(/(\w+)="([^"]*)"/g)].map((m) => [m[1], m[2]]),
  );
  if (!params.keyId || !params.signature || !params.headers) throw new Error("missing Signature header");

  const signed = params.headers.split(" ");
  if (!signed.includes("digest")) throw new Error("digest not signed");
  if ((request.headers.get("Digest") ?? "") !== `SHA-256=${await sha256(body)}`) throw new Error("digest mismatch");
  const date = Date.parse(request.headers.get("Date"));
  if (!(Math.abs(Date.now() - date) < 12 * 3600e3)) throw new Error("date out of range");

  // The keyId usually is `<actor>#main-key`; some servers use a separate key URL that returns the key or actor.
  const keyDoc = await fetchJson(env, params.keyId.split("#")[0]);
  const key = keyDoc.publicKey ?? keyDoc;
  if (key.owner !== actorUrl) throw new Error(`key owner ${key.owner} is not ${actorUrl}`);
  const actor = keyDoc.id === actorUrl ? keyDoc : await fetchJson(env, actorUrl);
  if (!actor.inbox) throw new Error("actor has no inbox");

  const url = new URL(request.url);
  const signingString = signed
    .map((h) =>
      h === "(request-target)"
        ? `(request-target): ${request.method.toLowerCase()} ${url.pathname}${url.search}`
        : `${h}: ${request.headers.get(h)}`,
    )
    .join("\n");
  const publicKey = await crypto.subtle.importKey(
    "spki",
    pemToDer(key.publicKeyPem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const ok = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    Uint8Array.from(atob(params.signature), (c) => c.charCodeAt(0)),
    new TextEncoder().encode(signingString),
  );
  if (!ok) throw new Error("bad signature");
  return actor;
}

async function fetchJson(env, url) {
  const res = await signedFetch(env, url); // signed, so servers with "authorized fetch" answer
  if (!res.ok) throw new Error(`GET ${url}: ${res.status}`);
  return res.json();
}

// GET (no body) or POST (body) to a remote server, signed with the blog's key.
export async function signedFetch(env, url, body) {
  const { host, pathname, search } = new URL(url);
  const method = body ? "post" : "get";
  const payload = body && JSON.stringify(body);
  const headers = {
    host,
    date: new Date().toUTCString(),
    ...(payload && { digest: `SHA-256=${await sha256(payload)}` }),
  };
  const signingString = [
    `(request-target): ${method} ${pathname}${search}`,
    ...Object.entries(headers).map(([k, v]) => `${k}: ${v}`),
  ].join("\n");
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToDer(env.AP_PRIVATE_KEY),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, new TextEncoder().encode(signingString));
  return fetch(url, {
    method,
    body: payload,
    headers: {
      ...headers,
      accept: AP_TYPE,
      ...(payload && { "content-type": AP_TYPE }),
      "user-agent": `deterministic.space (+${SITE})`,
      signature: `keyId="${KEY_ID}",algorithm="rsa-sha256",headers="(request-target) ${Object.keys(headers).join(" ")}",signature="${btoa(String.fromCharCode(...new Uint8Array(signature)))}"`,
    },
  });
}

// Cron: send a Create for every outbox entry not yet delivered.
export async function deliverNewPosts(env) {
  const asset = async (url) => (await env.ASSETS.fetch(new Request(url))).json();
  const outbox = await asset(`${SITE}/socialweb/outbox.json`);
  const all = outbox.orderedItems.map((item) => item.object);
  const delivered = await env.AP.get("delivered", "json");
  if (!delivered) {
    // First run: treat the existing archive as already sent instead of flooding timelines.
    await env.AP.put("delivered", JSON.stringify(all));
    return;
  }
  const fresh = outbox.orderedItems.filter((item) => !delivered.includes(item.object)).reverse(); // oldest first
  if (!fresh.length) return;

  const { keys } = await env.AP.list({ prefix: "follower:" });
  const inboxes = [...new Set(keys.map((k) => k.metadata?.inbox).filter(Boolean))];
  for (const item of fresh) {
    const note = await asset(item.object);
    const create = {
      "@context": AS_CONTEXT,
      id: `${note.id}#create`,
      type: "Create",
      actor: ACTOR,
      published: note.published,
      to: note.to,
      cc: note.cc,
      object: note,
    };
    // ponytail: one attempt per inbox, no retry queue; fine for a handful of servers,
    // move to Queues if followers span more servers than the per-run subrequest limit.
    await Promise.all(
      inboxes.map(async (inbox) => {
        const res = await signedFetch(env, inbox, create).catch((e) => ({ ok: false, status: e.message }));
        if (!res.ok) console.log("delivery failed", inbox, item.object, res.status);
      }),
    );
  }
  await env.AP.put("delivered", JSON.stringify(all));
}

async function sha256(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return btoa(String.fromCharCode(...new Uint8Array(digest)));
}

function pemToDer(pem) {
  const b64 = pem.replace(/-----[^-]+-----|\s/g, "");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}
