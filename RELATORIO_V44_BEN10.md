# Ben 10 · Clareira LIVE · V44
## Relatório de evolução, arquitetura e validação

Data: 09/11/2026 · versão 44.0.0 · alvo: Realme GT3 / Android / Termux.

## 1. Resultado e escopo

A V44 evolui a V43.8 no mesmo Babylon.js 9.32.1. Mantém os modelos, referência e motores de voz existentes, cenário da clareira, Omnitrix, ranking, controles, presentes, metas, desbloqueios e integrações. Não houve migração de engine, troca automática da voz nem substituição dos personagens.

A auditoria antecedeu as mudanças. Foram inspecionados 282 arquivos de JavaScript, Python, HTML, JSON, shell e CSS distribuídos, com revisão dos módulos principais e dos serviços; a base tinha 435 arquivos e 235 testes aprovados. O backup original e o manifesto SHA-256 foram criados antes do trabalho isolado da V44. O relatório de auditoria está em docs/AUDITORIA_V43_8_PARA_V44.md.

O resultado é uma versão candidata à validação prolongada no telefone. Há evidência de funcionamento em Linux e Chromium; não há resultado de uma LIVE de 60–120 minutos em GT3 físico. Clareza e timbre do clonador continuam pendentes. Não se declara resolvido o que não foi medido.

| Área | Implementação V44 | Evidência / limite |
| --- | --- | --- |
| Estabilidade | Supervisão separada de jogo, texto e voz; até três recuperações por serviço | Processos temporários foram encerrados de propósito; os outros permaneceram vivos |
| Persistência | Fila, respostas, recibos, memória e ranking locais | Reinício HTTP restaurou pergunta/recibo e ranking; não é promessa contra falha física de armazenamento |
| IA social | Memória por espectador e origem, retorno e estado social | Isolamento, expiração, desligamento e retomada testados; modelo ainda pode errar |
| Habilidades | 33 configurações, vigor, recargas, combos e guarda | Mantidos os IDs e efeitos; defesa não adiciona inimigos ou HP à clareira |
| LIVE | Regras por tipo; gameplay independente de texto gerado | Eventos e conectores testados com fixtures/protobuf; LIVE real não executada |
| Visual | Luz, sombras, cel, água, vegetação, auras, impactos e câmera suave | Chromium compilou o shader e renderizou dia/noite/combos; GPU do GT3 não medida |
| Voz | Normalização, números, envelope labial e corpus de comparação | Piper original medido separadamente; nenhum motor atual substituído |

## 2. Arquitetura atual

```text
TikTok / comentários / likes / presentes
                 |
                 v
Node :3000 -> EventHub -> contagem, metas, DNA e ranking
                 |
                 +-> LiveActionRouter -> ArenaSession -> habilidades
                 |       determinístico; sem executar texto do modelo
                 |
                 +-> SpeechQueue -> AISession -> social / direto / Qwen
                                           |
                                 memória local + referências
                                           |
                                    llama.cpp :8081
                                           |
                                   texto final / fala
                                           |
Node -> tarefas de voz :8082 -> WAV pronto -> Web Audio
                                           |
                                     recibo -> ACK

Supervisor de processos
  jogo    -> orçamento próprio de recuperação
  texto   -> orçamento próprio de recuperação
  voz     -> orçamento próprio de recuperação
  logs, RSS, estado e temperatura de bateria quando acessível
```

A voz e a conversa permanecem independentes. Os motores Piper, OpenVoice V2 e Qwen3-TTS continuam nos caminhos existentes; a escolha é feita pela instalação local. O novo supervisor reaproveita esses comandos, sem preparar ou selecionar um clone novo. A conversa usa Qwen local em API de loopback e pode manter Gemini como opção já existente.

O modelo de linguagem só devolve texto. Nenhuma resposta é avaliada como JavaScript, Python ou shell, nem encaminhada ao sistema operacional. Os comandos do jogo passam pelo parser e pelo catálogo com IDs permitidos. A interface mostra dados via textContent.

## 3. Estrutura e arquivos envolvidos

