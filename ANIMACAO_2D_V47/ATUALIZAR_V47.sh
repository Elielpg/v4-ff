#!/usr/bin/env bash
set -euo pipefail
stage_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
game_dir="${1:-$PWD}"
echo 'V47: conferindo arquivos, versão e backup antes de atualizar…'
node "$stage_dir/payload/scripts/animation-update.js" --apply "$stage_dir/payload" "$game_dir"
cd -- "$game_dir"
npm run build
echo 'V47 pronta. Backup informado acima. IA, voz, modelos e dados locais preservados.'
echo 'Execute: bash restart.sh'
echo 'Abra http://127.0.0.1:3000/?v=47.0.0'
