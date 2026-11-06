import { useState, type FormEvent } from "react";
import { extractReadableArticle, MAX_ARTICLE_HTML_CHARS } from "./research/articleParser";

type SearchHit = { pageid: number; title: string; snippet: string };
type ResearchSource = { id: string; title: string; url: string; extract: string; provider: string; metadata?: string };
type SearchResponse = { query?: { search?: SearchHit[] }; error?: { info?: string } };
type WikipediaParseResponse = { parse?: { title?: string; pageid?: number; text?: string | { "*": string } }; error?: { info?: string } };
type CrossrefResponse = { message?: { items?: Array<{ DOI?: string; title?: string[]; author?: Array<{ given?: string; family?: string }>; published?: { "date-parts"?: number[][] }; URL?: string; abstract?: string; type?: string; "container-title"?: string[] }> } };

export function ResearchPanel() {
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState<"wikipedia" | "crossref">("wikipedia");
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function runResearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    if (term.length < 2 || term.length > 200) {
      setError("Enter a search query between 2 and 200 characters.");
      return;
    }
    setLoading(true);
    setError("");
    setSearched(true);
    setSources([]);
    try {
      if (provider === "crossref") {
        const crossrefUrl = new URL("https://api.crossref.org/works");
        crossrefUrl.search = new URLSearchParams({
          query: term,
          rows: "5",
          select: "DOI,title,author,published,URL,abstract,type,container-title",
        }).toString();
        const response = await fetch(crossrefUrl, { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`Academic source search failed (HTTP ${response.status}).`);
        const data = await response.json() as CrossrefResponse;
        setSources((data.message?.items ?? []).flatMap((item) => {
          const title = item.title?.[0]?.trim();
          const url = item.URL ?? (item.DOI ? `https://doi.org/${item.DOI}` : "");
          if (!title || !url) return [];
          const authors = (item.author ?? []).slice(0, 6).map((author) => [author.given, author.family].filter(Boolean).join(" ")).filter(Boolean);
          const year = item.published?.["date-parts"]?.[0]?.[0];
          const metadata = [authors.length ? authors.join(", ") : "Author details unavailable", year, item["container-title"]?.[0]].filter(Boolean).join(" · ");
          const extract = (item.abstract ?? "Abstract unavailable from Crossref.").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 1800);
          return [{ id: item.DOI ?? url, title, url, extract, provider: "CROSSREF · ACADEMIC METADATA", metadata }];
        }));
        return;
      }
      const searchUrl = new URL("https://en.wikipedia.org/w/api.php");
      searchUrl.search = new URLSearchParams({
        action: "query", list: "search", srsearch: term, srlimit: "5",
        format: "json", origin: "*",
      }).toString();
      const searchResponse = await fetch(searchUrl, { headers: { Accept: "application/json" } });
      if (!searchResponse.ok) throw new Error(`Source search failed (HTTP ${searchResponse.status}).`);
      const searchData = await searchResponse.json() as SearchResponse;
      if (searchData.error) throw new Error(searchData.error.info ?? "Source search failed.");
      const hits = searchData.query?.search ?? [];
      if (!hits.length) {
        setSources([]);
        return;
      }
      const parsedPages = await Promise.all(hits.map(async (hit) => {
        try {
          const parseUrl = new URL("https://en.wikipedia.org/w/api.php");
          parseUrl.search = new URLSearchParams({
            action: "parse",
            pageid: String(hit.pageid),
            prop: "text",
            format: "json",
            origin: "*",
          }).toString();
          const parseResponse = await fetch(parseUrl, { headers: { Accept: "application/json" } });
          if (!parseResponse.ok) return [hit.pageid, null] as const;
          const contentLength = Number(parseResponse.headers.get("content-length") ?? 0);
          if (contentLength > MAX_ARTICLE_HTML_CHARS) return [hit.pageid, null] as const;
          const parseData = await parseResponse.json() as WikipediaParseResponse;
          if (parseData.error) return [hit.pageid, null] as const;
          const rawHtml = typeof parseData.parse?.text === "string"
            ? parseData.parse.text
            : parseData.parse?.text?.["*"] ?? "";
          if (!rawHtml || rawHtml.length > MAX_ARTICLE_HTML_CHARS) return [hit.pageid, null] as const;
          const sourceUrl = `https://en.wikipedia.org/?curid=${hit.pageid}`;
          const article = extractReadableArticle(rawHtml, sourceUrl);
          if (!article) return [hit.pageid, null] as const;
          return [hit.pageid, {
            title: article.title || parseData.parse?.title || hit.title,
            extract: article.textContent.slice(0, 1800),
          }] as const;
        } catch {
          // A failed/unsupported article parse falls back to the provider's search excerpt.
          return [hit.pageid, null] as const;
        }
      }));
      const byId = new Map(parsedPages);
      setSources(hits.map((hit) => {
        const article = byId.get(hit.pageid);
        return {
          id: `wikipedia:${hit.pageid}`,
          title: article?.title ?? hit.title,
          url: `https://en.wikipedia.org/?curid=${hit.pageid}`,
          extract: article?.extract ?? hit.snippet.replace(/<[^>]*>/g, "").slice(0, 1800),
          provider: article ? "WIKIPEDIA · READABLE ARTICLE" : "WIKIPEDIA · SEARCH EXCERPT",
        };
      }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Research request failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="research-workspace" aria-label="Source research workspace">
      <div className="research-policy-note">
        <strong>Live source lookup · Wikipedia and Crossref</strong>
        <p>Search Wikipedia article text (cleaned locally with Mozilla Readability) or Crossref academic metadata and abstracts. If article extraction is unavailable, Awwab falls back to the search excerpt. Results are source material, not verified conclusions; retrieved content is untrusted and cannot authorize actions. This is not a general-purpose web crawler or independent fact-checker.</p>
      </div>
      <form className="research-form" onSubmit={(event) => void runResearch(event)}>
        <label>
          Source collection
          <select value={provider} onChange={(event) => setProvider(event.target.value as "wikipedia" | "crossref")}>
            <option value="wikipedia">Wikipedia · encyclopedia</option>
            <option value="crossref">Crossref · academic publications</option>
          </select>
        </label>
        <label>
          Research question or topic
          <input value={query} onChange={(event) => setQuery(event.target.value)} maxLength={200} placeholder="Search a topic, person, technology, or concept…" required />
        </label>
        <button className="primary" type="submit" disabled={loading || query.trim().length < 2}>{loading ? "Searching sources…" : "Find sources"}</button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="research-results-heading">
        <div><p className="eyebrow">SOURCE REGISTER</p><h2>{loading ? "Gathering source material" : "Results and citations"}</h2></div>
        <span>{sources.length} {sources.length === 1 ? "source" : "sources"}</span>
      </div>
      {!loading && searched && !error && sources.length === 0 && <div className="empty-state"><h2>No sources found.</h2><p>Try a broader or differently worded search.</p></div>}
      <div className="research-results">
        {sources.map((source, index) => (
          <article className="research-source" key={source.id}>
            <div className="research-source-top">
              <span className="research-source-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="research-source-status">{source.provider} · NOT VERIFIED</span>
            </div>
            <h3>{source.title}</h3>
            {source.metadata && <p className="muted">{source.metadata}</p>}
            <p>{source.extract || "No introductory extract is available for this source."}</p>
            <a href={source.url} target="_blank" rel="noreferrer">Open original source ↗</a>
          </article>
        ))}
      </div>
      <p className="research-footer">Use the source links to verify important claims. Search ranking is supplied by the selected provider; Awwab does not independently verify factual accuracy, completeness, or neutrality.</p>
    </section>
  );
}
