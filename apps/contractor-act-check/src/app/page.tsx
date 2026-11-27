import { ActCheckDashboard } from "@/features/dashboard/act-check-dashboard";
import { isGeminiConfigured } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export default function Home() {
  const geminiConfigured = isGeminiConfigured();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 p-6 md:p-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Проверка акта КС-2 по договору
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Менеджер за минуту сравнивает скан акта с договорной ведомостью, видит завышения по
          объёму и цене в рублях и получает вердикт. Извлечение строк акта powered by{" "}
          <a
            href="https://github.com/google-gemini/gemini-api-cli"
            className="underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            Google Gemini
          </a>{" "}
          (multimodal) или демо-JSON без ключа.
        </p>
      </header>

      <ActCheckDashboard geminiConfigured={geminiConfigured} />
    </main>
  );
}