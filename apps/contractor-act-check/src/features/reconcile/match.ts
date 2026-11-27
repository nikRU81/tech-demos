import type {
  ActLine,
  Contract,
  ContractLine,
  ReconciledLine,
  ReconciliationResult,
  LineStatus,
} from "./types";
import { normalizeWorkType } from "./normalize";

const PRICE_EPSILON = 0.01;
const VOLUME_EPSILON = 0.001;

function findContractLine(
  actLine: ActLine,
  contract: Contract,
  cumulativeByContractId: Map<string, number>,
): ContractLine | null {
  const target = normalizeWorkType(actLine.workType);
  const exact = contract.lines.find(
    (line) =>
      normalizeWorkType(line.workType) === target && line.unit === actLine.unit,
  );
  if (exact) return exact;

  return (
    contract.lines.find((line) => {
      const normalized = normalizeWorkType(line.workType);
      return (
        line.unit === actLine.unit &&
        (normalized.includes(target) || target.includes(normalized))
      );
    }) ?? null
  );
}

function lineStatus(
  actLine: ActLine,
  contractLine: ContractLine | null,
  priorCumulative: number,
): { status: LineStatus; deviationRub: number; detail: string } {
  if (!contractLine) {
    return {
      status: "not_in_contract",
      deviationRub: actLine.amountRub,
      detail: "Позиция отсутствует в договорной ведомости",
    };
  }

  const priceDelta = actLine.unitPriceRub - contractLine.unitPriceRub;
  const inferredPrior =
    actLine.cumulativeVolume > actLine.periodVolume
      ? actLine.cumulativeVolume - actLine.periodVolume
      : priorCumulative;
  const reportedCumulative =
    actLine.cumulativeVolume > 0
      ? actLine.cumulativeVolume
      : priorCumulative + actLine.periodVolume;
  const volumeOverContract =
    reportedCumulative - contractLine.contractedVolume;
  const periodOverRemaining =
    actLine.periodVolume -
    Math.max(0, contractLine.contractedVolume - inferredPrior);

  let status: LineStatus = "ok";
  let deviationRub = 0;
  const details: string[] = [];

  if (volumeOverContract > VOLUME_EPSILON) {
    status = "volume_over";
    const excessVolume = Math.min(actLine.periodVolume, volumeOverContract);
    deviationRub += excessVolume * contractLine.unitPriceRub;
    details.push(
      `Накопленный объём ${reportedCumulative.toFixed(2)} ${actLine.unit} превышает договор ${contractLine.contractedVolume} ${actLine.unit}`,
    );
  } else if (periodOverRemaining > VOLUME_EPSILON) {
    status = "volume_over";
    deviationRub += periodOverRemaining * contractLine.unitPriceRub;
    details.push(
      `Объём за период превышает остаток по договору на ${periodOverRemaining.toFixed(2)} ${actLine.unit}`,
    );
  }

  if (priceDelta > PRICE_EPSILON) {
    const priceDeviation = actLine.periodVolume * priceDelta;
    if (status === "ok") {
      status = "price_over";
      deviationRub = priceDeviation;
    } else {
      deviationRub += priceDeviation;
    }
    details.push(
      `Цена ${actLine.unitPriceRub.toLocaleString("ru-RU")} ₽ выше договорной ${contractLine.unitPriceRub.toLocaleString("ru-RU")} ₽`,
    );
  }

  if (status === "ok") {
    return {
      status,
      deviationRub: 0,
      detail: "Соответствует договору",
    };
  }

  return {
    status,
    deviationRub: Math.round(deviationRub * 100) / 100,
    detail: details.join("; "),
  };
}

export function reconcileAct(
  contract: Contract,
  actLines: ActLine[],
): ReconciliationResult {
  const cumulativeByContractId = new Map<string, number>();
  for (const line of contract.lines) {
    cumulativeByContractId.set(line.id, 0);
  }

  const reconciled: ReconciledLine[] = [];

  for (const actLine of actLines) {
    const contractLine = findContractLine(
      actLine,
      contract,
      cumulativeByContractId,
    );
    const prior = contractLine
      ? (cumulativeByContractId.get(contractLine.id) ?? 0)
      : 0;
    const evaluation = lineStatus(actLine, contractLine, prior);

    if (contractLine) {
      const next = prior + actLine.periodVolume;
      cumulativeByContractId.set(contractLine.id, next);
    }

    reconciled.push({
      actLine,
      contractLine,
      status: evaluation.status,
      deviationRub: evaluation.deviationRub,
      detail: evaluation.detail,
    });
  }

  const actTotalRub = actLines.reduce((sum, line) => sum + line.amountRub, 0);
  const overstatedRub = reconciled.reduce(
    (sum, line) => sum + line.deviationRub,
    0,
  );
  const overstatedPct =
    actTotalRub > 0 ? Math.round((overstatedRub / actTotalRub) * 1000) / 10 : 0;

  const problemLines = reconciled.filter((line) => line.status !== "ok");
  const reasons = problemLines.map(
    (line) =>
      `Стр. ${line.actLine.lineNo}: ${statusLabel(line.status)} — ${line.detail}`,
  );

  const verdict: ReconciliationResult["verdict"] =
    problemLines.length === 0 ? "accept" : "return";

  if (verdict === "accept") {
    reasons.push("Все позиции в пределах договора по объёму и цене.");
  }

  return {
    lines: reconciled,
    actTotalRub: Math.round(actTotalRub * 100) / 100,
    overstatedRub: Math.round(overstatedRub * 100) / 100,
    overstatedPct,
    verdict,
    reasons,
  };
}

export function statusLabel(status: LineStatus): string {
  switch (status) {
    case "ok":
      return "OK";
    case "volume_over":
      return "Перебор объёма";
    case "price_over":
      return "Цена выше договора";
    case "not_in_contract":
      return "Нет в договоре";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}