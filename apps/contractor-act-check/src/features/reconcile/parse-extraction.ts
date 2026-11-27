import type { ActLine, ExtractedAct } from "./types";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isActLine(value: unknown): value is ActLine {
  if (typeof value !== "object" || value === null) return false;
  const line = value as Record<string, unknown>;
  return (
    isFiniteNumber(line.lineNo) &&
    typeof line.workType === "string" &&
    typeof line.unit === "string" &&
    isFiniteNumber(line.periodVolume) &&
    isFiniteNumber(line.cumulativeVolume) &&
    isFiniteNumber(line.unitPriceRub) &&
    isFiniteNumber(line.amountRub)
  );
}

export function parseExtractedAct(value: unknown): ExtractedAct {
  if (typeof value !== "object" || value === null) {
    throw new Error("Ответ Gemini не похож на акт: ожидался объект");
  }
  const act = value as Record<string, unknown>;
  if (
    typeof act.actId !== "string" ||
    typeof act.actNumber !== "string" ||
    typeof act.periodLabel !== "string" ||
    typeof act.documentDate !== "string" ||
    !Array.isArray(act.lines) ||
    act.lines.length === 0 ||
    !act.lines.every(isActLine)
  ) {
    throw new Error("Ответ Gemini не соответствует схеме акта");
  }
  return act as unknown as ExtractedAct;
}
