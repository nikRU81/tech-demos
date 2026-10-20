export type RiskType = "equipment" | "hse" | "deadlines";

export type Effort = "low" | "medium" | "high";

export interface RecommendedAction {
  id: string;
  title: string;
  effort: Effort;
  dueDate: string;
}

export interface UnitRisk {
  unitId: string;
  label: string;
  probability: number;
  impact: number;
  riskType: RiskType;
  lastInspection: string;
  inspectionIntervalDays: number;
  incidents12mo: number;
  findings: string;
  actions: RecommendedAction[];
}

export type RiskFilter = "all" | RiskType;
