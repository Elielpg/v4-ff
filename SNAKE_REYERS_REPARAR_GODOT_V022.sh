#!/usr/bin/env bash
# Repair owned adapter files only; original game and models stay untouched.
set -euo pipefail
repair_target="${1:-$HOME/SNAKE_REYERS_TERMUX_0_2}"
for relative in start.sh snake_termux/native.py snake_termux/__main__.py; do
  if [[ ! -f "$repair_target/$relative" ]]; then
    printf 'Adaptação incompleta ou pasta incorreta: %s\n' "$repair_target/$relative" >&2
    exit 1
  fi
done
repair_target="$(cd -- "$repair_target" && pwd)"
mkdir -p "$repair_target/state/launcher-backups"
repair_backup="$(mktemp -d "$repair_target/state/launcher-backups/godot-v022.XXXXXX")"
repair_stage="$(mktemp -d "$repair_target/.godot-v022.XXXXXX")"
repair_started=0
repair_complete=0
cleanup_repair() {
  if [[ "$repair_started" == 1 && "$repair_complete" != 1 ]]; then
    for relative in start.sh snake_termux/native.py snake_termux/__main__.py; do
      cp -p -- "$repair_backup/$relative" "$repair_target/$relative" || true
    done
    printf 'O reparo não terminou; os arquivos anteriores foram restaurados.\n' >&2
  fi
  rm -rf -- "$repair_stage"
}
trap cleanup_repair EXIT
for relative in start.sh snake_termux/native.py snake_termux/__main__.py; do
  mkdir -p -- "$repair_backup/$(dirname -- "$relative")" "$repair_stage/$(dirname -- "$relative")"
  cp -p -- "$repair_target/$relative" "$repair_backup/$relative"
done
cat >"$repair_stage/start.sh" <<'SNAKE_START_V022'
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
SNAKE_START_V022
cat >"$repair_stage/snake_termux/native.py" <<'SNAKE_NATIVE_V022'
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shlex
import shutil
import subprocess
import sys
import threading
import time
from pathlib import Path

EXPECTED_BYTES = 193264984
EXPECTED_SHA256 = '9a16a7f9596146927ececdbba523b8f0aefc59f0568d898e097f6f2bd598cd97'
NVIDIA_ENV = ('DRI_PRIME', '__GLX_VENDOR_LIBRARY_NAME', '__NV_PRIME_RENDER_OFFLOAD', '__VK_LAYER_NV_optimus')


def verify_original(path: Path) -> dict:
    if not path.is_file() or path.stat().st_size != EXPECTED_BYTES:
        raise ValueError('Não encontrei o SnakeReyers.exe original 0.1.9 completo em game/windows.')
    digest = hashlib.sha256()
    with path.open('rb') as file:
        while chunk := file.read(1024 * 1024):
            digest.update(chunk)
    if digest.hexdigest() != EXPECTED_SHA256:
        raise ValueError('O SHA-256 do jogo difere da versão 0.1.9 conferida. O arquivo foi preservado.')
    return {'bytes': EXPECTED_BYTES, 'sha256': digest.hexdigest(), 'verified': True}


def parse_godot_version(stdout: str, stderr: str = '') -> tuple[int, int, int] | None:
    output = stdout + '\n' + stderr
    output = re.sub(r'\x1b\[[0-?]*[ -/]*[@-~]', '', output).replace('\ufeff', '')
    match = re.search(r'(?m)^\s*(?:Godot Engine\s+v?)?(\d+)\.(\d+)(?:\.(\d+))?(?=[.\s+\-]|$)', output)
    if not match:
        return None
    return int(match[1]), int(match[2]), int(match[3] or 0)


def resolve_godot(value: str | None = None) -> Path:
    binary = value or os.environ.get('SNAKE_GODOT_BIN') or shutil.which('godot') or shutil.which('godot-4')
    if not binary:
        raise ValueError('Falta Godot nativo da série 4.7. Prepare os pacotes Termux/X11.')
    path = Path(binary).expanduser().resolve()
    if not path.is_file() or not os.access(path, os.X_OK):
        raise ValueError('O caminho do Godot nativo não é executável.')
    try:
        result = subprocess.run([str(path), '--version'], capture_output=True, text=True, timeout=10)
    except subprocess.TimeoutExpired as exc:
        raise ValueError('Godot demorou demais ao consultar --version: ' + str(path)) from exc
    details = ' '.join((result.stdout + '\n' + result.stderr).split())[:700] or '(sem saída)'
    if result.returncode:
        raise ValueError(f'Godot não conseguiu executar --version (código {result.returncode}): {details}')
    version = parse_godot_version(result.stdout, result.stderr)
    if version is None:
        raise ValueError('Não foi possível reconhecer a versão do Godot. Saída recebida: ' + details)
    # Godot's PCK loader checks the engine's major/minor, not patch. Termux
    # legitimately prints 4.7.stable.termux; treating a missing patch as an
    # incompatible binary blocked the service before the game could start.
    if version[:2] != (4, 7):
        raise ValueError(f'Godot encontrado: {version[0]}.{version[1]}.{version[2]}. Esta adaptação foi validada com a série 4.7. Executável: {path}')
    return path


