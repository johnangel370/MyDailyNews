import { escapeRegExp } from "@/lib/utils";

// Minimal hast node shapes -- enough to walk the tree without pulling in
// @types/hast.
interface HastText {
  type: "text";
  value: string;
}
interface HastElement {
  type: "element";
  tagName: string;
  properties?: Record<string, unknown>;
  children: HastNode[];
}
type HastNode = HastText | HastElement | { type: string; children?: HastNode[] };
interface HastParent {
  children: HastNode[];
}

function hasChildren(node: HastNode): node is HastParent & HastNode {
  return Array.isArray((node as HastParent).children);
}

// Rehype plugin factory: wraps case-insensitive matches of `query` in
// <mark class="search-highlight"> so search results highlight the term.
// Written without unist-util-visit to avoid adding a dependency. Matches only
// within a single text node (markdown bold/links split text into nodes; a
// keyword normally lands inside one run, which is good enough).
export function makeHighlightPlugin(query: string) {
  const q = query.trim();

  return function attacher() {
    return function transformer(tree: HastParent) {
      if (!q) return;
      const re = new RegExp(`(${escapeRegExp(q)})`, "ig");

      const walk = (parent: HastParent) => {
        const children = parent.children;
        for (let i = 0; i < children.length; i++) {
          const child = children[i];

          if (child.type === "element" && hasChildren(child)) {
            walk(child as HastParent);
            continue;
          }

          if (child.type === "text") {
            const value = (child as HastText).value;
            // split() with a capturing group yields alternating
            // [text, match, text, match, ...] where odd indexes are matches.
            const parts = value.split(re);
            if (parts.length <= 1) continue;

            const replacement: HastNode[] = [];
            parts.forEach((part, j) => {
              if (part === "") return;
              if (j % 2 === 1) {
                replacement.push({
                  type: "element",
                  tagName: "mark",
                  properties: { className: ["search-highlight"] },
                  children: [{ type: "text", value: part }],
                } as HastElement);
              } else {
                replacement.push({ type: "text", value: part } as HastText);
              }
            });

            children.splice(i, 1, ...replacement);
            // Skip past the freshly inserted nodes (marks only hold plain
            // text, so there is nothing more to highlight inside them).
            i += replacement.length - 1;
          }
        }
      };

      walk(tree);
    };
  };
}
