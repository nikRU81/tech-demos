"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import type { MemoryItem, SearchResultItem } from "@/lib/types";

interface NotesPanelProps {
  configured: boolean;
}

export function NotesPanel({ configured }: NotesPanelProps) {
  const [note, setNote] = useState("");
  const [adding, setAdding] = useState(false);
  const [addStatus, setAddStatus] = useState<string | null>(null);
  const [memories, setMemories] = useState<MemoryItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!configured) return;
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load memories");
      setMemories(data.memories);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load memories");
    }
  }, [configured]);

  useEffect(() => {
    // False positive: refresh only sets state after awaiting the fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  async function handleAdd() {
    if (!note.trim()) return;
    setAdding(true);
    setAddStatus(null);
    setError(null);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: note.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add note");
      setNote("");
      setAddStatus(`Saved (status: ${data.status}). Indexing takes a few seconds.`);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add note");
    } finally {
      setAdding(false);
    }
  }

  async function handleSearch() {
    const q = query.trim();
    if (!q) {
      setSearchResults(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setSearchResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Add a note</CardTitle>
          <CardDescription>
            Stored in Supermemory under the <code className="font-mono">playground-demo</code> container tag.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Textarea
            placeholder="e.g. My favorite programming language is TypeScript and I drink oat milk lattes."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={!configured || adding}
            rows={3}
          />
          <div className="flex items-center gap-3">
            <Button onClick={handleAdd} disabled={!configured || adding || !note.trim()}>
              {adding ? "Saving..." : "Save to memory"}
            </Button>
            {addStatus && <span className="text-sm text-muted-foreground">{addStatus}</span>}
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Memories</CardTitle>
          <CardDescription>Search runs hybrid semantic search over your memories.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Input
              placeholder="Search memories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              disabled={!configured}
            />
            <Button variant="secondary" onClick={handleSearch} disabled={!configured || loading}>
              Search
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setSearchResults(null);
                refresh();
              }}
              disabled={!configured || loading}
            >
              Refresh
            </Button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <ScrollArea className="h-[320px] pr-3">
            {searchResults !== null ? (
              <SearchResultList results={searchResults} />
            ) : (
              <MemoryList memories={memories} configured={configured} />
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function MemoryList({
  memories,
  configured,
}: {
  memories: MemoryItem[] | null;
  configured: boolean;
}) {
  if (!configured) {
    return <p className="text-sm text-muted-foreground">Set SUPERMEMORY_API_KEY to load memories.</p>;
  }
  if (memories === null) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  if (memories.length === 0) {
    return <p className="text-sm text-muted-foreground">No memories yet. Add your first note above.</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {memories.map((m) => (
        <li key={m.id} className="rounded-lg border p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{m.title ?? "Untitled note"}</p>
            <Badge variant={m.status === "done" ? "secondary" : "outline"}>{m.status}</Badge>
          </div>
          {m.summary && <p className="mt-1 text-sm text-muted-foreground">{m.summary}</p>}
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(m.createdAt).toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  );
}

function SearchResultList({ results }: { results: SearchResultItem[] }) {
  if (results.length === 0) {
    return <p className="text-sm text-muted-foreground">No matches. Notes may still be indexing.</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {results.map((r) => (
        <li key={r.id} className="rounded-lg border p-3">
          <p className="text-sm">{r.text}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            similarity {(r.similarity * 100).toFixed(0)}%
          </p>
        </li>
      ))}
    </ul>
  );
}
