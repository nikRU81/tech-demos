import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChatPanel } from "@/components/chat-panel";
import { NotesPanel } from "@/components/notes-panel";
import { isConfigured } from "@/lib/supermemory";

export const dynamic = "force-dynamic";

export default function Home() {
  const configured = isConfigured();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 p-6 md:p-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Supermemory Playground</h1>
        <p className="text-sm text-muted-foreground">
          Add notes, then recall them in chat — memories persist across sessions via the{" "}
          <a
            href="https://supermemory.ai/docs/memory-api/sdks/typescript"
            className="underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            Supermemory Memory API
          </a>
          .
        </p>
      </header>

      {!configured && (
        <Alert variant="destructive">
          <AlertTitle>SUPERMEMORY_API_KEY is not set</AlertTitle>
          <AlertDescription>
            Copy <code className="font-mono">.env.example</code> to{" "}
            <code className="font-mono">.env.local</code> and add your API key from{" "}
            <a
              href="https://console.supermemory.ai"
              className="underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              console.supermemory.ai
            </a>
            . Writes and recall are disabled until then.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid flex-1 gap-6 lg:grid-cols-2">
        <NotesPanel configured={configured} />
        <ChatPanel configured={configured} />
      </div>
    </main>
  );
}