| Componente | Arquivos principais | Responsabilidade |
| --- | --- | --- |
| Coordenação | server/index.js, core.js | HTTP/SSE, estado, ranking e fila |
| Supervisão | scripts/local-ai/run.js, process-supervisor.js, runtime-log.js, restart.js | Serviços isolados, limites, diagnóstico e retomada |
| Dados | atomic-json.js, speech-state.js, engagement-state.js, audience-memory.js | Gravação ordenada/atômica e restauração |
| IA | ai-session.js, local-ai.js, classic.js | Provedor, memória relevante, persona clássica e geração |
| Gameplay | live-action-router.js, arena-session.js, ability-runtime.js | Execução determinística, combos, defesa e recursos |
| Catálogo | public/ability-catalog.js, arena-commands.js | Configuração independente, movimentos e parser |
| Render | world.js, camp-look.js, meadow-wind.js, graphics-profile.js, cinematic-camera.js | Camada visual sobre os mesmos modelos e cenário |
| Interface | arena-app.js, evolution-panel.js, evolution.css | Controles novos organizados no painel |
| Reprodução | speech-consumer.js, playback-receipts.js, neural-audio.js, mouth-envelope.js | Serialização, recibos e movimento da boca |
| Texto/voz | voice-text.js, voice-evaluation.js, scripts/voice-benchmark.js | Normalização e instrumento de comparação |
| Atualização | scripts/evolution-update.js | Integridade, backup e reversão de código |

O módulo ativo da clareira é ArenaSession. Módulos antigos de cidade e missões permanecem para compatibilidade e testes; não foram reativados nem usados para recriar o jogo. Documentos de versões antigas são históricos.

## 4. Mudanças de comportamento

### Falhas e retomada

Na V43.8, o encerramento de um serviço disparava a limpeza dos demais. Agora cada serviço tem estado, PID, último código/sinal e orçamento de três reinícios além da tentativa inicial. Os intervalos aumentam; esgotar o orçamento marca falha e não cria um ciclo infinito. O jogo continua quando a voz ou o texto param. Falha do próprio servidor permite sua recuperação independente.

Os testes encerraram o processo simulado de voz e comprovaram que o PID do jogo não mudou. Depois encerraram o servidor HTTP e comprovaram nova instância com fila, resposta, recibo e ranking restaurados. Outro teste fez a voz falhar quatro vezes; houve três recuperações e nenhuma quinta tentativa automática. O iniciador também verifica se o supervisor ainda existe, para não confundir serviços órfãos com uma sessão supervisionada saudável.

A fila não confirma uma pergunta por simples expiração quando não há navegador. O áudio concluído ganha recibo local e estado no servidor; o ACK é persistido e idempotente pela API. A restauração reaproveita respostas prontas. Avisos automáticos antigos são descartados; perguntas e presentes não são descartados por esse filtro.

SSE tem limite de buffer por cliente lento e reabre a conexão para resincronização, evitando acúmulo indefinido. Configurações também são sincronizadas, para a interface não continuar mostrando um provedor antigo depois da inicialização ou mudança no servidor.

### Memória e personalidade

Memória local limitada a 256 espectadores, duas interações recentes e retenção de 14 dias. Demo e TikTok usam chaves separadas. São mantidos retorno, visitas, seguimento e um estado social simples; lembranças relevantes são recuperadas por contexto e termos. Há controles de desligar e apagar. Os arquivos ficam em data/private e não entram na distribuição. Não é uma memória ilimitada nem fine-tuning do personagem.

A persona continua sendo o Ben clássico. Contextos são dados, não instruções para executar comandos. Falhas transitórias do Qwen deixam a pergunta aguardando nova tentativa, em vez de guardar uma mensagem de falha como se fosse resposta definitiva.

### Habilidades e LIVE

Os 33 poderes existentes conservam IDs, nomes e animações. Cada um tem custo, recarga, categoria e temporização; valores podem ser configurados no painel. O vigor regenera. O comando COMBO encadeia três poderes sem sobrepor recargas; mudanças de forma, parada ou presentes podem interrompê-lo. DEFENDER cria a guarda e o campo visual. Existe estado de mitigação para a arquitetura, sem inventar inimigos ou alegar combate que o cenário não possui.

Curtidas, comentários, seguidores, presentes, compartilhamentos e entradas têm regras de ações/falas e habilidade extra, com mínimo e intervalo configuráveis. Metas, ranking, recompensas e presentes atuais foram preservados. Regras são executadas separadamente da geração de fala. Presentes mantêm prioridade sem interromper áudio em andamento.

### Visual e desempenho

