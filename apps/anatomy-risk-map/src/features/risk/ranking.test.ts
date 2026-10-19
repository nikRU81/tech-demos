import { describe, expect, test } from "bun:test";
import { RISK_REGISTER } from "@/data/risk-register";
import { rankTopActions } from "./ranking";
import { filteredScore, riskScore } from "./scoring";

const AS_OF = new Date("2026-02-19T12:00:00Z");

describe("risk scoring", () => {
  test("score is probability times impact", () => {
    expect(riskScore({ probability: 3, impact: 4 })).toBe(12);
  });

  test("filter zeroes non-matching types", () => {
    const unit = RISK_REGISTER.find((u) => u.unitId === "fire-hse")!;
    expect(filteredScore(unit, "hse")).toBe(25);
    expect(filteredScore(unit, "equipment")).toBe(0);
  });
});

describe("rankTopActions", () => {
  test("returns at most five actions", () => {
    const top = rankTopActions(RISK_REGISTER, "all", 5, AS_OF);
    expect(top.length).toBeLessThanOrEqual(5);
    expect(top.length).toBeGreaterThan(0);
  });

  test("hse filter excludes equipment-only units", () => {
    const top = rankTopActions(RISK_REGISTER, "hse", 5, AS_OF);
    expect(top.every((r) => r.unit.riskType === "hse")).toBe(true);
  });

  test("ranking is descending by rankScore", () => {
    const top = rankTopActions(RISK_REGISTER, "all", 5, AS_OF);
    for (let i = 1; i < top.length; i++) {
      expect(top[i - 1]!.rankScore).toBeGreaterThanOrEqual(top[i]!.rankScore);
    }
  });
});
