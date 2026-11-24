#!/usr/bin/env python3
"""Independent offline ZIP compatibility collector; never runs the game or changes it."""
from __future__ import annotations

import argparse
import hashlib
import json
import struct
import sys
import time
import zipfile
from pathlib import Path, PurePosixPath

MAX_CODE = 24 * 1024 * 1024
MAX_FILE = 2 * 1024 * 1024
TEXT_EXTENSIONS = {'.py', '.js', '.mjs', '.cjs', '.ts', '.html', '.css', '.json', '.md', '.txt', '.toml', '.yaml', '.yml', '.sh', '.ps1', '.bat'}
EXCLUDE_DIRS = {'private', 'secrets', 'secret', 'cookies', 'sessions', 'runs', 'logs', 'node_modules', '.git', '.venv', 'venv', '__pycache__', 'site-packages', 'assets', 'audio', 'music', 'models', 'model', 'tts_models'}


def safe_path(name: str) -> PurePosixPath | None:
    path = PurePosixPath(name.replace('\\', '/'))
    if path.is_absolute() or '..' in path.parts or any(':' in p for p in path.parts):
        return None
    return path


def header_info(data: bytes) -> dict:
    if data[:4] == b'GDPC' and len(data) >= 24:
        fmt, major, minor, patch, flags = struct.unpack_from('<IIIII', data, 4)
        return {'format': 'Godot PCK', 'pack_format': fmt, 'engine': f'{major}.{minor}.{patch}', 'flags': flags}
    if data[:2] == b'MZ':
        result = {'format': 'Windows PE'}
        if len(data) >= 64:
            offset = struct.unpack_from('<I', data, 60)[0]
            if offset + 6 <= len(data) and data[offset:offset + 4] == b'PE\0\0':
                machine = struct.unpack_from('<H', data, offset + 4)[0]
                result['architecture'] = {0x8664: 'x86_64', 0x14C: 'x86', 0xAA64: 'ARM64'}.get(machine, hex(machine))
        return result
    if data[:4] == b'\x7fELF':
        return {'format': 'Linux ELF', 'machine': struct.unpack_from('<H', data, 18)[0] if len(data) >= 20 else None}
    return {'magic_hex': data[:8].hex()}


def collect(source: Path, output: Path) -> dict:
    if not source.is_file():
        raise ValueError(f'ZIP não encontrado: {source}. Confira o nome na pasta Downloads.')
    if not zipfile.is_zipfile(source):
        raise ValueError('O arquivo não é um ZIP válido ou o download está incompleto.')
    if output.exists():
        raise ValueError(f'A saída já existe: {output}. Escolha outro nome com --saida.')
    digest = hashlib.sha256()
    with source.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(block)
    report = {'tool': 'independent-snakereyers-compatibility-collector-1', 'original_name': source.name, 'original_bytes': source.stat().st_size, 'original_sha256': digest.hexdigest(), 'files': [], 'binaries': [], 'code_copied': [], 'code_skipped': [], 'note': 'Only public-style text source and package metadata. Private folders, environments, game scripts, assemblies, models, sounds and executables are not copied. The original ZIP is unchanged.'}
    total_code = 0
    output.parent.mkdir(parents=True, exist_ok=True)
    try:
        with zipfile.ZipFile(source) as original, zipfile.ZipFile(output, 'x', zipfile.ZIP_DEFLATED, compresslevel=6) as diagnostic:
            seen = set()
            for item in original.infolist():
                if item.is_dir():
                    continue
                path = safe_path(item.filename)
                if path is None:
                    report['code_skipped'].append({'file': item.filename, 'reason': 'unsafe path'})
                    continue
                name = path.as_posix()
                report['files'].append({'path': name, 'bytes': item.file_size, 'compressed_bytes': item.compress_size})
                lower = name.lower()
                if path.suffix.lower() in {'.exe', '.pck', '.x86_64'}:
                    with original.open(item) as stream:
                        info = header_info(stream.read(65536))
                    report['binaries'].append({'path': name, 'bytes': item.file_size, **info})
                parts = {p.lower() for p in path.parts}
                if parts & EXCLUDE_DIRS or path.name.startswith('.') or any(p.startswith(('python', 'tor-browser')) for p in parts):
                    continue
                eligible = path.suffix.lower() in TEXT_EXTENSIONS or path.name.upper() in {'LICENSE', 'COPYING'}
                if not eligible:
                    continue
                if any(word in path.name.lower() for word in ('credential', 'cookie', 'secret', 'api_key', 'apikey', 'token', 'session')) and path.suffix.lower() in {'.json', '.txt', '.yaml', '.yml'}:
                    continue
                if item.file_size > MAX_FILE or total_code + item.file_size > MAX_CODE:
                    report['code_skipped'].append({'file': name, 'reason': 'size limit'})
                    continue
                destination = 'codigo/' + name
                if destination in seen:
                    continue
                data = original.read(item)
                try:
                    data.decode('utf-8-sig')
                except UnicodeDecodeError:
                    continue
                diagnostic.writestr(destination, data)
                seen.add(destination)
                total_code += len(data)
                report['code_copied'].append(name)
            diagnostic.writestr('DIAGNOSTICO.json', json.dumps(report, ensure_ascii=False, indent=2))
        if output.stat().st_size >= 32 * 1024 * 1024:
            raise ValueError('Diagnóstico excedeu 32 MB; não foi criado um pacote adequado para envio.')
    except Exception:
        output.unlink(missing_ok=True)
        raise
    return report


def main() -> int:
    parser = argparse.ArgumentParser(description='Cria um ZIP pequeno de diagnóstico; não instala nem executa o Snake Reyers.')
    parser.add_argument('--arquivo', type=Path, default=Path.home() / 'storage/downloads/SnakeReyers-0.1.9-Windows-x64.zip')
    parser.add_argument('--saida', type=Path)
    args = parser.parse_args()
    output = args.saida or args.arquivo.parent / ('SNAKE_REYERS_DIAGNOSTICO_' + time.strftime('%Y%m%d_%H%M%S') + '.zip')
    try:
        report = collect(args.arquivo.expanduser(), output.expanduser())
    except (OSError, ValueError, zipfile.BadZipFile, RuntimeError) as error:
        print('Não foi possível criar o diagnóstico:', error, file=sys.stderr)
        return 1
    print(f'Pronto: {output}')
    print(f'Tamanho: {output.stat().st_size / 1024 / 1024:.2f} MB; {len(report["code_copied"])} arquivos de texto.')
    print('Envie o ZIP de diagnóstico criado. O arquivo original foi preservado.')
    for binary in report['binaries'][:12]:
        print('Jogo/binário:', binary['path'], binary.get('architecture', binary.get('engine', binary.get('format', ''))))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
