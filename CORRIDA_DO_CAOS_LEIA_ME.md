# CORRIDA DO CAOS · LIVE — 0.1.0

Jogo independente para navegador e Termux. O público comenta **EU** para entrar de graça, ganha um mascote original e disputa corridas automáticas. Tem nome/foto quando disponíveis, obstáculos, turbo, escudo, ventania, pódio, ranking, música original, efeitos sonoros e apresentador com falas neurais prontas.

O pacote não altera Ben 10, Pulso Arena, Jujutsu ou Torre TNT. Não inclui chaves, modelos grandes de IA, dados de espectadores nem músicas comerciais.

## Instalar no Termux

Requer Node **22.19 ou mais recente**. A instalação inicial baixa as dependências do conector. Se precisar liberar Downloads, execute `termux-setup-storage` e conceda acesso.

Com o ZIP em Downloads:

```bash
cd ~ &&
python3 -m zipfile -e ~/storage/downloads/CORRIDA_DO_CAOS_V0_1.zip . &&
cd ~/CORRIDA_DO_CAOS_V0_1 &&
bash install.sh &&
bash start.sh
```

Abra **http://127.0.0.1:3400** no Chrome do mesmo celular e toque em **TESTAR COM SOM**. A demonstração usa nomes fictícios e tem progresso separado da LIVE.

Nas próximas vezes:

```bash
cd ~/CORRIDA_DO_CAOS_V0_1 && bash start.sh
```

Para parar: **Ctrl+C** na sessão original, ou `bash stop.sh` dentro desta pasta em outra sessão. O comando de parada verifica os processos desta instalação. Não usa `pkill node`.

## Como o público joga

- **EU / JOGAR / ENTRAR:** entra na fila gratuitamente. Durante a corrida, aguarda a próxima bateria; seu nome aparece na confirmação.
- **VAI / TURBO / ACELERA:** impulso gratuito de 1,6 segundo, com intervalo de 8 segundos por pessoa.
- **DANÇAR / PULAR:** pose/animação; não exige acertar um salto com a latência do chat.
- **150 curtidas:** turbo coletivo de 1,8 segundo. Curtidas sem identificação somam somente na meta coletiva.
- **Rosa:** turbo de 2,5 segundos. Combos podem prolongar até o limite de 6 segundos; a intensidade não cresce indefinidamente.
- **Heart / Coração:** um escudo contra o próximo obstáculo.
- **Galáxia, Leão, Confete, Foguete e Relâmpago:** ventania de 2,8 segundos, com intervalo global entre ativações.
- **Outros presentes:** efeito visual e destaque. O nome recebido aparece na tela.
- **Seguir:** um escudo, uma vez por espectador reconhecido.
- **Compartilhar:** impulso curto, com intervalo de 20 segundos.

Os efeitos são definidos em `public/rules.js` e aplicados pelo servidor. Eventos de combo intermediários não ativam o poder; o combo final é processado uma vez quando o conector informa os identificadores necessários.

O ciclo começa com 10 segundos de entrada, até 35 segundos de corrida e 6,5 segundos de pódio. A corrida pode terminar antes se todos chegarem. Ao atingir o limite de tempo, a classificação restante é por distância. Primeiro, segundo e terceiro recebem 15, 10 e 6 pontos; os demais recebem 2. O primeiro recebe uma vitória. NPCs são identificados e ficam fora do ranking de espectadores.

Até 12 corredores por bateria, fila de 100 e cadastro de 2.000 pessoas. Entradas excedentes aguardam. O perfil mais antigo que estiver fora da fila e da pista pode ser removido quando o cadastro atingir seu limite.

## Conectar à LIVE

1. Inicie sua transmissão pelo aplicativo habitual.
2. Abra **☰ → LIVE**, informe somente seu @ e toque em **Conectar LIVE**.
3. Espere **LIVE · EVENTOS CONECTADOS**. Localizar a sala não equivale a confirmar o WebSocket.
4. Toque em **INICIAR CORRIDA** para liberar som e rodadas.
5. Faça uma verificação com comentário, curtidas e presente real antes de depender da integração durante uma transmissão.

A leitura usa `piratetok-live-js` 0.3.0. É um conector comunitário. Os testes deste pacote usaram eventos simulados; uma conexão pública real no seu aparelho/conta ainda precisa ser validada. Se o TikTok mudar o protocolo, a leitura pode falhar. O indicador informa desconexão, e a pista continua com os participantes já cadastrados/NPCs.

**☰ → Testar** aplica eventos fictícios apenas na demonstração. Esses controles são recusados pelo servidor no modo LIVE. Toques na página não simulam curtidas reais do TikTok.

## Apresentador e IA local

As falas de Neco para largada, presentes, boas-vindas e pódio **já estão gravadas por voz neural brasileira no pacote**. Não é usada a voz do aparelho. Nesses clipes, o nome aparece na legenda; a leitura dinâmica do nome depende do serviço local de voz.

Para perguntas livres, o adaptador aceita a IA Qwen e a voz Piper já instaladas no seu Termux. Ele envia um contexto curto, personalidade original e as últimas interações salvas por pessoa, apenas para `127.0.0.1`. Não precisa de chave. O modelo não recebe acesso ao terminal nem executa comandos.

Com o jogo aberto, use **uma segunda sessão do Termux**:

```bash
cd ~/CORRIDA_DO_CAOS_V0_1 && bash ia-local.sh
```

