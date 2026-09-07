import { NextResponse } from "next/server";
import { isConfigured, searchMemories } from "@/lib/supermemory";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: "SUPERMEMORY_API_KEY is not set" },
      { status: 503 },
    );
  }
  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "q is required" }, { status: 400 });
  }
  try {
    const results = await searchMemories(q);
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Search failed" },
      { status: 500 },
    );
  }
}
