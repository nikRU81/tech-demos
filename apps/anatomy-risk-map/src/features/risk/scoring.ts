import type { RiskFilter, RiskType, UnitRisk } from "./types";

export function riskScore(unit: Pick<UnitRisk, "probability" | "impact">): number {
  return unit.probability * unit.impact;
}

export function daysSince(isoDate: string, asOf: Date = new Date()): number {
  const then = new Date(isoDate + "T12:00:00Z");
  const ms = asOf.getTime() - then.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function daysOverdue(unit: UnitRisk, asOf: Date = new Date()): number {
  const elapsed = daysSince(unit.lastInspection, asOf);
  const overdue = elapsed - unit.inspectionIntervalDays;
  return Math.max(0, overdue);
}

export function isInspectionOverdue(unit: UnitRisk, asOf: Date = new Date()): boolean {
  return daysOverdue(unit, asOf) > 0;
}

export function filteredScore(unit: UnitRisk, filter: RiskFilter): number {
  const base = riskScore(unit);
  if (filter === "all") return base;
  return unit.riskType === filter ? base : 0;
}

export function urgencyWeight(unit: UnitRisk, asOf: Date = new Date()): number {
  const score = riskScore(unit);
  const overdue = daysOverdue(unit, asOf);
  const incidentBoost = unit.incidents12mo * 2;
  return score * (1 + overdue / 30) + incidentBoost;
}

export function heatColor(score: number, maxScore = 25): string {
  const t = Math.min(1, Math.max(0, score / maxScore));
  if (t < 0.35) {
    const u = t / 0.35;
    const r = Math.round(34 + u * (180 - 34));
    const g = Math.round(120 + u * (200 - 120));
    const b = Math.round(80 + u * (60 - 80));
    return `rgb(${r},${g},${b})`;
  }
  if (t < 0.7) {
    const u = (t - 0.35) / 0.35;
    const r = Math.round(180 + u * (230 - 180));
    const g = Math.round(200 - u * 80);
    const b = Math.round(60 - u * 40);
    return `rgb(${r},${g},${b})`;
  }
  const u = (t - 0.7) / 0.3;
  const r = Math.round(230 + u * 25);
  const g = Math.round(120 - u * 90);
  const b = Math.round(20 + u * 30);
  return `rgb(${r},${g},${b})`;
}

export const RISK_TYPE_LABEL: Record<RiskType, string> = {
  equipment: "Equipment",
  hse: "HSE",
  deadlines: "Deadlines",
};
