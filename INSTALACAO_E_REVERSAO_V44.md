# Instalação, execução e reversão V44

O pacote BEN10_ATUALIZACAO_V44.zip é uma atualização de código para o Ben V43.7/V43.8 já instalado. Mantém os motores, amostra de voz, modelos e recursos atuais. Não inclui os pesos grandes ou os arquivos de clonagem e áudio já existentes no projeto.

## Atualizar

Baixe em Downloads e execute:

```bash
cd ~/ben10-v34/game &&
python3 -m zipfile -e ~/storage/downloads/BEN10_ATUALIZACAO_V44.zip "$TMPDIR/ben10-v44-update" &&
bash "$TMPDIR/ben10-v44-update/ATUALIZAR_BEN_V44.sh" &&
bash local-ai.sh start
```

O instalador valida SHA-256 e sintaxe, confere a pasta e encerra somente os processos identificados desta instalação antes de copiar. Guarda o código anterior em `data/backups/before-v44-.../`. Não reinstala APT/Python, não baixa pesos e não altera .env, chaves, modelos, referência ou seleção da voz. Se a versão antiga estiver rodando, o ranking visível (até 20 posições) e o total de energia podem ser importados; o restante do ranking antigo não é exportado pela API da V43.8. A V44 passa a persistir seu próprio ranking completo, com limite declarado.

Abra http://127.0.0.1:3000/?v=44.0.0 e toque em ♫. Confira a conexão da LIVE no painel. Mantenha esta sessão do Termux aberta.

## Iniciar depois

```bash
cd ~/ben10-v34/game
bash local-ai.sh start
```

Status: `bash local-ai.sh status`. Parar: `bash local-ai.sh stop`. Os serviços têm até três recuperações automáticas por sessão; esgotar esse limite não entra em um ciclo infinito. O jogo permanece disponível se texto ou voz falharem.

## Reverter o código

Leia o caminho de backup impresso pelo instalador. Dentro dele há `COMO_REVERTER.txt`, com os comandos escapados para a sua pasta. Exemplo (substitua pelo caminho real):

```bash
cd ~/ben10-v34/game
node scripts/evolution-update.js --rollback data/backups/before-v44-CAMINHO_REAL
bash local-ai.sh start
```

A reversão valida a integridade do backup, para os processos desta instalação e restaura somente os arquivos de código listados. Remove arquivos novos daquela atualização. Mantém dados, chaves e modelos atuais. Não é uma restauração histórica do progresso. Os arquivos de memória/fila V44 ficam locais e versões antigas não os interpretam. Guarde o backup original da V43.8; não aplique os reparos históricos V43.7 sobre a V44.

## Configurar sem encher a tela

Em LIVE → Configurações, abra V44. Há memória local, ajuste automático de resolução, orçamento de CPU, regras por tipo de evento e configuração individual de habilidades. Perfis gráficos: Econômico (alvo 30 FPS), Equilibrado (45) e Alto (60). São limites/alvos, não uma garantia de desempenho no GT3.

O perfil de CPU GT3 usa quatro threads de texto; Menor carga usa duas e pode responder mais devagar. Aplica ao executar novamente `bash local-ai.sh start`. O motor de voz não é trocado. A leitura opcional de temperatura usa o sensor da bateria quando disponível, não mede a CPU; ausência é informada como null.

Na seleção de poderes há vigor, Defender e Combo. O chat pode usar DEFENDER, COMBO e os comandos atuais. A defesa tem campo visual e estado de mitigação para a arquitetura; não foram adicionados inimigos ou um novo sistema de HP à clareira.

Memória local: até 256 espectadores, duas interações recentes e retenção de 14 dias. Pode ser desligada ou apagada. Fila e ranking são armazenados separadamente. Evite vários navegadores tocando a mesma LIVE: exclusão global de reprodução entre abas ainda não está implementada.

## Diagnosticar a parada do Termux

O relato atual é retorno ao prompt sem mensagem, sem fechamento do aplicativo. Se repetir, registre o código de saída imediatamente:

```bash
bash local-ai.sh start
task_exit=$?
printf 'Código de saída: %s\n' "$task_exit"
```

Em outra sessão:

```bash
cd ~/ben10-v34/game
bash local-ai.sh status
task_logs="${BEN10_LOCAL_ROOT:-$HOME/.local/share/ben10-local-ai}/logs"
tail -n 80 "$task_logs/supervisor.jsonl"
tail -n 60 "$task_logs/inicializacao.log"
tail -n 60 "$task_logs/voz.log"
tail -n 60 "$task_logs/conversa.log"
```

Os logs e dados podem conter textos e nomes do chat; revise antes de compartilhar. Nada é enviado automaticamente. SIGKILL do Android ou encerramento de todo o aplicativo não pode ser interceptado pelo supervisor interno. A causa original no GT3 continua pendente de confirmação, embora o encerramento em cascata tenha sido corrigido e testado.

## Comparar voz no aparelho

`node scripts/voice-benchmark.js --output data/diagnostics/voice-atual.json` mede o motor já selecionado, sem trocá-lo. O corpus cobre R/L, números, nomes e frases curtas/longas. Clareza, timbre e pronúncia precisam de avaliação humana; os campos ficam sem nota até serem avaliados. Não compare tempos de máquinas/corpora diferentes como prova de superioridade de um motor.

## Benchmarks no telefone

- CPU de eventos: `node scripts/v44-cpu-benchmark.js` (sintético, sem modelos).
- Texto já instalado: `node scripts/benchmark-current-ai.js` (força consultas reais ao modelo local e salva em data/diagnostics).
- Voz atual: `node scripts/voice-benchmark.js` (não troca o motor; não dá nota automática de timbre).
- Renderização: confira os perfis e FPS no painel e registre condições.

Execute cada medição separadamente, com a LIVE pausada e a página 3D fechada quando estiver medindo IA ou voz. Os scripts de Chromium/llama de laboratório usam caminhos Linux e são ferramentas de desenvolvimento.

## Teste prolongado pendente

Validar no GT3 por 60–120 minutos com TikTok, gravação/transmissão, cenário e voz simultâneos. Registrar início/fim, perfil, FPS, temperatura disponível, fila, memória e recuperação. Esta validação não foi simulada como se fosse hardware físico.
