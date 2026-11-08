# Ben 10 · Clareira LIVE · V43.7

[Baixar atualização V43.7](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_ATUALIZACAO_V43_7.zip?v=43.7.0) · [Projeto completo V43.7](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_LIVE_V43_7_TERMUX.zip?v=43.7.0)


Atualiza fala, contagem de curtidas e pedidos de música. Preserva o Omnitrix, ranking, comandos e cenário.

## Atualizar o jogo existente

Baixe BEN10_ATUALIZACAO_V43_7.zip para Downloads. Em outra sessão do Termux:

```bash
cd ~/ben10-v34/game &&
python3 -m zipfile -e ~/storage/downloads/BEN10_ATUALIZACAO_V43_7.zip "$TMPDIR/ben10-live-43-7" &&
bash "$TMPDIR/ben10-live-43-7/ATUALIZAR_LIVE_V43_7.sh" &&
bash local-ai.sh start
```

Abra http://127.0.0.1:3000/?v=43.7.0 e toque na tela para ativar o áudio. Mantenha a sessão do Termux aberta. O comando confere versões e reinicia somente os serviços confirmados desta instalação quando necessário.

Não instala nem baixa modelos novamente. A voz selecionada, amostra do Ben, chaves, .env, progresso e fontes APT são preservados. Arquivos substituídos ficam em data/installer-backups. Se a voz atual é OpenVoice, ela continua sendo OpenVoice; a atualização não troca para voz do aparelho.

Para iniciar nas próximas vezes: `cd ~/ben10-v34/game && bash local-ai.sh start`. Para parar: `bash local-ai.sh stop`. Para conferir: `bash local-ai.sh status`.

## Falas com menos espera

Saudações e agradecimentos ficaram mais curtos. Chegadas e comandos automáticos deixam espaço para perguntas; não continuam acumulando saudações enquanto há conversa aguardando. O nome aparece completo na interface, mas a fala remove números de identificadores como eva297366 para não ler um número enorme.

O prompt local passou de aproximadamente 788 para 396 tokens no teste sem histórico. As duas últimas interações da pessoa continuam disponíveis, com limite menor de texto. Durante a reprodução de uma fala, o jogo pode preparar a próxima resposta e iniciar sua síntese. O cache usa a mesma tarefa quando essa mensagem chega à vez; preparar não confirma nem consome a mensagem. Presentes mantêm prioridade e o áudio em reprodução termina antes da próxima fala.

Falhas temporárias conhecidas de rede/serviço continuam tentando novamente com intervalo; não param definitivamente após três falhas. Quando o próprio navegador bloqueia ou interrompe o áudio, aparece o botão para retomar por toque. Volume zerado ou falha persistente do sintetizador continuam mostrando o erro.

A máquina de testes, com CPU e gráficos por software, respondeu à multiplicação em 37,2 s; a medição anterior foi 60,7 s. A nova fala teve 9,1 s de geração e foi capturada na saída do Chromium. São medições pontuais, com respostas de comprimentos diferentes, não uma promessa de velocidade no GT3. A IA local ainda precisa processar cada pergunta. O teste de fila confirma a preparação da próxima voz durante a fala atual; nesse teste específico a síntese é simulada. A prova da voz real fica separada em reports/v43_7/full-audio.json, captured-speech-asr.json e browser-voice-captured.wav. A transcrição é automática e não certifica cada palavra ou identidade da voz.

## Curtidas

IDs vazios ou zero deixam de ser tratados como identificadores reais repetidos. Antes, uma entrada com ID zero podia fazer os likes seguintes com o mesmo valor serem descartados. IDs válidos repetidos continuam sem duplicar. Lotes de mais de mil curtidas não são cortados em mil antes de chegar ao DNA e à missão.

Testes exercitam o protobuf real do PirateTok, os dois adaptadores e a API do jogo. O caso controlado de 17 + 23 curtidas com ID zero passou de zero para 40. Os contadores usam os eventos recebidos, não estimam curtidas que o TikTok não entregou.

A conexão de eventos do jogo aparece separada do estado da LIVE. Se ela cair, uma consulta ao servidor atualiza os contadores enquanto tenta reconectar. O diagnóstico da LIVE mostra likesReceived e lastLikeAt. Isso não cria curtidas quando a conexão com o TikTok está parada. O TAP TAP dentro do cenário, durante a LIVE, continua sendo prévia visual; as curtidas reais chegam dos espectadores pelo TikTok. No modo DEMO ele serve para testar a contagem local separada.

## Música pelo chat

O público pode escrever:

```text
!musica Chase Atlantic - Swim
!musica Chris Grey - LET THE WORLD BURN
!musica https://www.youtube.com/watch?v=ID_DO_VIDEO
```

Abra Ações → Pedidos de música. Pedidos por nome entram na fila e aguardam você escolher a gravação e colar o link. Há sugestões de dark romance em inglês; não são arquivos de áudio incluídos. Pedidos com link válido do YouTube já podem tocar. Toque em Tocar fila ou Tocar no pedido. Se o navegador pedir, toque no botão ▶ do próprio vídeo.

O player oficial permanece visível, avança quando o vídeo termina, permite pausar/pular e abaixa o volume enquanto o Ben fala. O host pode remover pedidos. Há limite de dois pedidos aguardando por espectador e dez segundos entre pedidos; o host pode organizar mais faixas pelo painel. Pedidos não entram na fila de voz/IA. Testes DEMO e LIVE têm filas separadas.

Green Tube: use o app para encontrar a música e copie o link compartilhado para o pedido. Abrir no app/YouTube abre a URL no aplicativo escolhido pelo Android, se ele oferecer suporte. A atualização não controla o Green Tube nem promete uma integração privada com ele. O player dentro do jogo usa YouTube e precisa de internet; disponibilidade, bloqueio de incorporação e reprodução dependem do vídeo e do navegador. Se um vídeo não tocar incorporado, abra no app, troque o link ou avance a fila. Não há busca automática por nome nem download de músicas.

Nos testes automatizados, fila, controles, avanço e redução do volume usam um stub do player YouTube. Não foi verificada reprodução de uma música remota neste ambiente, nem o aplicativo Green Tube. Os testes não acessam a LIVE do usuário nem medem o alto-falante físico do telefone.

## Diagnóstico e instalação nova

Teste de som separado: http://127.0.0.1:3000/sound-test.html. Testa fala já gravada, resposta da IA e geração de voz. LIVE → IA e voz → Copiar diagnóstico inclui fila, versões e erros de sincronização, sem chaves.

No ZIP completo, extraia game e execute `bash install.sh`. Em uma instalação sem IA, execute uma vez `bash local-ai.sh install`, `bash local-ai.sh clone fast` e `bash local-ai.sh start`. A instalação inicial dos modelos precisa de internet. Depois a conversa e a voz são locais; TikTok e música online continuam precisando de internet.

OpenVoice: https://github.com/myshell-ai/OpenVoice, revisão 74a1d147b17a8c3092dd5430504bd83ef6c7eb23. Código e licença MIT em scripts/local-ai/vendor/openvoice. Pesos OpenVoiceV2 fixados na revisão f36e7edfe1684461a8343844af60babc2efbb727 e conferidos por hash. Piper pt_BR-cadu-medium inclui créditos no MODEL_CARD baixado junto da voz. A referência do Ben é a amostra fornecida pelo usuário.
