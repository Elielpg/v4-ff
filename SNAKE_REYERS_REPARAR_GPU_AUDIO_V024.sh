#!/usr/bin/env bash
# Repair this adapter only. No original game, model or private config is replaced.
set -euo pipefail
repair_files_only=0
if [[ "${1:-}" == "--files-only" ]]; then repair_files_only=1; shift; fi
repair_target="${1:-$HOME/SNAKE_REYERS_TERMUX_0_2}"
for relative in start.sh snake_termux/native.py snake_termux/__main__.py; do
  if [[ ! -f "$repair_target/$relative" ]]; then
    printf 'Pasta da adaptação incompleta: %s\n' "$repair_target/$relative" >&2
    exit 1
  fi
done
repair_target="$(cd -- "$repair_target" && pwd)"
repair_python="$repair_target/.venv/bin/python"
if [[ ! -x "$repair_python" ]]; then repair_python="$(command -v python3)"; fi
if [[ "$repair_files_only" == 0 ]]; then
  "$repair_python" - <<'SNAKE_CHECK_RUNNING'
import socket, sys
try:
    connection = socket.create_connection(("127.0.0.1", 9393), timeout=0.5)
except OSError:
    pass
else:
    connection.close()
    sys.exit("Há um serviço na porta 9393. Encerre a sessão do jogo com Ctrl+C antes de aplicar este reparo.")
SNAKE_CHECK_RUNNING
fi
mkdir -p "$repair_target/state/launcher-backups"
repair_backup="$(mktemp -d "$repair_target/state/launcher-backups/gpu-audio-v024.XXXXXX")"
repair_stage="$(mktemp -d "$repair_target/.gpu-audio-v024.XXXXXX")"
repair_started=0
repair_complete=0
repair_files=(start.sh snake_termux/native.py snake_termux/__main__.py snake_termux/device_runtime.py snake_termux/ui.js install-termux.sh)
cleanup_repair() {
  if [[ "$repair_started" == 1 && "$repair_complete" != 1 ]]; then
    for relative in "${repair_files[@]}"; do
      if [[ -f "$repair_backup/$relative" ]]; then
        cp -p -- "$repair_backup/$relative" "$repair_target/$relative" || true
      else
        rm -f -- "$repair_target/$relative"
      fi
    done
    printf 'Reparo interrompido; arquivos anteriores restaurados.\n' >&2
  fi
  rm -rf -- "$repair_stage"
}
trap cleanup_repair EXIT
for relative in "${repair_files[@]}"; do
  mkdir -p -- "$repair_backup/$(dirname -- "$relative")" "$repair_stage/$(dirname -- "$relative")"
  if [[ -f "$repair_target/$relative" ]]; then cp -p -- "$repair_target/$relative" "$repair_backup/$relative"; fi
done
if [[ -f "$repair_target/state/device-config.json" ]]; then
  mkdir -p "$repair_backup/state"
  cp -p -- "$repair_target/state/device-config.json" "$repair_backup/state/device-config.json"
fi
cat >"$repair_stage/start.sh" <<'SNAKE_DEVICE_V024_FILE_0'
#!/usr/bin/env bash
# Audio failure must not block the X11 game window.
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
  for required_command in termux-x11 xdpyinfo; do
    if ! command -v "$required_command" >/dev/null 2>&1; then
      printf 'Falta o comando %s no Termux. Confira o preparo dos pacotes X11.\n' "$required_command" >&2
      exit 1
    fi
  done
  export DISPLAY="${DISPLAY:-:1}"
  export XDG_RUNTIME_DIR="${TMPDIR:-$PREFIX/tmp}"
  # Python starts an owned, private audio server after checking graphics.
  # Never query/start the shared daemon here: it can hang before X11 opens.
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
  am start --user 0 -n com.termux.x11/com.termux.x11.MainActivity >state/logs/x11-activity.log 2>&1 || true
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
SNAKE_DEVICE_V024_FILE_0
cat >"$repair_stage/snake_termux/native.py" <<'SNAKE_DEVICE_V024_FILE_1'
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


def prepare_device(env: dict, state: Path) -> tuple[dict, dict]:
    try:
        from .device_runtime import prepare_game
    except ModuleNotFoundError as exc:
        # Older version-only repairs can still run without the optional module.
        if exc.name != 'snake_termux.device_runtime':
            raise
        return dict(env), {}
    try:
        from .device_runtime import prepare_graphics
    except ImportError:
        return prepare_game(env, state)
    return prepare_graphics(env, state)


def prepare_presentation(env: dict, state: Path, device: dict) -> dict:
    try:
        from .presentation import prepare_display
    except ModuleNotFoundError as exc:
        if exc.name != 'snake_termux.presentation':
            raise
        return device
    return prepare_display(state, env, device)


def finalize_device_audio(env: dict, state: Path, device: dict) -> tuple[dict, dict]:
    try:
        from .device_runtime import finalize_audio
    except ImportError:
        return env, device  # Older optional GPU modules keep their prior behavior.
    try:
        return finalize_audio(env, state, device, requested_sink=os.environ.get('PULSE_SINK'))
    except Exception as exc:
        # Audio is optional for opening the game. Filesystem/adapter errors
        # during this preflight must not abort FastAPI's startup and kill X11.
        error = f'{type(exc).__name__}: {exc}'[:900]
        print('Preparação de áudio falhou; abrindo a imagem mesmo assim. ' + error, flush=True)
        report = {**device, 'audio': {**device.get('audio', {}), 'output_available': False,
                  'stream_preflight_ok': False, 'message': 'Áudio não preparado; a janela pode abrir sem som.',
                  'preparation_error': error}}
        return dict(env), report


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


