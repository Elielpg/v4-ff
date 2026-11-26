# Arena 3D e fluidez — complemento Termux 0.3.6

26/11/2026. Para a cópia original 0.1.9 do Snake Reyers, de Thiago Reyes. Esta é uma evolução do adaptador independente; não contém nem substitui o jogo do criador. Não foi obtido, decompilado ou redistribuído o projeto-fonte privado Godot. A camada usa somente a API pública do motor durante a execução da cópia fornecida pelo usuário.

## Resultado concreto

O jogo mantém cobra, personagens, plateia, gaiola, canhão, palco, câmeras, terreno, regras, som, IA e integrações. O complemento acrescenta decoração própria nas laterais e opções de renderização que podem ser desligadas. Não simula uma versão mais nova do criador nem promete o mesmo desempenho da LIVE dele.

A inspeção por API pública na cena inicial encontrou 3.524 MeshInstance3D, 4.438 nós e 871 materiais padrão únicos. Isso conta a cena inteira, inclusive modelos ocultos: não significa 3.524 objetos desenhados a cada quadro nem prova que toda a CPU seja gasta neles. O uso de CPU concentrado em um núcleo nos diagnósticos antigos e esse volume de cena tornam inadequado simplesmente acrescentar dezenas de modelos independentes. O motor gráfico e o agendamento Android continuam relevantes.

## O que mudou na imagem

- 114 detalhes próprios nas bordas: balizadores, bases, pontos coloridos, faixas de sinalização e cristais geométricos. São cinco MultiMeshInstance3D, sem corpos físicos, novas luzes reais, partículas ou sombras. Os detalhes ficam fora das casas jogáveis e não alteram as colisões da cobra.
- Filtragem anisotrópica do terreno e geração de mipmaps na memória, quando faltam. Atua somente nas texturas padrão de piso, parede, grama e elevação já carregadas no jogo. Não muda fotos de espectadores, letras, rostos ou texturas animadas. Há limite de oito imagens, até 2048 × 2048 e uma imagem nova por quadro durante a preparação.
- Ajuste opcional de cor da grama para reduzir o aspecto excessivamente luminoso, preservando a textura original. A preferência é independente da filtragem e pode ser desligada.
- Resolução interna do 3D separada da resolução da janela e dos controles. A imagem 3D pode ficar mais suave; o painel não é reduzido junto. A janela continua no perfil de apresentação escolhido anteriormente.
- Antisserrilhado conforme o motor: FXAA no Vulkan/Mobile; 2× MSAA no OpenGL, que não oferece FXAA nessa versão. O perfil de mais detalhe também usa MSAA no Vulkan. Isso tem custo gráfico, especialmente no OpenGL: compare os modos no aparelho, sem assumir ganho automático.
- Limite de tamanho dos mapas de sombra e uso do LOD já oferecido pelo motor. Nenhum modelo original foi substituído ou removido.

A prévia `docs/evidence/PREVIA_ARENA_V036.png` é captura do jogo original com o complemento, em execução real Linux. Não é imagem conceitual gerada por IA, captura do GT3 ou benchmark de vídeo. A câmera e a seleção aleatória de texturas originais podem produzir outro enquadramento na sua partida.

## Perfis

| Perfil | Escala 3D inicial | Faixa adaptativa | Teto de FPS | Atlas de sombra |
| --- | ---: | ---: | ---: | ---: |
| GT3 fluido | 82% | 65–90% | 30 | 1024 |
| Equilibrado | 92% | 75–100% | 30 | 2048 |
| Mais detalhe | 100% | 85–100% | 30 | 2048 |

O teto é um limite de trabalho, não garantia de manter 30 FPS. Um limite explícito menor do chamador continua respeitado. A escala reduz largura e altura do 3D; 82% em cada eixo corresponde a cerca de 67% dos pixels, antes dos demais custos de renderização. Isso não implica 33% menos tempo total de quadro, principalmente quando o gargalo está na CPU.

A resolução adaptativa observa intervalos reais entre quadros, usando o relógio monotônico, em vez do delta de simulação que pode ser limitado pelo motor. Aguarda o início, exige três janelas lentas antes de reduzir e cinco janelas boas para recuperar detalhe. As alterações são pequenas e limitadas pelo perfil.

