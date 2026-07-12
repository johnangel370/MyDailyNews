import ReactMarkdown, { type Options } from "react-markdown";
import remarkGfm from "remark-gfm";

import { makeHighlightPlugin } from "@/lib/rehype-highlight";
import { cn } from "@/lib/utils";

export function MarkdownContent({
  children,
  className,
  highlight,
}: {
  children: string;
  className?: string;
  // When set, case-insensitive matches are wrapped in <mark> (search).
  highlight?: string;
}) {
  const rehypePlugins: Options["rehypePlugins"] = highlight?.trim()
    ? [makeHighlightPlugin(highlight)]
    : [];

  return (
    <div
      className={cn(
        "prose max-w-none dark:prose-invert",
        "prose-headings:font-display prose-a:text-topic-accent",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={rehypePlugins}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
