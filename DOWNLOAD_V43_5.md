# V43.5 · Corrige a inicialização com servidor ou voz antigos

[Baixar reparo de voz](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_REPARO_AUDIO_V43_5.zip?v=43.5.0) · [ZIP completo V43.5](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_LIVE_V43_5_TERMUX.zip?v=43.5.0)

A falha reproduzida está na atualização/inicialização: os arquivos da interface podiam atualizar enquanto Node/Python antigos continuavam rodando. O inicializador conferia a pasta, mas não a versão do servidor reaproveitado. No teste, a página mostrou V43.4 enquanto o servidor era V43.3; POST /api/tts-jobs retornou 404. Uma falha de voz também segura a fila, impedindo as respostas seguintes.

O novo início verifica as versões de servidor e worker. Quando necessário, reinicia os processos confirmados desta instalação por UID, pasta e entrada do programa em /proc. Uma sessão já saudável é mantida. Não usa pkill nem encerramento forçado. Processos externos são preservados; uma porta ocupada por serviço não confirmado interrompe a operação com um erro explícito.

A interface mostra um aviso persistente para versões diferentes e não envia falas à API incompatível. Copiar diagnóstico de voz passa a mostrar as versões reais de interface, servidor e worker, além de serviços, fila e conexão da LIVE. Não inclui chaves.

## Aplicar em outra sessão do Termux

Baixe o reparo e execute:

```bash
cd ~/ben10-v34/game &&
python3 -m zipfile -e ~/storage/downloads/BEN10_REPARO_AUDIO_V43_5.zip "$TMPDIR/ben10-audio-43-5" &&
bash "$TMPDIR/ben10-audio-43-5/REPARAR_AUDIO_V43_5.sh" &&
bash restart.sh
```

O script faz o reinício dos processos confirmados, sem exigir localizar manualmente a sessão antiga. Mantenha a nova sessão aberta. Abra http://127.0.0.1:3000/?v=43.5.0 e toque em Entrar ou ♫.

O reparo aceita V43.1 a V43.5. Preserva modelos GGUF/ONNX, referência, chaves, `.env`, progresso e fontes APT. Faz backup dos arquivos substituídos em `data/installer-backups`. Não é necessário baixar ou recompilar os modelos. Não aplique o pacote completo e o reparo em sequência.

## Teste com o modelo real

Foi usado Qwen/Qwen3-TTS-12Hz-0.6B-Base, revisão 5d83992436eae1d760afd27aff78a71d676296fc, com a amostra do usuário. Os pesos foram baixados de repositório público e verificados por hash; a conversão e o C API nativo seguiram a revisão fixada pelo instalador. A frase “Oi, Ana!” foi gerada pelo worker HTTP real, entregue pelo Node e reproduzida pelo AudioManager do jogo no Chromium com autoplay restrito.

Medição em Linux CPU com perfil básico: 29,13 s de geração; WAV de 1,657 s, PCM16 mono 24 kHz; RMS -16,37 dBFS, pico -4,17 dBFS. O teste confirma áudio não silencioso e sua reprodução na aplicação. A velocidade e a saída física no GT3 não foram medidas neste teste; síntese lenta continua sendo uma limitação separada.

217 testes Node passaram, incluindo 29 casos Python. Foram testadas troca de servidor/voz antigos, preservação de programa externo na mesma pasta, recusa de porta externa ocupada e reutilização de sessão saudável. Há também testes de perda de conexão, WAV persistido, playback, ACK depois da fala e diagnóstico funcionando com servidor antigo. O ZIP completo foi extraído e seu servidor iniciado.

O problema de inicialização foi comprovado no código. Sem um diagnóstico atual do aparelho, não se afirma que seja a única causa de todo silêncio observado no celular.
