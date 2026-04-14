#!/usr/bin/env -S npx tsx
/**
 * fix-links.ts — Convert inline markdown links to ref-style, fetch missing titles.
 *
 * Usage: npx tsx fix-links.ts <file.md>
 */

import { readFile, writeFile } from "node:fs/promises";

// --- HTML entity decoding ---

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

// --- ID generation ---

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
}

function generateId(url: string, usedIds: Set<string>): string {
  let base: string;
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");
    const pathParts = parsed.pathname.split("/").filter(Boolean);

    if (pathParts.length > 0) {
      // Prefer last path segment (strip extension)
      let last = pathParts[pathParts.length - 1].replace(/\.[^.]+$/, "");
      // "index" is meaningless — use the parent path segment instead
      if (last === "index" && pathParts.length >= 2) {
        last = pathParts[pathParts.length - 2];
      }
      const slug = slugify(last);
      base = slug || slugify(hostname.split(".")[0]);
    } else {
      base = slugify(hostname.split(".")[0]);
    }
  } catch {
    base = "link";
  }

  if (!base) base = "link";
  if (!usedIds.has(base)) return base;

  let i = 2;
  while (usedIds.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

// --- Title fetching ---

const RUST_DOC_HOSTS = new Set(["docs.rs", "doc.rust-lang.org"]);

/** Strip noise that's obvious from context (e.g. " - Rust" on rust doc pages). */
function cleanTitle(title: string, url: string): string {
  try {
    const { hostname } = new URL(url);
    if (RUST_DOC_HOSTS.has(hostname)) {
      title = title.replace(/\s*[-–]\s*Rust\s*$/, "");
    }
  } catch { /* ignore */ }
  return title;
}

async function fetchTitle(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; link-tidier/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) return null;

    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("text/html")) return null;

    const html = await res.text();

    // Try oEmbed discovery first (better titles for YouTube, Twitter, etc.)
    const oembedLinkMatch = html.match(
      /<link[^>]+type=["']application\/json\+oembed["'][^>]*>/i
    );
    if (oembedLinkMatch) {
      const hrefMatch = oembedLinkMatch[0].match(/href=["']([^"']+)["']/i);
      if (hrefMatch) {
        try {
          const oRes = await fetch(hrefMatch[1], {
            headers: { "User-Agent": "link-tidier/1.0" },
            signal: AbortSignal.timeout(10_000),
          });
          if (oRes.ok) {
            const data = (await oRes.json()) as { title?: string };
            if (data.title) return cleanTitle(decodeHtmlEntities(data.title), url);
          }
        } catch {
          // fall through to <title>
        }
      }
    }

    // Fall back to <title> tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) return cleanTitle(decodeHtmlEntities(titleMatch[1].trim().replace(/\s+/g, " ")), url);

    return null;
  } catch {
    return null;
  }
}

// --- Main ---

