import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "../../../lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("briefings")
      .select(
        "id, briefing_date, cv_section, llm_section, multimodal_section, sources, raw_markdown, created_at"
      )
      .order("briefing_date", { ascending: false })
      .limit(365);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ briefings: data });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