Camada reversível sobre os recursos existentes: luz mais dirigida, sombras do cenário, acabamento de materiais, cel shading leve, água com ondulações de textura, vegetação instanciada com vento, vaga-lumes noturnos, aura, guarda e ondas de impacto. A câmera acrescenta variação suave e só amplia a distância de enquadramento; respeita movimento reduzido e os enquadramentos sociais existentes.

Perfis Econômico, Equilibrado e Alto têm alvos 30/45/60 FPS, escala de resolução e sombras próprias, limites de presentes/celebrações/bolinhas e vegetação. A adaptação usa janelas e histerese. O orçamento de CPU permite 4 ou 2 threads de texto após reiniciar. A leitura opcional da bateria não é um sensor de temperatura da CPU; indisponibilidade é null.

Corrigidos identificadores duplicados dos controles de música e do contêiner de etiquetas. Os dois volumes deixam de atuar sobre o mesmo elemento. A boca usa um envelope com ataque/relaxamento; o volume de saída não reduz a abertura da boca.

## 5. Voz: o que foi testado e o que falta

A normalização preserva as letras e converte números, percentuais e unidades em fala mais explícita. Remove emoji, marcação e certos prefixos de atuação. Não existe substituição global de R por L ou outra letra. A legenda conserva o texto original.

O corpus tem oito frases cobrindo R inicial, medial e final, R/L, nomes próprios, números, português brasileiro e extensão curta/longa. O instrumento grava latência, duração, RTF e cache do motor já selecionado. Clareza, pronúncia e timbre ficam sem nota até avaliação humana. WAV válido e velocidade não comprovam uma voz parecida com o Ben.

O Piper original pt_BR-cadu-medium foi executado nesta nuvem em uma porta separada, sem referência de personagem e sem trocar a seleção do jogo. Foram medidas oito frases: geração entre 0.21 e 0.72 s, áudio entre 3.22 e 9.51 s. A espera percebida do instrumento inclui polling. Esses números não são do clonador no GT3. OpenVoice e Qwen3-TTS foram auditados no código, mas não receberam avaliação comparativa de timbre/pronúncia no mesmo corpus e aparelho nesta rodada.

As reclamações de palavras enroladas e timbre diferente continuam abertas. Nenhum motor foi removido ou substituído sob uma afirmação não comprovada de superioridade.

## 6. Benchmarks separados

### CPU / eventos, sem 3D ou modelos

Foram processados 20000 eventos sintéticos em 318.0 ms e 20000 contas diretas em 1135.7 ms. Isso mede classes em um laço Node Linux, não a capacidade de uma transmissão completa, nem do GT3. O total de curtidas foi conferido. Os dados brutos estão em reports/v44/cpu-benchmark.json.

### Qwen real, sem renderização ou voz

Mesmo Qwen3-4B-Instruct-2507 Q4_K_M, CPU Linux, quatro threads. Preparação do contexto: 8.097 s.

| Pergunta | Caminho | Tempo, segundos |
| --- | --- | --- |
| Ben, quanto é sete vezes oito? | direct | 0.034 |
| Quem criou o Omnitrix? | direct | 0.001 |
| O que é fotossíntese? | local-ai | 10.132 |
| Qual é a capital do Japão? | local-ai | 5.267 |
| Qual é meu aniversário? | local-ai | 14.846 |

O modelo respondeu aos exemplos gerais e admitiu não saber o aniversário, mas a formulação ainda pode incluir enfeites ou erros. São poucas amostras, sem percentis de produção ou prova de precisão universal. Respostas diretas rápidas já existiam na V43.8 e foram mantidas; não são inferência neural.

### Renderização, sem inferência neural

Chromium/SwiftShader, viewport 412×915 em Linux, cinco segundos por perfil. Backend gráfico por software, não GPU do telefone. Os alvos são configurações, não FPS alcançados.

| Perfil | Alvo FPS | Quadros renderizados | Janela, s | Escala |
| --- | --- | --- | --- | --- |
| economy | 30 | 51 | 5.00 | 1.8 |
| balanced | 45 | 32 | 5.00 | 1.35 |
| high | 60 | 18 | 5.11 | 1 |

Três recargas do mesmo GLB mantiveram a contagem de meshes, materiais e texturas no teste. O shader compilou e não houve erro JavaScript registrado. Medição de GPU nativa, temperatura e transmissão simultânea no GT3 continuam pendentes.

## 7. LOCAL-010 e bugs pendentes