async function main() {
  const [, , filePath] = process.argv;
  if (!filePath) {
    console.error("Usage: npx tsx fix-links.ts <file.md>");
    process.exit(1);
  }

  let content = await readFile(filePath, "utf-8");

  // url -> id (deduplication so same URL gets same ref)
  const urlToId = new Map<string, string>();
  // id -> {url, title}
  const linkDefs = new Map<string, { url: string; title?: string }>();
  const usedIds = new Set<string>();

  // --- Step 1: Collect existing ref-style link definitions ---
  // Matches: [id]: url  or  [id]: url "title"
  const refDefPattern = /^\[([^\]]+)\]:\s+(\S+)(?:\s+"([^"]*)")?\s*$/gm;
  let m: RegExpExecArray | null;

  while ((m = refDefPattern.exec(content)) !== null) {
    const [, id, url, title] = m;
    linkDefs.set(id, { url, title });
    urlToId.set(url, id);
    usedIds.add(id);
  }

  // Remember which IDs existed before we add any new ones.
  // Any of these that don't appear in explicit [text][id] form (e.g. shortcut
  // refs like [foo] or collapsed refs like [foo][]) won't be found by the
  // paragraph scanner — we'll preserve them at the bottom of the file.
  const originalIds = new Set(linkDefs.keys());

  // Strip existing definitions (we rebuild them at the end)
  content = content
    .replace(/^\[[^\]]+\]:\s+\S+(?:\s+"[^"]*")?\s*$/gm, "")
    .trimEnd();

  // --- Step 2: Replace inline links with ref-style ---
  // Matches [text](url) or [text](url "title"), but not ![alt](url) images
  const inlinePattern =
    /(?<!\!)\[([^\]]+)\]\(([^)\s"]+)(?:\s+"([^"]*)")?\)/g;

  const replacements: Array<{
    start: number;
    end: number;
    replacement: string;
  }> = [];

  while ((m = inlinePattern.exec(content)) !== null) {
    const [full, text, url, title] = m;

    let id: string;
    if (urlToId.has(url)) {
      id = urlToId.get(url)!;
      // Upgrade to titled if we now have a title and didn't before
      if (title && !linkDefs.get(id)?.title) {
        linkDefs.set(id, { url, title });
      }
    } else {
      id = generateId(url, usedIds);
      usedIds.add(id);
      urlToId.set(url, id);
      linkDefs.set(id, { url, title });
    }

    replacements.push({
      start: m.index,
      end: m.index + full.length,
      replacement: `[${text}][${id}]`,
    });
  }

  // Apply in reverse order to preserve offsets
  for (let i = replacements.length - 1; i >= 0; i--) {
    const { start, end, replacement } = replacements[i];
    content = content.slice(0, start) + replacement + content.slice(end);
  }

  // --- Step 3: Fetch titles for links that don't have one ---
  const needsTitles = [...linkDefs.entries()].filter(([, { title }]) => !title);

  if (needsTitles.length > 0) {
    console.error(`Fetching titles for ${needsTitles.length} link(s)...`);
    await Promise.all(
      needsTitles.map(async ([id, def]) => {
        process.stderr.write(`  ${def.url} ... `);
        const title = await fetchTitle(def.url);
        if (title) {
          linkDefs.set(id, { ...def, title });
          process.stderr.write(`"${title}"\n`);
        } else {
          process.stderr.write("(no title found)\n");
        }
      })
    );
  }

  // --- Step 4: Insert ref definitions after the paragraph where each is first used ---
  //
  // Split on blank-line boundaries, preserving the separators.
  // segments alternates: [block, "\n\n", block, "\n\n", ...]
  const segments = content.split(/(\n{2,})/);
  const placedIds = new Set<string>();
  const outputParts: string[] = [];

  for (const segment of segments) {
    if (/^\n+$/.test(segment)) {
      // Blank-line separator — pass through unchanged
      outputParts.push(segment);
      continue;
    }

    // Scan block for ref usages: [text][id]
    const newIds: string[] = [];
    const refUsagePattern = /\[[^\]]*\]\[([^\]]+)\]/g;
    let rm: RegExpExecArray | null;

    while ((rm = refUsagePattern.exec(segment)) !== null) {
      const id = rm[1];
      if (!placedIds.has(id) && linkDefs.has(id)) {
        placedIds.add(id);
        newIds.push(id);
      }
    }

    outputParts.push(segment);

    if (newIds.length > 0) {
      const defs = newIds
        .map((id) => {
          const { url, title } = linkDefs.get(id)!;
          return title ? `[${id}]: ${url} "${title}"` : `[${id}]: ${url}`;
        })
        .join("\n");
      // Inject definitions between this block and the next separator
      outputParts.push("\n\n" + defs);
    }
  }

  // Append any original ref defs that were never encountered in [text][id] form
  const unplaced = [...originalIds]
    .filter((id) => !placedIds.has(id))
    .map((id) => {
      const { url, title } = linkDefs.get(id)!;
      return title ? `[${id}]: ${url} "${title}"` : `[${id}]: ${url}`;
    });

  const tail = unplaced.length > 0 ? "\n\n" + unplaced.join("\n") : "";
  content = outputParts.join("") + tail + "\n";

  await writeFile(filePath, content, "utf-8");
  console.error(`Done. Updated: ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
