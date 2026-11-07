# V43.3 · Reprodução da voz clonada no jogo

[Baixar reparo de áudio](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_REPARO_AUDIO_V43_3.zip?v=43.3.0) · [ZIP completo V43.3](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_LIVE_V43_3_TERMUX.zip?v=43.3.0)

O usuário confirmou que o preview contém fala compreensível. Este reparo mantém os modelos e corrige a entrega ao jogo: a entrada ativa o áudio, respostas demoradas usam o contexto WebAudio já ativado e um botão reproduz o teste salvo sem gerar outro áudio. A fila confirma a mensagem somente depois de tocar a fala. Um aviso informa quando a IA local estiver parada.

Pare a sessão anterior com Ctrl+C. Depois de baixar o reparo, execute:

```bash
cd ~/ben10-v34/game &&
python3 -m zipfile -e ~/storage/downloads/BEN10_REPARO_AUDIO_V43_3.zip "$TMPDIR/ben10-audio-43-3" &&
bash "$TMPDIR/ben10-audio-43-3/REPARAR_AUDIO_V43_3.sh" &&
bash local-ai.sh start
```

Mantenha essa sessão aberta. Abra http://127.0.0.1:3000/?v=43.3.0 e toque em Entrar ou ♫. Em LIVE → IA e voz, use **Ouvir teste salvo do clone**. Isso toca o preview existente; não é uma resposta nova ao público. Diagnósticos devem rodar em outra sessão do Termux.

O reparo é para V43.1/V43.2/V43.3. Guarda os arquivos anteriores em `data/installer-backups` e preserva GGUF/ONNX, referência, chaves, `.env`, progresso e fontes APT. Não exige instalar ou converter modelos novamente. O ZIP completo atende instalações novas ou atualização pelo fluxo habitual; não é preciso aplicar os dois arquivos.

`bash start.sh` agora inicia também conversa e voz quando ambos estiverem selecionados como locais. O arquivo `~/.local/share/ben10-local-ai/logs/inicializacao.log` registra encerramentos e sinais; Ctrl+C encerra os processos iniciados por aquela sessão.

O log real anterior mostrou **69,5 s para gerar 5,1 s de áudio**. A correção de reprodução não garante resposta instantânea. Uma reconstrução opcional usa FP16 e dotprod somente se o Android confirmar suporte, sem SVE/SME/i8mm ou autodetecção `native`:

```bash
# Com os serviços parados, sem baixar modelos:
bash local-ai.sh clone repair-native
bash local-ai.sh start
```

A velocidade desse perfil precisa ser medida no aparelho. Para voltar ao perfil básico na compilação, use `BEN10_CLONE_BASELINE=1 bash local-ai.sh clone repair-native`.

Validação: 210 testes Node, incluindo 25 casos Python; navegador com autoplay restrito, atraso de síntese simulado, reprodução WebAudio, retomada do contexto, preview sem nova síntese, aviso de serviço parado e ausência de voz do aparelho. O comando real `bash start.sh` foi exercitado com serviços simulados e encerramento dos filhos. O ZIP completo foi extraído e seu servidor foi iniciado. Esses testes não medem timbre nem inferência no GT3.
