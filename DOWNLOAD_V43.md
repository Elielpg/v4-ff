# V43 · Conversa e clonagem opcional

[Baixar reparo pequeno para V42/V43](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_REPARO_V43.zip) · [ZIP completo V43](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_LIVE_V43_TERMUX.zip)

Pare a sessão com Ctrl+C. Depois de baixar o reparo:

```sh
cd ~/ben10-v34/game &&
python3 -m zipfile -e ~/storage/downloads/BEN10_REPARO_V43.zip "$TMPDIR/ben10-reparo-v43" &&
bash "$TMPDIR/ben10-reparo-v43/REPARAR_BEN_V43.sh" &&
bash local-ai.sh start
```

O reparo aplica 28 arquivos com backup e mantém dados e modelos. **A voz clonada ainda precisa da amostra WAV.** Atualizar o chat não inicia downloads do clonador nem troca a voz atual. O motor foi compilado em Linux; a clonagem é experimental no Termux e precisa ser ouvida e medida no aparelho.

205 testes Node aprovados, incluindo 14 testes Python. Navegador validou oi/olá e recuperação após falha de voz com fixtures. O ZIP foi extraído e iniciou o servidor.


## O que foi corrigido na conversa

“Oi”, “olá”, “bom dia” e outras saudações completas recebem uma resposta curta pertinente, com o nome do espectador. Essa via é um roteiro rápido, identificado como `social`, e usa a voz IA selecionada. Não é apresentada como resposta do modelo. “Oi, por que chove?” continua indo para a IA de conversa. O botão de teste de IA sempre testa o modelo real, inclusive com “oi”.

Uma falha no áudio podia confirmar a mensagem e passar à próxima sem falar. Agora a interface guarda a resposta, tenta a voz novamente e só confirma depois da reprodução. Não regenera o texto em cada tentativa. Um ACK perdido também não repete o áudio já reproduzido. Após três falhas, mostra a pausa e permite tentar de novo tocando em ♫. A reserva do servidor continua limitada a quatro minutos; não é armazenamento permanente de comentários.

Mensagens diferentes da mesma pessoa não são mais descartadas pela antiga janela de três segundos. Só duplicatas idênticas nessa janela são ignoradas; há limite de três comentários pendentes por pessoa para proteger a fila. Presentes mantêm prioridade. A voz e a conversa continuam independentes, e não existe voz do aparelho como substituta automática.

## Modelo de clonagem pesquisado

