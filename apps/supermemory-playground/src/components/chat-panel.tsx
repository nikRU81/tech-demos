"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { RecallResponse } from "@/lib/types";

interface ChatPanelProps {
  configured: boolean;
}

interface ChatTurn {
  question: string;
  response?: RecallResponse;
  error?: string;
}

export function ChatPanel({ configured }: ChatPanelProps) {
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [asking, setAsking] = useState(false);

  async function handleAsk() {
    const q = question.trim();
    if (!q || asking) return;
    setAsking(true);
    setQuestion("");
    try {
      const res = await fetch("/api/recall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Recall failed");
      setTurns((prev) => [...prev, { question: q, response: data }]);
    } catch (err) {
      setTurns((prev) => [
        ...prev,
        { question: q, error: err instanceof Error ? err.message : "Recall failed" },
      ]);
    } finally {
      setAsking(false);
    }
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Chat / recall</CardTitle>
        <CardDescription>
          Ask a question — the answer is grounded in memories recalled via Supermemory profile + search.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <ScrollArea className="h-[430px] pr-3">
          {turns.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Try: &ldquo;What is my favorite programming language?&rdquo;
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {turns.map((turn, i) => (
                <ChatTurnView key={i} turn={turn} />
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="flex gap-2">
          <Input
            placeholder={configured ? "Ask about your memories..." : "Set SUPERMEMORY_API_KEY to chat"}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            disabled={!configured || asking}
          />
          <Button onClick={handleAsk} disabled={!configured || asking || !question.trim()}>
            {asking ? "Recalling..." : "Ask"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ChatTurnView({ turn }: { turn: ChatTurn }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="self-end rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
        {turn.question}
      </div>
      {turn.error ? (
        <div className="self-start rounded-lg border border-destructive/50 px-3 py-2 text-sm text-destructive">
          {turn.error}
        </div>
      ) : turn.response ? (
        <div className="flex max-w-[90%] flex-col gap-2 self-start rounded-lg bg-muted px-3 py-2">
          <p className="whitespace-pre-wrap text-sm">{turn.response.answer}</p>
          {turn.response.results.length > 0 && (
            <div className="flex flex-col gap-1 border-t pt-2">
              <p className="text-xs font-medium text-muted-foreground">Recalled memories</p>
              {turn.response.results.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5 shrink-0">
                    {(r.similarity * 100).toFixed(0)}%
                  </Badge>
                  <p className="text-xs text-muted-foreground">{r.text}</p>
                </div>
              ))}
            </div>
          )}
          {(turn.response.profile.static.length > 0 || turn.response.profile.dynamic.length > 0) && (
            <div className="flex flex-col gap-1 border-t pt-2">
              <p className="text-xs font-medium text-muted-foreground">Profile facts</p>
              {[...turn.response.profile.static, ...turn.response.profile.dynamic]
                .slice(0, 5)
                .map((fact, i) => (
                  <p key={i} className="text-xs text-muted-foreground">
                    • {fact}
                  </p>
                ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
