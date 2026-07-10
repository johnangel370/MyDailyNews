"use client";

import { useEffect, useMemo, useState } from "react";

const SECTIONS = [
  { key: "all", label: "All sections" },
  { key: "cv_section", label: "Computer Vision" },
  { key: "llm_section", label: "LLM" },
  { key: "multimodal_section", label: "Multimodal" },
];

function sectionText(briefing, sectionKey) {
  if (sectionKey === "all") {
    return [briefing.cv_section, briefing.llm_section, briefing.multimodal_section]
      .filter(Boolean)
      .join("\n\n");
  }
  return briefing[sectionKey] || "";
}

function matchesQuery(briefing, query) {
  if (!query) return true;
  const haystack = [
    briefing.cv_section,
    briefing.llm_section,
    briefing.multimodal_section,
    briefing.raw_markdown,
    briefing.briefing_date,
  ]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export default function HomePage() {
  const [briefings, setBriefings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("all");

  useEffect(() => {
    fetch("/api/briefings")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setErrorMsg(data.error);
        } else {
          setBriefings(data.briefings || []);
        }
      })
      .catch((err) => setErrorMsg(String(err)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return briefings.filter((b) => {
      if (!matchesQuery(b, query)) return false;
      if (section !== "all" && !b[section]) return false;
      return true;
    });
  }, [briefings, query, section]);

  const latest = filtered[0];
  const history = filtered.slice(1);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0d12",
        color: "#e6e8eb",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "2rem 1.5rem 4rem",
      }}
    >
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h1 style={{ fontSize: "1.4rem", margin: 0 }}>Daily AI Briefing</h1>
          <form action="/api/logout" method="POST">
            <button
              type="submit"
              style={{
                background: "transparent",
                border: "1px solid #2a2f3a",
                color: "#9aa0aa",
                borderRadius: "6px",
                padding: "0.35rem 0.7rem",
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
            >
              Log out
            </button>
          </form>
        </header>

        <div
          style={{
            display: "flex",
            gap: "0.6rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Search briefings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: "1 1 220px",
              padding: "0.55rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid #2a2f3a",
              background: "#151821",
              color: "#e6e8eb",
              fontSize: "0.9rem",
            }}
          />
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            style={{
              padding: "0.55rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid #2a2f3a",
              background: "#151821",
              color: "#e6e8eb",
              fontSize: "0.9rem",
            }}
          >
            {SECTIONS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {loading && <p style={{ color: "#9aa0aa" }}>Loading...</p>}
        {errorMsg && <p style={{ color: "#ff6b6b" }}>{errorMsg}</p>}
        {!loading && !errorMsg && filtered.length === 0 && (
          <p style={{ color: "#9aa0aa" }}>No briefings match your search yet.</p>
        )}

        {latest && (
          <section style={{ marginBottom: "2rem" }}>
            <div
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#4c8dff",
                marginBottom: "0.5rem",
              }}
            >
              Latest -- {latest.briefing_date}
            </div>
            <BriefingCard briefing={latest} section={section} highlight />
          </section>
        )}

        {history.length > 0 && (
          <section>
            <div
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#9aa0aa",
                marginBottom: "0.75rem",
              }}
            >
              History
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {history.map((b) => (
                <BriefingCard key={b.id} briefing={b} section={section} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function BriefingCard({ briefing, section, highlight }) {
  const text = sectionText(briefing, section);
  return (
    <div
      style={{
        background: "#151821",
        border: highlight ? "1px solid #4c8dff" : "1px solid #2a2f3a",
        borderRadius: "10px",
        padding: "1.1rem 1.25rem",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: "0.5rem", fontSize: "0.9rem" }}>
        {briefing.briefing_date}
      </div>
      <div
        style={{
          whiteSpace: "pre-wrap",
          fontSize: "0.87rem",
          lineHeight: 1.55,
          color: "#c9cdd6",
        }}
      >
        {text || "(no content for this section)"}
      </div>
      {briefing.sources && (
        <details style={{ marginTop: "0.75rem" }}>
          <summary style={{ cursor: "pointer", color: "#9aa0aa", fontSize: "0.8rem" }}>
            Sources
          </summary>
          <div
            style={{
              whiteSpace: "pre-wrap",
              fontSize: "0.8rem",
              color: "#9aa0aa",
              marginTop: "0.4rem",
            }}
          >
            {briefing.sources}
          </div>
        </details>
      )}
    </div>
  );
}
