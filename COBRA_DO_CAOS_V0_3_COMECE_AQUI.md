# Cobra do Caos V0.3 · Ilha 3D + Caos Live

[Baixar o projeto completo (ZIP)](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/COBRA_DO_CAOS_V0_3.zip) · [Baixar Caos Live (APK)](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/CAOS_LIVE_V0_1.apk)

[Ver a cobra de frente](COBRA_DO_CAOS_V0_3_PREVIA.png) · [Cenário panorâmico](COBRA_DO_CAOS_V0_3_PANORAMA.png) · [Avatar do visitante](COBRA_DO_CAOS_V0_3_VISITANTE.png)

## A atualização

- Ilha 3D com lago, vegetação, montanhas, passarelas e lanternas. Tabuleiro ampliado fisicamente, preservando as 216 casas lógicas e os dados anteriores.
- Cobra erguida, câmera que acompanha seu rosto, tomadas superiores e órbita pelo cenário.
- Visitantes com características variadas, nome e foto quando disponível, apresentados num palco de entrada. Se a foto não permitir uso pelo navegador, aparecem iniciais.
- Boca ligada à amplitude da fala real, agradecimento aos presentes e corpo colorido.
- HUD compacto, adaptação a retrato/paisagem e CENA AMPLA para recolher painéis.
- Gaiola, três fugas, banquete de 50, presentes, ranking, playlist, IA local e dia/noite preservados.
- Compatibilidade corrigida com os lotes de batidas do captador Android; compensação Bluetooth também aplicada à ponte.

As regras continuam: **500 curtidas próprias OU uma rosa OU dez comentários** libertam antes de completar 50 presos. Compartilhar muda a cor, sem libertar. A demonstração continua identificada e separada da LIVE.

## Atualizar a pasta existente

Baixe o ZIP para Downloads e encerre a transmissão antes de executar:

```bash
cd ~/COBRA_DO_CAOS_V0_1 &&
python3 -m zipfile -e ~/storage/downloads/COBRA_DO_CAOS_V0_3.zip "$TMPDIR/cobra-v03" &&
bash "$TMPDIR/cobra-v03/COBRA_DO_CAOS_V0_3/ATUALIZAR_V0_3.sh" "$PWD" &&
bash install.sh &&
bash start.sh
```

Se sua instalação estiver numa pasta diferente, ajuste a primeira linha. A pasta mantém seu nome anterior, mas o jogo passa à **V0.3.0**. Abra **http://127.0.0.1:3500/?v=0.3.0**. Nas próximas vezes, entre nessa mesma pasta e execute `bash start.sh`.

O atualizador confere o manifesto, encerra somente a instância indicada e cria backup em `data/update-backups/v0.3.0-*`. Preserva progresso, configuração, `.env` e modelos. O `REVERTER.sh` do backup mostrado restaura código e estados anteriores, substituindo o progresso feito após a atualização. Não altera fontes/chaves APT nem ignora assinaturas.

## Instalação nova

```bash
cd ~ &&
python3 -m zipfile -e ~/storage/downloads/COBRA_DO_CAOS_V0_3.zip . &&
cd ~/COBRA_DO_CAOS_V0_3 &&
bash install.sh &&
bash start.sh
```

Requer Python e Node 22.19+. A primeira instalação das dependências usa internet.

## Usar o app Caos Live

1. Instale o APK e mantenha o servidor do Termux rodando na porta **3500**.
2. No app, preencha o servidor RTMP/RTMPS e a chave em campos separados. A conta da plataforma precisa ter esse recurso liberado.
3. Escolha perfil, áudio interno/microfone/sem áudio e cortes. Autorize a captura e confirme o diálogo do Android.
4. O app abre o jogo em tela cheia. Toque para liberar o som e conecte seu @ pelo painel LIVE. Use CENA AMPLA para dar espaço ao cenário.
5. Encerre pela notificação ou pelo botão do app.

O app captura a tela real do aparelho; outras páginas/apps que você abrir podem aparecer no vídeo. A configuração privada é protegida e aparece preta se aberta durante a captura. A chave não é salva nem enviada ao Node. O envio nativo usa MediaCodec/RTMP, sem precisar do FFmpeg no Termux. A transmissão pelo navegador continua disponível como alternativa; não inicie as duas ao mesmo tempo.

No áudio interno, a ponte de batidas usa a mesma captura para sincronizar o jogo. Não abra outro capturador MediaProjection simultaneamente. Áudio de GreenTube/outros players depende de eles permitirem captura. Carregar arquivos na playlist do jogo é uma alternativa. O app tenta estéreo e tem opção mono de contingência. O APK é pequeno porque abre o jogo que já está no Termux; não inclui os modelos de IA.

## Validação e pendências

**57 testes do jogo aprovados**, além de navegador, avatares, reprodução e boca sincronizada. **24 verificações JVM** de protocolo/filtro; cliente Java enviou H.264/AAC para receptor local. O caminho do navegador também foi conferido em RTMP local com imagem e som. Compilação, manifesto e assinatura do APK foram verificados.

O [relatório do pacote](COBRA_DO_CAOS_V0_3_RELEASE_CHECK.json) e o [teste a partir da V0.2](COBRA_DO_CAOS_V0_3_FROM_0_2_0_CHECK.json) ficam vinculados ao SHA do ZIP. Os registros detalhados, arquitetura, instruções e fonte completa do app estão em `docs/` e `android-live/` dentro do projeto.

**Captura física pelo APK, permissões, EGL/MediaCodec, estabilidade e latência no GT3 ainda precisam de teste no aparelho.** Não houve LIVE pública ao TikTok. Testes em Linux não comprovam captura Android nem duas horas reais de transmissão. O supervisor do servidor não recupera o encerramento de todo o Termux pelo Android.

ZIP SHA-256: `9dbf804e665bbb553697c48e21d0d5c96d945c73a5056b86fbd5593ae3ca20af`

APK SHA-256: `cbcb06bdde1624faf11ca3e0e28228b97409b6742f1b928b68931a6ca21a76ea`
