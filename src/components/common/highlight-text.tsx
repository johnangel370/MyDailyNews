import { Fragment } from "react";

import { escapeRegExp } from "@/lib/utils";

// Highlights case-insensitive matches of `query` in a plain-text string
// (used for news-item titles, which are not markdown). Renders the text
// unchanged when there is no query.
export function HighlightText({
  text,
  query,
}: {
  text: string;
  query?: string;
}) {
  const q = query?.trim();
  if (!q) return <>{text}</>;

  // Capturing group -> alternating [text, match, text, ...]; odd = match.
  const parts = text.split(new RegExp(`(${escapeRegExp(q)})`, "ig"));

  return (
    <>
      {parts.map((part, i) =>
        part === "" ? null : i % 2 === 1 ? (
          <mark key={i} className="search-highlight">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}
