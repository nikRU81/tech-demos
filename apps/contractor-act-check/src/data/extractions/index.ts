import type { ExtractedAct } from "@/features/reconcile/types";
import act202602 from "./act-2026-02.json";
import act202603 from "./act-2026-03.json";
import act202604 from "./act-2026-04.json";

const BY_ID: Record<string, ExtractedAct> = {
  "act-2026-02": act202602 as ExtractedAct,
  "act-2026-03": act202603 as ExtractedAct,
  "act-2026-04": act202604 as ExtractedAct,
};

export function getBundledExtraction(actId: string): ExtractedAct | null {
  return BY_ID[actId] ?? null;
}