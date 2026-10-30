import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  extractReadableArticle,
  MAX_ARTICLE_HTML_CHARS,
  MAX_ARTICLE_TEXT_CHARS,
} from "../apps/web/src/research/articleParser.ts";

const sampleArticle = {
  title: "  A useful article  ",
  byline: "  Example Author ",
  excerpt: " Short   summary ",
  siteName: " Example Site ",
  textContent: "A detailed article ".repeat(20),
};

function dependencies(article = sampleArticle) {
  return {
    parseDocument(html) {
      return { html };
    },
    read(document) {
      assert.equal(typeof document.html, "string");
      return article;
    },
  };
}

test("normalizes article metadata and returns plain text with source provenance", () => {
  const result = extractReadableArticle(
    "<html><body>fixture</body></html>",
    "https://example.com/article?id=7",
    dependencies(),
  );

  assert.ok(result);
  assert.equal(result.title, "A useful article");
  assert.equal(result.byline, "Example Author");
  assert.equal(result.excerpt, "Short summary");
  assert.equal(result.siteName, "Example Site");
  assert.equal(result.sourceUrl, "https://example.com/article?id=7");
  assert.equal(result.textContent, sampleArticle.textContent.trim());
  assert.equal("content" in result, false);
});

test("rejects empty and oversized HTML before parsing", () => {
  assert.throws(
    () => extractReadableArticle("   ", "https://example.com", dependencies()),
    /non-empty string/,
  );
  assert.equal(MAX_ARTICLE_HTML_CHARS, 1_000_000);
  assert.throws(
    () => extractReadableArticle("x".repeat(MAX_ARTICLE_HTML_CHARS + 1), "https://example.com", dependencies()),
    /1 MB parsing limit/,
  );
});

test("accepts only absolute HTTP(S) source URLs without embedded credentials", () => {
  for (const url of ["relative/path", "javascript:alert(1)", "file:///etc/passwd", "https://user:pass@example.com/"]) {
    assert.throws(
      () => extractReadableArticle("<p>fixture</p>", url, dependencies()),
      /source URL/,
    );
  }
});

test("returns null for missing or too-short article extraction", () => {
  assert.equal(extractReadableArticle("<p>fixture</p>", "https://example.com", dependencies(null)), null);
  assert.equal(
    extractReadableArticle("<p>fixture</p>", "https://example.com", dependencies({ textContent: "too short" })),
    null,
  );
});

test("caps extracted text and removes null/control whitespace", () => {
  const longText = ("A\u0000 useful\narticle ").repeat(MAX_ARTICLE_TEXT_CHARS);
  const result = extractReadableArticle(
    "<p>fixture</p>",
    "https://example.com",
    dependencies({ textContent: longText }),
  );
  assert.ok(result);
  assert.ok(result.textContent.length <= MAX_ARTICLE_TEXT_CHARS);
  assert.doesNotMatch(result.textContent, /\u0000|\n/);
});

test("vendored source retains its licence header and contains no network client", async () => {
  const source = await readFile(new URL("../apps/web/src/vendor/mozilla/Readability.js", import.meta.url), "utf8");
  const license = await readFile(new URL("../apps/web/src/vendor/mozilla/LICENSE.md", import.meta.url), "utf8");
  assert.match(source, /Copyright \(c\) 2010 Arc90 Inc/);
  assert.match(source, /Licensed under the Apache License, Version 2\.0/);
  assert.match(source, /export default Readability/);
  assert.match(license, /Apache License/);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /\bXMLHttpRequest\b/);
  assert.doesNotMatch(source, /\bWebSocket\b/);
});
