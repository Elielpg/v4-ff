# V48 — PHONK, participantes e captura de batida

## Base e arquitetura

A V47 foi preservada antes das alterações, com hashes. Seus 315 testes passaram novamente antes da implementação. O motor Babylon.js, a clareira, os personagens, os atlas da V47, a IA local, a voz e as regras de batalha foram reaproveitados. A entrega é uma atualização reversível do jogo existente.

`party-settings.js` concentra as opções e o reconhecimento de rosas. `PartyDirector`, no servidor, escolhe formas em um baralho sem repetição e agenda trocas com base na marcação musical recebida do navegador. Respeita recargas, perguntas, poderes, combos e uma pausa de 30 segundos após comandos manuais. Durante uma música, alinha a revelação da transformação a uma batida próxima. Sem sinal musical, usa um intervalo de 45 segundos.

A migração ativa o modo livre de DNA e mantém metas, curtidas e formas já ganhas. A opção de desbloqueio por curtidas continua disponível se for reativada. As dez formas citadas são as dez já existentes no projeto, incluindo o extra; não é a coleção completa de todos os aliens de todas as séries.

## Ritmo e entrada de áudio

O caminho de arquivo/PCM usa um filtro grave pequeno, compartilhado conceitualmente entre Java e JavaScript: passa-altas de 35 Hz e dois estágios passa-baixas de 240 Hz, com RMS por 1024 amostras. O modo Visualizer mede diretamente os bins graves do FFT fornecido pelo sistema. `BeatGain` adapta o sinal de entrada baixo sem transformar silêncio em energia.

`PhonkClock` acrescenta uma grade periódica limitada aos últimos 14 segundos. A cada 900 ms, compara tempos e fases em várias batidas; assim, uma nota sincopada não redefine o BPM a cada impacto. Mantém a alternativa rápida durante a preparação e o modo manual. O ensaio com a música de PHONK anteriormente enviada encontrou 90 BPM tanto no fluxo contínuo quanto no sinal reduzido a aproximadamente 20 quadros por segundo. Isso é uma medição nesse arquivo, não uma garantia para qualquer faixa.

Fontes disponíveis: player local com AudioWorklet, captador Android, captura de tela/áudio quando o navegador oferecer suporte, microfone autorizado para caixa/alto-falante e BPM manual. O microfone e o captador não reproduzem o som recebido de volta, evitando criar uma saída duplicada.

## Captador Android opcional

O modo padrão usa Visualizer na sessão de saída global, sem iniciar MediaProjection ou outra captura de tela. Requer as permissões normais de acesso/configuração de áudio; envia apenas níveis graves e gerais calculados a partir do FFT. A disponibilidade depende do aparelho e da rota de áudio, incluindo Bluetooth. Não foi validada em um Android físico nesta entrega.

Há uma opção avançada de AudioPlaybackCapture/MediaProjection, desativada por padrão e sem fallback automático. Ela pode filtrar o UID do app da música. O operador recebe uma confirmação específica: iniciar outra projeção pode interromper uma LIVE que já compartilha a tela. Essa opção não deve ser usada durante esse tipo de transmissão. As permissões e bloqueios do app de origem são respeitados. Nenhum modo cria arquivos de música nem quadros de tela.

`RhythmBridge` permite pareamento por código de seis números, com validade de dois minutos e limite de tentativas. Depois utiliza um token aleatório de 256 bits. Aceita somente energia, nível, instante e sequência, com limite de tamanho/frequência, rejeição de dados antigos e revogação. O servidor continua restrito a loopback. Níveis trafegam só em `127.0.0.1`; nomes e lista de aplicativos não são enviados.

O captador não tem início automático no boot, não contém modelo neural e não reinicia indefinidamente. Após cinco falhas de comunicação, encerra e exige reconexão. A compilação usa SDK oficial com checksums conferidos; a assinatura do APK é verificada. SDK e chave privada não fazem parte do pacote.

## Dança, luzes e câmera

As novas sequências PHONK/Shuffle reutilizam os quadros existentes, acrescentando passos laterais, elevação, poses de pausa e balanço. Visitantes e Ben compartilham o mesmo relógio. Não foram gerados novos atlas nesta versão.

`PartyCamera` resolve o enquadramento de entrada, foco social e dupla dentro do cenário 2D. Isso corrige a antiga sobrescrita da câmera social por `ComicStage`. A aproximação, o deslocamento lateral e a leve inclinação seguem a batida; o enquadramento considera o tamanho da forma e a largura da dupla.

`PartyLighting` desenha fachos e aros no canvas de efeitos já existente, com limites por perfil. A luz de fundo recebe uma atenuação suave para destacar os acentos. Não há flashes brancos ocupando a tela inteira. Movimentos reduzidos limitam esses efeitos.

## Rosa, perguntas e preservação

`LiveAudience` tem uma fila de duplas limitada, duração de 16 segundos e extensão limitada a 24 segundos. O visitante acompanha visualmente o Ben, recebe aura rosa e depois volta ao lugar. A posição original persistente não é sobrescrita.

No modo festa, a rosa mantém pontos, autoria e avisos visuais e passa a chamar a dupla em lugar do antigo poder automático desse presente. As demais regras de presentes permanecem. Quem presenteia continua promovendo suas perguntas na fila.

`party-speech.js` e `LiveHost` reduzem falas de evento sem desativar o motor de conversa. Perguntas, saudações digitadas e chamadas ao Ben são aceitas; emojis e mensagens genéricas de torcida não disparam uma resposta longa. As filas antigas de avisos automáticos são limpas sem apagar perguntas. É possível desligar o silêncio ou o modo festa no painel.

## Testes e pendências

O registro JSON contém os resultados reais: suíte de regressão, HTTP, captura simulada no navegador, arquivo local, filtro Java, ponte Android, testes de ritmo e instalação/reversão. Testes sintéticos não substituem uma LIVE real.

Ainda pendentes: captura física no Realme GT3 e no GreenTube instalado; compensação real de Bluetooth; FPS, temperatura e memória em LIVE prolongada; músicas com grande variação de andamento; LOCAL-010. Nenhum benchmark de modelos de voz/linguagem ou redução de latência de IA é reivindicado nesta versão.
