# Cobra do PHONK 0.3.9 — preto, prata e aura branca

Data: 27/11/2026. Complemento próprio para Snake Reyers 0.1.9, de Thiago Reyes.

## Resultado visual

O estilo Chrome usa corpo preto/prata, raios brancos, aura externa branca ondulando e detalhes coloridos discretos. O piso recebe linhas e ondas prateadas na batida, com faixas de cor de menor intensidade. O cenário original continua modelado e com suas colisões, mas seus materiais e o fundo da apresentação ganham acabamento escuro/metálico.

Os modelos de espectadores/personagens, olhos e boca continuam originais. Não foi copiada a marca da imagem de referência, substituído o modelo da cobra ou extraído código privado do jogo. A inspiração é a paleta e o contraste da referência.

O painel mantém o estilo Neon anterior. É possível escolher Chrome/Neon, ajustar a força dos detalhes coloridos, raios, aura e piso. No Chrome, a cor aleatória afeta detalhes; corpo e aura permanecem claros/metálicos. No Neon, a cor continua acompanhando o conjunto inteiro.

## Congelamento — situação aberta

O usuário confirmou novamente: a cena congela e a música continua. **A causa no Realme GT3 ainda não foi identificada. Esta entrega não declara o problema físico resolvido.**

A correção de retenção de objetos feita em 0.3.8 foi verificada, mas não eliminou o sintoma relatado no telefone. Portanto, o diagnóstico não pode continuar atribuindo toda a falha àquele acúmulo.

O modo estável novo evita operações da extensão que podem exigir sincronização/realocação gráfica:

- Mantém fixa a escala 3D do perfil escolhido; suspende o ajuste dinâmico da extensão durante a partida.
- Desativa MSAA adicional da camada gráfica ao aplicar esse modo. Isso pode deixar mais serrilhado no OpenGL; o perfil pode ser comparado/desativado no painel.
- Evita copiar texturas da GPU para a CPU e criar novas cópias com mipmaps durante a varredura do cenário. Usa a filtragem e os mipmaps já disponíveis.
- Não reaplica os parâmetros de configuração e a passagem da aura quando o arquivo não mudou. Os parâmetros animados de batida continuam sendo atualizados.
- Reutiliza um material para os elementos estáticos Chrome, em vez de clonar um para cada material original.

Essas são mudanças concretas no caminho gráfico, não uma comprovação de defeito do driver. O motor Vulkan/OpenGL, a resolução da janela e os modelos de IA não são trocados automaticamente. O modo estável depende da camada gráfica estar ativada; o diagnóstico informa separadamente se foi solicitado e aplicado.

## Instalação

Com o jogo parado por Ctrl+C:

```sh
cd ~/SNAKE_REYERS_TERMUX_0_2 &&
curl -fL 'https://raw.githubusercontent.com/Elielpg/v4-ff/main/SNAKE_REYERS_CHROME_ESTAVEL_V039.sh' -o "$HOME/snake-chrome-v039.sh" &&
bash "$HOME/snake-chrome-v039.sh" "$PWD" &&
bash start.sh
```

Se seu comando atual utiliza `SNAKE_RENDERER=mobile bash start.sh`, mantenha-o. O atualizador não muda o driver nem instala modelos/novas dependências.

A primeira aplicação 0.3.9 seleciona Chrome e renderização estável, preservando músicas, voz, chaves, progresso, perfil gráfico e fonte/BPM da música. As reaplicações preservam as escolhas posteriores. O script cria backup e informa o comando `REVERTER.py`; a reversão deve ser executada com o jogo parado.

No painel http://127.0.0.1:9393, confira **Termux 0.3.9** e **Cobra do PHONK · Chrome e estabilidade**. Mudar o modo estável requer reabrir a janela. Mudar estilo recompõe os materiais gradualmente. Os efeitos de batida dependem da música tocada no jogo; outros aplicativos continuam usando BPM manual.

O ZIP é o adaptador completo e requer a instalação original já existente. Não inclui EXE/PCK, pesos de IA ou recursos privados do criador.

