import { MarkdownContent } from "@/components/common/markdown-content";
import { SectionHeading } from "@/components/common/section-heading";
import { Card, CardContent } from "@/components/ui/card";

// Single source of truth for "one AI-topic card" -- reused by the list
// page (Latest/History, one card per visible topic) and the per-date
// detail page, so both stay visually identical via the shared glass Card.
export function TopicSection({ label, text }: { label: string; text: string }) {
  return (
    <section>
      <SectionHeading accent>{label}</SectionHeading>
      <Card variant="glass">
        <CardContent className="pt-6">
          <MarkdownContent>{text}</MarkdownContent>
        </CardContent>
      </Card>
    </section>
  );
}
