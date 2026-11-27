export type BundledAct = {
  id: string;
  label: string;
  scanImagePath: string;
  extractionPath: string;
  actNumber: string;
  periodLabel: string;
};

export const BUNDLED_ACTS: BundledAct[] = [
  {
    id: "act-2026-02",
    label: "КС-2 № 07/26 за февраль 2026",
    scanImagePath: "/acts/act-2026-02.png",
    extractionPath: "act-2026-02.json",
    actNumber: "КС-2 № 07/26",
    periodLabel: "Февраль 2026",
  },
  {
    id: "act-2026-03",
    label: "КС-2 № 11/26 за март 2026",
    scanImagePath: "/acts/act-2026-03.png",
    extractionPath: "act-2026-03.json",
    actNumber: "КС-2 № 11/26",
    periodLabel: "Март 2026",
  },
  {
    id: "act-2026-04",
    label: "КС-2 № 15/26 за апрель 2026",
    scanImagePath: "/acts/act-2026-04.png",
    extractionPath: "act-2026-04.json",
    actNumber: "КС-2 № 15/26",
    periodLabel: "Апрель 2026",
  },
];