# Ben 10 · Clareira LIVE V46 — instalador R1

Atualização para a **V45.0.0 já instalada**. Mantém o Babylon.js, o progresso de DNA e as integrações existentes. Não é uma instalação completa e não baixa modelos de IA.

## Atualizar e iniciar no Termux

Baixe `BEN10_HEROIS_VILOES_V46_R1.zip` para Downloads. Cole:

```bash
cd ~/ben10-v34/game &&
python3 -m zipfile -e ~/storage/downloads/BEN10_HEROIS_VILOES_V46_R1.zip "$TMPDIR/ben10-v46" &&
bash "$TMPDIR/ben10-v46/BEN10_HEROIS_VILOES_V46/ATUALIZAR_V46.sh" "$PWD" &&
bash restart.sh
```

Abra **http://127.0.0.1:3000/?v=46.0.0** e confira V46 no topo. Se seu jogo fica em outra pasta, ajuste a primeira linha. Em outras sessões, basta `cd ~/ben10-v34/game && bash restart.sh`. Mantenha a sessão aberta durante a live.

O instalador R1 corrige a identificação e a espera pelo encerramento dos processos. Se o Android impedir confirmar o processo, pressione Ctrl+C na aba original do jogo e repita. Veja [o relatório do reparo](RELATORIO_REPARO_INSTALADOR_V46.md).

A atualização verifica hashes antes de copiar e guarda backup em `data/backups/before-v46-...`. Não altera `.env`, dados privados, modelos neurais, motor de voz ou a voz escolhida. A geração de falas continua usando a IA e a voz configuradas na sua instalação.

## Regras para explicar ao chat

| Comando/interação | Resultado |
|---|---|
| `HERÓI` ou `HEROI` | Entra no time dos heróis, mostrado à esquerda |
| `VILÃO` ou `VILAO` | Entra no time dos vilões |
| `VILAO DRONE` | Escolhe Drone Sombrio para as próprias invocações |
| `VILAO MUTANTE` | Escolhe Mutante Tóxico |
| `VILAO MAGO` | Escolhe Mago Tecno |
| `VILAO TITA` | Escolhe Titã de Ferro |
| Curtida de herói | Energia, XP e progresso para desbloquear DNA |
| Presente de herói | Reforço de energia, vida e dano, além das regras de presentes existentes |
| Curtida de vilão | Um inimigo com nome e foto de quem o enviou, colocado na fila de ondas |
| Presente de vilão | Inimigo elite, maior e mais resistente |
| `DANÇAR` | Pede uma dança por até 30 segundos; a fala e as ações têm prioridade |
| `PARAR DANÇA` | Cancela esse pedido; a dança automática da música pode ser desligada no painel |

Quem ainda não escolheu um time ajuda o Ben com curtidas. A troca de time tem uma espera de 15 segundos. Inimigos já enviados continuam pertencendo à onda anterior mesmo após a pessoa trocar de time.

Até **12 inimigos simultâneos**. As outras curtidas permanecem como créditos numéricos, sem criar milhares de objetos. O HUD mostra os que estão em campo e os da próxima onda. As fotos dependem de o TikTok fornecer uma imagem válida; quando ela falta ou expira, aparecem iniciais.

O combate básico do Ben é automático. Energia dos heróis, presentes e poderes alteram a batalha. A vitória concede XP. Se a vida chegar a zero, os vilões vencem e outra rodada começa após alguns segundos. O programa continua em execução.

## Interface e transformações

O cenário padrão é desenhado em 2D. Ben e as dez formas disponíveis têm artes 2D; algumas animações dos sete novos aliens usam três poses reaproveitadas. Alien X está identificado como extra de uma série posterior. A animação sentada ainda usa o modelo 3D original.

Toque na linha de DNA do HUD ou em **Omnitrix → Ver prévias das transformações**. As silhuetas abrem uma prévia colorida; uma prévia não libera o alien nem permite transformar antes da meta. As metas e os DNAs já conquistados foram mantidos.

A taça abre o top dos dois times. **Expandir painéis** mostra as missões, o ranking e os comandos detalhados. Os controles e o símbolo original do Omnitrix foram mantidos. Cenário e personagens 3D continuam disponíveis em Configurações.

## Música, dança e som de seguidor

Abra **Ações → Dança e som de seguidor**.

- Escolha um arquivo de música do aparelho e toque para reproduzir: o jogo analisa batidas do áudio local.
- Para música no YouTube/GreenTube/outro aplicativo, ajuste o BPM ou use **Toque a batida** e ative **Música em outro app**. O navegador não captura o som de outro aplicativo automaticamente.
- O Ben faz movimentos por poses, pulso e inclinação. Não é uma coreografia específica para uma letra. A conversa e os comandos interrompem a dança do personagem.
- Para novo seguidor, há um sinal Omnitrix próprio. Você pode escolher um áudio de até 5 MB; o jogo usa até seis segundos. O arquivo fica salvo nesse navegador, não é enviado ao servidor.
- Ative o som com o botão ♫. O navegador pode exigir um toque antes de reproduzir qualquer áudio. O volume geral de música e efeitos continua nas configurações.

Nenhuma música comercial acompanha este ZIP. O vídeo será preparado somente depois das próximas instruções do usuário.

## Reverter

Na pasta do jogo, troque pelo caminho do backup que apareceu na instalação:

```bash
node scripts/campaign-update.js --rollback 'data/backups/before-v46-SEU-BACKUP'
npm run build
bash restart.sh
```

O arquivo `COMO_REVERTER.txt`, dentro do backup, tem o comando exato. A reversão restaura o código e mantém os dados atuais, inclusive os arquivos novos de batalha, para uma atualização futura.

## Problema conhecido

O encerramento espontâneo do Termux (LOCAL-010) ainda precisa de reprodução e logs no Realme GT3. Esta versão limita entidades e caches, mas isso não comprova uma solução para encerramentos pelo Android. Veja o relatório para limites e evidências dos testes.
