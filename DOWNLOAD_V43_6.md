# Ben 10 · Clareira LIVE · V43.6

[Baixar reparo V43.6](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_REPARO_AUDIO_V43_6.zip?v=43.6.0) · [ZIP completo](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_LIVE_V43_6_TERMUX.zip?v=43.6.0)


Corrige a ativação do áudio ao reabrir o jogo e acrescenta um clonador local mais leve com a mesma amostra do Ben.

## Aplicar na instalação existente

Baixe BEN10_REPARO_AUDIO_V43_6.zip para Downloads. Em outra sessão do Termux:

```bash
cd ~/ben10-v34/game &&
python3 -m zipfile -e ~/storage/downloads/BEN10_REPARO_AUDIO_V43_6.zip "$TMPDIR/ben10-audio-43-6" &&
bash "$TMPDIR/ben10-audio-43-6/REPARAR_AUDIO_V43_6.sh" &&
bash local-ai.sh clone fast &&
bash restart.sh
```

Abra http://127.0.0.1:3000/?v=43.6.0 e toque na tela para ativar o som. Mantenha a sessão do Termux aberta. A preparação inicial precisa de internet; depois a conversa e a voz funcionam localmente, sem chave. O TikTok continua precisando de internet.

O clone leve usa Piper pt-BR para pronunciar o texto e OpenVoice V2 para converter cada fala usando a referência do Ben. A saída é a fala convertida; se a conversão falhar, o jogo informa o erro. Não usa voz do aparelho. O instalador reaproveita o PyTorch já instalado na preparação do Qwen e só seleciona o novo motor após gerar um WAV real e medir o tempo. Referência, modelos Qwen, chaves, progresso e fontes APT são preservados. A seleção anterior fica em openvoice/selection-before-*.json na pasta local da IA. Para voltar ao motor Qwen já preparado: `bash local-ai.sh clone use` e `bash restart.sh`.

Se a preparação falhar, a seleção anterior é mantida. `bash restart.sh` inicia os serviços dessa seleção. Arquivos do jogo substituídos pelo reparo ficam em data/installer-backups.

## O que foi reproduzido

Ao reabrir a V43.5, a tela de boas-vindas podia estar oculta enquanto o áudio continuava desativado. Tocar no cenário não o ativava. A fila aguardava a ativação antes de enviar a pergunta: nesse estado não havia requisição à IA nem ao clonador. Agora o primeiro toque ativa o som e há um aviso visível enquanto ele estiver bloqueado.

Separadamente, o clonador Qwen gerava fala compreensível, mas podia demorar demais junto do jogo. No teste real desta máquina Linux com gráficos por software, a IA respondeu à multiplicação em 64 s e o Qwen gastou 597 s para produzir 4,94 s de fala; o teste completo expirou antes da reprodução. A existência de um WAV válido não comprovava que a resposta chegaria a tocar no jogo.

Com a mesma pergunta e referência, o teste com OpenVoice respondeu em 60,7 s e preparou a voz em aproximadamente 8,4 s. A captura da saída de áudio do Chromium continha fala (pico PCM 21359; RMS -19,1 dBFS), e a transcrição independente reconheceu a resposta 56. A fila confirmou a entrega após a reprodução. A frase de pronúncia “Quatro Braços corre rápido. O relógio está carregado” também foi reconhecida na saída convertida.

São medições desta máquina, não do GT3. O processamento de texto continua dependendo da velocidade do modelo local. O novo motor preserva a referência, mas tem timbre e qualidade próprios; não promete uma reprodução idêntica à dublagem. Os testes não medem o alto-falante físico do telefone. Evidências em reports/v43_6, incluindo a falha anterior e a captura/transcrição.

## Diagnóstico no celular

Abra http://127.0.0.1:3000/sound-test.html. A página testa separadamente:

1. Uma fala já gravada pelo clonador, sem gerar áudio novo.
2. A resposta da IA local a uma pergunta.
3. Uma fala nova do provedor local, com reprodução manual após ficar pronta.

“Copiar resultado” reúne as etapas, versões e erros sem chaves. Se o áudio já gravado também não for ouvido, confira volume de mídia, saída Bluetooth e permissão de som do Chrome. Se ele tocar e a geração falhar, o resultado mostra o erro da voz. No jogo, LIVE → IA e voz também mostra o diagnóstico da fila e dos serviços.

Para iniciar: `bash start.sh`. Para verificar: `bash local-ai.sh status`. Para parar somente processos confirmados desta instalação: `bash local-ai.sh stop`. O reinício confere UID, pasta e identidade dos processos; não usa pkill nem encerra processos externos.

Instalação nova pelo ZIP completo: extraia a pasta game, entre nela e execute `bash install.sh`, `bash local-ai.sh install`, `bash local-ai.sh clone fast` e `bash start.sh`.

## Créditos

OpenVoice: https://github.com/myshell-ai/OpenVoice, revisão 74a1d147b17a8c3092dd5430504bd83ef6c7eb23. Módulos originais e licença MIT em scripts/local-ai/vendor/openvoice. Pesos públicos OpenVoiceV2 fixados na revisão f36e7edfe1684461a8343844af60babc2efbb727, conferidos por hash. Piper pt_BR-cadu-medium: licença e créditos no MODEL_CARD baixado junto da voz. A amostra de referência é a fornecida pelo usuário.
