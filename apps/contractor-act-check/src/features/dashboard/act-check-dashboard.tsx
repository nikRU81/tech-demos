"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BUNDLED_ACTS } from "@/data/acts";
import { DEMO_CONTRACT } from "@/data/contract";
import { reconcileAct, statusLabel } from "@/features/reconcile/match";
import type { ExtractedAct, LineStatus } from "@/features/reconcile/types";
import { cn } from "@/lib/utils";

type Props = {
  geminiConfigured: boolean;
};

function statusVariant(status: LineStatus): "default" | "destructive" | "secondary" {
  if (status === "ok") return "secondary";
  return "destructive";
}

function formatRub(value: number): string {
  return `${value.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ₽`;
}

export function ActCheckDashboard({ geminiConfigured }: Props) {
  const [selectedActId, setSelectedActId] = useState(BUNDLED_ACTS[1]!.id);
  const [result, setResult] = useState<{
    actId: string;
    extraction: ExtractedAct | null;
    demoMode: boolean;
    error: string | null;
  } | null>(null);

  const selectedAct = BUNDLED_ACTS.find((act) => act.id === selectedActId)!;
  const loading = result?.actId !== selectedActId;
  const extraction = loading ? null : (result?.extraction ?? null);
  const demoMode = result?.demoMode ?? !geminiConfigured;
  const error = loading ? null : (result?.error ?? null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actId: selectedActId }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Не удалось загрузить извлечение");
        }
        return (await response.json()) as {
          extraction: ExtractedAct;
          demoMode: boolean;
          warning?: string;
        };
      })
      .then((payload) => {
        if (cancelled) return;
        setResult({
          actId: selectedActId,
          extraction: payload.extraction,
          demoMode: payload.demoMode,
          error: payload.warning ?? null,
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setResult({
          actId: selectedActId,
          extraction: null,
          demoMode: !geminiConfigured,
          error: err instanceof Error ? err.message : "Ошибка сети",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [selectedActId, geminiConfigured]);

  const reconciliation = useMemo(() => {
    if (!extraction) return null;
    return reconcileAct(DEMO_CONTRACT, extraction.lines);
  }, [extraction]);

  return (
    <div className="flex flex-col gap-4">
      {(demoMode || !geminiConfigured) && (
        <Alert>
          <AlertTitle>Демо-режим, без ключа</AlertTitle>
          <AlertDescription>
            Используется заранее извлечённый JSON для bundled-актов. Добавьте{" "}
            <code className="font-mono">GEMINI_API_KEY</code> для live-извлечения через Gemini.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Предупреждение</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium" htmlFor="act-select">
          Акт выполненных работ
        </label>
        <select
          id="act-select"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={selectedActId}
          onChange={(event) => setSelectedActId(event.target.value)}
          disabled={loading}
        >
          {BUNDLED_ACTS.map((act) => (
            <option key={act.id} value={act.id}>
              {act.label}
            </option>
          ))}
        </select>
        {loading && <span className="text-xs text-muted-foreground">Загрузка…</span>}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Скан акта КС-2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-md border bg-muted/30 shadow-sm">
              <Image
                src={selectedAct.scanImagePath}
                alt={selectedAct.label}
                fill
                className="object-contain [filter:contrast(1.05)_sepia(0.08)]"
                sizes="(max-width: 768px) 100vw, 400px"
                priority
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Договорная ведомость</CardTitle>
            <p className="text-xs text-muted-foreground">
              {DEMO_CONTRACT.title} · {DEMO_CONTRACT.siteName}
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[420px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Работы</TableHead>
                    <TableHead>Ед.</TableHead>
                    <TableHead className="text-right">Объём</TableHead>
                    <TableHead className="text-right">Цена</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEMO_CONTRACT.lines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell className="max-w-[200px] text-xs">{line.workType}</TableCell>
                      <TableCell className="text-xs">{line.unit}</TableCell>
                      <TableCell className="text-right text-xs">
                        {line.contractedVolume.toLocaleString("ru-RU")}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {line.unitPriceRub.toLocaleString("ru-RU")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {reconciliation && (
        <>
          <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Сумма акта: </span>
              <span className="font-semibold">{formatRub(reconciliation.actTotalRub)}</span>
            </div>
            <Separator orientation="vertical" className="hidden h-6 md:block" />
            <div className="text-sm">
              <span className="text-muted-foreground">Завышение: </span>
              <span className="font-semibold text-destructive">
                {formatRub(reconciliation.overstatedRub)}
              </span>
            </div>
            <Separator orientation="vertical" className="hidden h-6 md:block" />
            <div className="text-sm">
              <span className="text-muted-foreground">Доля завышения: </span>
              <span className="font-semibold">{reconciliation.overstatedPct}%</span>
            </div>
            <Badge
              className={cn(
                "ml-auto text-sm",
                reconciliation.verdict === "accept"
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-600 text-white",
              )}
            >
              {reconciliation.verdict === "accept" ? "Принять" : "Вернуть на доработку"}
            </Badge>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Сверка позиций</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>№</TableHead>
                    <TableHead>Наименование</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Отклонение</TableHead>
                    <TableHead>Комментарий</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reconciliation.lines.map((line) => (
                    <TableRow
                      key={line.actLine.lineNo}
                      className={cn(line.status !== "ok" && "bg-destructive/5")}
                    >
                      <TableCell>{line.actLine.lineNo}</TableCell>
                      <TableCell className="max-w-xs text-sm">{line.actLine.workType}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(line.status)}>
                          {statusLabel(line.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {line.deviationRub > 0 ? formatRub(line.deviationRub) : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{line.detail}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Обоснование решения</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {reconciliation.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}