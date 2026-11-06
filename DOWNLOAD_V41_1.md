# Ben 10 LIVE V41.1 · Correção da voz

[Baixar BEN10_LIVE_V41_1_TERMUX.zip](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_LIVE_V41_1_TERMUX.zip)

Corrige a leitura das características da voz antes das frases. O pedido de áudio agora contém somente a fala. A descrição da personalidade fica nas instruções da conversa, separada do conteúdo enviado ao sintetizador.

Quem responde é apenas **Ben Tennyson criança do clássico**: brincalhão, confiante, impulsivo e corajoso. Transformações mantêm a mesma personalidade e a mesma voz selecionada do Ben. Chamar Gwen ou Max no chat não faz outro personagem assumir a conversa. A animação continua na forma alienígena real.

## Atualizar no Termux

Na pasta anterior (ajuste se estiver em outro caminho):

```sh
cd ~/ben10-v34/game
bash backup.sh
bash update.sh --archive ~/storage/downloads/BEN10_LIVE_V41_1_TERMUX.zip --start
```

Abra novamente a página e confirme **V41.1 / 41.1.0**. Se aparecer a versão anterior, atualize a página ou abra `http://127.0.0.1:3000/?v=41.1.0`.

Em **LIVE → IA e voz**, salve o provedor e toque em **Testar voz IA**. A fala de teste deve começar diretamente por **“E aí, pessoal!”**, sem anunciar voz, características ou interpretação. Ative **♫**.

Chaves, `.env`, progresso, configurações e modelos personalizados são preservados pelo atualizador. O ZIP não contém chaves nem progresso pessoal. Instalação nova: extraia, entre em `game`, execute `bash install.sh` e `bash start.sh`.

## Verificação

A suíte tem **177 testes aprovados**. Os novos testes inspecionam o pedido ao TTS para confirmar que contém exatamente a frase. A integração HTTP verifica Ben, as dez formas alienígenas e chamadas de Gwen/Max, confirmando a mesma voz do Ben e nenhum prefixo de instrução. Testa a personalidade do clássico separada da forma visual.

O Chromium também verificou a reprodução com IA simulada, fila, visitantes, cumprimentos, energia, relógio e layouts. O ZIP foi extraído e seu servidor iniciado. Google e áudio são simulados offline: isso verifica o contrato e a reprodução, sem validar o timbre do Google real. Não houve uso de chave Google real, LIVE real ou Android físico.

Os recursos da V41 são preservados. Continua somente voz de IA, com acesso/cota dependentes do Gemini TTS ou ElevenLabs. Guia e relatórios no ZIP: `game/docs/V41_1_CORRECAO_VOZ.md` e `game/reports/v41_1/`.

[Checksum SHA-256](BEN10_LIVE_V41_1_TERMUX.zip.sha256) · [Recursos da V41](DOWNLOAD_V41.md)
