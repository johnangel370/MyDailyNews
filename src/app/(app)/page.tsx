import { BriefingView } from "@/components/briefing/briefing-view";

// Home shows only the latest briefing (no history list). Data + chrome come
// from the (app) layout; BriefingView with no date reads the latest from the
// shared FilterContext.
export default function HomePage() {
  return <BriefingView />;
}
