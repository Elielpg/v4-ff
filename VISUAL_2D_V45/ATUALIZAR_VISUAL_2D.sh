#!/usr/bin/env bash
set -euo pipefail
stage_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
game_dir="${1:-$PWD}"
if ! command -v node >/dev/null 2>&1; then
  echo 'Node não encontrado. Execute este arquivo no Termux onde a V44.2 já funciona.' >&2
  exit 1
fi
node "$stage_dir/payload/scripts/visual2d-update.js" --apply "$stage_dir/payload" "$game_dir"
cd -- "$game_dir"
npm run build
echo 'Visual V45 instalado. Os arquivos anteriores estão no backup informado acima.'
echo 'Execute: bash restart.sh'
echo 'Depois abra: http://127.0.0.1:3000/?v=45.0.0'
