import "server-only";
import Supermemory from "supermemory";
import type { MemoryItem, RecallResponse, SearchResultItem } from "@/lib/types";

export const CONTAINER_TAG = "playground-demo";

export function isConfigured(): boolean {
  return Boolean(process.env.SUPERMEMORY_API_KEY);
}

let client: Supermemory | null = null;

function getClient(): Supermemory {
  if (!client) {
    // Reads SUPERMEMORY_API_KEY (and optional SUPERMEMORY_BASE_URL) from env.
    client = new Supermemory();
  }
  return client;
}

export async function addNote(content: string): Promise<{ id: string; status: string }> {
  const res = await getClient().add({
    content,
    containerTag: CONTAINER_TAG,
    metadata: { source: "supermemory-playground" },
  });
  return { id: res.id, status: res.status };
}

export async function listMemories(): Promise<MemoryItem[]> {
  const res = await getClient().documents.list({
    containerTags: [CONTAINER_TAG],
    sort: "createdAt",
    order: "desc",
    limit: 50,
  });
  return res.memories.map((m) => ({
    id: m.id,
    title: m.title,
    summary: m.summary,
    status: m.status,
    createdAt: m.createdAt,
  }));
}

export async function searchMemories(q: string): Promise<SearchResultItem[]> {
  const res = await getClient().search.memories({
    q,
    containerTag: CONTAINER_TAG,
    searchMode: "hybrid",
    limit: 10,
  });
  return res.results
    .map((r) => ({
      id: r.id,
      text: r.memory ?? r.chunk ?? "",
      similarity: r.similarity,
      updatedAt: r.updatedAt,
    }))
    .filter((r) => r.text.length > 0);
}

export async function recall(question: string): Promise<RecallResponse> {
  const [profileRes, results] = await Promise.all([
    getClient().profile({ containerTag: CONTAINER_TAG, q: question }),
    searchMemories(question),
  ]);

  const profile = {
    static: profileRes.profile.static,
    dynamic: profileRes.profile.dynamic,
  };

  // MVP: templated answer instead of an LLM call (see PLAN.md "Deferred").
  const answer =
    results.length > 0
      ? `Based on your memories, here is what I recall:\n${results
          .slice(0, 3)
          .map((r, i) => `${i + 1}. ${r.text}`)
          .join("\n")}`
      : "I couldn't find anything relevant in your memories yet. Add a note first — new notes take a few seconds to index.";

  return { answer, results, profile };
}
