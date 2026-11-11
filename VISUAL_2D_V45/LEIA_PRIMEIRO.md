# Ben 10 · Clareira LIVE V45.0 — visual 2D

Atualização visual para quem já tem a **V44.2.0 instalada**. Não é um instalador completo e não baixa modelos de IA. Ben, Chama, XLR8 e Diamante passam a usar desenhos com poses no cenário 3D existente. A IA, a voz, os dados e as integrações continuam na instalação atual.

## Instalar no Termux

Baixe `BEN10_VISUAL_2D_V45.zip` para Downloads. Na pasta do seu jogo:

```bash
cd ~/ben10-v34/game
python3 -m zipfile -e ~/storage/downloads/BEN10_VISUAL_2D_V45.zip "$TMPDIR/ben10-visual-v45"
bash "$TMPDIR/ben10-visual-v45/BEN10_VISUAL_2D_V45/ATUALIZAR_VISUAL_2D.sh" "$PWD"
bash restart.sh
```

Abra **http://127.0.0.1:3000/?v=45.0.0** e confirme V45.0.0 no painel. Se seu jogo estiver em outra pasta, troque somente o caminho da primeira linha. O instalador recusa uma versão anterior à V44.2 e não tenta migrar uma instalação desconhecida.

Em **Controles → Configurações → Visual dos personagens**, escolha Desenho clássico ou Modelos 3D originais. A escolha fica salva neste navegador. As outras sete formas continuam com os modelos originais. Sentar também usa temporariamente a animação 3D original, pois ainda não há uma pose 2D sentada específica.

## Backup e reversão

Antes de copiar os arquivos, o instalador valida os hashes e guarda os arquivos substituídos em `data/backups/before-v45-2d-...`. O caminho exato aparece no Termux. Nenhuma pasta de dados é restaurada por cima do seu progresso atual.

Para reverter, execute na pasta do jogo, trocando o caminho pelo backup exibido:

```bash
node scripts/visual2d-update.js --rollback 'data/backups/before-v45-2d-SEU-BACKUP'
npm run build
bash restart.sh
```

A reversão apaga apenas arquivos de código que foram adicionados por esta atualização e repõe os arquivos antigos. O backup inclui `COMO_REVERTER.txt` com o comando da sua instalação. Não apague o backup antes de decidir se vai ficar com a V45.

## Limites desta entrega

São oito poses por personagem, combinadas com movimento livre no cenário, alternância de passos, fala, cumprimento, salto e poder. Não são novos esqueletos 3D nem animações desenhadas quadro a quadro para todos os ângulos: a arte acompanha a câmera e pode se espelhar ao mudar de direção.

O funcionamento foi verificado em Chromium na nuvem. Ainda precisa de uma LIVE prolongada no Realme GT3 para medir FPS, temperatura e consumo real de memória. Esta atualização não comprova uma solução para encerramentos do Termux (LOCAL-010) nem altera o motor de voz.
