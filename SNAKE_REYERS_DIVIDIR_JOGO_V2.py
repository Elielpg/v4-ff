#!/usr/bin/env python3
"""Split the user's original game into small valid ZIPs. No game execution or changes."""
from __future__ import annotations

import argparse
import contextlib
import hashlib
import json
import os
import re
import sys
import time
import zipfile
from pathlib import Path, PurePosixPath


SKIP_DIRS = {'.git', '.venv', 'venv', 'node_modules', '__pycache__', 'private', 'runs', 'logs'}


def is_game_exe(path: Path | PurePosixPath) -> bool:
    stem = re.sub(r'\s*\(\d+\)$', '', path.stem).casefold()
    return path.suffix.casefold() == '.exe' and re.sub(r'[^a-z0-9]', '', stem) == 'snakereyers'


def search_roots() -> list[Path]:
    home = Path.home()
    candidates = [home / 'storage/downloads', home / 'storage/shared/Download', home / 'Downloads', home / 'downloads', home / 'Download', Path('/storage/emulated/0/Download'), Path('/storage/emulated/0/Downloads'), Path('/storage/emulated/0/Documents'), Path('/storage/emulated/0/Telegram')]
    current = Path.cwd()
    if current != home and current != Path('/') and ('snake' in str(current).casefold() or 'download' in str(current).casefold()):
        candidates.append(current)
    try:
        candidates.extend(p for p in home.iterdir() if 'snake' in p.name.casefold() and p.is_dir())
    except OSError:
        pass
    roots = []
    seen = set()
    for candidate in candidates:
        try:
            resolved = candidate.resolve()
            if resolved not in seen and resolved.is_dir():
                roots.append(resolved)
                seen.add(resolved)
        except OSError:
            pass
    return roots


def discover_sources(roots: list[Path], max_depth: int = 7, limit: int = 30000) -> list[Path]:
    matches = set()
    visited = 0
    for root in roots:
        root = root.resolve()
        for directory, dirs, files in os.walk(root, followlinks=False):
            here = Path(directory)
            depth = len(here.relative_to(root).parts)
            dirs[:] = sorted(d for d in dirs if d.casefold() not in SKIP_DIRS and not d.startswith('.')) if depth < max_depth else []
            visited += len(files) + len(dirs)
            for name in sorted(files):
                path = here / name
                lowered = name.casefold()
                if is_game_exe(path):
                    try:
                        with path.open('rb') as stream:
                            if stream.read(2) == b'MZ':
                                matches.add(path.resolve())
                    except OSError:
                        pass
                elif path.suffix.casefold() == '.zip' and ('snake' in lowered or 'reyers' in lowered):
                    if any(word in lowered for word in ('diagnostico', 'diagnostic', 'parte_', 'partes_')):
                        continue
                    try:
                        with zipfile.ZipFile(path) as archive:
                            entries = [i for i in archive.infolist() if not i.is_dir() and is_game_exe(PurePosixPath(i.filename.replace('\\', '/')))]
                        if len(entries) == 1:
                            matches.add(path.resolve())
                    except (OSError, ValueError, zipfile.BadZipFile, RuntimeError):
                        pass
            if visited >= limit:
                return sorted(matches, key=lambda p: ('0.1.9' not in str(p), p.suffix.casefold() != '.zip', str(p)))
    return sorted(matches, key=lambda p: ('0.1.9' not in str(p), p.suffix.casefold() != '.zip', str(p)))


def select_source(matches: list[Path], *, interactive: bool, input_fn=input) -> Path:
    if not matches:
        raise ValueError('Não encontrei o jogo nas pastas acessíveis de Download/Downloads, Documents, Telegram e pastas Snake. Pelo aplicativo Arquivos, mova o ZIP original ou SnakeReyers.exe para Download. Se necessário, libere o armazenamento com termux-setup-storage. Também é possível informar o caminho com --arquivo.')
    if len(matches) == 1:
        return matches[0]
    print('Encontrei mais de um arquivo. Escolha o pacote 0.1.9 ou seu executável:')
    for index, path in enumerate(matches, 1):
        print(f'  {index}. {path}')
    if not interactive:
        raise ValueError('Há vários candidatos. Execute novamente com --arquivo e o caminho do arquivo escolhido.')
    while True:
        try:
            answer = input_fn(f'Digite o número (1–{len(matches)}): ').strip()
        except EOFError as error:
            raise ValueError('Seleção interrompida. Use --arquivo para informar o caminho diretamente.') from error
        if answer.isdecimal() and 1 <= int(answer) <= len(matches):
            return matches[int(answer) - 1]
        print('Número inválido; escolha um dos arquivos listados.')


def output_root(source: Path) -> Path:
    for candidate in [Path.home() / 'storage/downloads', Path('/storage/emulated/0/Download'), Path.home() / 'Downloads']:
        if candidate.is_dir() and os.access(candidate, os.W_OK):
            return candidate.resolve()
    return source.parent.resolve()


