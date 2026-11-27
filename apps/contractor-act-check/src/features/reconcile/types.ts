export type ContractLine = {
  id: string;
  workType: string;
  unit: string;
  contractedVolume: number;
  unitPriceRub: number;
};

export type Contract = {
  id: string;
  title: string;
  siteName: string;
  contractorName: string;
  customerName: string;
  lines: ContractLine[];
};

export type ActLine = {
  lineNo: number;
  workType: string;
  unit: string;
  periodVolume: number;
  cumulativeVolume: number;
  unitPriceRub: number;
  amountRub: number;
};

export type ExtractedAct = {
  actId: string;
  actNumber: string;
  periodLabel: string;
  documentDate: string;
  lines: ActLine[];
};

export type LineStatus = "ok" | "volume_over" | "price_over" | "not_in_contract";

export type ReconciledLine = {
  actLine: ActLine;
  contractLine: ContractLine | null;
  status: LineStatus;
  deviationRub: number;
  detail: string;
};

export type ReconciliationResult = {
  lines: ReconciledLine[];
  actTotalRub: number;
  overstatedRub: number;
  overstatedPct: number;
  verdict: "accept" | "return";
  reasons: string[];
};