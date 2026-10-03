// Round-trip check for HTTP signatures and the follow flow: `node worker/activitypub.test.mjs`
import assert from "node:assert/strict";
import { handleActivityPub, signedFetch, verifySignature } from "./activitypub.js";

const ACTOR = "https://deterministic.space/socialweb/blog.json";
const INBOX = "https://deterministic.space/activitypub/inbox";
const REMOTE = "https://remote.example/users/alice";

const pem = (label, buf) => `-----BEGIN ${label}-----\n${Buffer.from(buf).toString("base64")}\n-----END ${label}-----`;
const keys = await crypto.subtle.generateKey(
  { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
  true,
  ["sign", "verify"],
);
const publicKeyPem = pem("PUBLIC KEY", await crypto.subtle.exportKey("spki", keys.publicKey));
const kv = new Map();
const env = {
  AP_PRIVATE_KEY: pem("PRIVATE KEY", await crypto.subtle.exportKey("pkcs8", keys.privateKey)),
  AP: {
    put: async (k, _v, o) => kv.set(k, o?.metadata),
    delete: async (k) => kv.delete(k),
    list: async ({ prefix }) => ({
      keys: [...kv].filter(([k]) => k.startsWith(prefix)).map(([name, metadata]) => ({ name, metadata })),
    }),
  },
};

// Fake network: GETs return actor docs, POSTs are recorded.
let docs = {};
const sent = [];
const toRequest = (url, init) => new Request(url, { method: init.method, headers: init.headers, body: init.body });
globalThis.fetch = async (url, init) => {
  if (init.method === "get") return Response.json(docs[url]);
  sent.push(toRequest(url, init));
  return new Response(null, { status: 202 });
};
const lastSent = async () => ({ url: sent.at(-1).url, body: JSON.parse(await sent.at(-1).clone().text()) });

// Our outgoing signatures pass our own verifier.
docs = { [ACTOR]: { id: ACTOR, inbox: INBOX, publicKey: { owner: ACTOR, publicKeyPem } } };
await signedFetch(env, "https://remote.example/inbox?x=1", { type: "Ping" });
const ping = sent.at(-1);
assert.equal((await verifySignature(ping, await ping.clone().text(), ACTOR, env)).id, ACTOR);

// Pretend to be the remote server. signedFetch always signs with keyId=ACTOR#main-key,
// so serve the remote's actor doc at that URL.
docs = {
  [ACTOR]: {
    id: REMOTE,
    inbox: `${REMOTE}/inbox`,
    endpoints: { sharedInbox: "https://remote.example/inbox" },
    publicKey: { owner: REMOTE, publicKeyPem },
  },
};
const fromRemote = async (activity, tamper = (b) => b) => {
  await signedFetch(env, INBOX, activity);
  const req = sent.pop();
  return handleActivityPub(new Request(req, { body: tamper(await req.text()) }), env);
};
const follow = { type: "Follow", actor: REMOTE, object: ACTOR };

// Signed Follow: Accept goes to the remote's personal inbox, shared inbox is stored.
assert.equal((await fromRemote(follow)).status, 202);
assert.deepEqual(await lastSent(), {
  url: `${REMOTE}/inbox`,
  body: { ...(await lastSent()).body, type: "Accept", actor: ACTOR, object: follow },
});
assert.deepEqual(kv.get(`follower:${REMOTE}`), { inbox: "https://remote.example/inbox" });

// Body changed after signing, unsigned, or claimed by another actor: rejected.
assert.equal((await fromRemote(follow, (b) => b.replace("{", '{"x":1,'))).status, 401);
const unsigned = new Request(INBOX, { method: "POST", body: JSON.stringify(follow) });
assert.equal((await handleActivityPub(unsigned, env)).status, 401);
assert.equal((await fromRemote({ ...follow, actor: "https://evil.example/u/mallory" })).status, 401);

// Unrelated activities are acknowledged without checks.
const del = new Request(INBOX, { method: "POST", body: JSON.stringify({ type: "Delete", actor: REMOTE }) });
assert.equal((await handleActivityPub(del, env)).status, 202);

// Undo removes the follower.
assert.equal((await fromRemote({ type: "Undo", actor: REMOTE, object: follow })).status, 202);
assert.equal(kv.has(`follower:${REMOTE}`), false);
console.log("ok");
