import type { RecommendedAction, RiskFilter, UnitRisk } from "./types";
import { filteredScore, riskScore, urgencyWeight } from "./scoring";

export interface RankedAction {
  action: RecommendedAction;
  unit: UnitRisk;
  rankScore: number;
}

export function rankTopActions(
  units: UnitRisk[],
  filter: RiskFilter,
  limit = 5,
  asOf: Date = new Date(),
): RankedAction[] {
  const candidates: RankedAction[] = [];
  for (const unit of units) {
    if (filter !== "all" && unit.riskType !== filter) continue;
    const unitUrgency = urgencyWeight(unit, asOf);
    for (const action of unit.actions) {
      const dueMs = new Date(action.dueDate + "T12:00:00Z").getTime();
      const daysToDue = (dueMs - asOf.getTime()) / (1000 * 60 * 60 * 24);
      const dueBoost = daysToDue < 0 ? 8 : daysToDue < 14 ? 4 : 0;
      candidates.push({
        action,
        unit,
        rankScore: unitUrgency + dueBoost,
      });
    }
  }
  return candidates.sort((a, b) => b.rankScore - a.rankScore).slice(0, limit);
}

export function highRiskUnits(units: UnitRisk[], threshold = 15): UnitRisk[] {
  return units.filter((u) => riskScore(u) >= threshold);
}

export function kpiSnapshot(units: UnitRisk[], filter: RiskFilter, asOf: Date = new Date()) {
  const visible = filter === "all" ? units : units.filter((u) => u.riskType === filter);
  const highRisk = visible.filter((u) => filteredScore(u, filter) >= 15).length;
  const overdue = visible.filter((u) => {
    const elapsed =
      Math.floor((asOf.getTime() - new Date(u.lastInspection + "T12:00:00Z").getTime()) / 86400000) -
      u.inspectionIntervalDays;
    return elapsed > 0;
  }).length;
  const incidents = visible.reduce((sum, u) => sum + u.incidents12mo, 0);
  return { highRisk, overdue, incidents, unitCount: visible.length };
}
