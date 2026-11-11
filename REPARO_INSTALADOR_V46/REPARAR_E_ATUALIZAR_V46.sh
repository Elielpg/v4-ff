#!/usr/bin/env bash
set -euo pipefail
repair_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
game_dir="${1:-$PWD}"
original_dir="${2:-${TMPDIR:?Execute dentro do Termux}/ben10-v46/BEN10_HEROIS_VILOES_V46}"
if ! command -v node >/dev/null 2>&1; then
  echo 'Node não encontrado. Execute no Termux onde o Ben já funciona.' >&2
  exit 1
fi
python3 - "$repair_dir/patch" "$original_dir/payload" <<'PY'
import datetime, hashlib, json, os, pathlib, shutil, sys
patch, payload = (pathlib.Path(x) for x in sys.argv[1:])
changed = ['scripts/campaign-update.js', 'scripts/update-stop.js',
           'scripts/local-ai/project-processes.js', 'tests/update-stop.test.js']
def check_path(root, name):
    rel = pathlib.PurePosixPath(name)
    if rel.is_absolute() or any(x in ('', '.', '..') for x in rel.parts) or '\\' in name:
        raise ValueError('Caminho inválido no manifesto.')
    current = root
    for part in rel.parts:
        current = current / part
        if current.is_symlink():
            raise ValueError('Link simbólico encontrado no pacote: ' + name)
    return current
try:
    old = json.loads((payload / 'manifest.json').read_text())
    manifest = json.loads((patch / 'manifest.json').read_text())
    if any(m.get('version') != '46.0.0' or m.get('kind') != 'campaign-update' for m in (old, manifest)):
        raise ValueError('Esta correção requer o pacote V46 já extraído.')
    entries = manifest.get('files', [])
    if len(entries) != 47 or len({f['name'] for f in entries}) != 47:
        raise ValueError('Manifesto do reparo incompleto.')
    for entry in entries:
        name = entry['name']
        source = check_path(patch if name in changed else payload, name)
        if hashlib.sha256(source.read_bytes()).hexdigest() != entry['sha256']:
            raise ValueError('Arquivo ausente ou diferente do esperado: ' + name)
    backup = payload.parent / ('backup-instalador-' + datetime.datetime.now().strftime('%Y%m%d-%H%M%S') + '-' + str(os.getpid()))
    backup.mkdir()
    for name in changed + ['manifest.json']:
        dest = check_path(payload, name)
        if dest.exists():
            saved = backup / name
            saved.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(dest, saved)
        dest.parent.mkdir(parents=True, exist_ok=True)
        temporary = dest.with_name(dest.name + '.repair-' + str(os.getpid()))
        shutil.copyfile(patch / name, temporary)
        os.replace(temporary, dest)
    print('Instalador corrigido no pacote temporário. Conferidos 47 arquivos.')
    print('Cópia anterior do instalador: ' + str(backup))
except (OSError, ValueError, KeyError, TypeError) as error:
    print('Reparo interrompido: ' + str(error), file=sys.stderr)
    print('Se o pacote temporário não existe mais, baixe BEN10_HEROIS_VILOES_V46_R1.zip e use o instalador dele.', file=sys.stderr)
    sys.exit(1)
PY
node "$original_dir/payload/scripts/campaign-update.js" --apply "$original_dir/payload" "$game_dir"
cd -- "$game_dir"
npm run build
echo 'V46 instalada com o reparo R1. Dados e modelos locais preservados.'
echo 'Execute: bash restart.sh'
echo 'Abra http://127.0.0.1:3000/?v=46.0.0'
