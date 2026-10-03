import { deliverNewPosts, handleActivityPub } from "./activitypub.js";

// Content negotiation: agents sending `Accept: text/markdown` get the
// Hugo-generated .md twin of an HTML page.
const wantsMarkdown = (request) =>
  (request.headers.get("Accept") ?? "").includes("text/markdown");

const withHeaders = (response, headers) => {
  const res = new Response(response.body, response);
  for (const [k, v] of Object.entries(headers)) res.headers.set(k, v);
  return res;
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/activitypub/")) return handleActivityPub(request, env);
    if (url.pathname === "/") url.pathname = "/index.html";
    if (!url.pathname.endsWith(".html")) return env.ASSETS.fetch(request);

    if (wantsMarkdown(request)) {
      const mdUrl = new URL(url);
      mdUrl.pathname = url.pathname.replace(/\.html$/, ".md");
      const md = await env.ASSETS.fetch(new Request(mdUrl, request));
      if (md.ok) {
        return withHeaders(md, {
          "Content-Type": "text/markdown; charset=utf-8",
          Vary: "Accept",
        });
      }
    }
    const html = await env.ASSETS.fetch(new Request(url, request));
    return withHeaders(html, { Vary: "Accept" });
  },

  async scheduled(_event, env) {
    await deliverNewPosts(env);
  },
};