O iniciador procura a instalação existente em `~/.local/share/ben10-local-ai/install.json` (ou `BEN10_LOCAL_ROOT`). Reaproveita um serviço de texto compatível já pronto ou inicia o `llama-server` instalado. Para a voz, usa o ambiente Piper `ben10-ai` existente. **Não inicia o clonador**, não troca o arquivo de referência e não baixa os modelos novamente. Se a porta de voz 8082 já estiver ocupada, tenta 8083 para o novo Piper. A configuração é enviada ao jogo quando os serviços ficam prontos.

Mantenha essa segunda sessão aberta. Ctrl+C encerra somente serviços iniciados por ela; serviços preexistentes são preservados. Se faltar a instalação local anterior, o comando informa o problema e as falas prontas continuam funcionando.

Também é possível configurar **☰ → Apresentador** manualmente. Os padrões são texto 8081 e voz 8082; o nome padrão do modelo é `ben-classico-local`, alias que a instalação anterior costuma usar, mas a personalidade enviada pelo novo jogo é **Neco**. Ajuste se seu servidor usa outro alias. Toque em **Salvar e verificar** e teste uma pergunta. Sem ativar a IA, a interface identifica o modo de falas prontas; não apresenta respostas roteirizadas como raciocínio do modelo.

A fila de perguntas é limitada e expira perguntas antigas. A voz tem tempo limite; se falhar, a resposta pode aparecer apenas em legenda. A corrida não espera pelo modelo nem pelo áudio. A qualidade factual e a latência do Qwen instalado precisam de medição no aparelho. A síntese depende da versão de Piper disponível no ambiente anterior.

## Música e batida

Uma trilha instrumental original está incluída. Em **☰ → Música**, você pode carregar arquivos MP3/WAV/M4A do celular. O player usa o arquivo local sem decodificar uma hora inteira em um grande buffer. Ajuste o volume e a compensação Bluetooth entre 0 e 400 ms. Música e voz podem ser desligadas individualmente.

Para GreenTube ou outro aplicativo, baixe o **Pulso Batida 0.2.1** pelo painel Música. Instale sobre a versão anterior se já o usa. Gere um código no jogo e informe **porta 3400** no captador. Código-fonte do aplicativo em `android/`.

A disponibilidade do sinal depende do Android, aparelho, saída Bluetooth e aplicativo que toca o áudio. Prefira o modo padrão Visualizer. A captura compartilhada avançada do captador tem autorização própria do Android e pode interferir em outra captura de tela. Não há troca automática para ela. O captador não foi validado no Realme GT3 nesta entrega. Se o sinal sumir, a corrida continua.

## Progresso, recuperação e backup

- Estado salvo em `data/demo.json` e `data/live.json`, com cópias `.bak` e gravação por arquivo temporário.
- Memória de conversa limitada a três interações por perfil; cache de voz limitado por quantidade e tamanho.
- Rodada interrompida volta ao lobby com os participantes reais na fila. Um pódio já premiado não é premiado novamente.
- O supervisor tenta recuperar o servidor até 4 vezes em 15 minutos, com espera crescente. Depois para e informa a falha.
- O Android pode encerrar o Termux inteiro. Nesse caso, o supervisor também para e não consegue relançar o aplicativo. Não há promessa de execução ilimitada.

Use **☰ → LIVE → Baixar backup** para exportar o progresso do modo selecionado. Para backup completo, pare o jogo e guarde `data/`, `logs/` e o ZIP desta versão. Para restaurar a mesma versão, extraia o ZIP numa pasta separada, copie seu `data/` para ela, execute `bash install.sh` e inicie. Preserve o backup anterior antes de substituir arquivos. Não copie dados de outro jogo para esta pasta.

Diagnóstico:

```bash
cd ~/CORRIDA_DO_CAOS_V0_1
tail -n 30 logs/supervisor.jsonl
tail -n 30 logs/server.jsonl
```

Use uma aba do jogo para evitar som duplicado e consumo extra. Comece no perfil **Equilibrado**, ou **Leve** se notar aquecimento/quedas. O ajuste adaptativo reduz a resolução se o FPS ficar baixo. Reduzir movimentos suaviza a câmera e as luzes.

## Estrutura

```text
server/engine.mjs          corrida, fila, pontos, presentes e curtidas
server/live.mjs            adaptação dos eventos TikTok
server/index.mjs           HTTP, SSE, separação demo/LIVE e persistência
server/host.mjs            Neco, perguntas, fila e cache de voz
server/storage.mjs         gravação e recuperação de backup
server/rhythm.mjs          ponte de batidas do Android
public/world.js            pista, câmera, obstáculos e poses
public/mascots.js           mascotes originais adaptados da Pulso Arena
public/rules.js             parâmetros e descrição do trajeto
public/audio.js             player, efeitos e análise de batida
public/app.js               HUD e painel
scripts/supervisor.mjs      recuperação limitada do servidor
scripts/local-services.mjs  aproveitamento da IA instalada
tools/tts_worker.py         serviço Piper local
tests/                     regras, HTTP, dados e voz
docs/                      evidências e pendências
```

Execute `npm test` para os testes de Node. As ferramentas de captura em `tools/` registram o ambiente de desenvolvimento utilizado; Playwright/Chromium e a geração das falas não são dependências para jogar no Termux.

Resultados e limitações em `docs/TESTES_E_PENDENCIAS.md`. Créditos em `docs/CREDITOS.md`. As capturas da entrega mostram o renderer real com participantes de demonstração.