def native_command(godot: Path, pack: Path, args: list[str], *, workdir: Path, renderer: str = 'gl_compatibility') -> list[str]:
    if renderer not in ('gl_compatibility', 'mobile'):
        raise ValueError('Renderizador inválido; use gl_compatibility ou mobile.')
    # Desktop launch plans target a second monitor. Termux:X11 normally has one.
    args = list(args)
    for index, value in enumerate(args[:-1]):
        if value == '--':
            break
        if value == '--screen':
            args[index + 1] = '0'
    defaults = ['--main-pack', str(pack), '--path', str(workdir), '--rendering-method', renderer]
    if '--headless' not in args:
        if '--display-driver' not in args:
            defaults += ['--display-driver', 'x11']
        if '--audio-driver' not in args:
            audio_driver = os.environ.get('SNAKE_AUDIO_DRIVER', 'PulseAudio')
            if audio_driver not in ('PulseAudio', 'Dummy'):
                raise ValueError('Driver de áudio inválido; use PulseAudio ou Dummy para diagnóstico.')
            defaults += ['--audio-driver', audio_driver]
    return [str(godot), *defaults, *args]


class NativeGame:
    def __init__(self, project: Path, *, godot: str | None = None, port: int = 9393, state_dir: Path | None = None):
        self.project = project.resolve()
        self.pack = self.project / 'game/windows/SnakeReyers.exe'
        self.godot = resolve_godot(godot)
        self.integrity = verify_original(self.pack)
        self.port = port
        self.state_dir = (state_dir or Path(__file__).resolve().parents[1] / 'state').resolve()
        self.state_dir.mkdir(parents=True, exist_ok=True)
        self.log_path = self.state_dir / 'logs/game-native.log'
        self.log_path.parent.mkdir(parents=True, exist_ok=True)
        self.wrapper = self.state_dir / 'bin/SnakeReyers-native'
        self.process: subprocess.Popen | None = None
        self.log = None
        self.started_at = 0.0
        self.last_exit_code = None
        self.lock = threading.RLock()
        self.renderer = os.environ.get('SNAKE_RENDERER', 'gl_compatibility')
        native_command(self.godot, self.pack, [], workdir=self.state_dir, renderer=self.renderer)

    def prepare_wrapper(self) -> Path:
        self.wrapper.parent.mkdir(parents=True, exist_ok=True)
        shell = shutil.which('bash')
        if not shell:
            raise ValueError('Falta bash para o iniciador nativo.')
        module_root = Path(__file__).resolve().parents[1]
        text = f'#!{shell}\n# Independent adapter; original game remains unchanged.\nexport PYTHONPATH={shlex.quote(str(module_root))}\nexec {shlex.quote(sys.executable)} -m snake_termux.native --project {shlex.quote(str(self.project))} --godot {shlex.quote(str(self.godot))} --workdir {shlex.quote(str(self.state_dir))} -- "$@"\n'
        temporary = self.wrapper.with_suffix('.tmp')
        temporary.write_text(text, encoding='utf-8')
        temporary.chmod(0o700)
        temporary.replace(self.wrapper)
        return self.wrapper

    def status(self) -> dict:
        with self.lock:
            if self.process and self.process.poll() is not None:
                self.last_exit_code = self.process.returncode
                self.process = None
                if self.log:
                    self.log.close()
                    self.log = None
                with (self.state_dir / 'process-events.jsonl').open('a') as file:
                    file.write(json.dumps({'event': 'game_exit', 'at': time.time(), 'code': self.last_exit_code}) + '\n')
            return {'running': self.process is not None, 'pid': self.process.pid if self.process else None,
                    'started_at': self.started_at, 'last_exit_code': self.last_exit_code, 'log': str(self.log_path),
                    'godot': str(self.godot), 'renderer': self.renderer, 'original_verified': self.integrity['verified'],
                    'automatic_restarts': 0, 'android_validation': 'pending'}

    def start(self) -> dict:
        with self.lock:
            if self.status()['running']:
                return self.status()
            if not os.environ.get('DISPLAY'):
                raise ValueError('DISPLAY não configurado. Inicie Termux:X11 antes do jogo.')
            env = os.environ.copy()
            for name in NVIDIA_ENV:
                env.pop(name, None)
            env['COBRINHA_LIVE_SERVER_URL'] = f'ws://127.0.0.1:{self.port}/ws/godot'
            env['COBRINHA_TERRAIN_EDITOR_FILE'] = str(self.project / 'server/private/cobrinha_terrain_editor.json')
            args = ['--windowed', '--resolution', '720x1280', '--', '--cobrinha-live']
            command = native_command(self.godot, self.pack, args, workdir=self.state_dir, renderer=self.renderer)
            self.log = self.log_path.open('ab', buffering=0)
            try:
                self.process = subprocess.Popen(command, cwd=self.state_dir, env=env, stdout=self.log, stderr=subprocess.STDOUT)
            except Exception:
                self.log.close()
                self.log = None
                raise
            self.started_at = time.time()
            return self.status()

    def stop(self) -> dict:
        with self.lock:
            if self.process and self.process.poll() is None:
                self.process.terminate()
                try:
                    self.process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    self.process.kill()
                    self.process.wait(timeout=5)
            return self.status()


