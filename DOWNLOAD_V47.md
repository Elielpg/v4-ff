# Ben 10 · Animação LIVE 2D — V47

[Baixar V47 — ZIP, 41 MB](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_ANIMACAO_2D_V47.zip) · [Relatório](RELATORIO_V47.md) · [Testes](REGISTRO_TESTES_V47.json)

Atualização para a V45 ou V46 já instalada. Reaproveita o jogo, a IA local, a voz escolhida, os modelos, o progresso e as configurações. Não precisa repetir a instalação da IA.

## Instalar no Termux

Baixe `BEN10_ANIMACAO_2D_V47.zip` em Downloads e execute:

```bash
cd ~/ben10-v34/game &&
python3 -m zipfile -e ~/storage/downloads/BEN10_ANIMACAO_2D_V47.zip "$TMPDIR/ben10-v47" &&
bash "$TMPDIR/ben10-v47/BEN10_ANIMACAO_2D_V47/ATUALIZAR_V47.sh" "$PWD" &&
bash restart.sh
```

Abra **http://127.0.0.1:3000/?v=47.0.0** e confira V47 no topo. Nas próximas sessões: `cd ~/ben10-v34/game && bash restart.sh`.

O instalador confere os arquivos, identifica os processos desta instalação, faz backup e atualiza o código. Se o Android impedir confirmar a parada, pressione Ctrl+C na aba original do jogo, espere o prompt e repita. Não use `pkill node`.

## Animações e poderes

- Ben e as dez formas ganham 24 quadros adicionais cada: quatro para andar, quatro para correr, quatro para pular, quatro para lutar, quatro para dançar e quatro para sentar/levantar.
- Os quatro tipos de inimigo recebem aproximação, preparação do golpe, ataque, reação e queda. Os três estilos de visitante ganham passos de dança.
- São 324 quadros novos no total, incluindo 24 desenhos de efeitos. Os movimentos usam esses quadros, temporização e deformações leves contínuas. Não são ciclos de animação de estúdio com dezenas de desenhos por segundo.
- Fogo, água, cristais, cipós, energia, impactos, transformação, presentes e energia das curtidas usam o modo desenhado em 2D.
- Cada forma mantém os três poderes anteriores e ganha um especial: **ESPECIAL** ou **PODER 4** no chat. Também funciona pelo painel de poderes e pela tecla 4.
- **ANDAR ESQUERDA**, **CORRER DIREITA**, **PULAR**, **SENTAR**, **LEVANTAR** e **DANÇAR** continuam disponíveis. **DASH** é de XLR8; **ROLAR** é de Bola de Canhão. As transformações continuam exigindo DNA e respeitando o Omnitrix.

O cenário padrão é a clareira desenhada. Os recursos anteriores ficam guardados para retorno explícito ao modo original ou reversão. Times, ranking, fotos, curtidas, seguidores, presentes, metas e perguntas ao Ben foram mantidos.

## Colocar os personagens na batida

Abra **Ações → Dança e som de seguidor**.

**Arquivo de música no jogo:** escolha o áudio do aparelho. A detecção automática acompanha os graves e usa o tempo do áudio para marcar a dança. O indicador mostra o BPM estimado. A voz e as ações têm prioridade para o Ben; ele retoma a dança na marcação atual quando termina. Os visitantes podem continuar acompanhando a música.

**GreenTube ou outro aplicativo:** ative **Música em outro app / dançar com BPM**. Toque **Toque a batida** quatro vezes acompanhando a música. O navegador não recebe automaticamente o som de outro aplicativo. Ajustar o BPM ou usar os toques fixa a marcação manualmente.

Use **Adiantar / atrasar dança** para compensar a saída de som, especialmente em Bluetooth. Há três sequências: Groove, Herói e Robô. Para um arquivo com batida difícil de detectar, desmarque a detecção automática e marque o ritmo pelos toques. BPM, sequência e ajuste de atraso ficam salvos nesse navegador.

Nenhuma música comercial acompanha o ZIP. O som personalizado de seguidor continua disponível.

## Backup e reversão

O caminho do backup aparece no fim da instalação, em `data/backups/before-v47-...`. Há um arquivo `COMO_REVERTER.txt` com o comando exato. Exemplo:

```bash
cd ~/ben10-v34/game
node scripts/animation-update.js --rollback 'data/backups/before-v47-SEU-BACKUP'
npm run build
bash restart.sh
```

A reversão restaura o código anterior e mantém os dados atuais. O pacote é uma atualização do jogo instalado; não contém dependências, pesos neurais ou arquivos privados para uma instalação do zero.

O relatório e o registro de testes acompanham o ZIP. A parada espontânea do Termux (LOCAL-010) ainda precisa de diagnóstico no aparelho; os testes desta entrega não comprovam sua resolução no Android.
