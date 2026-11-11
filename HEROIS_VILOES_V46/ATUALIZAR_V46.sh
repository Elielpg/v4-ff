#!/usr/bin/env bash
set -euo pipefail
stage_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
game_dir="${1:-$PWD}"
if ! command -v node >/dev/null 2>&1; then
  echo 'Execute no Termux onde a V45 já funciona; Node não encontrado.' >&2
  exit 1
fi
node "$stage_dir/payload/scripts/campaign-update.js" --apply "$stage_dir/payload" "$game_dir"
cd -- "$game_dir"
npm run build
echo 'V46 instalada. O caminho do backup aparece acima.'
echo 'Execute: bash restart.sh'
echo 'Abra http://127.0.0.1:3000/?v=46.0.0'
