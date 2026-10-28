import { useState, type FormEvent } from "react";

type SearchHit = { pageid: number; title: string; snippet: string };
type ResearchSource = { pageid: number; title: string; url: string; extract: string };
type SearchResponse = { query?: { search?: SearchHit[] }; error?: { info?: string } };
type ExtractResponse = { query?: { pages?: Record<string, { pageid: number; title: string; extract?: string }> }; error?: { info?: string } };

export function ResearchPanel() {
  const [query, setQuery] = useState("");
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
      const extractUrl = new URL("https://en.wikipedia.org/w/api.php");
      extractUrl.search = new URLSearchParams({
        action: "query", prop: "extracts", exintro: "1", explaintext: "1",
        pageids: hits.map((hit) => hit.pageid).join("|"),
        format: "json", origin: "*",
      }).toString();
      const extractResponse = await fetch(extractUrl, { headers: { Accept: "application/json" } });
      if (!extractResponse.ok) throw new Error(`Source extraction failed (HTTP ${extractResponse.status}).`);
      const extractData = await extractResponse.json() as ExtractResponse;
      if (extractData.error) throw new Error(extractData.error.info ?? "Source extraction failed.");
      const pages = Object.values(extractData.query?.pages ?? {});
      const byId = new Map(pages.map((page) => [page.pageid, page]));
      setSources(hits.flatMap((hit) => {
        const page = byId.get(hit.pageid);
        if (!page) return [];
        return [{
          pageid: page.pageid,
          title: page.title,
          url: `https://en.wikipedia.org/?curid=${page.pageid}`,
          extract: (page.extract ?? hit.snippet.replace(/<[^>]*>/g, "")).slice(0, 1800),
        }];
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
        <strong>Live source lookup · Wikipedia only</strong>
        <p>Searches and extracts are fetched live from Wikipedia’s public API. Results are source material, not verified conclusions; page content is untrusted and cannot authorize actions. This free first integration does not search the entire web.</p>
      </div>
      <form className="research-form" onSubmit={(event) => void runResearch(event)}>
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
          <article className="research-source" key={source.pageid}>
            <div className="research-source-top">
              <span className="research-source-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="research-source-status">SOURCE EXTRACT · NOT VERIFIED</span>
            </div>
            <h3>{source.title}</h3>
            <p>{source.extract || "No introductory extract is available for this page."}</p>
            <a href={source.url} target="_blank" rel="noreferrer">Open original source ↗</a>
          </article>
        ))}
      </div>
      <p className="research-footer">Use the source links to verify important claims. Search ranking is supplied by Wikipedia; Awwab does not independently verify factual accuracy, completeness, or neutrality.</p>
    </section>
  );
}
