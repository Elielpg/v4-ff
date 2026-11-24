#!/usr/bin/env bash
# Independent launcher repair. No game/config/model files are changed.
set -euo pipefail
repair_target="${1:-$HOME/SNAKE_REYERS_TERMUX_0_2}"
if [[ ! -f "$repair_target/start.sh" || ! -d "$repair_target/snake_termux" ]]; then
  printf 'Pasta da adaptação não encontrada: %s\n' "$repair_target" >&2
  exit 1
fi
repair_target="$(cd -- "$repair_target" && pwd)"
mkdir -p "$repair_target/state/launcher-backups"
repair_backup="$(mktemp "$repair_target/state/launcher-backups/start-before-x11-fix.XXXXXX")"
cp -p -- "$repair_target/start.sh" "$repair_backup"
repair_temp="$(mktemp "$repair_target/.start-x11-fix.XXXXXX")"
trap 'rm -f -- "$repair_temp"' EXIT
cat >"$repair_temp" <<'SNAKE_X11_LAUNCHER_V021'
#!/usr/bin/env bash
# Adapter 0.2.1: test the X11 service; Android package queries can fail in Termux.
set -euo pipefail
adapter_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd -- "$adapter_dir"
if [[ $# -gt 0 ]]; then
  project_dir="$1"
else
  if [[ ! -f state/project-path.txt ]]; then
    printf 'Prepare sua cópia original: bash install-termux.sh /caminho/SnakeReyers\n' >&2
    exit 1
  fi
  project_dir="$(cat state/project-path.txt)"
fi
if [[ ! -x .venv/bin/python ]]; then
  printf 'Faltam dependências do painel. Execute bash install-panel.sh\n' >&2
  exit 1
fi
mkdir -p state/logs
if [[ -n "${PREFIX:-}" && "$PREFIX" == /data/* ]]; then
  for required_command in termux-x11 xdpyinfo pulseaudio; do
    if ! command -v "$required_command" >/dev/null 2>&1; then
      printf 'Falta o comando %s no Termux. Confira o preparo dos pacotes X11.\n' "$required_command" >&2
      exit 1
    fi
  done
  export DISPLAY="${DISPLAY:-:1}"
  export XDG_RUNTIME_DIR="${TMPDIR:-$PREFIX/tmp}"
  pulseaudio --check 2>/dev/null || pulseaudio --start --exit-idle-time=-1
  if ! xdpyinfo -display "$DISPLAY" >/dev/null 2>&1; then
    termux-x11 "$DISPLAY" >state/logs/x11.log 2>&1 &
    x11_pid=$!
    trap 'if [[ -n "${x11_pid:-}" ]]; then kill "$x11_pid" 2>/dev/null || true; fi' EXIT
    for _ in {1..40}; do
      if xdpyinfo -display "$DISPLAY" >/dev/null 2>&1; then break; fi
      if ! kill -0 "$x11_pid" 2>/dev/null; then
        printf 'O serviço Termux:X11 encerrou. Últimas mensagens:\n' >&2
        tail -n 30 state/logs/x11.log >&2
        exit 1
      fi
      sleep 0.25
    done
    if ! xdpyinfo -display "$DISPLAY" >/dev/null 2>&1; then
      printf 'O display X11 não ficou pronto. Abra o aplicativo Termux:X11 e confira o log.\n' >&2
      tail -n 30 state/logs/x11.log >&2
      exit 1
    fi
  fi
  am start --user 0 -n com.termux.x11/.MainActivity -d main >state/logs/x11-activity.log 2>&1 || true
fi
printf 'Painel: http://127.0.0.1:9393 | Janela: aplicativo Termux:X11\n'
printf 'Ctrl+C encerra esta execução. Nenhum processo de outros projetos será encerrado.\n'
set +e
.venv/bin/python -m snake_termux --project "$project_dir" --game --reuse-ai 2>&1 | tee -a state/logs/panel.log
launcher_code=${PIPESTATUS[0]}
set -e
printf '%s\n' "$launcher_code" >state/launcher-exit-code.txt
printf 'Painel encerrou com código %s. Log: state/logs/panel.log\n' "$launcher_code"
exit "$launcher_code"
SNAKE_X11_LAUNCHER_V021
bash -n "$repair_temp"
chmod 700 "$repair_temp"
mv -f -- "$repair_temp" "$repair_target/start.sh"
printf 'Detecção X11 corrigida. Backup do iniciador: %s\n' "$repair_backup"
printf 'Configurações, progresso e modelos foram preservados.\n'