Relato atualizado do usuário: o Termux permaneceu aberto e o programa voltou ao prompt sem mensagem. A condição da tela não foi informada. Isso não identifica o primeiro processo que saiu nem prova falta de memória.

O encerramento em cascata foi corrigido e comprovado com falhas provocadas. Logs novos registram PID, código, sinal, tentativas e estado. O iniciador informa seu término no terminal. A causa inicial do episódio no GT3 permanece aberta: pode envolver saída normal/sinal do iniciador, falha nativa, pressão de memória ou gerenciamento de processos do Android. Não foi declarada uma dessas hipóteses como fato.

SIGKILL e encerramento de todo o Termux não podem ser tratados por um supervisor dentro do aplicativo. Após um reinício do servidor, conferir a conexão TikTok; a validação não garante ressubscrição automática a uma LIVE real. Manter apenas um navegador audível evita a limitação ainda existente de concorrência entre abas.

Outras pendências: calibrar perfis no telefone; avaliar timbre e R/L do motor atual; ampliar avaliação factual do Qwen; testar disco cheio e condições adversas prolongadas; migrar ranking para armazenamento incremental antes de grandes campanhas. O ranking usa lotes e teto de 50 mil registros/5 mil IDs; a última janela não gravada pode se perder numa parada abrupta.

## 8. Testes, backup, entrega e reversão

A base passou nos 235 testes. A suíte final da V44 passou nos 255 testes, sem falhas nem casos ignorados; lint e build também passaram. O registro está em reports/v44/test-record.json e no log completo. Foram preservados os testes existentes e acrescentados casos de falha isolada, orçamento de reinícios, supervisor órfão, fila/recibo, memória, habilidades, perfis, sensor ausente, ranking e atualização/reversão.

Uma regressão introduzida durante o trabalho impedia a transformação de presentes quando os combos eram pausados. O teste antigo detectou, o controle de pausa foi separado e o caso passou novamente. Também foram corrigidos IDs duplicados identificados no navegador. Esses resultados intermediários não foram omitidos nem tratados como testes finais aprovados.

O instalador de atualização confere hashes e sintaxe antes de copiar, para somente os processos desta instalação e guarda código anterior em data/backups. A reversão valida o backup e restaura apenas código; dados, chaves, modelos e voz atuais permanecem. Há teste com espaços/aspas no caminho. O ZIP real foi extraído e aplicado sobre uma cópia temporária da V43.7; todos os hashes foram conferidos. O servidor atualizado iniciou, serviu os módulos novos, respondeu a uma conta pelo fluxo de comentários e manteve o progresso de 321 curtidas. A reversão também passou. Esse teste não executou clonagem nem uma LIVE real. Registro: reports/v44/package-test.json. Guia completo: docs/INSTALACAO_E_REVERSAO_V44.md.

A publicação do pacote completo com áudio e clonagem segue bloqueada pela revisão automática anterior e não foi repetida. A entrega pública preparada é BEN10_ATUALIZACAO_V44.zip: código, testes e documentação, sem os recursos/implementação de clonagem bloqueados. Aplica sobre a instalação existente e preserva esses arquivos. Não se apresenta esse pacote incremental como uma instalação completa nova.

O projeto completo permanece preparado no workspace, com recursos originais. Nenhuma chave, .env real, progresso privado, peso GGUF/ONNX ou cache de usuários entra na atualização pública. Não houve envio automático dos logs do telefone.

## 9. Operação rápida

```bash
cd ~/ben10-v34/game &&
python3 -m zipfile -e \
  ~/storage/downloads/BEN10_ATUALIZACAO_V44.zip \
  "$TMPDIR/ben10-v44-update" &&
bash "$TMPDIR/ben10-v44-update/ATUALIZAR_BEN_V44.sh" &&
bash local-ai.sh start
```

Abra http://127.0.0.1:3000/?v=44.0.0 e toque em ♫. Para parar: bash local-ai.sh stop. Para verificar: bash local-ai.sh status. Consulte o caminho de backup impresso para reversão.

Se o programa voltar ao prompt, registre o código de saída imediatamente e guarde os trechos finais de logs/supervisor.jsonl, inicializacao.log, conversa.log e voz.log. Revise dados do chat antes de compartilhá-los. O próximo passo de aceitação é uma sessão de 60–120 minutos no GT3 com a LIVE e a voz escolhida, registrando perfis, FPS, fila, memória, temperatura disponível e falhas.
