"use client";

import { RISK_REGISTER } from "@/data/risk-register";
import { filteredScore, heatColor, isInspectionOverdue } from "@/features/risk/scoring";
import type { RiskFilter } from "@/features/risk/types";
import { UNIT_OVERLAY_PATHS } from "./geometry";
import { StationArtContent } from "./station-art";
import { FIG_H, FIG_W, UNIT_LABEL_POSITIONS } from "./view";
import { useCallback, useEffect, useMemo } from "react";

const AS_OF = new Date("2026-02-19T12:00:00Z");

interface StationDiagramProps {
  filter: RiskFilter;
  selectedUnitId: string | null;
  onSelectUnit: (unitId: string | null) => void;
  onHoverUnit: (unitId: string | null) => void;
}

export function StationDiagram({ filter, selectedUnitId, onSelectUnit, onHoverUnit }: StationDiagramProps) {
  const colors = useMemo(() => {
    const map = new Map<string, string>();
    for (const unit of RISK_REGISTER) {
      const score = filteredScore(unit, filter);
      map.set(unit.unitId, heatColor(score));
    }
    return map;
  }, [filter]);

  const handlePointer = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      const target = (event.target as Element | null)?.closest("[data-unit-id]");
      const id = target?.getAttribute("data-unit-id") ?? null;
      if (event.type === "click" && id) {
        onSelectUnit(id === selectedUnitId ? null : id);
      }
      if (event.type === "pointermove") {
        onHoverUnit(id);
      }
    },
    [onSelectUnit, onHoverUnit, selectedUnitId],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onSelectUnit(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSelectUnit]);

  return (
    <div
      className="station-diagram w-full overflow-hidden rounded-lg border bg-card"
      onPointerLeave={() => onHoverUnit(null)}
    >
      <div className="iso mx-auto w-full" data-theme="light">
        <svg
          className="station-svg w-full max-w-full"
          viewBox={`0 0 ${FIG_W} ${FIG_H}`}
          role="img"
          aria-label="Isometric pumping station risk heatmap"
          onPointerMove={handlePointer}
          onClick={handlePointer}
        >
          <StationArtContent />
          <g className="risk-overlays" aria-hidden pointerEvents="none">
            {RISK_REGISTER.map((unit) => {
              const path = UNIT_OVERLAY_PATHS[unit.unitId];
              const active = selectedUnitId === unit.unitId;
              const dimmed = filter !== "all" && unit.riskType !== filter;
              return (
                <path
                  key={unit.unitId}
                  d={path}
                  fill={colors.get(unit.unitId) ?? "transparent"}
                  fillOpacity={dimmed ? 0.06 : active ? 0.5 : 0.32}
                  stroke={active ? "currentColor" : "none"}
                  strokeWidth={active ? 1.2 : 0}
                />
              );
            })}
            {RISK_REGISTER.map((unit) => {
              if (!isInspectionOverdue(unit, AS_OF)) return null;
              const pos = UNIT_LABEL_POSITIONS[unit.unitId];
              if (!pos) return null;
              return (
                <g key={`od-${unit.unitId}`} transform={`translate(${pos[0] + 14}, ${pos[1] - 18})`}>
                  <circle r={7} className="fill-destructive" />
                  <text textAnchor="middle" dominantBaseline="central" className="fill-destructive-foreground text-[8px] font-semibold">
                    !
                  </text>
                </g>
              );
            })}
          </g>
          <g className="station-hit-targets">
            {RISK_REGISTER.map((unit) => (
              <path
                key={`hit-${unit.unitId}`}
                data-unit-id={unit.unitId}
                d={UNIT_OVERLAY_PATHS[unit.unitId]}
                fill="transparent"
                stroke="none"
                className="cursor-pointer focus:outline-none"
                tabIndex={0}
                role="button"
                aria-label={unit.label}
                onFocus={() => onHoverUnit(unit.unitId)}
                onBlur={() => onHoverUnit(null)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectUnit(unit.unitId === selectedUnitId ? null : unit.unitId);
                  }
                }}
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
