# Cofra Studio BETA 0.1.1

[Baixar APK 0.1.1](https://raw.githubusercontent.com/Elielpg/v4-ff/main/COFRA_STUDIO_BETA_0_1_1.apk) · [Fontes e testes](https://raw.githubusercontent.com/Elielpg/v4-ff/main/COFRA_STUDIO_FONTES_0_1_1.zip)

## Correção do envio interrompido pelo áudio

A versão anterior encerrava imagem e conexão RTMP se a leitura do mixer do jogo gerasse uma exceção. O aviso “A fonte de áudio parou” também abrangia falhas do buffer do codificador, portanto ele sozinho não identificava a exceção exata. O relato do usuário localiza a falha na etapa de alimentação de áudio; a razão da interrupção da ponte no GT3 ainda precisa do diagnóstico dessa revisão.

- A ponte PCM do jogo passa a ser lida em uma thread independente, com fila limitada a 250 ms. Uma pausa/queda nela não bloqueia vídeo ou codificador AAC.
- Durante a indisponibilidade, envia silêncio alinhado a 48 kHz e mostra **ÁUDIO DO JOGO EM SILÊNCIO**. Não troca automaticamente para o microfone ou captura de outro aplicativo.
- Tenta reabrir a fonte com limite de cinco falhas por ciclo e esperas de 1, 2, 4 e 8 segundos. Depois mantém imagem/silêncio e pausa a recuperação. **Tentar áudio do jogo novamente** permite iniciar outro ciclo explicitamente.
- Mensagens de falha são preservadas depois do encerramento. **Copiar diagnóstico · sem chaves** informa a etapa e códigos distintos para timeout, fim do PCM, falha HTTP, AudioRecord e MediaCodec; não inclui URL, chave, token ou mensagens brutas do servidor.
- Corrige também a ordem da negociação RTMP: o cliente envia C2 antes de aguardar S2, aceitando servidores que esperam essa resposta. A falha antiga foi reproduzida em um servidor local de teste, mas não foi atribuída à sessão do usuário.
- Interrupções/rejeições do servidor após publicar são reconhecidas; envio bloqueado é encerrado em vez de ficar pendurado. Cabeçalhos AVC deixam de contar como quadros de vídeo enviados.

Instale **COFRA_STUDIO_BETA_0_1_1.apk** por cima da beta anterior, após encerrar a captura. O pacote continua `br.cofra.studio`, com o mesmo certificado e `versionCode=2`. A atualização não altera o jogo ou o Termux. A chave não é armazenada: cole novamente os dados de entrada no aplicativo.

Para Restream, o caminho é **Cofra Studio → entrada RTMP/RTMPS do Restream → destino TikTok configurado no Restream**. Use URL e chave de entrada fornecidas pelo Restream nos dois campos do app e confira a prévia correspondente àquela entrada. O endereço da página `app.restream.io/...` não é a URL de ingestão.

O APK foi compilado e sua assinatura verificada. Nos testes de sockets reais locais, a fonte PCM sofreu EOF e timeout, e recuperou som depois de silêncio sinalizado. O fluxo H264/AAC feito desse PCM chegou a um receptor FFmpeg local com 51 quadros de vídeo e sem lacuna de vídeo além do período normal de 15 FPS. Passaram ainda cinco cenários de conexão, incluindo recusa, desconexão e envio bloqueado. Isso não substitui a validação de MediaProjection/MediaCodec, áudio perceptível e Restream no telefone.

Complemento Android independente para capturar Termux:X11 e enviar por RTMP/RTMPS usando H264 por hardware. Não contém o jogo Snake Reyers, recursos do criador, modelos de IA nem chaves. Não é afiliado ao TikTok e não substitui o painel de eventos do jogo.

## Instalar e testar

1. Use o complemento Termux 0.3.4 ou mais recente e inicie o jogo normalmente. Confira que a voz é audível no Termux:X11. Não deixe duas transmissões de tela abertas ao mesmo tempo.
2. Instale o APK Cofra Studio BETA. Não desinstale versões futuras para atualizar: a assinatura própria deve ser mantida.
3. Comece com 720 × 1280, 30 FPS, 4 Mbps e **Jogo e voz**. A ponte lê exclusivamente o mixer privado desse jogo no Termux. Nenhuma chave de transmissão passa pelo painel Termux.
4. Toque em **Autorizar teste local de 10 segundos**. Isso grava um MP4 no celular e não conecta ao TikTok. Android 14+ oferece a escolha de um aplicativo: selecione **Termux:X11**. Em Android 10–13, a captura pode abranger a tela inteira; mantenha o jogo visível e ajuste os cortes se necessário.
5. Deixe o jogo visível. Retorne após o teste e abra o MP4 salvo em Filmes/CofraStudio. Confira voz, música, enquadramento, fluidez e sincronismo. O indicador de áudio não comprova que o MP4 é audível: ouça o arquivo.
6. Só depois preencha URL e chave de transmissão nos campos próprios do app e toque em **Autorizar captura e transmitir**. Nunca envie a chave por chat. Não há reconexão automática da conexão RTMP; somente a ponte de áudio possui a recuperação limitada descrita acima. O botão/aviso **Encerrar** para a captura.

A transmissão exige acesso a URL e chave pela própria conta TikTok. Continua sujeita à conexão e ao processamento de vídeo do TikTok. Este complemento não garante mais espectadores, monetização ou qualidade superior ao OBS.

## Imagem, som e painel privado

- O codificador H264 deve ser reconhecido pelo Android como hardware; o app não recorre silenciosamente a um encoder de vídeo por software.
- H264 sem B-frames, keyframe a cada 2 s. 720p/4 Mbps ou 1080p/6 Mbps, sempre 30 FPS. A resolução de saída não cria detalhes ausentes no jogo; compare o perfil gráfico também.
- Teste 1080p apenas depois da aprovação do MP4 de 720p. Meça FPS do jogo antes/durante a captura. Não há autoaumento para 60 FPS.
- Áudio do jogo: PCM estéreo 48 kHz por HTTP somente em 127.0.0.1, token temporário de uso único em cabeçalho; AAC 128 kbps no app. Mixer indisponível, saída Dummy ou falha da ponte deixam a trilha em silêncio com aviso visível e tentativas limitadas de recuperação. O vídeo continua. Um erro real do codificador ou do transporte ainda pode encerrar a sessão, com diagnóstico preservado.
- Modo **Jogo + músicas**: mixer do jogo mais áudio de apps que permitem AudioPlaybackCapture. Exclui o UID Termux da segunda captura para evitar duplicar a voz. Requer permissão de áudio. A música é reduzida enquanto há sinal no mixer do jogo; música já tocada dentro do mixer também participa dessa detecção. Apps/proteções que impedem captura podem ficar silenciosos. Não foi validado com Green Tube no GT3.
- Microfone, áudio interno isolado e sem áudio são alternativas explícitas. Bluetooth/fones não confirmam nem impedem o áudio digital do mixer; valide o MP4.
- Prévia privada 288×512/1 FPS somente enquanto o painel está aberto. Não cria janela flutuante. Não precisa gerar outro render 3D.
- O painel exibe espectadores atuais somente se o monitor TikTok entregar `roomUser.viewerCount`; mostra desconhecido/desatualizado quando apropriado. O FPS do jogo vem do Godot e é diferente do FPS do encoder.
- FLAG_SECURE protege os controles e a chave. Não se pretende capturar essa própria tela. Em captura de tela inteira, abrir os controles pode gerar imagem preta no envio; em Android 14+, a captura de aplicativo mantém a fonte selecionada conforme o sistema permitir. Mantenha o jogo visível e a tela acesa durante a LIVE.
- Os indicadores de captura/privacidade do Android não são removidos do aparelho. O app não usa permissão para desenhar sobre outros apps.
- A chave fica em memória durante a sessão, não é salva em preferências/arquivos/relatórios e é removida do campo ao iniciar. Se o processo morrer, autorize novamente.

## Estrutura e limites

`MainActivity` contém controles privados e autorização. `CaptureService` coordena MediaProjection, hardware MediaCodec, AAC, teste e envio; `ScreenRenderer` recorta e preserva proporção em EGL. `GamePcm` lê a ponte local; `PcmRing` mantém fila limitada para música. `LocalRecorder` finaliza o teste MP4. `rtmp/` implementa handshake/AMF/FLV, RTMP e TLS com verificação de hostname, fila limitada e encerramento ao travar. Não foi usado RootEncoder ou um serviço de streaming externo.

A conexão RTMP foi verificada com receptor FFmpeg local e mídia de teste H264/AAC estéreo 48 kHz. Classes de composição/PCM passaram nos testes JVM. O APK foi compilado, alinhado e assinado; **MediaProjection, MediaCodec, sincronismo perceptível, temperatura, Twitch/TikTok e estabilidade de longa duração ainda exigem teste físico no Android**. Não há afirmação de fluidez no GT3 baseada em medições Linux.

## Compilar

Requer Java com módulos jdk.compiler/jdk.jartool, keytool, Android SDK API 35 e ferramentas aapt2, d8, zipalign, apksigner. Disponha as ferramentas em `$COFRA_ANDROID_SDK/android-15` e o `android.jar` em `$COFRA_ANDROID_SDK/android-35/android.jar` e execute:

```sh
COFRA_ANDROID_SDK=/caminho/sdk python3 build.py
```

O script cria chave de assinatura **só localmente** em `private/` e registra a verificação em `build/android-build.json`. Guarde `private/` para assinar futuras atualizações; não publique esse diretório. O ZIP de fontes exclui build/, SDK, APK e private/.

`tests/ProtocolTest.java` verifica protocolo/PCM/composição sem Android. `PcmPumpTest.java` usa sockets locais com EOF, timeout, retorno do som, limite de recuperação e preservação do erro. `run_connections.py` testa uma negociação que espera C2, recusas e envio sem progresso. `run_receiver.py` e `run_audio_outage_receiver.py` recebem H264/AAC em FFmpeg local, incluindo PCM com falhas simuladas. Não usam conta, URL ou chave reais. Para repetir no computador com JDK e FFmpeg:

```sh
python3 tests/run_checks.py --output "$PWD/build/verification"
```

As evidências de entrega estão em `docs/evidence`. Overlays novos e reconexão automática da LIVE não fazem parte desta correção. Não houve conexão nem publicação em Restream/TikTok durante os testes.
