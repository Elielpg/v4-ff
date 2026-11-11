# Clareira LIVE V46 — Heróis contra Vilões

[**Baixar atualização V46 — ZIP (9,7 MB)**](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_HEROIS_VILOES_V46.zip)

Requer a **V45.0.0 instalada**. Mantém IA/voz, configurações, progresso e integrações. Não é um instalador completo e não baixa modelos neurais.

## Atualizar e iniciar

Com o ZIP em Downloads:

```bash
cd ~/ben10-v34/game
python3 -m zipfile -e ~/storage/downloads/BEN10_HEROIS_VILOES_V46.zip "$TMPDIR/ben10-v46"
bash "$TMPDIR/ben10-v46/BEN10_HEROIS_VILOES_V46/ATUALIZAR_V46.sh" "$PWD"
bash restart.sh
```

Abra **http://127.0.0.1:3000/?v=46.0.0**. Nas próximas sessões, basta `cd ~/ben10-v34/game && bash restart.sh`.

## O que entra nesta versão

- Cenário desenhado, Ben e dez formas com visual 2D. Espectadores em 2D com fotos e identificação do time.
- `HERÓI`: curtidas/presentes ajudam o Ben. `VILÃO`: curtidas criam inimigos com foto e nome do autor; presentes criam elites.
- Quatro tipos de inimigo: `VILAO DRONE`, `VILAO MUTANTE`, `VILAO MAGO`, `VILAO TITA`.
- Ondas com até doze inimigos simultâneos; créditos restantes ficam na fila numérica.
- HUD com vida, energia, níveis, rodada, tops dos dois times e prévias das transformações bloqueadas.
- Falas de equipe e contexto da batalha para a IA local existente.
- Dança com batidas de arquivo local ou BPM/tap tempo para música em outro app.
- Sinal Omnitrix para novo seguidor e escolha de áudio personalizado no navegador.

[Guia completo e reversão](LEIA_PRIMEIRO_V46.md) · [Relatório de arquitetura e pendências](RELATORIO_V46.md) · [Registro de testes](REGISTRO_TESTES_V46.json) · [Prévia em DEMO](BEN10_V46_PREVIA.png)

A suíte passou em 296 testes; há verificações no navegador, teste de carga do backend e instalação/reversão. Não foi feito benchmark no celular nem conectada uma LIVE real neste ambiente. LOCAL-010 segue pendente de reprodução no Android. As sete formas adicionadas usam três poses reutilizadas; sentar mantém o modelo 3D original. Música de outro aplicativo não tem captura automática de batidas.

O vídeo novo será feito depois das próximas instruções do usuário.
