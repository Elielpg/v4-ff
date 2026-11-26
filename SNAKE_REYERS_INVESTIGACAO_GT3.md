# Investigação da limitação no Realme GT3 — 26/11/2026

Foram consultados o código e a documentação públicos de Godot 4.7, Termux:X11, Mesa e Android, além dos dois diagnósticos do aparelho e do código independente do adaptador. O jogo original não foi extraído/decompilado e seus 127 arquivos fornecidos continuam conferidos por hash. Não foi iniciada uma LIVE pública.

## Resultado da pesquisa

Há uma falha de consistência reproduzida no nosso iniciador secundário e uma restrição de execução em segundo plano documentada pelo Termux:X11 que os relatórios antigos não mediam. A distribuição do tempo de CPU, o limite realmente enviado e o estado térmico do telefone ainda precisam ser registrados para determinar o gargalo físico dominante. Não é correto chamar a leitura de 37 FPS de limite fixo do GT3.

### 1. Falha confirmada no adaptador: perfil ignorado no iniciador secundário

O lançamento principal (`NativeGame.start`) consulta a apresentação selecionada. O lançamento secundário (`python -m snake_termux.native`, usado pelo executável intermediário em rotas de prévia/captura/sessão) usava o resultado bruto da verificação gráfica: com Adreno confirmada, esse resultado contém 60 FPS. Essa rota não consultava o limite de FPS do perfil.

O teste executou a construção real do comando das duas versões, interceptando somente a execução do filho. Com o mesmo perfil `gt3_live`, a versão anterior enviou `--max-fps 60`; a corrigida enviou `--max-fps 30`. A resolução explícita da prévia foi preservada. A correção não troca modelos, voz, chaves ou perfil, não encerra processos e não redimensiona a janela principal. Um limite explícito do chamador também é preservado.

Esse defeito explica como uma rota podia usar teto maior do que o esperado. **Não demonstra que o telefone estava usando essa rota**, e não explica por si só os FPS baixos no primeiro teste. O coletor novo registra os argumentos filtrados dos processos para resolver essa dúvida.

Correção pronta: `SNAKE_REYERS_CORRIGIR_LIMITE_WRAPPER.py`. Aplica somente ao arquivo próprio `snake_termux/native.py` de uma base 0.3.4 reconhecida por hash; recusa arquivos editados/desconhecidos. Exige que o iniciador esteja parado e faz backup. Não é uma nova versão completa do jogo. A coleta deve vir antes da aplicação para preservar a evidência da configuração atualmente em uso.

### 2. Restrição documentada: jogo em segundo plano mesmo quando sua janela está visível

A documentação oficial do Termux:X11 diz:

> “Once Termux:X11 opens, Android treats Termux itself as no longer being on screen, so things running inside Termux (like your desktop apps) can slow down.”

O processo nativo Godot roda no UID do Termux. A janela Android pode estar no UID separado do Termux:X11. Ter a janela do jogo visível, portanto, não garante que o Android dê ao processo Godot o mesmo tratamento de aplicativo em primeiro plano.

A lista `Cpus_allowed_list` informa em quais CPUs um processo pode executar; ela não informa sua quota, peso, espera na fila do escalonador ou limites uclamp. Por isso “0–7 permitidos” e RAM livre não descartam essa restrição.

O projeto oferece `termux-x11-universal-sharedUid-release.apk`, confirmado na release oficial. Seu manifesto usa `android:sharedUserId="com.termux"` e processo `com.termux`. O README informa que essa variante só funciona com Termux instalado pelo GitHub, devido às assinaturas; não é compatível dessa maneira com as versões F-Droid/Google Play.

**Ainda não está confirmado se esse é o caso no GT3.** O novo coletor verifica origem do Termux, UIDs quando legíveis, cgroup do jogo, controles de CPU acessíveis, identificação da thread principal e espera no escalonador. Nenhum APK foi trocado. Não há motivo para desinstalar o Termux ou arriscar seus modelos/progresso antes dessa verificação.

Fonte: https://github.com/termux/termux-x11#avoiding-slowdowns
Manifesto: https://github.com/termux/termux-x11/blob/master/lorie-app/src/sharedUid/AndroidManifest.xml
Release: https://github.com/termux/termux-x11/releases/tag/nightly

### 3. Caminho gráfico: Zink acrescenta tradução e processamento de comandos

Zink implementa OpenGL emitindo chamadas Vulkan. O Godot documenta que a preparação dos comandos e o trabalho do driver podem limitar a renderização na CPU, mesmo com GPU disponível. Um percentual agregado de GPU não identifica sozinho o tempo perdido no driver, no motor ou na apresentação da janela.

O primeiro diagnóstico mostra Zink/Turnip e média amostrada de 14 FPS. O segundo mostra identificador compatível com Vulkan direto e média de 32 FPS, com CPU do jogo semelhante. Isso favorece investigar o caminho gráfico direto; não é um ensaio controlado que atribua todo o ganho somente à remoção de Zink, pois resolução, limite efetivo e condições térmicas não vieram nos JSONs.

Fontes:
- https://github.com/godotengine/godot-docs/blob/master/tutorials/performance/gpu_optimization.rst
- Documentação Mesa, consultada pelo espelho: https://github.com/chaotic-cx/mesa-mirror/blob/main/docs/drivers/zink.rst