def attach(binding, app, native: NativeGame, *, auto_start: bool = False):
    from fastapi import HTTPException
    from cobrinha_server.services import preview_renderer, session_executor_plan
    old_executable = session_executor_plan.EXPORTED_GAME_EXECUTABLE
    old_dir = session_executor_plan.EXPORTED_GAME_DIR
    wrapper = native.prepare_wrapper()
    binding.replace_aliases(old_executable, wrapper)
    binding.replace_aliases(old_dir, wrapper.parent)
    app.state.snake_native_game = native

    @app.get('/termux/game')
    def status():
        from cobrinha_server.bridge.godot_bridge import godot_bridge
        return {**native.status(), 'bridge_connected': godot_bridge.status()['connected']}

    @app.post('/termux/game/start')
    def start():
        try:
            return native.start()
        except (ValueError, OSError) as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc

    @app.post('/termux/game/stop')
    def stop():
        return native.stop()

    if auto_start:
        app.add_event_handler('startup', native.start)

    def shutdown():
        native.stop()
        # Version 0.1.9 exposes process handles but has no public stop_preview.
        # Only terminate children actually launched by this server instance.
        for name in ('_PREVIEW_PROCESS', '_TERRAIN_EDITOR_PROCESS'):
            process = getattr(preview_renderer, name, None)
            if process and process.poll() is None:
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait(timeout=5)
        preview_renderer._refresh_process()
    app.add_event_handler('shutdown', shutdown)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--project', required=True, type=Path)
    parser.add_argument('--godot', required=True)
    parser.add_argument('--workdir', required=True, type=Path)
    parser.add_argument('engine_args', nargs=argparse.REMAINDER)
    args = parser.parse_args()
    # Used only by launch plans of the original server, never by model output.
    game = NativeGame(args.project, godot=args.godot, state_dir=args.workdir)
    engine_args = args.engine_args[1:] if args.engine_args[:1] == ['--'] else args.engine_args
    command = native_command(game.godot, game.pack, engine_args, workdir=game.state_dir, renderer=game.renderer)
    env = os.environ.copy()
    for name in NVIDIA_ENV:
        env.pop(name, None)
    os.execvpe(command[0], command, env)


if __name__ == '__main__':
    main()
SNAKE_NATIVE_V022
cat >"$repair_stage/snake_termux/__main__.py" <<'SNAKE_MAIN_V022'
from __future__ import annotations

import argparse
import importlib
import json
import os
import subprocess
import sys
from pathlib import Path

from .client import valid_port


def configure_source(value: str) -> Path:
    root = Path(value).expanduser().resolve()
    source = root / 'server' / 'src'
    if not (source / 'cobrinha_server' / 'main.py').is_file():
        raise ValueError('Não encontrei server/src/cobrinha_server/main.py na pasta original informada.')
    version = (root / 'VERSION').read_text(encoding='utf-8').strip()
    if version.removeprefix('v') != '0.1.9':
        raise ValueError('Este adaptador foi conferido com Snake Reyers 0.1.9. Versão encontrada: ' + version)
    os.environ['COBRINHA_SERVER_DIR'] = str(root / 'server')
    sys.path.insert(0, str(source))
    return root


