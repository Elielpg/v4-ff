# Jujutsu Live · Colônia Zero V0.2 — download completo

[**BAIXAR O ZIP COMPLETO**](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/JUJUTSU_COLONIA_ZERO_V0_2.zip) · 8,601,246 bytes.

[Relatório de alterações](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/JUJUTSU_COLONIA_ZERO_V0_2_RELATORIO.md) · [Prévia do jogo](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/JUJUTSU_COLONIA_ZERO_V0_2_PREVIA.png) · [Modelos](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/JUJUTSU_COLONIA_ZERO_V0_2_PERSONAGENS.png)

Novos GLBs esqueléticos próprios, 18 animações por modelo, confrontos de até três
incluindo NPCs, batalhas simultâneas, câmera por confronto, 36 técnicas e oito
expansões. Seguir ou Rosa concede entrada; TAP TAP ajuda, e 100 pontos permitem
uma regra controlada. Universo de fã inspirado em Jujutsu Kaisen.

## Atualizar V0.1 mantendo progresso

```bash
cd ~ &&
python3 -m zipfile -e ~/storage/downloads/JUJUTSU_COLONIA_ZERO_V0_2.zip . &&
bash ~/JUJUTSU_COLONIA_ZERO_V0_2/ATUALIZAR.sh ~/JUJUTSU_COLONIA_ZERO_V0_1 &&
cd ~/JUJUTSU_COLONIA_ZERO_V0_1 &&
bash start.sh
```

Se sua pasta antiga tiver outro nome, substitua esse caminho. O atualizador
confere a identidade, cria backup e mantém os dados. Não é atualização do Ben 10
ou PULSO ARENA.

## Instalação nova

```bash
cd ~ &&
python3 -m zipfile -e ~/storage/downloads/JUJUTSU_COLONIA_ZERO_V0_2.zip . &&
cd ~/JUJUTSU_COLONIA_ZERO_V0_2 &&
bash install.sh &&
bash start.sh
```

Requer Python e Node 22.19+. Abra **http://127.0.0.1:3200/?v=0.2.0** no Chrome e
toque em TESTAR A COLÔNIA para liberar som e demonstração. Conecte sua LIVE no
menu. O captador Android incluído precisa ser configurado para porta 3200.

## Verificação

62 testes passaram também no ZIP extraído. Instalação limpa, atualização V0.1→V0.2,
backup, recuperação e reversão foram testados em cópias isoladas. O código de
execução do pacote final foi comparado ao candidato instalado, e CRC/manifesto
foram conferidos. A LIVE real, captura Bluetooth e duração/FPS no GT3 ainda
precisam de validação no aparelho. Os modelos são estilizados próprios e as
falas são clipes ingleses originais, sem vozes de dubladores.

SHA-256 do ZIP:

```text
9f4086ddaa6c8095116ab86cd5cd32946b9e222c49e5b7493c6f4e30d4633dd5
```

[Arquivo de checksum](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/JUJUTSU_COLONIA_ZERO_V0_2.zip.sha256).