## Diagnóstico necessário no telefone

Quando congelar, antes de reiniciar, abra o painel e use **Baixar diagnóstico do efeito**. Envie o arquivo `COBRA_PHONK_DIAGNOSTICO.json` para analisar a ocorrência real.

Além das métricas anteriores, o diagnóstico agora diferencia:

- Processo encerrado, com código/sinal de saída, de processo ainda vivo.
- Idade da atualização da cena, contadores de quadros processados/desenhados e tempo desde o último movimento observado da cabeça da cobra. Esses dados ajudam a distinguir lógica parada de apresentação travada.
- CPU/memória/threads do processo próprio e canais de espera das threads, quando o Android permite lê-los.
- Resposta do servidor X11 a uma consulta com timeout de dois segundos.
- Motor observado, modo estável aplicado, escala, MSAA, permissões de cópia de textura e sinais conhecidos de erro gráfico.

A consulta de CPU dura cerca de 250 ms. Os canais de espera podem estar indisponíveis ou conter `0`; não são interpretados como prova de falha. O diagnóstico não exporta comentários, áudio, chaves ou conteúdo integral dos logs e não encerra/reinicia processos. A presença de um sinal de saída, por exemplo SIGKILL, não identifica sozinha quem o enviou.

## Evidências e limites

Passaram 354 testes Python (incluindo 67 originais), três testes Node, 30 verificações de áudio/estilo no Godot e oito verificações no navegador.

Os registros ficam em `docs/evidence/CHROME_*` e `ALL_TESTS_V039.xml`.

Foi executado o jogo original por 360 segundos no modo estável, com música, falas Piper reais e comandos de teste. Foram 72 amostras; a maior idade do relatório da cena foi 2,2 s. A escala ficou em 0,82, sem trocas dinâmicas. A memória estática do Godot variou de 122,9 a 124,1 MB nesse ensaio. Houve quadros lentos na renderização por software; não se trata de um resultado de FPS do GT3 ou demonstração de ausência de engasgos.

O acabamento final do cenário, os controles e a troca de estilos foram verificados separadamente no jogo original. O teste de áudio cobre aura, cores, preservação da voz, restauração dos materiais e configuração sem reaplicações periódicas desnecessárias.

Um ensaio sintético independente pausou a thread principal do Godot por dez segundos, mantendo a mistura de áudio em outra thread. O diagnóstico identificou processo vivo com atualização antiga, confirmou-se áudio PCM durante a pausa e o teste retomou depois dela. Foi uma falha artificial controlada, não reprodução da causa no telefone.

**Não houve teste físico no Realme GT3 nem transmissão TikTok.** Ainda faltam o diagnóstico da ocorrência real, uso prolongado no aparelho e verificação do driver/X11/captura. Não se afirma que MSAA, mipmaps, aura ou resolução dinâmica eram a causa específica do congelamento.

## Arquivos envolvidos

| Arquivo | Função |
| --- | --- |
| `phonk.py` / `phonk_ui.js` | Estilos, controles, modo estável e diagnóstico ampliado. |
| `phonk_runtime.gd` | Materiais compartilhados, troca de estilos e atualizações de configuração somente quando mudam. |
| `phonk_skin.gdshader` | Acabamento preto/prata e raios claros. |
| `phonk_aura.gdshader` | Aura branca no Chrome e colorida no Neon. |
| `phonk_floor.gdshader` | Piso escuro com ondas prateadas e detalhes de cor. |
| `scene_graphics.py` / `.gd` | Aplicação reversível do modo estável, sem copiar texturas para a CPU. |
| `tests/test_phonk.py` / `tests/godot/phonk_audio.gd.in` | Validação, migração, reversão, estilo, materiais e áudio. |

O atualizador preserva o arquivo da configuração gráfica anterior e aplica a opção estável à execução. Desmarcar a opção e reabrir volta a usar os ajustes gráficos salvos, incluindo a adaptação se ela estava selecionada.
