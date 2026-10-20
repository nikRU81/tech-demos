"use client";

import { RISK_REGISTER, UNITS_BY_ID } from "@/data/risk-register";
import { kpiSnapshot, rankTopActions } from "@/features/risk/ranking";
import {
  daysOverdue,
  daysSince,
  isInspectionOverdue,
  RISK_TYPE_LABEL,
  riskScore,
} from "@/features/risk/scoring";
import type { RiskFilter } from "@/features/risk/types";
import { StationDiagram } from "@/features/station/station-diagram";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useMemo, useState } from "react";

const AS_OF = new Date("2026-02-19T12:00:00Z");

const FILTERS: { value: RiskFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "equipment", label: "Equipment" },
  { value: "hse", label: "HSE" },
  { value: "deadlines", label: "Deadlines" },
];

export function RiskDashboard() {
  const [filter, setFilter] = useState<RiskFilter>("all");
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [hoverUnitId, setHoverUnitId] = useState<string | null>(null);

  const kpis = useMemo(() => kpiSnapshot(RISK_REGISTER, filter, AS_OF), [filter]);
  const topActions = useMemo(() => rankTopActions(RISK_REGISTER, filter, 5, AS_OF), [filter]);
  const selected = selectedUnitId ? UNITS_BY_ID.get(selectedUnitId) : undefined;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 md:p-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Site risk map</h1>
          <p className="text-sm text-muted-foreground">
            Synthetic pumping-station register — click a unit for detail or use the top actions list.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              type="button"
              size="sm"
              variant={filter === f.value ? "default" : "outline"}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Units at high risk (≥15)" value={kpis.highRisk} />
        <KpiCard label="Overdue inspections" value={kpis.overdue} />
        <KpiCard label="Incidents (12 mo)" value={kpis.incidents} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
        <div className="flex flex-col gap-3">
          <StationDiagram
            filter={filter}
            selectedUnitId={selectedUnitId}
            onSelectUnit={setSelectedUnitId}
            onHoverUnit={setHoverUnitId}
          />
          <RiskLegend />
          {hoverUnitId ? (
            <p className="text-xs text-muted-foreground">
              Hovering: {UNITS_BY_ID.get(hoverUnitId)?.label}
            </p>
          ) : null}
        </div>

        <Card className="flex max-h-[calc(100vh-8rem)] flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{selected ? selected.label : "Top 5 actions"}</CardTitle>
            <CardDescription>
              {selected ? "Unit risk card" : "Ranked by score × urgency across the site"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
            {selected ? (
              <UnitRiskCard unit={selected} onClear={() => setSelectedUnitId(null)} />
            ) : (
              <ScrollArea className="min-h-0 flex-1 pr-3">
                <ul className="space-y-3">
                  {topActions.map(({ action, unit, rankScore }) => (
                    <li key={action.id}>
                      <button
                        type="button"
                        className="w-full rounded-lg border bg-muted/30 p-3 text-left transition hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => setSelectedUnitId(unit.unitId)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium text-sm leading-snug">{action.title}</span>
                          <Badge variant="secondary" className="shrink-0 text-[10px]">
                            {rankScore.toFixed(0)}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{unit.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Due {action.dueDate} · {action.effort} effort
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function UnitRiskCard({
  unit,
  onClear,
}: {
  unit: NonNullable<ReturnType<typeof UNITS_BY_ID.get>>;
  onClear: () => void;
}) {
  const score = riskScore(unit);
  const overdue = daysOverdue(unit, AS_OF);
  const elapsed = daysSince(unit.lastInspection, AS_OF);

  return (
    <ScrollArea className="min-h-0 flex-1 pr-3">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Score {score}</Badge>
          <Badge variant="secondary">P{unit.probability} × I{unit.impact}</Badge>
          <Badge>{RISK_TYPE_LABEL[unit.riskType]}</Badge>
          {isInspectionOverdue(unit, AS_OF) ? <Badge variant="destructive">Inspection overdue</Badge> : null}
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Last inspection</p>
            <p>{unit.lastInspection}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Days since / interval</p>
            <p>
              {elapsed}d / {unit.inspectionIntervalDays}d
              {overdue > 0 ? ` (${overdue}d overdue)` : ""}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Incidents (12 mo)</p>
            <p>{unit.incidents12mo}</p>
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">Findings</p>
          <p className="text-sm leading-relaxed">{unit.findings}</p>
        </div>
        <Separator />
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Recommended actions</p>
          <ul className="space-y-2">
            {unit.actions.map((action) => (
              <li key={action.id} className="rounded-md border px-3 py-2 text-sm">
                <p className="font-medium">{action.title}</p>
                <p className="text-xs text-muted-foreground">
                  Due {action.dueDate} · {action.effort} effort
                </p>
              </li>
            ))}
          </ul>
        </div>
        <Button variant="outline" size="sm" onClick={onClear}>
          Back to top 5
        </Button>
      </div>
    </ScrollArea>
  );
}

function RiskLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">Risk heat</span>
      <span className="inline-flex items-center gap-1">
        <span className="h-3 w-8 rounded-sm bg-[rgb(34,120,80)]" /> Low
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="h-3 w-8 rounded-sm bg-[rgb(200,140,40)]" /> Medium
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="h-3 w-8 rounded-sm bg-[rgb(230,50,30)]" /> High
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
          !
        </span>
        Overdue inspection
      </span>
    </div>
  );
}
