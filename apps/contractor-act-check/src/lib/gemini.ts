import "server-only";
import { GoogleGenAI } from "@google/genai";
import type { ExtractedAct } from "@/features/reconcile/types";
import { parseExtractedAct } from "@/features/reconcile/parse-extraction";

// Gemini 4 Hydrogen: multimodal (text, image, PDF), see https://ai.google.dev/gemini-api/docs/models
const DEFAULT_GEMINI_MODEL = "gemini-4-hydrogen";

function geminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

const EXTRACTION_SCHEMA = `{
  "actId": string,
  "actNumber": string,
  "periodLabel": string,
  "documentDate": string (ISO date),
  "lines": [{
    "lineNo": number,
    "workType": string,
    "unit": string,
    "periodVolume": number,
    "cumulativeVolume": number,
    "unitPriceRub": number,
    "amountRub": number
  }]
}`;

export async function extractActFromImage(
  imageBase64: string,
  mimeType: string,
  actId: string,
): Promise<ExtractedAct> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const client = new GoogleGenAI({ apiKey });
  const response = await client.models.generateContent({
    model: geminiModel(),
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Извлеки табличную часть акта выполненных работ КС-2 с изображения. Верни только JSON без markdown по схеме:\n${EXTRACTION_SCHEMA}\nactId должен быть \"${actId}\". Суммы в рублях, числа как decimal.`,
          },
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Пустой ответ Gemini");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Gemini вернул не JSON");
  }
  return parseExtractedAct(parsed);
}