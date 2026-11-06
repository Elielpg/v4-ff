# V42.4 · Conversa e voz locais

[Baixar reparo pequeno para V42](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_REPARO_CONVERSA_V42_4.zip) · [ZIP completo](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_LIVE_V42_4_TERMUX.zip)

Baixe o reparo pequeno, pare o jogo/IA com Ctrl+C e execute:

```sh
cd ~/ben10-v34/game &&
python3 -m zipfile -e ~/storage/downloads/BEN10_REPARO_CONVERSA_V42_4.zip "$TMPDIR/ben10-reparo-42-4" &&
bash "$TMPDIR/ben10-reparo-42-4/REPARAR_CONVERSA_V42_4.sh" &&
bash local-ai.sh voice cadu &&
bash local-ai.sh start
```

Abra http://127.0.0.1:3000/?v=42.4.0 e ative ♫. O reparo aplica 20 arquivos com backup e mantém dados e pesos instalados. O comando de voz baixa apenas a voz. Não é preciso aplicar os dois ZIPs.

199 testes Node aprovados, incluindo 10 testes Python. Fluxo no navegador validado em 360/500/1280, com modelos simulados. A pronúncia da voz Cadu precisa ser ouvida no telefone.


O teste enviado pelo usuário confirmou `conversationProvider=local`, `voiceProvider=local` e uma resposta neural correta a sete vezes oito, em 9843 ms. Portanto, cadastrar outra chave ou reinstalar o modelo de conversa não é necessário.

Frases como “você gosta de correr” e “me conta sobre o XLR8” podiam ser consumidas como ações. Agora perguntas, pedidos de explicação e assuntos de conversa vão para a IA. Comandos diretos como `correr direita`, `Chama` e `poder 3` continuam funcionando.

Comentários comuns passam à frente de saudações automáticas; quem presenteia mantém a prioridade. A fala em geração recebe uma reserva de quatro minutos até o ACK, em vez de expirar nos 45 segundos de espera da fila. Não interrompe quem está falando. O indicador mostra “Pensando” e o nome do espectador. Ainda é preciso ativar ♫ e receber eventos da LIVE.

Ben continua criança do clássico em todas as formas. A conversa recebe até duas trocas anteriores por espectador, referências selecionadas de poderes e aventuras e exemplos de respostas sobre assuntos gerais. O contexto do launcher passa a 4096 tokens e a geração tem até 192 tokens e 90 segundos. Não consulta episódios ou notícias na internet: o conhecimento vem do modelo e das referências locais; pode errar. Títulos e detalhes incertos não devem ser inventados. As referências novas usam títulos originais para evitar traduções regionais incorretas.

## Pronúncia do R

O usuário confirmou `pt-br` e IDs diferentes para `l`, `r`, `ɹ`, `ɾ` e `ʁ`. O fonemizador Piper 1.8.0 foi executado em Linux: produz fonemas de R em “agora”, “relógio”, “Quatro Braços” e “corre rápido”. Isso verifica a entrada fonética, não o resultado acústico do ONNX Faber no telefone. Não há evidência suficiente para atribuir a troca ao texto ou garantir que uma alteração de letras a corrigiria.

A atualização permite comparar três modelos neurais brasileiros do catálogo público do Piper: Cadu, Faber e Jeff. Não altera R para L nem L para R no texto. Não promete a dublagem original. Pare a sessão com Ctrl+C e execute:

```sh
cd ~/ben10-v34/game
bash local-ai.sh voice cadu
bash local-ai.sh start
```

O comando baixa apenas ONNX, configuração e MODEL_CARD da voz escolhida, valida hashes e idioma e só então grava a seleção no manifesto. O GGUF e o ambiente Debian não são reinstalados. Se o download falhar, a seleção anterior fica preservada. A voz anterior permanece em disco. Para comparar de novo, substitua `cadu` por `faber` ou `jeff`, pare e reinicie a sessão.

Em LIVE → IA e voz existe uma frase editável para ouvir a pronúncia: “Agora o relógio está pronto. Quatro Braços corre rápido. Bora transformar!”. O diagnóstico informa o modelo realmente em uso. Nenhuma descrição de interpretação é enviada ao TTS.

Catálogo público consultado: https://github.com/rhasspy/piper/blob/master/VOICES.md . Modelos são obtidos de `rhasspy/piper-voices` com revisão fixa e hash do catálogo. Os créditos de cada nova voz ficam em `~/.local/share/ben10-local-ai/voices/<nome>/MODEL_CARD`.

## Atualizar

Com o ZIP completo baixado, pare a IA/jogo com Ctrl+C e use:

```sh
cd ~/ben10-v34/game
bash update.sh --archive ~/storage/downloads/BEN10_LIVE_V42_4_TERMUX.zip
bash local-ai.sh voice cadu
bash local-ai.sh start
```

Quem já tem V42 a V42.4 pode usar `BEN10_REPARO_CONVERSA_V42_4.zip`: extrair em pasta temporária e executar `REPARAR_CONVERSA_V42_4.sh` de dentro da pasta do jogo. Ele aplica os arquivos alterados com backup em `data/installer-backups`. Não executa downloads, não modifica chaves, `.env`, progresso, fontes APT nem os modelos. Depois use os dois comandos de voz e início acima. Não é preciso aplicar os dois pacotes.

## Validação

Testes de roteamento de comentários, contexto e memória, prioridade e reserva da fala, respostas HTTP locais e WAV, troca de voz sem download do GGUF, preservação da seleção em falha e atualização com backup. Navegador e ZIP são testados isoladamente. LLM e áudio nesses testes são fixtures: não avaliam qualidade da conversa nem pronúncia. Pesos Cadu/Faber/Jeff e GGUF não foram executados na nuvem; a comparação acústica depende do telefone.