def native_command(godot: Path, pack: Path, args: list[str], *, workdir: Path, renderer: str = 'gl_compatibility', audio_driver: str | None = None) -> list[str]:
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
            audio_driver = audio_driver or os.environ.get('SNAKE_AUDIO_DRIVER', 'PulseAudio')
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
        self.log_offset = 0
        self.audio_service = None
        self.audio_driver = None
        self.audio_env = None
        self.started_at = 0.0
        self.last_exit_code = None
        self.device_report = {}
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
                if self.audio_service:
                    self.audio_service.stop()
                if self.log:
                    self.log.close()
                    self.log = None
                with (self.state_dir / 'process-events.jsonl').open('a') as file:
                    file.write(json.dumps({'event': 'game_exit', 'at': time.time(), 'code': self.last_exit_code}) + '\n')
            audio_runtime = {'state': 'pending', 'message': 'Aguardando inicialização do áudio do jogo.'}
            if self.process and self.audio_driver == 'Dummy':
                audio_runtime = {'state': 'dummy', 'driver': 'Dummy',
                                 'message': 'Imagem em execução sem som: a saída de áudio não ficou disponível.'}
            if self.process and self.log_path.exists():
                with self.log_path.open('rb') as stream:
                    stream.seek(self.log_offset)
                    output = stream.read(32768).decode('utf-8', errors='replace')
                if 'falling back to the dummy driver' in output.lower():
                    audio_runtime = {'state': 'dummy', 'driver': 'Dummy',
                                     'message': 'Jogo sem som: Godot iniciou com driver Dummy. Feche e abra a janela após preparar o áudio Android.'}
                elif self.audio_driver != 'Dummy' and ('SPEECH_AUDIO_STARTED' in output or 'MUSIC_TRACK_STARTED' in output):
                    audio_runtime = {'state': 'playback-requested',
                                     'message': 'O jogo iniciou reprodução interna; isso não confirma som audível.'}
            return {'running': self.process is not None, 'pid': self.process.pid if self.process else None,
                    'started_at': self.started_at, 'last_exit_code': self.last_exit_code, 'log': str(self.log_path),
                    'godot': str(self.godot), 'renderer': self.renderer, 'original_verified': self.integrity['verified'],
                    'device': self.device_report,
                    'audio_runtime': audio_runtime,
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
            env, self.device_report = prepare_device(env, self.state_dir)
            self.device_report = prepare_presentation(env, self.state_dir, self.device_report)
            try:
                from .device_runtime import config
            except ImportError:
                managed_audio = False
            else:
                managed_audio = env.get('PREFIX', '').startswith('/data/') and config(self.state_dir).get('enabled') is True
            # Explicit capture routes belong to the original capture launcher.
            if managed_audio and not os.environ.get('PULSE_SINK'):
                try:
                    from .audio_service import PrivateAudio
                except ImportError:
                    env, self.device_report = finalize_device_audio(env, self.state_dir, self.device_report)
                else:
                    self.audio_service = PrivateAudio(self.state_dir)
                    env, self.device_report = self.audio_service.start(env, self.device_report)
            else:
                env, self.device_report = finalize_device_audio(env, self.state_dir, self.device_report)
            env['COBRINHA_LIVE_SERVER_URL'] = f'ws://127.0.0.1:{self.port}/ws/godot'
            env['COBRINHA_TERRAIN_EDITOR_FILE'] = str(self.project / 'server/private/cobrinha_terrain_editor.json')
            graphics = self.device_report.get('graphics', {})
            full = self.device_report.get('display', {}).get('fullscreen', False)
            args = ['--fullscreen' if full else '--windowed', '--resolution', graphics.get('resolution', '720x1280')]
            if graphics.get('max_fps'):
                args.extend(['--max-fps', str(graphics['max_fps'])])
            if self.device_report.get('audio', {}).get('godot_latency_ms'):
                args.extend(['--audio-output-latency', str(self.device_report['audio']['godot_latency_ms'])])
            args.extend(['--', '--cobrinha-live'])
            output = self.device_report.get('audio', {})
            audio_driver = 'PulseAudio' if output.get('output_available') else ('Dummy' if 'output_available' in output else None)
            self.audio_driver = audio_driver
            self.audio_env = dict(env)
            command = native_command(self.godot, self.pack, args, workdir=self.state_dir, renderer=self.renderer, audio_driver=audio_driver)
            self.log = self.log_path.open('ab', buffering=0)
            self.log_offset = self.log_path.stat().st_size
            try:
                self.process = subprocess.Popen(command, cwd=self.state_dir, env=env, stdout=self.log, stderr=subprocess.STDOUT)
            except Exception:
                self.log.close()
                self.log = None
                if self.audio_service:
                    self.audio_service.stop()
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
            if self.audio_service:
                self.audio_service.stop()
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

    # Optional for older, version-only repairs. Music is installed before the
    # game's initial websocket handshake, only when its library is empty.
    try:
        from . import presentation
    except ImportError:
        presentation = None
    if presentation is not None:
        def starter_music():
            from cobrinha_server.services import music_runtime
            try:
                result = presentation.provision_music(music_runtime, native.state_dir)
                if result.get('added'):
                    print(result['message'], flush=True)
            except (OSError, ValueError) as exc:
                print('Trilha opcional: ' + str(exc), flush=True)
        app.add_event_handler('startup', starter_music)

        @app.get('/termux/presentation')
        def presentation_status():
            return {'settings': presentation.settings(native.state_dir),
                    'display': native.device_report.get('display', {})}

        @app.post('/termux/presentation')
        def presentation_settings(payload: dict):
            try:
                saved = presentation.save_settings(native.state_dir, payload)
            except ValueError as exc:
                raise HTTPException(status_code=400, detail=str(exc)) from exc
            return {'settings': saved, 'restart_required': True}

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

    @app.post('/termux/audio/test')
    def audio_test():
        from .device_runtime import test_audio
        if native.audio_service:
            if not native.device_report.get('audio', {}).get('output_available'):
                return native.device_report.get('audio', {})
            return test_audio(native.state_dir, base=native.audio_env)
        return test_audio(native.state_dir)

    @app.post('/termux/audio/speech-test')
    def speech_test():
        from cobrinha_server.bridge.godot_bridge import godot_bridge
        from cobrinha_server.services.speech_queue import enqueue_manual_sequence
        if not godot_bridge.status()['connected']:
            raise HTTPException(status_code=409, detail='Abra o jogo primeiro para testar sua fala.')
        try:
            sequence = enqueue_manual_sequence('Olá! A cobra está pronta para conversar com vocês.')
        except (ValueError, RuntimeError) as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc
        return {'queued': True, 'sequence': sequence}

    # Own validated playlist controller; optional for old partial repair packages.
    try:
        from .music_library import attach as attach_music
    except ImportError:
        library = None
    else:
        library = attach_music(binding, app, native)

    from starlette.requests import Request
    from starlette.datastructures import UploadFile

    async def music_upload(request):
        if library is not None:
            return await library.upload(request)
        from .device_runtime import save_music
        from cobrinha_server.services import music_runtime
        from cobrinha_server.bridge.godot_bridge import godot_bridge, preview_bridge
        form = await request.form(max_files=1, max_fields=0)
        upload = form.get('file')
        if not isinstance(upload, UploadFile):
            raise HTTPException(status_code=400, detail='Selecione um arquivo de música.')
        try:
            target = await save_music(upload, music_runtime.BACKGROUND_MUSIC_DIR)
        except ValueError as exc:
            await upload.close()
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        music = music_runtime.update(enabled=True, current_track=str(target))
        for bridge in (godot_bridge, preview_bridge):
            if bridge.status()['connected']:
                await bridge.send(music_runtime.websocket_message())
        return {'ok': True, 'file': target.name, 'track_count': len(music.get('tracks', []))}

    # Keep native.py importable before FastAPI is installed by the bootstrap.
    music_upload.__annotations__['request'] = Request
    app.add_api_route('/termux/music/upload', music_upload, methods=['POST'])

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
    env = os.environ.copy()
    for name in NVIDIA_ENV:
        env.pop(name, None)
    env, device = prepare_device(env, game.state_dir)
    env, device = finalize_device_audio(env, game.state_dir, device)
    graphics = device.get('graphics', {})
    if graphics.get('max_fps') and '--max-fps' not in engine_args:
        engine_args = ['--max-fps', str(graphics['max_fps']), *engine_args]
    if device.get('audio', {}).get('godot_latency_ms') and '--audio-output-latency' not in engine_args:
        engine_args = ['--audio-output-latency', str(device['audio']['godot_latency_ms']), *engine_args]
    output = device.get('audio', {})
    audio_driver = 'PulseAudio' if output.get('output_available') else ('Dummy' if 'output_available' in output else None)
    command = native_command(game.godot, game.pack, engine_args, workdir=game.state_dir, renderer=game.renderer, audio_driver=audio_driver)
    os.execvpe(command[0], command, env)


if __name__ == '__main__':
    main()
SNAKE_DEVICE_V024_FILE_1
cat >"$repair_stage/snake_termux/__main__.py" <<'SNAKE_DEVICE_V024_FILE_2'
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
SNAKE_DEVICE_V024_FILE_2
cat >"$repair_stage/snake_termux/device_runtime.py" <<'SNAKE_DEVICE_V024_FILE_3'
"""Bounded Termux GPU/audio setup; configuration applies only to this game."""
from __future__ import annotations

import argparse
import json
import math
import os
import re
import struct
import subprocess
import time
import unicodedata
import uuid
import wave
from pathlib import Path

STATE = Path(__file__).resolve().parents[1] / 'state'
GPU_PACKAGES = ('mesa-vulkan-icd-freedreno', 'mesa-demos', 'vulkan-tools')
MAX_MUSIC_BYTES = 200 * 1024 * 1024


def run(command: list[str], *, env: dict | None = None, timeout: float = 8) -> subprocess.CompletedProcess:
    return subprocess.run(command, env=env, capture_output=True, text=True, timeout=timeout)


def atomic_json(path: Path, data: dict):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix('.part')
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(path)


def config(state: Path) -> dict:
    try:
        data = json.loads((state / 'device-config.json').read_text())
        return data if isinstance(data, dict) else {}
    except (OSError, ValueError):
        return {}


def ensure_packages():
    prefix = Path(os.environ.get('PREFIX', ''))
    if not str(prefix).startswith('/data/'):
        raise ValueError('Os drivers devem ser preparados no Termux do celular.')
    missing = []
    for package in GPU_PACKAGES:
        result = run(['dpkg-query', '-W', '-f=${db:Status-Status}', package])
        if result.returncode or result.stdout.strip() != 'installed':
            missing.append(package)
    if missing:
        from snake_termux.termux_packages import apt
        print('Preparando somente os pacotes ausentes: ' + ', '.join(missing), flush=True)
        apt(prefix / 'etc/apt', ['update'], x11=True)
        apt(prefix / 'etc/apt', ['install', '-y', *missing], x11=True)
    else:
        print('Drivers e ferramentas já instalados; sem consultar APT.', flush=True)


def find_freedreno(prefix: Path) -> Path | None:
    for path in sorted((prefix / 'share/vulkan/icd.d').glob('freedreno_icd*.json')):
        try:
            data = json.loads(path.read_text())
            library = str(data.get('ICD', {}).get('library_path', ''))
            if 'freedreno' in library.lower():
                return path.resolve()
        except (OSError, ValueError, AttributeError):
            pass
    return None


def graphics(base: dict, prefix: Path) -> tuple[dict, dict]:
    env = dict(base)
    icd = find_freedreno(prefix)
    report = {'hardware_verified': False, 'renderer': None, 'resolution': '540x960', 'max_fps': 30}
    if icd:
        for name in ('LIBGL_ALWAYS_SOFTWARE', 'GALLIUM_DRIVER', 'MESA_LOADER_DRIVER_OVERRIDE', 'VK_ICD_FILENAMES', 'VK_DRIVER_FILES'):
            env.pop(name, None)
        env.update(GALLIUM_DRIVER='zink', MESA_LOADER_DRIVER_OVERRIDE='zink', VK_ICD_FILENAMES=str(icd), VK_DRIVER_FILES=str(icd), TU_DEBUG='noconform')
        try:
            probe = run(['glxinfo', '-B'], env=env, timeout=15)
            match = re.search(r'(?im)^\s*OpenGL renderer string:\s*(.+)', probe.stdout)
            renderer = match[1].strip() if match else ''
            report['renderer'] = renderer or None
            software = any(word in renderer.lower() for word in ('llvmpipe', 'softpipe', 'lavapipe', 'swrast'))
            adreno = any(word in renderer.lower() for word in ('adreno', 'turnip', 'qualcomm'))
            if probe.returncode == 0 and renderer and adreno and not software:
                report.update(hardware_verified=True, resolution='720x1280', max_fps=60, driver_file=str(icd), message='GPU Adreno confirmada por glxinfo.')
                return env, report
            report['message'] = 'A GPU não foi confirmada; usando perfil reduzido de CPU.'
            report['probe_error'] = (probe.stderr or probe.stdout)[-1800:]
        except (OSError, subprocess.TimeoutExpired) as exc:
            report['message'] = 'Falha ao verificar GPU; usando perfil reduzido de CPU.'
            report['probe_error'] = str(exc)[:800]
    else:
        report['message'] = 'Freedreno não localizado; usando perfil reduzido de CPU.'
    # A failed Vulkan probe must not leave half-configured GPU overrides active.
    env = dict(base)
    for name in ('VK_ICD_FILENAMES', 'VK_DRIVER_FILES', 'MESA_LOADER_DRIVER_OVERRIDE'):
        env.pop(name, None)
    env.update(GALLIUM_DRIVER='llvmpipe', LIBGL_ALWAYS_SOFTWARE='1', LP_NUM_THREADS='3')
    return env, report


def sinks(env: dict) -> list[dict]:
    result = run(['pactl', 'list', 'short', 'sinks'], env=env)
    if result.returncode:
        raise ValueError((result.stderr or 'PulseAudio não respondeu.').strip())
    entries = []
    for line in result.stdout.splitlines():
        fields = line.split()
        if len(fields) >= 3:
            entries.append({'index': fields[0], 'name': fields[1], 'module': fields[2]})
    return entries


def real_sinks(entries: list[dict]) -> list[dict]:
    return [item for item in entries if item['name'] != 'auto_null' and 'null-sink' not in item['module']]


def output_latency(env: dict) -> int:
    try:
        latency = int(env.get('PULSE_LATENCY_MSEC', '80'))
    except (TypeError, ValueError):
        latency = 80
    return max(40, min(300, latency))


def audio(base: dict) -> tuple[dict, dict]:
    env = dict(base)
    report = {'output_available': False, 'sink': None, 'audibility_confirmed': False, 'errors': []}
    try:
        available = sinks(env)
        requested = env.get('PULSE_SINK')
        capture = next((item for item in available if item['name'] == requested and requested != 'auto_null' and 'null-sink' in item['module']), None)
        if capture:
            # Original RTMP launch plans deliberately use a named null sink
            # for capture. Preserve that explicit route; auto_null is different.
            report.update(output_available=True, sink=capture['name'], virtual_capture=True,
                          message='Saída de captura configurada preservada; o monitor controla o som local.')
            return env, report
        entries = real_sinks(available)
        created = False
        if not entries:
            for module in ('module-sles-sink', 'module-aaudio-sink'):
                options = []
                if module == 'module-aaudio-sink':
                    # The official Termux module documents this workaround for
                    # AAudioStream_close() crashes when an idle sink resumes.
                    # Normal performance mode is also friendlier to Bluetooth.
                    options = ['sink_name=snake_android_audio', 'no_close_hack=true', 'pm=0', 'latency=' + str(output_latency(env))]
                result = run(['pactl', 'load-module', module, *options], env=env, timeout=3)
                if result.returncode:
                    report['errors'].append(module + ': ' + result.stderr.strip()[:500])
                    continue
                entries = real_sinks(sinks(env))
                if entries:
                    created = True
                    report['loaded_module'] = module
                    report['module_id'] = result.stdout.strip()
                    report['module_arguments'] = options
                    break
        if not entries:
            env.pop('PULSE_SINK', None)
            report['message'] = 'PulseAudio ainda não tem saída real; auto_null é silenciosa.'
            return env, report
        current = run(['pactl', 'get-default-sink'], env=env)
        requested = env.get('PULSE_SINK') or current.stdout.strip()
        selected = next((item for item in entries if item['name'] == requested), None)
        if selected is None:
            selected = next((item for item in entries if any(part in item['module'] for part in ('sles', 'aaudio'))), entries[0])
        name = selected['name']
        if current.stdout.strip() not in {item['name'] for item in entries}:
            changed = run(['pactl', 'set-default-sink', name], env=env)
            if changed.returncode:
                report['errors'].append(changed.stderr.strip()[:500])
        if created:
            unmute = run(['pactl', 'set-sink-mute', name, '0'], env=env)
            if unmute.returncode:
                report['errors'].append(unmute.stderr.strip()[:500])
        env['PULSE_SINK'] = name
        report.update(output_available=True, sink=name, message='Saída PulseAudio selecionada; confirme o som no teste.')
    except (OSError, ValueError, subprocess.TimeoutExpired) as exc:
        report['message'] = 'Não foi possível preparar a saída PulseAudio.'
        report['errors'].append(str(exc)[:800])
    return env, report


def finalize_audio(base: dict, state: Path, device: dict, *, requested_sink: str | None = None) -> tuple[dict, dict]:
    """Recheck after X11 reconfiguration and open a real PCM stream once.

    A module ID returned by pactl is not proof that the output survived idle or
    route changes. No game/daemon restart loop is used. Capture sinks stay intact.
    """
    if config(state).get('enabled') is not True or not base.get('PREFIX', '').startswith('/data/'):
        return dict(base), device
    env = dict(base)
    if not requested_sink and not device.get('audio', {}).get('virtual_capture'):
        env.pop('PULSE_SINK', None)
    env, output = audio(env)
    if output.get('output_available'):
        path = state / 'audio-startup-silence.wav'
        path.parent.mkdir(parents=True, exist_ok=True)
        with wave.open(str(path), 'wb') as stream:
            stream.setnchannels(1)
            stream.setsampwidth(2)
            stream.setframerate(24000)
            stream.writeframes(b'\0' * (24000 // 5 * 2))
        try:
            env.setdefault('PULSE_LATENCY_MSEC', '80')
            played = run(['paplay', '--device=' + output['sink'], str(path)], env=env, timeout=6)
            available = sinks(env)
            retained = next((item for item in available if item['name'] == output['sink']), None)
            if played.returncode or retained is None:
                raise ValueError((played.stderr or 'A saída de áudio desapareceu durante o teste PCM.').strip())
            output.update(stream_preflight_ok=True, godot_latency_ms=output_latency(env),
                          message='Saída de áudio aceitou PCM antes de abrir o jogo; confirme se ouviu a fala.')
            if not requested_sink and not output.get('virtual_capture'):
                # Do not bind Godot permanently to an ephemeral Android sink.
                # PulseAudio can then move its stream if the output reconnects.
                env.pop('PULSE_SINK', None)
                output['route_mode'] = 'server-default'
        except (OSError, ValueError, subprocess.TimeoutExpired) as exc:
            output.update(output_available=False, stream_preflight_ok=False,
                          message='A saída Android falhou no teste PCM; o jogo pode ficar sem som.')
            output['errors'].append(str(exc)[:800])
            if not output.get('virtual_capture'):
                env.pop('PULSE_SINK', None)
    result = {**device, 'audio': output}
    atomic_json(state / 'device-runtime.json', result)
    print('Áudio antes de abrir o jogo: ' + output['message'], flush=True)
    return env, result


def prepare_graphics(base: dict, state: Path) -> tuple[dict, dict]:
    settings = config(state)
    prefix = Path(base.get('PREFIX', ''))
    if settings.get('enabled') is not True or not str(prefix).startswith('/data/'):
        return dict(base), {}
    env, gpu = graphics(base, prefix)
    report = {'updated_at': time.time(), 'graphics': gpu}
    atomic_json(state / 'device-runtime.json', report)
    print('Gráficos: ' + gpu['message'] + (' ' + str(gpu['renderer']) if gpu.get('renderer') else ''), flush=True)
    return env, report


def prepare_game(base: dict, state: Path) -> tuple[dict, dict]:
    env, report = prepare_graphics(base, state)
    if not report:
        return env, report
    env, output = audio(env)
    report['audio'] = output
    atomic_json(state / 'device-runtime.json', report)
    print('Áudio: ' + output['message'], flush=True)
    return env, report


def tone(path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    rate, duration = 24000, 0.55
    frames = []
    for index in range(int(rate * duration)):
        t = index / rate
        envelope = min(1, t / .03, max(0, (duration - t) / .06))
        frames.append(struct.pack('<h', int(4500 * envelope * math.sin(2 * math.pi * 660 * t))))
    with wave.open(str(path), 'wb') as stream:
        stream.setnchannels(1)
        stream.setsampwidth(2)
        stream.setframerate(rate)
        stream.writeframes(b''.join(frames))


def test_audio(state: Path, *, base: dict | None = None) -> dict:
    env, output = audio(dict(os.environ) if base is None else dict(base))
    if not output['output_available']:
        return output
    path = state / 'audio-test.wav'
    tone(path)
    try:
        result = run(['paplay', '--device=' + output['sink'], str(path)], env=env, timeout=8)
        output['test_sent'] = result.returncode == 0
        if result.returncode:
            output['errors'].append(result.stderr.strip()[:800])
    except (OSError, subprocess.TimeoutExpired) as exc:
        output['test_sent'] = False
        output['errors'].append(str(exc)[:800])
    return output


async def save_music(upload, directory: Path) -> Path:
    name = unicodedata.normalize('NFC', str(getattr(upload, 'filename', '') or '').replace('\\', '/').split('/')[-1])
    name = re.sub(r'[^\w. -]', '_', name)[:140]
    source = Path(name)
    if source.suffix.lower() not in {'.mp3', '.ogg', '.wav'}:
        raise ValueError('Escolha música MP3, OGG/Vorbis ou WAV para reprodução direta no jogo.')
    if getattr(upload, 'size', 0) and upload.size > MAX_MUSIC_BYTES:
        raise ValueError('A música excede o limite de 200 MB.')
    directory.mkdir(parents=True, exist_ok=True)
    token = str(uuid.uuid4())
    target = directory / f'{source.stem or "musica"} [{token}]{source.suffix.lower()}'
    temporary = directory / ('.' + token + '.part')
    try:
        size = 0
        with temporary.open('xb') as file:
            while chunk := await upload.read(128 * 1024):
                size += len(chunk)
                if size > MAX_MUSIC_BYTES:
                    raise ValueError('A música excede o limite de 200 MB.')
                file.write(chunk)
        if size == 0:
            raise ValueError('O arquivo de música está vazio.')
        temporary.replace(target)
        return target
    except Exception:
        temporary.unlink(missing_ok=True)
        raise
    finally:
        await upload.close()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--state', type=Path, default=STATE)
    parser.add_argument('--install', action='store_true')
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--audio-test', action='store_true')
    args = parser.parse_args()
    if args.install:
        ensure_packages()
        settings = config(args.state)
        settings.update(enabled=True)
        atomic_json(args.state / 'device-config.json', settings)
        print('Perfil GPU/áudio preparado. A GPU será verificada no próximo início do jogo.')
    if args.check:
        _env, report = prepare_game(dict(os.environ), args.state)
        print(json.dumps(report, ensure_ascii=False, indent=2))
    if args.audio_test:
        print(json.dumps(test_audio(args.state), ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
SNAKE_DEVICE_V024_FILE_3
cat >"$repair_stage/snake_termux/ui.js" <<'SNAKE_DEVICE_V024_FILE_4'
(function () {
  'use strict';
  const byId = id => document.getElementById(id);
  const status = byId('openaiStatus');
  const key = byId('openaiApiKey');
  if (!status || !key) return;
  status.closest('section').classList.add('termux-ai-card');
  const styles = document.createElement('style');
  styles.textContent = '.termux-ai-card,.termux-ai-card *{box-sizing:border-box}.termux-ai-card input,.termux-ai-card select,.termux-ai-card audio{max-width:100%}.termux-ai-card fieldset{min-width:0;padding:12px;margin:16px 0 0}.termux-ai-card audio{display:block;margin-top:10px;width:100%}.termux-ai-card button{white-space:normal}';
  document.head.append(styles);
  key.hidden = true;
  key.style.setProperty('display', 'none', 'important');
  key.disabled = true;
  key.value = '';
  const keyLabel = document.querySelector('label[for="openaiApiKey"]');
  if (keyLabel) {keyLabel.hidden = true; keyLabel.style.setProperty('display', 'none', 'important');}
  const portLabel = document.createElement('label');
  portLabel.htmlFor = 'termuxQwenPort';
  portLabel.textContent = 'Porta do Qwen local';
  const port = document.createElement('input');
  port.id = 'termuxQwenPort'; port.type = 'number'; port.min = '1024'; port.max = '65535'; port.value = '8081';
  key.after(portLabel, port);
  byId('openaiModel').placeholder = 'auto · detectar o modelo já instalado';
  const note = document.createElement('p');
  note.textContent = 'Qwen local no Termux. Use auto para detectar o modelo. Não precisa de chave de API.';
  status.parentElement.prepend(note);

  window.renderOpenAISettings = function (settings) {
    if (document.activeElement !== byId('openaiModel')) byId('openaiModel').value = settings.model || 'auto';
    if (document.activeElement !== port) port.value = settings.local_port || 8081;
    byId('openaiEnabled').checked = !!settings.enabled;
    const local = settings.local_status || {};
    status.textContent = !settings.enabled ? 'IA local desativada.' : local.ready === true ? 'Qwen local conectado · ' + (local.selected_model || settings.model) : local.ready === false ? (local.last_error || 'Qwen local indisponível. Confira o serviço e a porta.') : 'IA local habilitada; toque em Detectar Qwen para conferir a conexão.';
  };
  window.saveOpenAISettings = async function (disable = false) {
    const response = await fetch('/api/settings/openai', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({provider: 'local', enabled: disable ? false : byId('openaiEnabled').checked, model: byId('openaiModel').value.trim() || 'auto', local_port: Number(port.value)})});
    const body = await response.json();
    if (!response.ok || body.ok === false) throw new Error(body.error || body.detail || 'Não foi possível salvar.');
    window.renderOpenAISettings(body.settings);
    return body.settings;
  };
  function button(id, text, handler) {
    const old = byId(id), replacement = old.cloneNode(true);
    replacement.textContent = text;
    old.replaceWith(replacement);
    replacement.addEventListener('click', async () => {try {await handler();} catch (error) {status.textContent = error.message;}});
  }
  button('openaiSave', 'Salvar IA local', () => window.saveOpenAISettings(false));
  button('openaiRemove', 'Desativar IA local', () => window.saveOpenAISettings(true));
  const detect = document.createElement('button'); detect.id = 'termuxQwenDetect'; detect.type = 'button'; detect.textContent = 'Detectar Qwen local';
  byId('openaiSave').after(detect);
  detect.addEventListener('click', async () => {
    detect.disabled = true;
    try {
      await window.saveOpenAISettings(false);
      const response = await fetch('/termux/local-ai/detect', {method: 'POST'});
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail || 'Não foi possível verificar a IA local.');
      window.renderOpenAISettings(body.settings);
    } catch (error) {status.textContent = error.message;} finally {detect.disabled = false;}
  });
  const question = document.createElement('input'); question.id = 'termuxQwenQuestion'; question.maxLength = 180; question.placeholder = 'Teste: quanto é sete vezes oito?';
  const ask = document.createElement('button'); ask.id = 'termuxQwenAsk'; ask.type = 'button'; ask.textContent = 'Testar resposta local';
  status.after(question, ask);
  ask.addEventListener('click', async () => {
    ask.disabled = true; status.textContent = 'Aguardando o Qwen local…';
    try {
      const response = await fetch('/termux/local-ai/test', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({text: question.value})});
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail || 'A IA local não respondeu.');
      status.textContent = body.text;
    } catch (error) {status.textContent = error.message;} finally {ask.disabled = false;}
  });
  const voiceBox = document.createElement('fieldset');
  const legend = document.createElement('legend'); legend.textContent = 'Voz local já instalada';
  const voiceProvider = document.createElement('select'); voiceProvider.id = 'termuxVoiceProvider';
  for (const [value, title] of [['piper-local', 'Piper local · sem clonagem'], ['xtts', 'XTTS original · exige instalação compatível']]) {
    const option = document.createElement('option'); option.value = value; option.textContent = title; voiceProvider.append(option);
  }
  const voicePort = document.createElement('input'); voicePort.id = 'termuxVoicePort'; voicePort.type = 'number'; voicePort.min = '1024'; voicePort.max = '65535'; voicePort.value = '8083';
  const voiceLabel = document.createElement('label'); voiceLabel.htmlFor = voicePort.id; voiceLabel.textContent = 'Porta do Piper (geralmente 8082 ou 8083)';
  const voiceMessage = document.createElement('p'); voiceMessage.id = 'termuxVoiceStatus';
  const detectVoice = document.createElement('button'); detectVoice.type = 'button'; detectVoice.textContent = 'Salvar e detectar voz'; detectVoice.id = 'termuxVoiceDetect';
  const testVoice = document.createElement('button'); testVoice.type = 'button'; testVoice.textContent = 'Ouvir teste de voz'; testVoice.id = 'termuxVoiceTest';
  const player = document.createElement('audio'); player.controls = true; player.id = 'termuxVoicePlayer'; player.preload = 'none';
  const resume = document.createElement('button'); resume.type = 'button'; resume.textContent = 'Tocar áudio preparado'; resume.hidden = true;
  let audioURL = null;
  async function saveVoice() {
    const response = await fetch('/termux/voice', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({provider: voiceProvider.value, port: Number(voicePort.value)})});
    const body = await response.json();
    if (!response.ok) throw new Error(body.detail || 'Não foi possível salvar a voz.');
  }
  detectVoice.addEventListener('click', async () => {
    detectVoice.disabled = true;
    try {
      await saveVoice();
      if (voiceProvider.value === 'xtts') {voiceMessage.textContent = 'XTTS original selecionado. O teste depende do modelo e da referência originais.'; return;}
      const response = await fetch('/termux/voice/detect', {method: 'POST'});
      const body = await response.json(); voiceMessage.textContent = body.message;
    } catch (error) {voiceMessage.textContent = error.message;} finally {detectVoice.disabled = false;}
  });
  testVoice.addEventListener('click', async () => {
    testVoice.disabled = true; voiceMessage.textContent = 'Gerando áudio local…';
    try {
      await saveVoice();
      const response = await fetch('/termux/voice/test', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({text: 'Olá! Rosa, relógio, carro e clarão. A cobra está pronta para conversar.'})});
      if (!response.ok) {const error = await response.json(); throw new Error(error.detail || 'Falha na voz local.');}
      if (audioURL) URL.revokeObjectURL(audioURL);
      audioURL = URL.createObjectURL(await response.blob()); player.src = audioURL;
      voiceMessage.textContent = 'Áudio gerado. Use o player para ouvir.';
      try {await player.play(); resume.hidden = true;} catch (_) {resume.hidden = false; voiceMessage.textContent = 'Áudio pronto. Toque em Tocar áudio preparado para autorizar a reprodução.';}
    } catch (error) {voiceMessage.textContent = error.message;} finally {testVoice.disabled = false;}
  });
  resume.addEventListener('click', () => {player.play().then(() => {resume.hidden = true;}).catch(error => {voiceMessage.textContent = error.message;});});
  voiceBox.append(legend, voiceProvider, voiceLabel, voicePort, detectVoice, testVoice, voiceMessage, player, resume);
  status.parentElement.append(voiceBox);
  fetch('/termux/voice').then(response => response.json()).then(body => {voiceProvider.value = body.provider; voicePort.value = body.port;}).catch(error => {voiceMessage.textContent = error.message;});
  const username = byId('monitorUsername');
  if (username) {
    username.placeholder = '@seu.usuario';
    const label = document.querySelector('label[for="monitorUsername"]');
    if (label) label.textContent = '@ do perfil que está ao vivo';
  }
  window.loadOpenAISettings().catch(error => {status.textContent = error.message;});
  fetch('/termux/game').then(async response => {
    if (!response.ok) return;
    const card = document.createElement('section'); card.className = 'card termux-ai-card'; card.style.marginTop = '14px';
    const title = document.createElement('h2'); title.textContent = 'Jogo original · Termux 0.3.0';
    const message = document.createElement('p'); message.id = 'termuxGameStatus';
    const deviceMessage = document.createElement('p'); deviceMessage.id = 'termuxDeviceStatus';
    const start = document.createElement('button'); start.type = 'button'; start.textContent = 'Abrir jogo original';
    const stop = document.createElement('button'); stop.type = 'button'; stop.textContent = 'Fechar janela do jogo';
    async function refresh() {
      const response = await fetch('/termux/game'); const body = await response.json();
      message.textContent = body.running ? (body.bridge_connected ? 'Janela em execução · conectada ao servidor.' : 'Janela em execução · aguardando conexão com o servidor.') : 'Janela parada. Última saída: ' + (body.last_exit_code ?? 'nenhuma') + '. Logs: ' + body.log;
      const gpu = body.device?.graphics, output = body.device?.audio, display = body.device?.display;
      deviceMessage.textContent = gpu ? (gpu.hardware_verified ? 'GPU confirmada: ' + gpu.renderer : gpu.message) + ' · ' + gpu.resolution + ' · limite ' + gpu.max_fps + ' FPS. ' + (display?.message || output?.message || '') : '';
      if (body.audio_runtime?.state === 'dummy') {
        deviceMessage.textContent += ' ⚠ ' + body.audio_runtime.message;
        deviceMessage.style.color = '#ffba6b';
      } else if (output && output.output_available === false) {
        deviceMessage.textContent += ' ⚠ ' + output.message;
        deviceMessage.style.color = '#ffba6b';
      } else {deviceMessage.style.color = '';}
    }
    for (const [button, action] of [[start, 'start'], [stop, 'stop']]) button.addEventListener('click', async () => {
      button.disabled = true;
      try {const r = await fetch('/termux/game/' + action, {method: 'POST'}); const b = await r.json(); if (!r.ok) throw new Error(b.detail || 'Falha no jogo nativo.'); await refresh();}
      catch (error) {message.textContent = error.message;} finally {button.disabled = false;}
    });
    const sound = document.createElement('button'); sound.type = 'button'; sound.textContent = 'Testar som do jogo'; sound.id = 'termuxGameSoundTest';
    const speech = document.createElement('button'); speech.type = 'button'; speech.textContent = 'Testar fala no jogo'; speech.id = 'termuxGameSpeechTest';
    const testMessage = document.createElement('p'); testMessage.id = 'termuxGameAudioStatus';
    for (const [button, path] of [[sound, '/termux/audio/test'], [speech, '/termux/audio/speech-test']]) button.addEventListener('click', async () => {
      button.disabled = true; testMessage.textContent = 'Preparando teste…';
      try {
        const response = await fetch(path, {method: 'POST'}); const body = await response.json();
        if (!response.ok) throw new Error(body.detail || 'Falha no teste.');
        testMessage.textContent = body.queued ? 'Fala enfileirada; ainda não confirma reprodução. Confirme se ouviu.' : body.test_sent ? 'Teste de som enviado. Confirme se ouviu o sinal.' : (body.message || 'A saída não ficou disponível.') + ' ' + (body.errors || []).join(' ');
        await refresh();
      } catch (error) {testMessage.textContent = error.message;} finally {button.disabled = false;}
    });
    const musicBox = document.createElement('fieldset'); musicBox.id = 'termuxMusicLibrary';
    const musicTitle = document.createElement('legend'); musicTitle.textContent = 'Biblioteca de músicas';
    const musicHelp = document.createElement('p'); musicHelp.textContent = 'Envie várias faixas. A preparação acontece uma vez e preserva o áudio original. Marque as músicas que participarão do automático.';
    const musicLabel = document.createElement('label'); musicLabel.htmlFor = 'termuxMusicFile'; musicLabel.textContent = 'MP3, OGG, WAV, M4A, AAC, FLAC ou OPUS · até 200 MB por arquivo';
    const musicFile = document.createElement('input'); musicFile.id = 'termuxMusicFile'; musicFile.type = 'file'; musicFile.multiple = true; musicFile.accept = '.mp3,.ogg,.wav,.m4a,.aac,.flac,.opus';
    const sendMusic = document.createElement('button'); sendMusic.type = 'button'; sendMusic.id = 'termuxMusicUpload'; sendMusic.textContent = 'Salvar músicas';
    const musicMessage = document.createElement('p'); musicMessage.id = 'termuxMusicStatus'; musicMessage.setAttribute('role', 'status');
    const musicSelect = document.createElement('select'); musicSelect.id = 'termuxMusicSelect'; musicSelect.setAttribute('aria-label', 'Faixa para tocar');
    const musicMode = document.createElement('select'); musicMode.id = 'termuxMusicMode'; musicMode.setAttribute('aria-label', 'Modo de reprodução');
    for (const [value, text] of [['single', 'Repetir a faixa escolhida'], ['shuffle', 'Automático · sortear somente as marcadas']]) {
      const option = document.createElement('option'); option.value = value; option.textContent = text; musicMode.append(option);
    }
    const musicTracks = document.createElement('div'); musicTracks.id = 'termuxMusicTracks'; musicTracks.style.cssText = 'max-height:240px;overflow:auto;display:grid;gap:8px;margin:12px 0';
    const playMusic = document.createElement('button'); playMusic.id = 'termuxMusicPlay'; playMusic.type = 'button'; playMusic.textContent = 'Tocar / salvar seleção';
    const nextMusic = document.createElement('button'); nextMusic.id = 'termuxMusicNext'; nextMusic.type = 'button'; nextMusic.textContent = 'Próxima faixa';
    const pauseMusic = document.createElement('button'); pauseMusic.id = 'termuxMusicPause'; pauseMusic.type = 'button'; pauseMusic.textContent = 'Pausar';
    const musicVolumeLabel = document.createElement('label'); musicVolumeLabel.htmlFor = 'termuxMusicVolume'; musicVolumeLabel.textContent = 'Volume da música';
    const musicVolume = document.createElement('input'); musicVolume.type = 'range'; musicVolume.id = 'termuxMusicVolume'; musicVolume.min = '0'; musicVolume.max = '100';
    const musicVolumeValue = document.createElement('output'); musicVolumeValue.htmlFor = 'termuxMusicVolume';
    let library, musicBusy = false;
    const musicButtons = [sendMusic, playMusic, nextMusic, pauseMusic];
    function busyMusic(value) {musicBusy = value; for (const button of musicButtons) button.disabled = value; musicVolume.disabled = value;}
    async function musicRequest(path, options) {
      const response = await fetch(path, options); const body = await response.json();
      if (!response.ok) throw new Error(body.detail || 'Não foi possível preparar a música.');
      return body;
    }
    function showLibrary(body) {
      library = body; musicMode.value = body.mode;
      musicSelect.replaceChildren(); musicTracks.replaceChildren();
      const selected = new Set(body.selected);
      for (const track of body.tracks) {
        const option = document.createElement('option'); option.value = track.id; option.textContent = track.title; musicSelect.append(option);
        const row = document.createElement('label'); row.style.cssText = 'display:flex;gap:10px;align-items:center';
        const check = document.createElement('input'); check.type = 'checkbox'; check.value = track.id; check.checked = selected.has(track.id); check.style.width = 'auto';
        const text = document.createElement('span'); text.textContent = track.title + (track.error ? ' · ' + track.error : track.ready ? ' · pronta' : ' · preparar ao tocar');
        row.append(check, text); musicTracks.append(row);
      }
      if (body.current) musicSelect.value = body.current;
      musicVolume.value = String(Math.round(body.volume * 100)); musicVolumeValue.textContent = musicVolume.value + '%';
      pauseMusic.textContent = body.enabled ? 'Pausar música' : 'Retomar música';
    }
    async function musicControl(payload) {
      const body = await musicRequest('/termux/music/control', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)});
      showLibrary(body.music);
      musicMessage.textContent = body.sent_to_game ? 'Configuração enviada ao jogo. ' + (body.music.mode === 'single' ? 'Repetindo a faixa escolhida.' : 'Automático: somente as faixas marcadas.') : 'Seleção salva. Abra o jogo para reproduzir.';
      return body;
    }
    musicRequest('/termux/music/library').then(body => {
      showLibrary(body); musicMessage.textContent = body.tracks.length + ' faixa(s) salvas. Escolha uma e toque em Tocar. Arquivos antigos serão preparados automaticamente.';
      const oldCard = document.getElementById('musicEnabled')?.closest('article'); if (oldCard) oldCard.hidden = true;
    }).catch(error => {musicMessage.textContent = error.message;});
    sendMusic.addEventListener('click', async () => {
      const files = Array.from(musicFile.files); if (!files.length) {musicMessage.textContent = 'Selecione uma ou mais músicas do celular.'; return;}
      busyMusic(true); let saved = 0; const errors = [];
      try {
        for (let i = 0; i < files.length; i++) {
          musicMessage.textContent = (i + 1) + '/' + files.length + ' · recebendo e preparando ' + files[i].name + '. Faixas longas podem levar alguns minutos.';
          try {
            if (files[i].size > 200 * 1024 * 1024) throw new Error('O arquivo deve ter até 200 MB.');
            const form = new FormData(); form.append('file', files[i]);
            const body = await musicRequest('/termux/music/import', {method: 'POST', body: form});
            showLibrary(body.music); musicSelect.value = body.id; saved++;
          } catch (error) {errors.push(files[i].name + ': ' + error.message);}
        }
        musicMessage.textContent = saved + ' música(s) preparadas e salvas. Escolha uma e toque em Tocar. ' + errors.join(' ');
        musicFile.value = '';
      } finally {busyMusic(false);}
    });
    playMusic.addEventListener('click', async () => {
      busyMusic(true); musicMessage.textContent = 'Preparando a seleção. Músicas longas podem levar alguns minutos na primeira vez…';
      try {await musicControl({mode: musicMode.value, selected: Array.from(musicTracks.querySelectorAll('input:checked'), item => item.value), current: musicSelect.value, play: true});}
      catch (error) {musicMessage.textContent = error.message;} finally {busyMusic(false);}
    });
    nextMusic.addEventListener('click', async () => {busyMusic(true); try {await musicControl({next: true, play: true});} catch (error) {musicMessage.textContent = error.message;} finally {busyMusic(false);}});
    pauseMusic.addEventListener('click', async () => {if (!library) return; busyMusic(true); try {await musicControl({enabled: !library.enabled}); musicMessage.textContent = library.enabled ? 'Música retomada.' : 'Música pausada. Voz e efeitos continuam disponíveis.';} catch (error) {musicMessage.textContent = error.message;} finally {busyMusic(false);}});
    musicVolume.addEventListener('input', () => {musicVolumeValue.textContent = musicVolume.value + '%';});
    musicVolume.addEventListener('change', async () => {try {const b = await musicRequest('/termux/music/control', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({volume: Number(musicVolume.value) / 100})}); library = b.music;} catch (error) {musicMessage.textContent = error.message;}});
    setInterval(async () => {
      if (musicBusy) return;
      try {const body = await musicRequest('/termux/music/library'); if (body.progress.busy) musicMessage.textContent = body.progress.message;} catch (_) {}
    }, 5000);
    musicBox.append(musicTitle, musicHelp, musicLabel, musicFile, sendMusic, musicMode, musicSelect, musicTracks, playMusic, nextMusic, pauseMusic, musicVolumeLabel, musicVolume, musicVolumeValue, musicMessage);
    const profileLabel = document.createElement('label'); profileLabel.htmlFor = 'termuxGraphicsProfile'; profileLabel.textContent = 'Qualidade da imagem · tela limpa em retrato';
    const profile = document.createElement('select'); profile.id = 'termuxGraphicsProfile';
    for (const [value, text] of [['balanced', 'Equilibrado · 720 × 1280'], ['light', 'Leve · 640 × 1136'], ['live', 'Modo LIVE · 640 × 1136 · limite 45 FPS'], ['sharp', 'Mais nítido · 864 × 1536'], ['stable', 'Estável · 640 × 1136 · limite 30 FPS']]) {
      const option = document.createElement('option'); option.value = value; option.textContent = text; profile.append(option);
    }
    const saveProfile = document.createElement('button'); saveProfile.type = 'button'; saveProfile.id = 'termuxSaveProfile'; saveProfile.textContent = 'Salvar qualidade';
    const profileMessage = document.createElement('p'); profileMessage.id = 'termuxProfileStatus';
    const profileBox = document.createElement('div'); profileBox.hidden = true;
    profileBox.append(profileLabel, profile, saveProfile, profileMessage);
    fetch('/termux/presentation').then(r => {if (!r.ok) throw new Error('Exibição não disponível nesta revisão.'); return r.json();}).then(body => {profile.value = body.settings.profile; profileBox.hidden = false;}).catch(() => {});
    saveProfile.addEventListener('click', async () => {
      saveProfile.disabled = true;
      try {
        const response = await fetch('/termux/presentation', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({profile: profile.value})});
        const body = await response.json(); if (!response.ok) throw new Error(body.detail || 'Não foi possível salvar.');
        profileMessage.textContent = 'Salvo. Use Fechar janela do jogo e depois Abrir jogo original para aplicar. O modo leve reduz a carga gráfica; os FPS reais dependem do aparelho.';
      } catch (error) {profileMessage.textContent = error.message;} finally {saveProfile.disabled = false;}
    });
    card.append(title, message, deviceMessage, start, stop, profileBox, sound, speech, testMessage, musicBox);
    const pacing = document.createElement('fieldset'); pacing.hidden = true;
    const pacingTitle = document.createElement('legend'); pacingTitle.textContent = 'Ritmo das respostas e câmera';
    const pacingMode = document.createElement('select'); pacingMode.id = 'termuxReplyMode';
    for (const [value, text] of [['direct', 'Resposta direta · menos espera e trocas de foco'], ['dialogue', 'Diálogo original · usuário lê, cobra responde']]) {
      const option = document.createElement('option'); option.value = value; option.textContent = text; pacingMode.append(option);
    }
    const pacingSave = document.createElement('button'); pacingSave.type = 'button'; pacingSave.textContent = 'Salvar ritmo'; pacingSave.id = 'termuxSaveReplyMode';
    const pacingMessage = document.createElement('p'); pacingMessage.id = 'termuxReplyModeStatus';
    fetch('/termux/live-tuning').then(async r => {if (!r.ok) return; const b = await r.json(); pacingMode.value = b.settings.reply_mode; pacing.hidden = false;}).catch(() => {});
    pacingSave.addEventListener('click', async () => {
      pacingSave.disabled = true;
      try {const r = await fetch('/termux/live-tuning', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({reply_mode: pacingMode.value})}); const b = await r.json(); if (!r.ok) throw new Error(b.detail || 'Falha ao salvar.'); pacingMessage.textContent = 'Salvo para os próximos comentários. Nomes e personagens continuam aparecendo; o modo direto evita a leitura em voz alta antes da resposta.';}
      catch (error) {pacingMessage.textContent = error.message;} finally {pacingSave.disabled = false;}
    });
    pacing.append(pacingTitle, pacingMode, pacingSave, pacingMessage); card.append(pacing);
    status.closest('section').before(card);
    await refresh(); setInterval(() => refresh().catch(() => {}), 5000);
  }).catch(() => {});
})();
SNAKE_DEVICE_V024_FILE_4
cat >"$repair_stage/install-termux.sh" <<'SNAKE_DEVICE_V024_FILE_5'
#!/usr/bin/env bash
set -euo pipefail
adapter_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd -- "$adapter_dir"
if ! command -v python3 >/dev/null 2>&1; then
  printf 'Instale primeiro o pacote python no Termux.\n' >&2
  exit 1