def main():
    parser = argparse.ArgumentParser(description='Adaptador local independente para Snake Reyers 0.1.9')
    parser.add_argument('--project', required=True, help='Pasta original contendo server, game e VERSION')
    parser.add_argument('--port', type=valid_port, default=9393)
    parser.add_argument('--diagnose', action='store_true', help='Testa serviços locais; não abre o jogo')
    parser.add_argument('--game', action='store_true', help='Conecta o jogo original ao Godot nativo e inicia a janela')
    parser.add_argument('--godot', help='Caminho opcional do Godot 4.7 nativo')
    parser.add_argument('--reuse-ai', action='store_true', help='Reutiliza a instalação Qwen/Piper existente sem baixar modelos')
    args = parser.parse_args()
    try:
        root = configure_source(args.project)
    except (ValueError, OSError) as exc:
        parser.error(str(exc))
    from .integration import install
    original = importlib.import_module('cobrinha_server.main')
    binding = install(original.app)
    native = None
    if args.game:
        from .native import NativeGame, attach
        try:
            native = NativeGame(root, godot=args.godot, port=args.port)
            attach(binding, original.app, native, auto_start=not args.diagnose)
        except (ValueError, OSError) as exc:
            parser.error(str(exc))
    if args.diagnose:
        print(json.dumps({'project': str(root), 'text': binding.local_client().health(), 'voice': binding.local_voice().health(),
                          'graphics': native.status() if native else 'Modo apenas painel. Use --game para carregar o jogo no Godot nativo.'}, ensure_ascii=False, indent=2))
        return
    if args.reuse_ai:
        state = Path(__file__).resolve().parents[1] / 'state'
        (state / 'logs').mkdir(parents=True, exist_ok=True)
        service = {'process': None, 'log': None}

        def start_ai():
            service['log'] = (state / 'logs/local-ai.log').open('ab', buffering=0)
            service['process'] = subprocess.Popen([sys.executable, '-m', 'snake_termux.reuse_ai', '--port', str(args.port), '--state', str(state)], stdout=service['log'], stderr=subprocess.STDOUT)

        def stop_ai():
            process = service['process']
            if process and process.poll() is None:
                process.terminate()
                try:
                    process.wait(timeout=15)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait(timeout=5)
            if service['log']:
                service['log'].close()
        original.app.add_event_handler('startup', start_ai)
        original.app.add_event_handler('shutdown', stop_ai)

        @original.app.get('/termux/services')
        def local_services_status():
            try:
                return json.loads((state / 'ai-services.json').read_text())
            except (OSError, ValueError):
                return {'state': 'starting'}
    import uvicorn
    print(f'Painel adaptado: http://127.0.0.1:{args.port} — Ctrl+C para parar.', flush=True)
    print('Jogo original via Godot nativo ativado.' if native else 'Modo apenas painel; o jogo gráfico não foi iniciado.', flush=True)
    uvicorn.run(original.app, host='127.0.0.1', port=args.port, loop='asyncio', http='h11', ws='wsproto')


if __name__ == '__main__':
    main()
SNAKE_MAIN_V022
if [[ -x "$repair_target/.venv/bin/python" ]]; then
  repair_python="$repair_target/.venv/bin/python"
else
  repair_python="$(command -v python3)"
fi
"$repair_python" - "$repair_stage/snake_termux/native.py" "$repair_stage/snake_termux/__main__.py" <<'SNAKE_CHECK_PYTHON'
import ast, pathlib, sys
for filename in sys.argv[1:]:
    path = pathlib.Path(filename)
    ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
SNAKE_CHECK_PYTHON
bash -n "$repair_stage/start.sh"
chmod 700 "$repair_stage/start.sh"
chmod 600 "$repair_stage/snake_termux/native.py" "$repair_stage/snake_termux/__main__.py"
repair_started=1
for relative in start.sh snake_termux/native.py snake_termux/__main__.py; do
  mv -f -- "$repair_stage/$relative" "$repair_target/$relative"
done
repair_complete=1
printf 'Reconhecimento do Godot 4.7.stable.termux corrigido.\n'
printf 'Backup dos arquivos anteriores: %s\n' "$repair_backup"
printf 'Jogo original, configurações, progresso e modelos foram preservados.\n'