Depois de reduzir, compara duas janelas seguintes. Se não observar pelo menos 3% de melhora dos intervalos, restaura a escala anterior e pausa novas tentativas por 30 segundos. É uma proteção conservadora de qualidade: a câmera, compilação de shaders e eventos também afetam as amostras; esse teste não identifica sozinho um gargalo de GPU ou CPU. O comportamento e seus limites foram exercitados no Godot real.

## Termux:X11

O preparo mantém retrato, proporção, tela cheia, resolução personalizada e teclas extras ocultas. Acrescenta ampliação bilinear quando essa preferência existe no APK. Não força configurações de BGRA, drivers antigos, clocks, root ou origem do Termux.

A preferência nova tem backup separado, inclusive quando já existe o backup antigo de tela. A função de restaurar apresentação combina os dois, sem perder a opção anterior de filtragem. Não foi alterada a configuração global do Android.

A documentação oficial do Termux:X11 continua relevante: o Android pode tratar o processo Termux como segundo plano mesmo com a janela X11 visível. Não sabemos ainda se isso domina o caso do GT3. Trocar o APK por sharedUid exige origem/assinatura compatível; não fizemos essa troca. Pesquisa anterior: `INVESTIGACAO_CAUSA_GT3.md`. Fonte das preferências: https://github.com/termux/termux-x11/blob/master/lorie/src/main/res/xml/preferences.xml

## Arquitetura

- `scene_graphics.py` valida e salva controles próprios, configura a abertura e oferece `/termux/scene-graphics`. Não aceita caminhos de scripts ou comandos do operador/modelo. O complemento fica desativado por padrão numa cópia sem preparo; o reparador desta versão o habilita uma única vez na instalação existente, se ainda não há configuração própria.
- `godot/scene_graphics.gd` é um SceneTree independente: solicita ao Godot carregar normalmente a cena principal configurada no pacote, espera a câmera original e aplica os ajustes públicos. Não lê nem exporta o código do jogo. O pacote original fica intacto.
- `native.py` liga essa camada somente aos modos LIVE/prévia originais. Respeita scripts explícitos do chamador e não injeta a camada no editor de terreno. Ajusta o orçamento de FPS e preserva áudio privado e motor selecionado.
- `presentation.py` adiciona somente a preferência X11 documentada e seu backup.
- `ui.js` oferece Arena 3D, medições e retorno ao visual original no painel privado, sem novos painéis sobre a LIVE.
- O JSON de execução guarda método gráfico, escala observada e próxima, intervalos médios/p95, chamadas gráficas totais, memória de texturas e auditoria da decoração. Não inclui comentários, nomes, fotos ou credenciais.

Se o arquivo opcional da camada estiver ausente, a abertura continua pelo jogo original e o painel informa o motivo. Um erro de script/motor ainda pode impedir a janela: nesse caso desative o complemento no painel e reabra. Não há ciclo automático de reinicializações.

## Validação e limites

- 317 testes Python passaram, incluindo os 67 originais; três testes Node passaram. Testes focados verificam configurações, preservação de áudio/modos/scripts, retorno ao visual original, falha segura do arquivo opcional, limite de FPS, preferências X11, reaplicação sem sobrescrever escolhas e reversão dos arquivos/configuração novos.
- Godot 4.7 real: controle da histerese, limites inferior/superior, recuperação de qualidade, respeito a um teto explícito de 24 FPS e restauração/pausa quando a redução não ajuda. Saída: `GRAPHICS_CONTROL_V036.log`.
- Ensaio isolado da decoração, 640 × 640, OpenGL por software Linux, seis amostras por caso: 114 chamadas gráficas/117 nós com objetos individuais; cinco chamadas/nove nós com lotes. Ambos desenharam 4.260 primitivas e mantiveram o teto de 30 FPS após aquecimento. Demonstra redução das chamadas da decoração nova, não aceleração do jogo inteiro. Registro: `DECOR_BENCH_V036.json`.
- Jogo original + complemento + Piper real + PulseAudio privado em Linux: arena carregada, 114 detalhes em cinco lotes, três texturas de terreno preparadas, foto recebida e fala da cobra iniciada/concluída. A câmera e o jogo continuaram executando. A resposta textual usou uma fixture de atraso conhecido; não é benchmark do Qwen. Registro: `NATIVE_GRAPHICS_V036.json`.
- Vulkan/Mobile real em Lavapipe Linux por software: carregou arena, camada e filtragem sem erro de script. Isso confirma compatibilidade nesse motor, sem comprovar a GPU Adreno ou velocidade no GT3. Os FPS baixos do renderizador por CPU desse teste não descrevem o telefone. Registro: `MOBILE_GRAPHICS_V036.json`.
- Chromium 412 × 915: salvar perfis/controles, recarregar, consultar, baixar diagnóstico e desativar o complemento, sem erros JavaScript ou transbordamento horizontal. Registro: `BROWSER_GRAPHICS_V036.json`.
- Conferência por SHA-256 dos 127 arquivos originais recebidos na preparação do pacote. Nenhum executável, recurso privado, peso de IA ou chave foi incluído na entrega.