fi
python3 -m snake_termux.prepare_project "$@"
python3 -m snake_termux.termux_packages
bash install-panel.sh
project_dir="$(cat state/project-path.txt)"
npm --prefix "$project_dir/server/external/tiktok-live-monitoring-server" ci
.venv/bin/python -m snake_termux.device_runtime --install
printf '\nPreparo concluído. Instale também o aplicativo oficial Termux:X11 no Android.\n'
printf 'Iniciar: bash start.sh\n'
SNAKE_DEVICE_V024_FILE_5
"$repair_python" - "$repair_stage" <<'SNAKE_CHECK_FILES'
import ast, pathlib, sys
for path in pathlib.Path(sys.argv[1]).rglob("*.py"):
    ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
SNAKE_CHECK_FILES
bash -n "$repair_stage/start.sh" "$repair_stage/install-termux.sh"
if command -v node >/dev/null 2>&1; then node --check "$repair_stage/snake_termux/ui.js"; fi
chmod 700 "$repair_stage/start.sh" "$repair_stage/install-termux.sh"
repair_started=1
for relative in "${repair_files[@]}"; do mv -f -- "$repair_stage/$relative" "$repair_target/$relative"; done
repair_complete=1
printf 'Arquivos GPU/áudio e janela atualizados. Backup: %s\n' "$repair_backup"
if [[ "$repair_files_only" == 0 ]]; then
  cd -- "$repair_target"
  "$repair_python" -m snake_termux.device_runtime --install
fi
printf 'Jogo original, configurações, progresso e modelos foram preservados.\n'
printf 'Para iniciar: cd "%s" && bash start.sh\n' "$repair_target"
