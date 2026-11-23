# Cobra do Caos · Gaiola 3D · V0.2.0

[Baixar o projeto completo (ZIP)](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/COBRA_DO_CAOS_V0_2.zip) · [Prévia da transmissão](COBRA_DO_CAOS_V0_2_PREVIA.png) · [Gaiola 3D](COBRA_DO_CAOS_V0_2_GAIOLA.png)

## O que mudou

- Câmera 3D com percurso automático pelo tabuleiro, acompanhamento da cobra e foco na gaiola, fugas e banquetes.
- Cada novo espectador identificado entra na gaiola. Antes de completar 50 presos, pode escapar com **500 curtidas próprias OU uma rosa OU dez comentários**. Entradas repetidas não duplicam pessoa.
- Com 50 presos, os avatares viram comida e caem no centro do tabuleiro. A cobra coleta o banquete e recebe crescimento, preservado entre rodadas.
- Compartilhar muda a cor da cobra e faz a aura pulsar por nove segundos; **não é missão de fuga**.
- Dia/noite gradual, modos fixos e opção de reduzir movimentos/luzes.
- Playlist local com vários arquivos, reprodução aleatória sem repetição imediata, seleção manual e botão Próxima.
- Contadores individuais e comando **STATUS**, novas falas PT-BR, sons, avatares com fotos ou iniciais e HUD no estúdio RTMP.

Babylon.js foi mantido para continuar com navegador, Termux e captura RTMP existentes. Não é uma migração para Godot. Piloto, presentes, ranking, IA local e o instalador com verificação das assinaturas APT continuam disponíveis.

## Atualizar sua pasta atual

Baixe o ZIP acima para Downloads e termine a transmissão antes de executar:

```bash
cd ~/COBRA_DO_CAOS_V0_1 &&
python3 -m zipfile -e ~/storage/downloads/COBRA_DO_CAOS_V0_2.zip "$TMPDIR/cobra-v02" &&
bash "$TMPDIR/cobra-v02/COBRA_DO_CAOS_V0_2/ATUALIZAR_V0_2.sh" "$PWD" &&
bash install.sh &&
bash start.sh
```

A pasta continua com nome **COBRA_DO_CAOS_V0_1**, mas o jogo passa à **V0.2.0**. Abra **http://127.0.0.1:3500/?v=0.2.0** e confira a versão no topo. Nas próximas vezes:

```bash
cd ~/COBRA_DO_CAOS_V0_1 && bash start.sh
```

O atualizador confere o manifesto, encerra somente o servidor da pasta indicada e salva backup em `data/update-backups/v0.2.0-*`. Preserva progresso, ranking, configuração, `.env` e modelos locais. Para reverter, execute o `REVERTER.sh` do backup mostrado; ele restaura também o estado anterior à atualização, substituindo o progresso obtido depois.

## Instalação nova

Para quem ainda não tem a V0.1:

```bash
cd ~ &&
python3 -m zipfile -e ~/storage/downloads/COBRA_DO_CAOS_V0_2.zip . &&
cd ~/COBRA_DO_CAOS_V0_2 &&
bash install.sh &&
bash start.sh
```

Requer Python e Node 22.19 ou mais recente. A primeira instalação de dependências usa internet. Se apenas o FFmpeg estiver pendente, o jogo continua disponível e o estúdio informa como instalar esse componente.

## Uso na LIVE

No painel, conecte seu @ já ao vivo e aguarde a confirmação de eventos. O número da gaiola é a quantidade de avatares cadastrados, não o número de espectadores simultâneos. Curtidas sem identificação contam para o coletivo, sem atribuição a uma pessoa. A demonstração tem dados e botões separados da LIVE.

Selecione as músicas em **Música**; os arquivos precisam ser selecionados novamente ao recarregar a página. A captura de outro aplicativo depende das permissões do Android e fornece batidas, sem encaminhar o áudio desse aplicativo ao RTMP. Para enviar música ao RTMP, carregue os arquivos no painel. RTMP exige URL/chave liberadas na conta e Chrome visível; configure a chave apenas no painel local.

## Evidências

**51 testes aprovados**, teste visual em Chromium, avatares, playlist, três fugas e queda do grupo de 50. Transmissão para receptor RTMP local validada em H.264/AAC 720 × 1280, com som. Simulação acelerada de 7.200 segundos da lógica; não equivale a duas horas reais no Android.

O [relatório do pacote](COBRA_DO_CAOS_V0_2_RELEASE_CHECK.json) confirma instalação limpa, atualização com servidor antigo ativo, outra instalação preservada, progresso/configuração conservados, recuperação após falha do servidor e reversão do backup. Foi executado no Linux Cloud, com npm do cache. Os registros detalhados e a arquitetura estão na pasta `docs` do ZIP.

Permanecem pendentes a LIVE real no TikTok, identificação por usuário em eventos reais, fotos com CORS da plataforma, latência da IA e teste prolongado no Realme GT3. O supervisor não pode recuperar o encerramento de todo o Termux pelo Android.

SHA-256 do ZIP:

```
605746e61e35923f1f06d086018f99b1c1598fb73aba0a2c885f331cb9362523
```
