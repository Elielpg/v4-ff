# Renderização e movimento — adaptador 0.4.1

Atualização do complemento Termux para o Snake Reyers 0.1.9, de Thiago Reyes. Mantém o jogo original, modelos, colisões, regras, som, IA, progresso e a organização de atendimento da 0.4.0. O ZIP contém o adaptador completo; a cópia original do usuário continua necessária.

## Problema observado e diagnóstico

O usuário descreveu a cobra e a câmera parecendo avançar e recuar. Na medição local da posição dos nós da cabeça, com câmera aérea, não houve reversão nos 109 intervalos examinados. Essa medição não reproduziu o problema físico do GT3 nem permite atribuí-lo definitivamente à animação ou à câmera original.

Foi encontrado um custo concreto: aproximadamente 3.700 chamadas de desenho por quadro na cena examinada. Muitos objetos estáticos usam geometrias e materiais compatíveis, mas eram enviados separadamente. A atualização reduz esse trabalho e oferece outro caminho de renderização e um filtro visual de câmera. O congelamento prolongado e o movimento relatado no telefone permanecem pendentes de comparação física; não são declarados resolvidos.

## Mudanças e arquivos

| Área | Arquivos | Comportamento |
| --- | --- | --- |
| GPU | `device_runtime.py`, `native.py`, `scene_graphics.py` | Seleciona Vulkan/Mobile diretamente, com ICD Turnip. Consulta `vulkaninfo --summary` quando disponível; remove variáveis exclusivas do OpenGL/Zink desse caminho. Mantém OpenGL como alternativa. |
| Cenário estático | `godot/static_batches.gd` | Agrupa primitivas opacas compatíveis de duas regiões estáticas do cenário usando MultiMesh. Conserva nós, materiais originais, colisões e transformações. |
| Câmera | `godot/camera_filter.gd`, `godot/render_pipeline.gd` | Filtra a câmera apresentada ao renderizador após as atualizações normais do jogo. A câmera lógica original continua selecionada para as regras e os alvos. |
| Controles e diagnóstico | `scene_graphics.py`, `godot/scene_graphics.gd`, `ui.js` | Controles independentes para lotes estáticos e suavização; relatório de lotes, câmera e tamanho da saída. |
| Atualização | `render_update.py`, `tools/build_repairs.py` | Migração aplicada uma vez, com backup, reversão e preservação das escolhas posteriores. |

O filtro usa resposta exponencial com constante de 55 ms e fator limitado entre zero e um: não ultrapassa um alvo estático. Preserva cortes entre câmeras e grandes mudanças de posição/ângulo. Não interpola a cobra, não muda sua velocidade, a física ou o tempo de simulação. Portanto, se a animação original realmente recuar no aparelho, esse filtro sozinho não a corrige.

Os lotes começam após a inicialização. A coleta é distribuída entre quadros, com até 48 nós e orçamento suave de 1,8 ms por passagem; a construção dos lotes ocorre ao terminar a coleta. O agrupamento é limitado por regiões de 8 m para preservar parte do descarte de objetos fora da visão. Objetos animados, transparentes ou com características incompatíveis são ignorados. Mudança de visibilidade, posição, malha, material ou cor de uma fonte restaura seu grupo original. As verificações também são limitadas por quadro. Não há cópia de imagem da GPU para a CPU durante esse funcionamento.

A detecção por `vulkaninfo` pode não estar disponível na instalação. Nesse caso, a verificação OpenGL já existente pode confirmar a GPU; isso não prova que Vulkan direto funcionará. O iniciador mantém o retorno a OpenGL quando não confirma hardware no Android. Uma falha do driver Vulkan ainda pode exigir a seleção manual do modo anterior.

Um teste com renderização em thread separada gerou aviso de modo experimental e erro no encerramento do motor. Essa opção foi descartada; o reparador não a ativa. A atualização não instala drivers, modelos de IA ou outro aplicativo Termux:X11.

## Evidências

