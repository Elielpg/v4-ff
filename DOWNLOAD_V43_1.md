# V43.1 · Referência do Ben incluída e preparo automático

[Baixar reparo com o áudio incluído](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_REPARO_V43_1.zip?v=43.1.0) · [ZIP completo](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_LIVE_V43_1_TERMUX.zip?v=43.1.0)

Atualização de 34 arquivos, incluindo o WAV de referência enviado, com backup e preservação de modelos/dados. O comando `bash local-ai.sh clone setup` prepara tudo no celular e só seleciona o clone depois de produzir um teste real válido. A semelhança e a velocidade ainda precisam ser ouvidas/medidas no GT3.


O MP3 enviado pelo usuário foi convertido para WAV PCM16 mono, 24 kHz, com duração de 12,95675 segundos. A conversão preserva o tom; aplica apenas uma transição curta no início/fim. O WAV está em `assets/voice/ben-classico-reference.wav`, e o JSON ao lado registra formato, duração e SHA-256. O MP3 original não precisa ficar no celular para configurar a voz.

## Preparar no Termux

Pare a sessão do jogo/IA com Ctrl+C. Aplique o ZIP completo ou o reparo pequeno, sem aplicar os dois. Depois:

```sh
cd ~/ben10-v34/game
bash local-ai.sh clone setup
bash local-ai.sh start
```

O `setup` realiza as etapas:

1. Confere a referência incluída por hash e formato e verifica se a IA anterior foi parada.
2. Instala o motor nativo Qwen3-TTS e os pesos públicos, se estiverem ausentes. A primeira instalação precisa de internet, vários GB e pelo menos 8 GB livres. O modelo de conversa já instalado não é reinstalado.
3. Registra a referência do Ben, faz síntese **real** no aparelho e valida o WAV gerado e o tempo. O processo de teste tem limite de dez minutos; o tempo de geração da frase precisa ficar abaixo de 150 segundos para esse perfil. Esse é um limite de erro, não promessa de velocidade adequada a uma LIVE.
4. Seleciona a voz clonada após sucesso. Se instalação, síntese, integridade ou tempo falharem, restaura a seleção, a referência e o preview anteriores.

Se o motor e os GGUF já estiverem presentes, o comando não os reinstala nem consulta catálogos. O teste de síntese ainda é executado. A verificação final no aparelho é necessária para avaliar o áudio e o desempenho com seus modelos reais.

O preview fica em `~/.local/share/ben10-local-ai/cloning/preview.wav`. Ouça-o para avaliar a semelhança. Depois de iniciar, abra http://127.0.0.1:3000/?v=43.1.0 e ative ♫. O diagnóstico de voz deve mostrar `Qwen3-TTS-0.6B-clone-pt`; essa voz não será identificada como Piper.

Para voltar à voz anterior, pare a sessão e execute:

```sh
bash local-ai.sh clone piper
bash local-ai.sh start
```

Nada apaga a referência do Ben ou os modelos já baixados. Para usar outro áudio WAV, permanece disponível `bash local-ai.sh clone reference caminho/arquivo.wav` e o fluxo de preview/seleção da V43.

## Instalar o reparo pequeno

```sh
cd ~/ben10-v34/game &&
python3 -m zipfile -e ~/storage/downloads/BEN10_REPARO_V43_1.zip "$TMPDIR/ben10-reparo-v43-1" &&
bash "$TMPDIR/ben10-reparo-v43-1/REPARAR_BEN_V43_1.sh" &&
bash local-ai.sh clone setup &&
bash local-ai.sh start
```

O reparo valida e copia os arquivos com backup em `data/installer-backups`, incluindo o WAV como bytes, com SHA-256. Mantém `.env`, chaves, curtidas/progresso e modelos. O pacote completo usa o atualizador habitual: `bash update.sh --archive ~/storage/downloads/BEN10_LIVE_V43_1_TERMUX.zip`.

## Validação desta versão

206 testes Node aprovados, incluindo 18 testes Python. Foram exercitados o arquivo real enviado, a conferência do WAV, o fluxo de instalação/registro/teste/seleção e a restauração exata de arquivos anteriores em falha ou geração lenta. O navegador validou saudações, perguntas, recuperação da voz e a orientação de preparo em telas 360/500/1280. Os testes de fala e diálogo no navegador usam fixtures.

Os conversores reais da revisão fixada do motor foram executados com PyTorch CPU 2.9.1, GGUF 0.17.1, safetensors 0.5.3 e NumPy 2.2.6. Tensores pequenos BF16/F32 foram convertidos para GGUF e lidos novamente com nomes, formas e tipos corretos. Isso valida o caminho de conversão, não a voz do modelo completo. A biblioteca nativa já havia sido compilada e carregada em Linux.

Os pesos reais do Qwen3-TTS não foram executados nesta nuvem: a política atual não permite os domínios do Hugging Face. Um rascunho de liberação foi salvo para revisão nas configurações do ambiente, sem alterar a política aplicada. Portanto, não se afirma que semelhança ou velocidade foram confirmadas no GT3. A síntese real será feita pelo `setup` no aparelho, e a qualidade precisa ser ouvida no preview.

## Modelos e código

O modelo continua sendo [Qwen3-TTS 0.6B Base](https://github.com/QwenLM/Qwen3-TTS), com o motor [predict-woo/qwen3-tts.cpp](https://github.com/predict-woo/qwen3-tts.cpp) fixado em `b3ba14077cf1b3e11b86e5f84aa9184605c89b28`. O código nativo usa o embedding da referência e o token de português `2071`; não faz treinamento completo de um modelo exclusivo do personagem. A semelhança não é uma garantia de cópia idêntica da dublagem.