- Oficial: [Qwen3-TTS](https://github.com/QwenLM/Qwen3-TTS), modelo `Qwen/Qwen3-TTS-12Hz-0.6B-Base`, com português e clonagem a partir de referência. Código/modelos sob Apache 2.0 conforme o projeto.
- Motor nativo: [predict-woo/qwen3-tts.cpp](https://github.com/predict-woo/qwen3-tts.cpp), MIT, fixado em `b3ba14077cf1b3e11b86e5f84aa9184605c89b28`, com GGML fixado pelo submódulo. O pacote chama a C API por ctypes, mantém modelos e embedding da referência carregados e força o token de português `2071`.
- Também foram consultados [Chatterbox](https://github.com/resemble-ai/chatterbox) e [OpenVoice](https://github.com/myshell-ai/OpenVoice). A integração entregue usa Qwen3-TTS nativo para evitar PyTorch durante as falas da LIVE.

Não há um modelo pronto do Ben incluído. É preciso uma amostra limpa da voz desejada. O motor nativo usa o embedding da referência; não faz treinamento completo nem promete uma cópia idêntica da dublagem. Não é possível avaliar semelhança ou corrigir pronúncia ouvindo apenas o código.

## Atualizar sem mudar a voz atual

Pare o jogo/IA com Ctrl+C. Para o pacote completo:

```sh
cd ~/ben10-v34/game
bash update.sh --archive ~/storage/downloads/BEN10_LIVE_V43_TERMUX.zip
bash local-ai.sh start
```

Ou extraia `BEN10_REPARO_V43.zip` em uma pasta temporária e execute `REPARAR_BEN_V43.sh` de dentro do jogo. Não aplique os dois pacotes. O reparo guarda os arquivos anteriores em `data/installer-backups`; preserva `.env`, chaves, progresso e modelos. Abra http://127.0.0.1:3000/?v=43.0.0 e ative ♫.

## Preparar a clonagem no Termux

A clonagem é opcional e experimental no GT3. A compilação foi validada em Linux x86_64; ainda falta validação do build nativo Android e do áudio no telefone. O instalador preserva o Piper e não seleciona o clone automaticamente. Instalação e conversão iniciais precisam de internet, vários GB e pelo menos 8 GB livres. As dependências de conversão têm wheels Linux ARM64 para o Debian usado pelo projeto; isso não mede desempenho no Android.

1. Pare a sessão com Ctrl+C e instale o motor:

```sh
cd ~/ben10-v34/game
bash local-ai.sh clone install
```

O instalador baixa pesos públicos com revisão e hashes conferidos; compila o motor nativo; usa PyTorch dentro do Debian **somente para converter os pesos uma vez**. Durante a LIVE, o motor de voz é C++/GGML e Python padrão. O modelo de conversa já instalado não é baixado novamente. Os arquivos ficam em `~/.local/share/ben10-local-ai`, fora do ZIP.

2. Prepare uma amostra do Ben clássico em português, idealmente de 10 a 20 segundos, com uma única voz, sem música/efeitos. O comando aceita WAV PCM16, mono ou estéreo, de 3 a 30 segundos e até 16 MB. Ele converte localmente para mono 24 kHz. MP3/M4A precisam ser convertidos para WAV antes.

```sh
bash local-ai.sh clone reference ~/storage/downloads/ben-classico.wav
bash local-ai.sh clone preview
```

O preview fica em `~/.local/share/ben10-local-ai/cloning/preview.wav`. Ouça esse arquivo e confira `secondsToGenerate` mostrado no terminal. Sem a amostra, não existe voz clonada pronta. Uma nova amostra invalida o preview anterior. A seleção só é permitida depois de gerar um preview para a referência atual.

3. Se o som e o tempo forem adequados, selecione e inicie:

```sh
bash local-ai.sh clone use
bash local-ai.sh start
```

O tempo máximo de espera da voz clonada é de 180 segundos. Isso é um limite de erro, não promessa de velocidade: se as falas demorarem demais, esse perfil não será adequado à LIVE nesse aparelho. O painel informa `Qwen3-TTS-0.6B-clone-pt` quando o clone realmente entrega áudio. A fala recebe apenas o texto, sem rubricas de personalidade.

Para voltar à voz já instalada, pare a sessão e execute:

```sh
bash local-ai.sh clone piper
bash local-ai.sh start
```

Não apaga referência, modelos ou a voz anterior. `bash local-ai.sh clone status` mostra a seleção e os arquivos disponíveis, sem chaves.

## O que foi validado

Compilação real do motor nativo e carregamento de sua C API em Linux; compatibilidade das estruturas ctypes, embedding calculado uma vez, token português, saída PCM e liberação de memória com biblioteca controlada de teste; normalização da referência e seleção sem substituir o Piper; pré-validação de catálogos antes de baixar pesos.

No jogo, testes de saudações, perguntas gerais, comentários consecutivos e progresso de fala. No navegador, uma falha de voz mantém o comentário ativo e a recuperação confirma a mensagem depois da reprodução. O teste usa LLM/WAV simulados e não avalia semelhança de voz.

Não foram baixados/executados pesos Qwen3-TTS na nuvem, não houve uma LIVE real nesta validação e ainda não foi fornecida a amostra do Ben. A clonagem efetiva e seu desempenho dependem desses próximos passos. Relatórios em `reports/v43/`.
