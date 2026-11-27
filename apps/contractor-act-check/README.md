# contractor-act-check

Демо: менеджер за минуту сверяет скан акта КС-2 с договорной ведомостью, видит завышения по объёму и цене в рублях и получает вердикт «Принять» / «Вернуть на доработку». Все данные синтетические.

## Стек

- Bun, Next.js App Router, shadcn/ui
- Извлечение строк акта: [@google/genai](https://www.npmjs.com/package/@google/genai) на сервере; вдохновение и agent-tool — [gemini-api-cli](https://github.com/google-gemini/gemini-api-cli) (см. `scripts/extract-with-cli.sh`)
- Сверка позиций: чистый TypeScript в `src/features/reconcile/`

## Запуск

```bash
cd apps/contractor-act-check
bun install
bun run scripts/generate-act-scans.ts   # PNG сканов (нужен sharp)
bun run dev
```

Тесты логики сверки:

```bash
bun test
```

## Переменные окружения

Скопируйте `.env.example` в `.env.local`. Без `GEMINI_API_KEY` приложение работает в **демо-режиме** (заранее извлечённый JSON для трёх bundled-актов, баннер «демо-режим, без ключа»).

## Что на экране

- Выбор акта КС-2 (февраль / март / апрель 2026)
- Слева: скан формы, справа: договор (~18 позиций) для «Площадка А, участок трубопроводов Т-12»
- Таблица сверки: OK / перебор объёма / цена выше договора / нет в договоре, отклонение в ₽
- Полоса итогов и вердикт с краткими причинами

## Vercel

В корне приложения лежит `vercel.json` с `{"framework":"nextjs"}`. Укажите Root Directory `apps/contractor-act-check` в настройках проекта.