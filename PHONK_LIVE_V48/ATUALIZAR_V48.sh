#!/usr/bin/env bash
set -euo pipefail
stage_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
game_dir="${1:-$PWD}"
echo 'V48: conferindo arquivos, versão e backup antes de atualizar…'
node "$stage_dir/payload/scripts/phonk-update.js" --apply "$stage_dir/payload" "$game_dir"
cd -- "$game_dir"
npm run build
echo 'V48 pronta. Backup informado acima. IA, voz, modelos e dados locais preservados.'
echo 'Execute: bash restart.sh'
echo 'Abra http://127.0.0.1:3000/?v=48.0.0'
