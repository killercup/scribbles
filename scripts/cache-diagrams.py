#!/usr/bin/env -S uv run
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "markdown-it-py",
#     "requests",
# ]
# ///
import hashlib
import json
import os
import sys
from pathlib import Path

import requests
from markdown_it import MarkdownIt

KROKI_URL = os.environ.get("KROKI_URL", "http://localhost:8000")
CONTENT_DIR = Path("content")
CACHE_DIR = Path("assets/kroki-cache")
DIAGRAM_TYPES = ["mermaid"]

NO_WHITESPACE = {"separators": (",", ":"), "ensure_ascii": False}


def hash_input(type: str, source: str, options: dict | None = None) -> str:
    """Matches layouts/partials/diagram-kroki.html hash computation.

    Hugo: crypto.SHA256 (printf "%s\n%s\n%s" .type .source (.options | default (dict) | jsonify))
    """
    opts = json.dumps(options or {}, **NO_WHITESPACE)
    raw = f"{type}\n{source}\n{opts}"
    return hashlib.sha256(raw.encode()).hexdigest()


def extract_blocks(text: str, lang: str, md: MarkdownIt) -> list[str]:
    return [
        t.content.rstrip("\n")
        for t in md.parse(text)
        if t.type == "fence" and t.info.split("{", 1)[0].strip() == lang
    ]


def fetch_svg(type: str, source: str) -> str:
    body = {
        "diagram_source": source,
        "output_format": "svg",
    }
    resp = requests.post(
        f"{KROKI_URL}/{type}/svg",
        json=body,
        headers={"Content-Type": "application/json"},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.text


def main() -> None:
    if not CONTENT_DIR.is_dir():
        print(f"error: content directory not found at {CONTENT_DIR}", file=sys.stderr)
        sys.exit(1)

    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    md_files = sorted(CONTENT_DIR.rglob("*.md"))
    if not md_files:
        print("No markdown files found in content/", file=sys.stderr)
        sys.exit(1)

    md = MarkdownIt("commonmark")

    total = 0
    cached = 0
    fetched = 0
    errors = 0
    expected: set[str] = set()

    for f in md_files:
        text = f.read_text()
        for lang in DIAGRAM_TYPES:
            for source in extract_blocks(text, lang, md):
                total += 1
                h = hash_input(lang, source)
                expected.add(f"{h}.svg")
                out = CACHE_DIR / f"{h}.svg"

                if out.exists():
                    cached += 1
                    print(f"  [cached] {f.name} ({lang}, {h[:12]})")
                    continue

                try:
                    svg = fetch_svg(lang, source)
                    out.write_text(svg)
                    fetched += 1
                    print(f"  [ok]     {f.name} ({lang}, {h[:12]})")
                except Exception as e:
                    errors += 1
                    print(f"  [error]  {f.name} ({lang}, {h[:12]})", end="")
                    print(f": {e}", file=sys.stderr)

    removed = 0
    for cached_file in CACHE_DIR.glob("*.svg"):
        if cached_file.name not in expected:
            cached_file.unlink()
            removed += 1

    print()
    print(
        f"Done: {total} diagrams, {cached} cached, {fetched} fetched, {errors} errors"
        f"{f', {removed} removed' if removed else ''}"
    )
    if errors:
        sys.exit(1)


if __name__ == "__main__":
    main()
