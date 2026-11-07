# V43.2 · SIGILL no clonador

[Baixar reparo SIGILL — 32 KB](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_REPARO_SIGILL_V43_2.zip?v=43.2.0) · [Pacote completo V43.2](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_LIVE_V43_2_TERMUX.zip?v=43.2.0)

O resultado enviado pelo usuário confirmou GGML_NATIVE=ON, GGML_CPU_ARM_ARCH vazio e ausência de SVE nos recursos anunciados pelo Android. O reparo muda o perfil de compilação e reutiliza os modelos já convertidos. A confirmação de que o SIGILL desapareceu ainda depende de executar o teste no GT3.

207 testes do jogo e um teste adicional do reparo pequeno passaram. O motor foi recompilado em Linux com instruções básicas e executou uma multiplicação de matrizes GGML corretamente.


O telefone terminou a conversão do tokenizer, gravou o GGUF e o processo nativo de preview morreu com `SIGILL` (sinal 4). Esse sinal indica instrução inválida, mas sem o ponto da falha não identifica sozinho a causa. A V43.1 deixava `GGML_NATIVE=ON` por padrão e acrescentava `-mcpu=native` no motor. Essas opções são suspeitas em Android com núcleos diferentes ou extensões vetoriais sem suporte do sistema.

## Reparo

O motor agora usa `-march=armv8-a`, sem otimizações nativas, SVE/SME, i8mm ou dotprod opcionais. GGML_NATIVE, GGML_CPU_KLEIDIAI, GGML_CPU_ALL_VARIANTS e GGML_BACKEND_DL ficam desativados. Duas configurações CMake recebem `--fresh`; isso limpa opções antigas sem apagar os pesos. O projeto é compilado novamente e os comandos reais gerados pelo CMake são conferidos antes de registrar o perfil como pronto.

Os caches e o CMakeLists anteriores ficam em `~/.local/share/ben10-local-ai/cloning/native-before-repair-*`. O reparo usa as fontes locais das revisões fixadas do Qwen3-TTS e GGML. Se as revisões forem diferentes, ele para antes de modificar as fontes. Não há download de modelos, chamada ao APT nem reinstalação de PyTorch nesse caminho.

O setup reconhece os dois GGUF presentes e escolhe `repair-native`, em vez de repetir a instalação/conversão. O caminho normal de instalação também utiliza o perfil compatível para novas instalações.

## Aplicar na V43.1

Pare qualquer sessão de IA com Ctrl+C. Baixe `BEN10_REPARO_SIGILL_V43_2.zip` e execute:

```sh
cd ~/ben10-v34/game &&
python3 -m zipfile -e ~/storage/downloads/BEN10_REPARO_SIGILL_V43_2.zip "$TMPDIR/ben10-sigill-43-2" &&
bash "$TMPDIR/ben10-sigill-43-2/REPARAR_SIGILL_V43_2.sh" &&
bash local-ai.sh clone setup &&
bash local-ai.sh start
```

O reparo pequeno troca apenas scripts e metadados do jogo, com backup em `data/installer-backups`. Os arquivos GGUF ficam fora da pasta do jogo e não são incluídos no conjunto de escrita. A voz Piper, a referência fornecida, chaves e progresso são preservados. O ZIP completo V43.2 também inclui a mudança, mas não é necessário aplicar os dois pacotes.

Para reconstruir explicitamente, sem executar o teste de voz em seguida:

```sh
bash local-ai.sh clone repair-native
```

## Diagnóstico e validação

O preview agora grava `~/.local/share/ben10-local-ai/logs/clonagem-preview.log`, com etapas de carregamento da biblioteca, leitura dos GGUF, extração da referência e geração. O faulthandler do Python também é ativado. Se o sinal se repetir, o setup explica o SIGILL e restaura a voz/referência anteriores.

Foram testados o perfil ARMv8-A, a rejeição de opções nativas residuais, a seleção do caminho sem download quando há modelos, a preservação de bytes GGUF e o tratamento de SIGILL com restauração da configuração. Uma compilação real do motor com perfil básico foi realizada em Linux x86_64, separadamente da instalação antiga.

A correção ainda precisa ser confirmada no GT3. Não há aparelho ARM64 nem pesos reais de voz disponíveis para reproduzir a falha nesta nuvem. O perfil de instruções mais básico pode reduzir a velocidade; o teste de geração continua verificando o tempo antes de selecionar a voz.
