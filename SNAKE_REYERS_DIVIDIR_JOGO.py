#!/usr/bin/env python3
"""Split the user's original game into small valid ZIPs. No game execution or changes."""
from __future__ import annotations

import argparse
import contextlib
import hashlib
import json
import sys
import time
import zipfile
from pathlib import Path, PurePosixPath


def default_source() -> Path:
    downloads = Path.home() / 'storage/downloads'
    for candidate in [downloads / 'SnakeReyers-0.1.9-Windows-x64.zip', downloads / 'SnakeReyers.exe']:
        if candidate.is_file():
            return candidate
    return downloads / 'SnakeReyers-0.1.9-Windows-x64.zip'


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
            entries = [item for item in original.infolist() if not item.is_dir() and PurePosixPath(item.filename.replace('\\', '/')).name.lower() == 'snakereyers.exe']
            if len(entries) != 1:
                raise ValueError(f'O ZIP contém {len(entries)} entradas SnakeReyers.exe; preciso de uma única entrada para identificar o jogo.')
            entry = entries[0]
            stream = stack.enter_context(original.open(entry))
            filename, size = 'SnakeReyers.exe', entry.file_size
            game_files = [{'name': item.filename, 'bytes': item.file_size} for item in original.infolist() if '/game/' in '/' + item.filename.replace('\\', '/').lower() and not item.is_dir()]
        else:
            if source.name.lower() != 'snakereyers.exe':
                raise ValueError('Informe o ZIP original ou um arquivo chamado SnakeReyers.exe.')
            stream = stack.enter_context(source.open('rb'))
            filename, size = source.name, source.stat().st_size
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
    args = parser.parse_args()
    source = args.arquivo or default_source()
    output = args.saida or Path.home() / 'storage/downloads' / ('SNAKE_PARTES_' + time.strftime('%Y%m%d_%H%M%S'))
    try:
        manifest = split_game(source, output, args.tamanho_mb)
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
