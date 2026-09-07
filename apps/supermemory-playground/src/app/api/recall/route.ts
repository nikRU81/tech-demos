import { NextResponse } from "next/server";
import { isConfigured, recall } from "@/lib/supermemory";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: "SUPERMEMORY_API_KEY is not set" },
      { status: 503 },
    );
  }
  const body = (await request.json().catch(() => null)) as { question?: string } | null;
  const question = body?.question?.trim();
  if (!question) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }
  try {
    const response = await recall(question);
    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Recall failed" },
      { status: 500 },
    );
  }
}
