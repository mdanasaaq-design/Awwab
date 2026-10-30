export type ReadabilityOptions = {
  debug?: boolean;
  maxElemsToParse?: number;
  nbTopCandidates?: number;
  charThreshold?: number;
  classesToPreserve?: string[];
  keepClasses?: boolean;
  disableJSONLD?: boolean;
};

export type ReadabilityArticle = {
  title: string;
  byline: string | null;
  dir: string | null;
  lang: string | null;
  content: string;
  textContent: string;
  length: number;
  excerpt: string | null;
  siteName: string | null;
  publishedTime: string | null;
};

declare class Readability {
  constructor(document: Document, options?: ReadabilityOptions);
  parse(): ReadabilityArticle | null;
}

export default Readability;