def split_game(source: Path, output: Path, chunk_mb: int = 24) -> dict:
    source = source.expanduser().resolve()
    if not source.is_file():
        raise ValueError(f'Não encontrei {source}. Use --arquivo com o caminho do ZIP original ou do SnakeReyers.exe.')
    if not 1 <= chunk_mb <= 24:
        raise ValueError('O tamanho de cada parte deve ficar entre 1 e 24 MB.')
    if output.exists():
        raise ValueError(f'A pasta de saída já existe: {output}. Nenhum arquivo foi sobrescrito.')
    with contextlib.ExitStack() as stack:
        game_files = []
        if zipfile.is_zipfile(source):
            original = stack.enter_context(zipfile.ZipFile(source))
            entries = [item for item in original.infolist() if not item.is_dir() and is_game_exe(PurePosixPath(item.filename.replace('\\', '/'))) ]
            if len(entries) != 1:
                raise ValueError(f'O ZIP contém {len(entries)} entradas SnakeReyers.exe; preciso de uma única entrada para identificar o jogo.')
            entry = entries[0]
            stream = stack.enter_context(original.open(entry))
            filename, size = 'SnakeReyers.exe', entry.file_size
            game_files = [{'name': item.filename, 'bytes': item.file_size} for item in original.infolist() if '/game/' in '/' + item.filename.replace('\\', '/').lower() and not item.is_dir()]
        else:
            if not is_game_exe(source):
                raise ValueError('Informe o ZIP original ou um arquivo chamado SnakeReyers.exe.')
            stream = stack.enter_context(source.open('rb'))
            filename, size = 'SnakeReyers.exe', source.stat().st_size
        if size < 2:
            raise ValueError('O executável está vazio ou incompleto.')
        output.mkdir(parents=True)
        full_hash = hashlib.sha256()
        parts = []
        total = 0
        chunk_bytes = chunk_mb * 1024 * 1024
        while True:
            chunk = stream.read(chunk_bytes)
            if not chunk:
                break
            if total == 0 and chunk[:2] != b'MZ':
                raise ValueError('O arquivo encontrado não tem o cabeçalho esperado de um executável Windows.')
            index = len(parts) + 1
            target = output / f'SNAKE_JOGO_PARTE_{index:03}.zip'
            with zipfile.ZipFile(target, 'x', zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
                archive.writestr('parte.bin', chunk)
            full_hash.update(chunk)
            parts.append({'index': index, 'file': target.name, 'bytes': len(chunk), 'sha256': hashlib.sha256(chunk).hexdigest()})
            total += len(chunk)
            print(f'Parte {index}: {len(chunk) / 1024 / 1024:.1f} MB do executável.', flush=True)
        if total != size:
            raise ValueError('O tamanho lido não coincide com o executável original; não envie estas partes.')
    manifest = {'format': 'snake-reyers-original-binary-parts-v1', 'filename': filename, 'bytes': total, 'sha256': full_hash.hexdigest(), 'part_count': len(parts), 'parts': parts, 'game_files': game_files, 'note': 'Original game binary only, split without changes. Not a port or an unofficial game distribution. Upload all parts privately to the assistant for compatibility analysis.'}
    for part in parts:
        target = output / part['file']
        with zipfile.ZipFile(target, 'a', zipfile.ZIP_DEFLATED) as archive:
            archive.writestr('manifesto.json', json.dumps({**manifest, 'this_part': part['index']}, ensure_ascii=False, indent=2))
        if target.stat().st_size >= 32 * 1024 * 1024:
            raise ValueError('Uma parte excedeu o limite de 32 MB; não envie estas partes.')
    (output / 'manifesto.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    return manifest


def main() -> int:
    parser = argparse.ArgumentParser(description='Cria ZIPs menores do executável original, sem executá-lo ou alterá-lo.')
    parser.add_argument('--arquivo', type=Path, default=None)
    parser.add_argument('--saida', type=Path, default=None)
    parser.add_argument('--tamanho-mb', type=int, default=24)
    parser.add_argument('--procurar', action='store_true', help='Somente lista os arquivos encontrados, sem criar partes.')
    args = parser.parse_args()
    try:
        if args.arquivo:
            source = args.arquivo.expanduser()
            if args.procurar:
                if not source.is_file():
                    raise ValueError(f'Arquivo não encontrado: {source}')
                print(source.resolve())
                return 0
        else:
            print('Procurando o ZIP ou executável nas pastas acessíveis…', flush=True)
            matches = discover_sources(search_roots())
            if args.procurar:
                for match in matches:
                    print(match)
                if not matches:
                    print('Nenhum arquivo encontrado. Mova o jogo para Download ou use --arquivo.')
                return 0 if matches else 1
            source = select_source(matches, interactive=sys.stdin.isatty())
        print('Arquivo escolhido:', source, flush=True)
        output = args.saida or output_root(source) / ('SNAKE_PARTES_' + time.strftime('%Y%m%d_%H%M%S'))
        manifest = split_game(source, output, args.tamanho_mb)
    except KeyboardInterrupt:
        print('\nCancelado. O arquivo original foi preservado.', file=sys.stderr)
        return 130
    except (OSError, ValueError, RuntimeError, zipfile.BadZipFile) as error:
        print('Erro:', error, file=sys.stderr)
        return 1
    print(f'Pronto: {output}')
    print(f'Envie todos os {manifest["part_count"]} arquivos SNAKE_JOGO_PARTE_*.zip desta pasta.')
    print('O arquivo original foi preservado. Nenhum executável foi iniciado.')
    print('SHA-256 do executável:', manifest['sha256'])
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