Os mipmaps acrescentam memória de textura; o consumo exato depende das texturas sorteadas. A camada acrescenta decoração e não reorganiza todas as milhares de peças originais. Reduzir esse custo de CPU de forma mais profunda exige estudar as mudanças da cena sem quebrar os objetos dinâmicos; não declaramos isso resolvido nesta etapa. Também continuam pendentes desempenho/temperatura no GT3, estabilidade prolongada com transmissão e possível política de segundo plano.

## Atualização da instalação existente

Pare o iniciador com Ctrl+C e espere o prompt; deixe o Tor da outra sessão como está.

```sh
cd ~/SNAKE_REYERS_TERMUX_0_2 &&
curl -fL 'https://raw.githubusercontent.com/Elielpg/v4-ff/main/SNAKE_REYERS_GRAFICOS_GT3_V036.sh' -o "$HOME/snake-graficos-v036.sh" &&
bash "$HOME/snake-graficos-v036.sh" "$PWD" &&
bash start.sh
```

Confira Termux 0.3.6 no painel. O reparo faz backup e, na primeira aplicação sem configuração gráfica própria, ativa o GT3 fluido. Preserva a resolução de apresentação, motor Vulkan/OpenGL, voz, IA, modelos, música, chaves e progresso. Reaplicar não reativa algo que você desativou.

Se você iniciava com `SNAKE_RENDERER=mobile bash start.sh`, mantenha essa variável ao iniciar. Ela é temporária e não equivale a salvar o motor no painel. O seletor Vulkan direto/Mobile continua disponível; compare com a mesma cena/resolução e volte ao anterior se piorar a imagem ou estabilidade.

Em Arena 3D escolha o perfil e salve. Feche e abra somente a janela para aplicar. Para comparar, use Desativar complemento e reabra; a apresentação e o som continuam configurados. Uma configuração salva ainda não comprova que a janela atual a aplicou: confira a medição e sua idade.

Para primeira instalação, use o ZIP do complemento completo e a seção de instalação do README com sua cópia original do Snake Reyers. Para atualizar esta pasta já funcional, use o reparador acima.

## Teste no GT3 e reversão

Use primeiro GT3 fluido e mantenha motor/resolução constantes. Após alguns minutos com o jogo visível, no painel pressione Atualizar medição do cenário e Baixar diagnóstico gráfico. O arquivo é `COFRA_GRAFICOS_GT3.json`; inclui escala, tempos do motor e contadores, sem dados do chat. Os tempos são do motor, não uma medição externa dos quadros apresentados pelo Android.

Se ficar suave mas pouco nítido, teste Equilibrado. Se o ganho não aparecer, não aumente todos os efeitos simultaneamente: compare com o complemento desativado e use também o diagnóstico de processos/agendamento já fornecido. A camada não força a GPU/NPU a executar o Qwen.

Para reversão completa, pare o jogo e execute o `python3 "…/REVERTER.py"` mostrado pelo reparador em `state/launcher-backups/graphics-v036.…`. Ele restaura os arquivos anteriores e a presença/configuração gráfica original, removendo arquivos novos que não existiam. Voz, modelos, músicas, progresso e chaves permanecem preservados. O relatório da versão anterior e os backups devem ser guardados até o teste físico.