Não foram aplicadas variáveis experimentais de driver, aumento forçado de clocks, afinidade global ou desativação de proteções térmicas.

### 4. Calor: relevante, ainda sem prova do limite térmico efetivo

Os sensores CPU passaram de 55,4–63,2 °C no primeiro arquivo para 69,1–84,4 °C no segundo. O sensor `skin-msm-therm` passou de aproximadamente 50 °C para 55,2–56,8 °C. São leituras dos sensores informados, não uma medição independente do gabinete ou da bateria.

Os relatórios antigos não guardavam frequências, limites máximos da política cpufreq ou estado dos dispositivos de resfriamento. Não permitem concluir qual proteção estava ativa. O coletor novo preserva valores brutos, frequência/política quando acessível e estados de resfriamento. Leitura negada é `null`; o programa não tenta obter root.

O Android possui uma API específica para estado térmico (`PowerManager.getCurrentThermalStatus`). Isso reforça que temperatura isolada não substitui o estado de limitação térmica. A API não foi chamada no GT3 nesta investigação.

Fonte: https://github.com/aosp-mirror/platform_frameworks_base/blob/master/core/java/android/os/PowerManager.java
Unidades de thermal sysfs: https://github.com/torvalds/linux/blob/master/Documentation/ABI/testing/sysfs-class-thermal

### 5. Godot: limite e indicador de FPS são coisas a conferir na execução

No ensaio com Godot 4.7 Linux, uma aplicação de controle respeitou 30 FPS. O jogo original, carregado normalmente por uma sonda independente da API pública do motor em modo headless, manteve `Engine.max_fps=30`. Não foi encontrado um teto universal de 37 FPS nem prova de que o Godot ignore sempre o argumento.

O modo headless não desenha a arena e não é um benchmark gráfico do GT3. O ensaio testa somente o limite e sua observação no motor. `Project FPS` é um contador de iterações do motor, não uma medição externa dos quadros efetivamente apresentados pelo Android.

O novo coletor guarda o perfil, o limite informado pelo adaptador e o `--max-fps` real da linha de execução. Se o argumento for 60, não há contradição com um valor de 37 FPS. Se for 30 e persistirem leituras muito acima do teto, será necessário examinar o tempo do log, a rota ativa e a execução do motor no telefone.

Fontes:
- https://github.com/godotengine/godot/blob/4.7/core/os/os.cpp
- https://github.com/godotengine/godot/blob/4.7/main/main.cpp
- https://github.com/godotengine/godot/blob/4.7/doc/classes/Engine.xml

## Coleta específica que falta no aparelho

Arquivo: `SNAKE_REYERS_INVESTIGAR_GT3.py`.

Com o jogo já aberto, execute em outra sessão do Termux. O script aguarda oito segundos antes da primeira amostra: deixe o Termux:X11 visível nesse intervalo. Não altere motor, perfil ou cena durante a coleta. São 12 leituras, separadas por dois segundos, além do tempo de cada leitura: cerca de meio minuto.

O JSON será salvo em Downloads se a pasta `~/storage/downloads` estiver acessível; caso contrário, na pasta HOME, com o caminho mostrado no terminal. Envie o arquivo `COFRA_INVESTIGACAO_GT3_…json`.

O script registra:

- Origem/versão do Termux, UIDs dos dois apps quando o Android permitir, versões dos pacotes gráficos.
- Perfil e resolução informados pelo adaptador; argumentos gráficos filtrados realmente presentes na execução.
- Processos do jogo encontrados no mesmo UID, para detectar eventual jogo/prévia duplicado. Não encerra nenhum deles.
- Thread principal por TID/PID, carga das threads, CPU usada, estado e espera de execução quando legível. `wchan` sozinho não é tratado como prova de espera na GPU.
- Cgroup e controles acessíveis; frequências atuais/mínimas/máximas de políticas de CPU; dados brutos de GPU; sensores e estados de resfriamento.

Não instala pacote/APK, não altera prioridade, não troca motor/resolução e não lê `.env` nem o ambiente completo dos processos; não inclui chaves, comentários do chat ou comandos brutos na saída. Não faz requisições externas: somente consultas ao painel em 127.0.0.1. O único arquivo novo no aparelho é o JSON de saída. Permissões negadas são respeitadas.

## Validação concluída

- 295 testes Python do adaptador/servidor passaram, incluindo os 67 originais.
- 16 testes focados passaram: quatro da rota de limite (também presentes nos 295), dez do coletor e dois do reparador.
- Coletor executado com processo Linux próprio e HTTP controlado: três amostras completas, identidade da thread principal verificada e campo privado de teste excluído da saída.
- Comando antigo/novo executado com lançamento interceptado: perfil 30 → argumento antigo 60 / corrigido 30.
- Godot real e jogo original em modo headless: limite lido pela API pública do motor; sem extração de fonte privada.
- 127 arquivos originais conferidos e preservados.

Esses testes não comprovam qual restrição domina o GT3 nem garantem estabilidade de LIVE. Não há alegação de ganho físico no celular decorrente da correção. A coleta nova foi preparada justamente para não repetir recomendações genéricas de baixar resolução ou aumentar threads sem identificar a rota e a política que estão em uso.
