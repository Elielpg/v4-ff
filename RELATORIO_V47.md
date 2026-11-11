# V47 — alterações, arquitetura e pendências

## Base preservada

A V46 foi copiada antes das alterações e passou nos 302 testes da base. Babylon.js, cenário da clareira, personagens, dados, regras da LIVE e serviços de IA/voz foram mantidos. A atualização é incremental e aceita instalações V45/V46. Não altera arquivos de modelo, chaves ou configuração de voz.

## Desenhos e movimento

Foram acrescentados 264 quadros dos onze personagens, 24 dos quatro inimigos, 12 de dança dos visitantes e 24 de efeitos: 324 desenhos adicionais. Os atlas anteriores continuam presentes. Cada personagem recebe seis conjuntos de quatro quadros principais; o Besta conserva a anatomia de quatro apoios, e o Fantasmático usa a cauda, sem pernas humanas.

`animation-2d.js` escolhe quadros pela ação e pelo relógio do servidor. Andar/correr usam a distância realmente percorrida para evitar correr parado. Salto distingue preparação, subida, suspensão e aterrissagem. `drawing-animation-view.js` estende o personagem anterior, aplica os novos atlas e mantém acenos/fala existentes. Sentar permanece desenhado; Bola de Canhão usa a arte de bola durante o rolamento.

Os quadros principais recebem pequenas deformações de corpo, inclinação, avanço no golpe, reação e pulsos de dança. São animações por desenhos e poses; não há interpolação completa de todos os membros ou um novo rig esquelético 2D. Os poderes compartilham alguns quadros de ataque, com efeitos específicos por habilidade.

## Poderes e renderização 2D

`comic-power.js` preserva antecipação, lançamento, impacto e recuperação conforme os tempos das habilidades. `comic-effects.js` desenha chamas, cristais, água, cipós, ondas, garras, estrelas, escudos, rastros, presentes, transformação e orbes de curtidas em Canvas2D. As imagens de efeitos complementam os traços vetoriais. Os sinais de áudio existentes continuam ligados aos eventos de presente, impacto, energia e recompensa.

Os 33 poderes anteriores mantêm IDs e ordem; onze especiais foram acrescentados como quarta opção de cada forma. `ability-catalog.js`, `transformations.js`, `arena-commands.js` e `arena-session.js` continuam controlando energia, comandos, recargas e seleção. O modelo de linguagem não decide nem executa comandos do sistema operacional.

`comic-stage.js` mantém a clareira desenhada e oculta os volumes no modo 2D. Babylon.js continua cuidando das coordenadas, colisões e projeção dos planos desenhados. O carregamento de GLB é evitado quando o personagem está em 2D. Os arquivos e o caminho do modo anterior permanecem disponíveis.

`battle-animation-view.js` estende a visão de batalha existente, usando seis quadros por tipo de inimigo e uma saída curta de queda. Nome, foto, vida, autoria e regras de time são preservados. `audience-drawing.js` usa passos próprios de dança para os visitantes, sem interromper o ritmo coletivo quando o Ben fala ou age.

## Correção da dança

Antes, a análise incluía frequências de voz/agudos e dependia do ciclo de renderização. A dança também reutilizava poses de corrida/aceno, e a presença de um objeto de poder expirado podia impedir sua retomada.

Agora `bass-meter.js` filtra o sinal grave; `beat-worklet.js` mede energia na trilha de áudio, em blocos de 1024 amostras. A análise ocorre antes da redução de volume durante a voz. `dance-clock.js` calcula intervalos robustos, marcação contínua, passos e atraso ajustável. A média reduz a oscilação causada pela quantização das janelas de áudio.

`live-media.js` usa o tempo do arquivo reproduzido, trata pausa/troca de fonte, mantém uma alternativa por analisador para navegadores sem AudioWorklet e oferece bloqueio manual de BPM/tap. A fala, os poderes, o salto e as transformações interrompem a dança do Ben; o relógio musical continua, permitindo retomada na marcação atual.

Para GreenTube/YouTube externo, há tap/BPM manual. Não foi implementada captura automática do som de outros aplicativos. Faixas sem graves marcados também podem exigir o modo manual. O ajuste de atraso depende do dispositivo e da saída de áudio; resultados no teste sintético não comprovam precisão em Bluetooth no GT3.

## Limites de recursos

- Até três atlas adicionais mantidos pelo cache do personagem; os atlas originais são reutilizados.
- Até 12 inimigos ativos, como na V46, e até 12 saídas curtas de queda.
- Orbes visuais limitados por perfil, até 28; no máximo 12 efeitos breves, dois espetáculos de presente e oito amostras de rastro.
- Canvas de efeitos limitado a aproximadamente 1,3 milhão de pixels.
- O áudio local é analisado durante a reprodução, sem decodificar o arquivo inteiro em outro buffer de análise.

Na cena de componentes usada no teste, repetir as trocas manteve as mesmas contagens de malhas, materiais e texturas. Isso demonstra estabilidade naquela sequência; não é medição de RAM, temperatura ou FPS do Realme GT3.

## Instalação e testes

`scripts/animation-update.js` confere a lista restrita, versão, hashes e sintaxe, faz backup e só copia depois da parada verificada. Usa o reconhecimento de processos corrigido no reparo R1 da V46. A biblioteca de cópia restaura os arquivos já copiados se ocorrer uma falha de escrita. A reversão valida o backup antes de restaurar.

O registro JSON reúne a suíte, sintaxe/build, ensaios com áudio real no Chromium, matriz de onze formas/44 poderes, limites de recursos e instalação/reversão. Os testes recusam pacote adulterado e destino com link simbólico antes de parar o jogo, e preservam um processo independente na mesma pasta.

## Problemas pendentes

- LOCAL-010: encerramento do Termux durante LIVE prolongada ainda exige logs e reprodução no Android. Os serviços de supervisão existentes foram preservados; esta entrega não comprova correção desse encerramento.
- Validar sincronização percebida e ajuste de atraso no Realme GT3, incluindo Bluetooth e músicas reais.
- Expandir os quatro quadros principais por ciclo para mais desenhos intermediários e animações exclusivas de cada golpe.
- Ampliar expressões/lábios; a fala ainda reutiliza parte das poses anteriores.
- Testar uma LIVE real prolongada com fotos, presentes, rede móvel, temperatura e a IA local do usuário. Os eventos desta validação foram de demonstração.

Não foram executados modelos de voz ou linguagem no celular durante estes testes, nem foi prometida redução de latência da IA. Os motores de voz, as seleções e os modelos existentes permanecem sob a configuração do usuário.
