import { describe, expect, test } from "bun:test";
import { DEMO_CONTRACT } from "@/data/contract";
import act202603 from "@/data/extractions/act-2026-03.json";
import act202604 from "@/data/extractions/act-2026-04.json";
import { reconcileAct, statusLabel } from "./match";
import type { ExtractedAct } from "./types";

describe("reconcileAct", () => {
  test("чистый акт без отклонений получает verdict accept", () => {
    const result = reconcileAct(DEMO_CONTRACT, [
      {
        lineNo: 1,
        workType: "Инструктаж персонала заказчика",
        unit: "чел",
        periodVolume: 4,
        cumulativeVolume: 4,
        unitPriceRub: 2400,
        amountRub: 9600,
      },
    ]);
    expect(result.verdict).toBe("accept");
    expect(result.overstatedRub).toBe(0);
  });

  test("мартовский акт выявляет цену выше договора и лишнюю позицию", () => {
    const act = act202603 as ExtractedAct;
    const result = reconcileAct(DEMO_CONTRACT, act.lines);
    expect(result.verdict).toBe("return");
    const statuses = result.lines.map((line) => line.status);
    expect(statuses).toContain("price_over");
    expect(statuses).toContain("not_in_contract");
    expect(result.overstatedRub).toBeGreaterThan(0);
  });

  test("апрельский акт ловит перебор накопленного объёма", () => {
    const act = act202604 as ExtractedAct;
    const result = reconcileAct(DEMO_CONTRACT, act.lines);
    const insulation = result.lines.find((line) =>
      line.actLine.workType.includes("Разборка изоляции"),
    );
    expect(insulation?.status).toBe("volume_over");
    expect(insulation!.deviationRub).toBeGreaterThan(0);
    expect(result.verdict).toBe("return");
  });

  test("statusLabel покрывает все статусы", () => {
    expect(statusLabel("ok")).toBe("OK");
    expect(statusLabel("volume_over")).toBe("Перебор объёма");
    expect(statusLabel("price_over")).toBe("Цена выше договора");
    expect(statusLabel("not_in_contract")).toBe("Нет в договоре");
  });
});