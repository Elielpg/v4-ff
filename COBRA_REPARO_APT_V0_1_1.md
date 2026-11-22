# Reparo 0.1.1 do instalador · NO_PUBKEY em termux-glibc

O instalador original chamava `pkg install ffmpeg`, que atualizava todos os repositórios. O extra `termux-glibc` falhava com `NO_PUBKEY 5A897D96E57CF20C`, interrompendo a cadeia `install.sh && start.sh`. A instalação das dependências Node já tinha terminado; o jogo podia ser iniciado separadamente.

O novo `scripts/termux-packages.sh` reconhece as ferramentas presentes antes de consultar APT. Para uma dependência ausente, prioriza o `sources.list.d/termux.sources` existente, preserva literalmente seu `Signed-By` (inclusive chave inline) e usa listas/caches temporários. Há compatibilidade com fontes legadas reconhecidas. Não escolhe o repositório de outra edição, não importa chaves e não desliga autenticação. Fontes extras e listas globais ficam intactas.

A fonte principal `termux.sources` com `https://termux.net` já foi confirmada pelo usuário em uma consulta anterior. Se a fonte principal também falhar, a instalação da dependência para; nenhuma assinatura é dispensada.

O FFmpeg é necessário para o estúdio RTMP. Uma falha dele agora deixa o jogo disponível e mostra uma mensagem de transmissão pendente. A instalação de Node/npm continua obrigatória.

## Instalação existente

Baixe `COBRA_REPARO_APT_V0_1_1.zip` em Downloads e execute:

```bash
cd ~/COBRA_DO_CAOS_V0_1 &&
python3 -m zipfile -e ~/storage/downloads/COBRA_REPARO_APT_V0_1_1.zip "$TMPDIR/cobra-reparo" &&
bash "$TMPDIR/cobra-reparo/COBRA_REPARO_APT_V0_1_1/REPARAR.sh" "$PWD" &&
bash install.sh &&
bash start.sh
```

O reparo valida a integridade dos dois arquivos, faz backup em `data/installer-backups/apt-0.1.1.*` e altera somente `install.sh` e `scripts/termux-packages.sh`. Preserva progresso, configurações, modelos de IA e fontes APT. Não precisa parar o jogo para alterar apenas esses scripts. Para reverter o instalador, copie os arquivos originais desse backup para os mesmos caminhos; se o helper não existia, remova apenas o helper acrescentado.

Para repetir somente a instalação do FFmpeg:

```bash
cd ~/COBRA_DO_CAOS_V0_1 && bash scripts/termux-packages.sh ffmpeg
```

## Verificação

Nove regressões exercitam o fluxo com APT simulado, fontes Deb822 e legadas, assinatura inválida, recusa de Trusted yes, preservação de listas/fontes, chave inline, FFmpeg opcional e backup do reparo. A suíte completa e o ZIP extraído são verificados na nuvem. A instalação real do pacote FFmpeg e o RTMP no GT3 ainda dependem da execução no aparelho.
