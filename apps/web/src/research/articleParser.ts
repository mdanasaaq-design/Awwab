import Readability from "../vendor/mozilla/Readability.js";

export type ReadableArticle = {
  title: string;
  byline: string;
  excerpt: string;
  siteName: string;
  textContent: string;
  sourceUrl: string;
};

type UpstreamArticle = {
  title?: string | null;
  byline?: string | null;
  excerpt?: string | null;
  siteName?: string | null;
  textContent?: string | null;
};

type ParserDependencies = {
  parseDocument?: (html: string) => Document;
  read?: (document: Document) => UpstreamArticle | null;
};

export const MAX_ARTICLE_HTML_CHARS = 1_000_000;
export const MAX_ARTICLE_TEXT_CHARS = 12_000;

function cleanText(value: string | null | undefined, maxLength: number): string {
  return (value ?? "").replace(/\u0000/g, "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

/**
 * Parse already-fetched HTML into plain article text.
 * This function performs no network requests. URL fetching, domain policy,
 * redirect checks, response limits and provenance belong to the caller.
 */
export function extractReadableArticle(
  html: string,
  sourceUrl: string,
  dependencies: ParserDependencies = {},
): ReadableArticle | null {
  if (typeof html !== "string" || html.trim().length === 0) {
    throw new TypeError("Article HTML must be a non-empty string.");
  }
  if (html.length > MAX_ARTICLE_HTML_CHARS) {
    throw new RangeError("Article HTML exceeds the 1 MB parsing limit.");
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(sourceUrl);
  } catch {
    throw new TypeError("Article source URL must be an absolute HTTP(S) URL.");
  }
  if ((parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") || parsedUrl.username || parsedUrl.password) {
    throw new TypeError("Article source URL must use HTTP(S) and cannot contain embedded credentials.");
  }

  const document = dependencies.parseDocument
    ? dependencies.parseDocument(html)
    : new DOMParser().parseFromString(html, "text/html");

  const article = dependencies.read
    ? dependencies.read(document)
    : new Readability(document.cloneNode(true) as Document, {
        maxElemsToParse: 10_000,
        charThreshold: 100,
        disableJSONLD: true,
      }).parse();

  if (!article) return null;

  const textContent = cleanText(article.textContent, MAX_ARTICLE_TEXT_CHARS);
  if (textContent.length < 80) return null;

  return {
    title: cleanText(article.title, 300) || parsedUrl.hostname,
    byline: cleanText(article.byline, 300),
    excerpt: cleanText(article.excerpt, 600),
    siteName: cleanText(article.siteName, 200),
    textContent,
    sourceUrl: parsedUrl.toString(),
  };
}
