import { describe, expect, test } from "bun:test";
import { parseExtractedAct } from "./parse-extraction";
import act from "@/data/extractions/act-2026-03.json";

describe("parseExtractedAct", () => {
  test("принимает корректный акт", () => {
    expect(parseExtractedAct(act).lines.length).toBeGreaterThan(0);
  });

  test("отклоняет не-объект и пустые строки", () => {
    expect(() => parseExtractedAct("x")).toThrow();
    expect(() => parseExtractedAct({ ...act, lines: [] })).toThrow();
  });

  test("отклоняет строку с нечисловой суммой", () => {
    const broken = { ...act, lines: [{ ...act.lines[0], amountRub: "100" }] };
    expect(() => parseExtractedAct(broken)).toThrow();
  });
});
