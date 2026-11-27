#!/usr/bin/env bash
# Пример вызова Google gemini-api-cli для извлечения таблицы КС-2.
# https://github.com/google-gemini/gemini-api-cli
set -euo pipefail

ACT_IMAGE="${1:-public/acts/act-2026-03.png}"
ACT_ID="${2:-act-2026-03}"

if [[ -z "${GEMINI_API_KEY:-}" ]]; then
  echo "Задайте GEMINI_API_KEY" >&2
  exit 1
fi

if ! command -v gemini-api-cli >/dev/null 2>&1; then
  echo "Установите CLI: go install github.com/google-gemini/gemini-api-cli@latest" >&2
  exit 1
fi

gemini-api-cli \
  --model "${GEMINI_MODEL:-gemini-4-hydrogen}" \
  --prompt "Извлеки строки акта КС-2 в JSON. actId=${ACT_ID}. Только JSON." \
  --file "${ACT_IMAGE}"