import { BUNDLED_ACTS } from "../src/data/acts";
import { getBundledExtraction } from "../src/data/extractions";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildKs2Svg(actId: string): string {
  const extraction = getBundledExtraction(actId);
  if (!extraction) {
    throw new Error(`Нет данных для ${actId}`);
  }

  const rows = extraction.lines
    .map(
      (line, index) => `
    <g font-family="Courier New, monospace" font-size="11" fill="#1a1a1a">
      <text x="40" y="${200 + index * 28}">${line.lineNo}</text>
      <text x="70" y="${200 + index * 28}">${escapeXml(line.workType.slice(0, 42))}</text>
      <text x="430" y="${200 + index * 28}">${line.unit}</text>
      <text x="480" y="${200 + index * 28}">${line.periodVolume}</text>
      <text x="540" y="${200 + index * 28}">${line.cumulativeVolume}</text>
      <text x="620" y="${200 + index * 28}">${line.unitPriceRub.toLocaleString("ru-RU")}</text>
      <text x="710" y="${200 + index * 28}">${line.amountRub.toLocaleString("ru-RU")}</text>
    </g>`,
    )
    .join("");

  const height = 220 + extraction.lines.length * 28 + 80;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="820" height="${height}" viewBox="0 0 820 ${height}">
  <defs>
    <filter id="paper">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise"/>
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.08 0" in="noise" result="fade"/>
      <feBlend in="SourceGraphic" in2="fade" mode="multiply"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="#f4f1e8" filter="url(#paper)"/>
  <g transform="rotate(-0.6 410 ${height / 2})">
    <text x="40" y="48" font-family="Times New Roman, serif" font-size="22" font-weight="700" fill="#222">Унифицированная форма № КС-2</text>
    <text x="40" y="78" font-family="Arial, sans-serif" font-size="12" fill="#444">Акт о приёмке выполненных работ</text>
    <text x="40" y="108" font-family="Arial, sans-serif" font-size="12" fill="#444">${escapeXml(extraction.actNumber)} · ${escapeXml(extraction.periodLabel)} · дата ${escapeXml(extraction.documentDate)}</text>
    <text x="40" y="138" font-family="Arial, sans-serif" font-size="11" fill="#666">Объект: Площадка А, участок трубопроводов Т-12 (учебные данные)</text>
    <rect x="32" y="160" width="756" height="26" fill="#e8e4da" stroke="#999"/>
    <text x="40" y="178" font-size="10" font-family="Arial" fill="#333">№ | Наименование | Ед. | За период | Накопит. | Цена | Сумма</text>
    ${rows}
    <line x1="32" y1="190" x2="788" y2="190" stroke="#bbb"/>
    <line x1="32" y1="${height - 60}" x2="788" y2="${height - 60}" stroke="#bbb"/>
    <text x="40" y="${height - 36}" font-family="Arial" font-size="11" fill="#555">Подписи сторон: ____________ / ____________</text>
  </g>
  <text x="700" y="30" font-size="9" fill="#aaa" transform="rotate(12 700 30)">СКАН-ДЕМО</text>
</svg>`;
}

async function main() {
  const outDir = path.join(process.cwd(), "public", "acts");
  await mkdir(outDir, { recursive: true });

  let sharp: typeof import("sharp") | null = null;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    sharp = null;
  }

  for (const act of BUNDLED_ACTS) {
    const svg = buildKs2Svg(act.id);
    const svgPath = path.join(outDir, `${act.id}.svg`);
    await writeFile(svgPath, svg, "utf8");

    if (sharp) {
      const pngPath = path.join(outDir, `${act.id}.png`);
      await sharp(Buffer.from(svg)).png().toFile(pngPath);
    }
  }

  console.log("Сгенерированы сканы в public/acts/");
}

main();