import { parseSourceUrls } from "@/lib/briefing-utils";

// Collapsible list of clickable source links, shown at the bottom of a
// topic card. Renders nothing when the topic has no sources.
export function TopicSources({ sources }: { sources: string }) {
  const urls = parseSourceUrls(sources);
  if (urls.length === 0) return null;

  return (
    <details className="mt-5 border-t pt-3">
      <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
        Sources
      </summary>
      <ul className="mt-2 flex flex-col gap-1">
        {urls.map((url) => (
          <li key={url}>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="break-all text-xs text-muted-foreground underline-offset-2 hover:text-topic-accent hover:underline"
            >
              {url}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
