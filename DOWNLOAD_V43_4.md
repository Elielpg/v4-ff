# V43.4 · Voz clonada entregue ao jogo após geração demorada

[Baixar reparo de voz](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_REPARO_AUDIO_V43_4.zip?v=43.4.0) · [ZIP completo V43.4](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_LIVE_V43_4_TERMUX.zip?v=43.4.0)

A V43.3 podia perder o áudio quando a conexão expirava antes de a síntese terminar. Essa falha foi reproduzida: a primeira fala era descartada e a tentativa seguinte gerava o mesmo texto novamente. O tempo padrão legado era 60 segundos; o log fornecido pelo usuário mostrou 69,5 segundos para gerar 5,1 segundos de áudio. O print de PREPARANDO VOZ não confirma sozinho qual timeout aconteceu no telefone.

A V43.4 inicia uma tarefa e acompanha a geração por consultas curtas. O worker guarda o WAV pronto; conexões interrompidas e reinício do serviço não obrigam a gerar de novo uma fala já concluída. O cache local fica separado por modelo e referência, limitado a 32 clipes/24 MB e 30 minutos.

O jogo mostra o tempo de geração e só confirma a mensagem após reproduzir o áudio. O teste salvo funciona enquanto a fila está ocupada. LIVE → IA e voz inclui um player de teste e **Copiar diagnóstico de voz**, sem chaves de API. Frases automáticas aguardam o clonador responder rapidamente antes de disputar a fila com os espectadores. Comentários, chegadas, presentes e agradecimentos permanecem ativos; respostas da IA local ficam mais curtas.

## Instalar o reparo

Pare a execução anterior com Ctrl+C. Depois de baixar o reparo:

```bash
cd ~/ben10-v34/game &&
python3 -m zipfile -e ~/storage/downloads/BEN10_REPARO_AUDIO_V43_4.zip "$TMPDIR/ben10-audio-43-4" &&
bash "$TMPDIR/ben10-audio-43-4/REPARAR_AUDIO_V43_4.sh" &&
bash local-ai.sh start
```

Mantenha a sessão aberta. Abra http://127.0.0.1:3000/?v=43.4.0 e toque em Entrar ou ♫. A nova versão do worker exige reiniciar a execução antiga; recarregar apenas a página não troca o serviço Python que já estava rodando.

Preserva GGUF/ONNX, referência, chaves, `.env`, progresso e fontes APT. Faz backup dos arquivos alterados em `data/installer-backups`. O reparo aceita V43.1 até V43.4; não é preciso baixar ou converter modelos novamente. Não aplique o pacote completo e o reparo em sequência.

## Aceleração do motor existente

O telefone pode ainda estar usando o perfil básico aplicado para corrigir SIGILL. Com os serviços parados, este comando recompila só o motor com FP16/dotprod quando HWCAP do Android confirma suporte:

```bash
bash local-ai.sh clone repair-native && bash local-ai.sh start
```

SVE, SME, i8mm e flags native permanecem desativados. Não há download de pesos. Para compilar com o perfil básico: `BEN10_CLONE_BASELINE=1 bash local-ai.sh clone repair-native`.

## Validação

215 testes Node passaram, incluindo 29 casos Python. Regressões verificam desconexão antes de a fala terminar, recuperação do WAV após reinício, idempotência, separação por referência, corrupção e limite de cache. O navegador usa o worker HTTP Python de produção com gerador de tom de 12 segundos, maior que o timeout legado de 10 segundos configurado no teste. Uma consulta é interrompida; o teste verifica recuperação, uma única síntese, reprodução WebAudio com autoplay restrito e ACK após a fala.

O ZIP foi extraído e seu servidor iniciado. Não foi executada inferência Qwen3-TTS real nesta máquina de testes. O usuário havia confirmado fala compreensível no preview do aparelho. A velocidade da nova compilação precisa ser medida no telefone; esta correção não torna a síntese instantânea e não confirma, sem novos dados do aparelho, a causa exata de todo silêncio observado.