| Verificação | Resultado e limite |
| --- | --- |
| Python do adaptador | 317 testes passaram; inclui migração, reversão, detecção de GPU, argumentos e fila existente. |
| Python original recebido | 67 testes passaram. Os 127 arquivos de recebimento foram conferidos por tamanho e SHA-256, sem alteração. |
| Node original | Três testes passaram. |
| Interface móvel | Seis verificações passaram, sem erros JavaScript; controles novos e filas preservados. |
| Godot original e Piper real | Seis falas começaram e terminaram: dois presentes em ordem, três comentários e uma saudação agrupada. Quarto comentário rejeitado com a fila cheia. Teste Linux/OpenGL por software, sem LIVE real. |
| Cena original antes/depois | 3.670 → 2.738 chamadas de desenho por quadro, cerca de 25,4% menos; 588 instâncias em 79 lotes. Comparação da mesma vista com processamento da raiz do jogo desativado. Algumas animações independentes podem continuar. |
| Geometria na mesma comparação | 696.356 → 705.372 primitivas, cerca de 1,3% a mais: compensação do agrupamento por região. Não houve evidência de ganho de FPS nessa medição. |
| Imagens antes/depois | Aparência visual consistente na inspeção; diferenças pequenas de rasterização e animação. Não se promete identidade de cada pixel. |
| Regressão sintética OpenGL e Vulkan | 64 objetos em oito lotes; fontes lógicas preservadas; grupo restaurado após movimentar uma fonte; filtro limitado e sem ultrapassagem; câmera lógica original preservada. |
| Vulkan/Mobile com jogo original | Arena, lotes e filtro carregaram sem erro de script no Vulkan por software Linux. Resolução reduzida e aceleração da coleta somente na montagem do teste; não é medição de desempenho ou inicialização do GT3. |

O campo `process_delta_ms` da comparação é o delta fornecido pelo Godot e pode ser limitado pelo motor. Não é duração independente dos quadros nem medição de FPS. Os testes por software no computador não demonstram ganho de velocidade no Adreno do telefone. Nenhuma LIVE ou transmissão RTMP foi iniciada.

As evidências ficam em `docs/evidence/*V041*`. O teste sintético pode ser repetido com uma sessão gráfica ativa:

```sh
python3 tools/test_render_pipeline.py --output "$PWD/state/render-test" --renderer mobile
```

Esse teste cria uma cena própria, sem carregar o jogo ou acessar chaves. Use `--renderer gl_compatibility` para a outra opção; `--godot caminho` permite indicar o motor já instalado.

## Instalação na cópia existente

Pare a execução anterior com Ctrl+C e espere voltar ao prompt. Aplique:

```sh
cd ~/SNAKE_REYERS_TERMUX_0_2 &&
curl -fL 'https://raw.githubusercontent.com/Elielpg/v4-ff/main/SNAKE_REYERS_RENDER_MOVIMENTO_V041.sh' -o "$HOME/snake-render-v041.sh" &&
bash "$HOME/snake-render-v041.sh" "$PWD" &&
bash start.sh
```

Recarregue o painel `http://127.0.0.1:9393` e confira **Termux 0.4.1**. A primeira aplicação seleciona Vulkan direto, lotes estáticos, câmera suavizada e escala 3D fixa. Mantém resolução, perfil de qualidade, voz, IA, músicas e filas. Se a 0.4.0 ainda não tiver sido aplicada, sua migração da aparência original e atendimento também é realizada uma vez.

Para instalação completa, o ZIP mantém a pasta `SNAKE_REYERS_TERMUX_0_2` e seus instaladores. Ele não contém o executável/PCK, recursos privados do criador ou pesos de IA. Na instalação já funcionando, prefira o reparador acima para preservar seu estado.

## Comparação e reversão

Compare a mesma câmera/cena e resolução no telefone, primeiro sem transmissão. Use também uma resposta falada para conferir o movimento quando a câmera visita um espectador. Em **Arena 3D**, os controles de lotes e suavização podem ser desligados separadamente; salvar exige reabrir a janela.

Se Vulkan falhar ou ficar pior, pare a execução e inicie pelo caminho anterior:

```sh
cd ~/SNAKE_REYERS_TERMUX_0_2 &&
SNAKE_RENDERER=gl_compatibility bash start.sh
```

Essa variável vale para a execução atual. A seleção permanente também pode ser salva no painel. O retorno a OpenGL não desliga automaticamente lotes e filtro; desligue-os separadamente caso queira comparar toda a apresentação anterior.

O reparador imprime o diretório do backup e seu comando `REVERTER.py`. Pare a execução antes de utilizá-lo. A reversão restaura os arquivos/configurações registrados na atualização e não deve apagar os registros de presentes recebidos depois dela. O projeto original não é reempacotado nem regravado pela alteração gráfica.

## Pendências

- Confirmar no GT3 se a oscilação percebida e a fluidez melhoraram; comparar consumo, temperatura e FPS com a mesma cena.
- Medir execução prolongada com voz e captura Android; a causa do congelamento com música ativa ainda não foi isolada.
- Se a própria posição da cabeça recuar no telefone, coletar a medição naquele modo de câmera antes de alterar animação ou temporização do jogo original.
- O filtro pode acrescentar um pequeno atraso visual; pode ser desligado pelo painel. Lotes podem aumentar a geometria desenhada quando objetos da mesma região estão fora da vista.
- APK de captura e overlays permanecem uma frente separada; esta atualização altera a apresentação do jogo, sem iniciar transmissão.
