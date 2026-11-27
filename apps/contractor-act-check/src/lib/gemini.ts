import "server-only";
import { GoogleGenAI } from "@google/genai";
import type { ExtractedAct } from "@/features/reconcile/types";

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
    model: "gemini-2.0-flash",
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

  return JSON.parse(text) as ExtractedAct;
}