import { NextResponse } from "next/server";
import { getBundledExtraction } from "@/data/extractions";
import { extractActFromImage, isGeminiConfigured } from "@/lib/gemini";
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function POST(request: Request) {
  const body = (await request.json()) as { actId?: string };
  const actId = body.actId?.trim();

  if (!actId) {
    return NextResponse.json({ error: "actId обязателен" }, { status: 400 });
  }

  const bundled = getBundledExtraction(actId);
  if (!bundled) {
    return NextResponse.json({ error: "Неизвестный акт" }, { status: 404 });
  }

  if (!isGeminiConfigured()) {
    return NextResponse.json({
      extraction: bundled,
      demoMode: true,
      source: "bundled",
    });
  }

  try {
    const imagePath = path.join(
      process.cwd(),
      "public",
      "acts",
      `${actId}.png`,
    );
    const buffer = await readFile(imagePath);
    const extraction = await extractActFromImage(
      buffer.toString("base64"),
      "image/png",
      actId,
    );
    return NextResponse.json({
      extraction,
      demoMode: false,
      source: "gemini",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ошибка извлечения";
    return NextResponse.json(
      {
        extraction: bundled,
        demoMode: true,
        source: "bundled-fallback",
        warning: message,
      },
      { status: 200 },
    );
  }
}