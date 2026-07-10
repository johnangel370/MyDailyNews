export function SourcesBlock({ sources }: { sources: string }) {
  return (
    <details className="mt-4 border-t pt-3">
      <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
        Sources
      </summary>
      <div className="mt-2 whitespace-pre-wrap break-words text-xs text-muted-foreground">
        {sources}
      </div>
    </details>
  );
}
