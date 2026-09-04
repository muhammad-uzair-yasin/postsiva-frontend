export type LegalBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "note"; text: string };

export type LegalSection = {
  id: string;
  title: string;
  blocks: LegalBlock[];
  subsections?: LegalSection[];
};

export type LegalTocItem = {
  id: string;
  label: string;
};

export type LegalDocument = {
  title: string;
  lastUpdated: string;
  effectiveDate: string;
  intro?: string;
  notice?: string;
  toc: LegalTocItem[];
  sections: LegalSection[];
  footer?: string;
};
