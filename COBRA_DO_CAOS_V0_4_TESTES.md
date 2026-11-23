# Validação · Cobra do Caos V0.4.0

Executado em 23/11/2026 no Linux Cloud, Node 24 e Chromium com WebGL por software. Não foi realizada LIVE pública nem teste físico no Realme GT3.

## Lógica, regressão e estabilidade

A suíte contém **61 testes**: piloto em 24 preenchimentos completos, regras de presentes/curtidas, combos e deduplicação, gaiola e missões alternativas, identidade, persistência, filas, conversa local com resposta controlada, instalador APT assinado/isolado, HTTP, supervisor, playlist, atualização e reversão. As regressões novas cobrem tabuleiro de 504 casas, velocidade/densidade/cadência de crescimento, migração de 32 comidas antigas mais 180 créditos sem perda, interpolação e falas ambiente.

Saída da suíte em `unit-tests.log`. O teste de banquete também confere a passagem do primeiro dono para o novo segmento, depois da coleta e do intervalo de crescimento.

`V04_SOAK_ENGINE.json`: 7.200 segundos simulados, 144 mil ticks. Houve 54 grupos de banquete, 479 fugas, uma vitória, 1.500 perfis e 3.000 entradas de deduplicação; nenhum limite/invariante violado. Execução acelerada em aproximadamente 21,3 s, RSS do processo de aproximadamente 33 a 83 MB. Isso mede somente essa carga da lógica na máquina Cloud; não é uma medição de duas horas reais, do Android, do renderizador ou das IAs.

## Câmera, som e interação

- `V04_PANORAMA_CHECK.json`: rosto da cobra dentro do enquadramento, visitante correto, material colorido após presente, boca reagindo a áudio real e fechando ao pausar, retrato/paisagem/CENA AMPLA e ausência de overflow em 360 × 800. Imagens em `V04_*.png`.
- `V04_CAGE_BROWSER_CHECK.json`: fugas por 500 curtidas próprias, dez comentários e rosa; compartilhamento, dia/noite, queda dos 50 no centro, coleta dos créditos, playlist com troca automática e simulações recusadas no modo LIVE. Nenhum erro JS ou pedido de recurso falhou.
- `V04_AVATAR_CHECK.json`: foto sintética com CORS atualizada no mesmo slot, sem duplicar cadastro, com canvas continuando capturável. Não testa CORS de fotos reais do TikTok.
- `V04_VOICE_AND_PACING_CHECK.json`: som de comida decodificado/disparado, total 504 no estado e no HUD, passo 280 ms, pergunta/resposta/áudio chegando ao navegador, saudação interrompendo fala ambiente e botão de retomada voltando a reproduzir após pausa. Texto da resposta fornecido por fixture HTTP; síntese real pelo Piper. Não testa a qualidade das respostas do Qwen ou sua latência no telefone.
- `AUDIO_CHECK.json`: formato, sinal e SHA-256 dos **24 WAVs prontos Kokoro/pm_alex**. A escolha da voz contou com transcrição automática comparativa, descrita em `VOZ_E_CREDITOS_V0_4.md`; não é avaliação humana de timbre/pronúncia.

## Transmissão

`V04_STUDIO_CHECK.json`: caminho real canvas/WebAudio → MediaRecorder → FFmpeg → receptor RTMP local. Recebidos **720 × 1280, H.264/AAC, 11,387 s**, áudio RMS **-20,29 dBFS**. Confirmados progresso de quadros, gravação local de teste, encerramento do codificador e jogo continuando. A chave não apareceu no estado público ou na configuração/log verificados. O formato declara 30 FPS; não é medida de quadros únicos da GPU.

O APK Caos Live é exatamente o da V0.3, SHA-256 `cbcb06bdde1624faf11ca3e0e28228b97409b6742f1b928b68931a6ca21a76ea`. Não foi recompilado. Os relatórios anteriores de compilação/assinatura e 24 verificações JVM de transporte estão preservados; não foram novos testes físicos de captura Android na V0.4.

## ZIP, migração e reversão

Os relatórios de instalação limpa e atualização a partir dos ZIPs V0.1/V0.2/V0.3 ficam **ao lado do ZIP final**, vinculados ao seu SHA-256. O verificador confere manifesto, instalação, versão, corpo migrado válido com comprimento preservado, curtidas/perfis, configuração externa, parada da instância correta, outra instância preservada, recuperação após SIGKILL somente do servidor e reversão de código/estado. Considere o pacote conferido apenas com `ok: true` e hash correspondente.

## O que ainda precisa ser medido no celular

TikTok real, áudio/captura física no APK, latência de Qwen/Piper concorrendo com o jogo, temperatura/bateria, Bluetooth e estabilidade prolongada. Um supervisor dentro do Termux não recupera o encerramento do aplicativo inteiro pelo Android. Relatórios sem prefixo V04 e imagens V03 são evidências históricas, não novos benchmarks desta entrega.
