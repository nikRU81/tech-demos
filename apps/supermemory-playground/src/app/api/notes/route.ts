import { NextResponse } from "next/server";
import { addNote, isConfigured, listMemories } from "@/lib/supermemory";

export const dynamic = "force-dynamic";

function notConfigured() {
  return NextResponse.json(
    { error: "SUPERMEMORY_API_KEY is not set" },
    { status: 503 },
  );
}

export async function GET() {
  if (!isConfigured()) return notConfigured();
  try {
    const memories = await listMemories();
    return NextResponse.json({ memories });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list memories" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!isConfigured()) return notConfigured();
  const body = (await request.json().catch(() => null)) as { content?: string } | null;
  const content = body?.content?.trim();
  if (!content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }
  try {
    const result = await addNote(content);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to add note" },
      { status: 500 },
    );
  }
}
