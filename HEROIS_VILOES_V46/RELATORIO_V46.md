# Clareira LIVE V46.0.0 — arquitetura, alterações e pendências

## Base e escopo

A implementação evolui a V45.0.0 existente. Houve auditoria de integração e backup anterior às alterações; a base passou nos 281 testes. Não houve migração de motor, recriação do projeto ou instalação de novos serviços neurais. A entrega é uma atualização incremental para V45/V46.

## Arquitetura

| Camada | Arquivos principais | Responsabilidade |
|---|---|---|
| Entrada LIVE | `server/index.js`, adaptadores TikTok existentes | Normalizar eventos, aplicar regras, manter fontes DEMO/LIVE separadas e transmitir estado por SSE |
| Batalha | `server/live-battle.js`, `public/battle-rules.js` | Papéis, tipos de inimigo, ondas, energia, dano, XP, rodadas, persistência e limites |
| Cenário 2D | `public/comic-stage.js` | Fundo desenhado, parallax leve, iluminação por hora e câmera; retorno ao cenário 3D original |
| Personagens | `character-2d.js`, `extra-drawing-catalog.js`, `atlas-sprite.js` | Desenhos dos onze personagens; materiais reutilizados e poses |
| Espectadores | `server/live-audience.js`, `audience-drawing.js` | Participantes em 2D com nome, foto e time; cumprimentos e posições do lado escolhido |
| Inimigos | `battle-view.js` | Até doze inimigos, autoria por foto/nome, vida, animação de ataque e traços de impacto |
| HUD e DNAs | `battle-hud.js`, `battle.css` | Times, vida, energia, XP, rodadas, fila, top dos times e prévias bloqueadas |
| Fala | `server/battle-dialogue.js`, `ai-session.js`, `live-host.js`, `classic.js` | Respostas rápidas para regras e contadores, contexto verificado para o modelo e falas de equipe |
| Música e efeitos | `dance-clock.js`, `live-media.js`, `cinematic-audio.js` | Batidas locais, BPM manual, dança e áudio de novo seguidor |
| Atualização | `scripts/campaign-update.js` | Lista restrita de arquivos, validação de hashes, backup e reversão |

O modelo de linguagem não executa comandos do sistema. Papéis e ações são definidos por parsers e regras de jogo. O modelo recebe somente dados de contexto e gera texto para a conversa. A IA de gameplay permanece independente da geração de voz.

Os motores de IA/voz e seus arquivos de instalação não foram substituídos. O pacote não contém chaves, modelos neurais, amostras de dublador, arquivos de clonagem ou dados da LIVE. As falas novas usam o motor de voz selecionado pelo usuário.

## Mecânicas e persistência

Há quatro tipos configurados de inimigos: drone, mutante, mago e titã. Cada curtida de um vilão acrescenta um crédito de inimigo. Presentes adversários criam elites com três vezes a vida e dano maior. São no máximo doze ativos; os créditos restantes são números por jogador, não uma lista de meshes pendentes.

Heróis e visitantes sem time dão energia e progresso de DNA com as curtidas. Presentes dos heróis dão reforço de vida/energia/dano. Os eventos dos vilões não alimentam o desbloqueio por curtidas. As regras existentes de desativação, quantidade mínima e frequência de eventos continuam respeitadas.

O nível do Ben é `1 + floor(sqrt(XP/100))`. Curtidas dos heróis dão XP, presentes dão XP conforme pontos, inimigos derrotados dão 12 XP e a vitória dá 30 XP. Níveis aumentam o dano básico com limite. Rankings individuais usam a participação em curtidas/presentes do jogador. Os contadores são de gameplay, separados do ranking geral existente.

`data/private/live-battle.json` guarda times, créditos, inimigos ativos, XP e identificadores recentes. DEMO e TikTok têm estados separados. Há checkpoints de até três segundos e gravação final no encerramento normal. Um encerramento forçado do Android pode perder os últimos segundos. Arquivo inválido não é sobrescrito: o jogo avisa e mantém a batalha em memória para diagnóstico.

O registro de eventos é limitado a 2048 IDs por fonte; a memória de participantes a 1024 por fonte, com remoção de registros antigos sem invocações pendentes. Fotos são servidas pelo proxy existente, com hosts TikTok permitidos e cache limitado. Fotos ausentes/expiradas usam iniciais. Os avatares visíveis de espectadores continuam limitados pelo sistema existente de seis posições.

## Visual e áudio

O fundo é uma pintura 2D; personagens e espectadores usam planos com artes transparentes. O cenário e os modelos 3D originais continuam disponíveis. A geometria de colisão e os controladores de locomoção são mantidos; efeitos de energia/poder continuam usando recursos do Babylon.js. Não se trata de nova animação esquelética 3D.

Ben, Chama, XLR8 e Diamante mantêm oito poses. Besta, Quatro Braços, Aquático, Fantasmático, Cipó Selvagem, Bola de Canhão e Alien X recebem três poses autorais por forma, reutilizadas nos estados de movimento. A continuidade clássica continua sendo a referência; Alien X permanece marcado como extra. Sentar usa o ciclo 3D anterior.

A galeria mostra silhuetas e prévias coloridas. Ela não altera o estado do Omnitrix ou os desbloqueios e não reconstrói os canvases a cada curtida. A escolha de cenário reutiliza os mesmos recursos.

Para música tocada por arquivo no jogo, um analisador Web Audio detecta transientes nos graves e médios e sincroniza pulsos/poses. BPM e tap tempo são a alternativa para faixas suaves, vídeos incorporados e outro aplicativo. Não há leitura automática do áudio do GreenTube nem coreografia específica por letra. A dança pausa durante conversa, poder e locomoção.

O áudio de novo seguidor aceita arquivo local, com limite de 5 MB e reprodução de até seis segundos. Ele é armazenado no IndexedDB desse navegador. Não acompanha exportações do jogo e não é enviado ao servidor. O navegador precisa ser liberado por um toque para emitir som. O teste local verificou leitura, análise e reprodução de um WAV de teste; não é uma comparação de vozes neurais.

## Testes e limites de evidência

O registro JSON acompanha a entrega. Inclui a suíte existente, casos novos de regras, contagem, deduplicação, fontes, persistência, carga, dança, artes e instalação/reversão. O navegador executou a aplicação real em modo DEMO, com perfis e áudio de teste. Não foi conectada uma LIVE TikTok real nesta execução.

A simulação do backend processou 10.000 pacotes equivalentes a 1.000.000 de curtidas adversárias, mantendo o teto de doze inimigos e contadores agregados. Os tempos e a memória medidos pertencem ao processo de teste na nuvem, não ao Realme GT3, ao renderizador, à IA ou à voz.

## Problemas pendentes e próximos ajustes

- LOCAL-010: o Termux volta ao prompt e a página trava. Continua sem reprodução instrumentada no Android. Limites de entidades e tratamento de arquivos ajudam a reduzir riscos, mas não provam a correção da causa.
- Validar uma LIVE prolongada no Realme GT3, incluindo memória, temperatura, retomada do navegador, origem dos perfis e comportamento do conector na rede do usuário.
- Expandir as três poses dos sete novos aliens para ciclos completos, vistas laterais/costas e uma pose sentada 2D própria.
- Calibrar dano, XP e ritmo das ondas com público real. Uma fila muito grande permanece numérica e segura, mas pode levar muito tempo para ser enfrentada.
- Melhorar o detector de dança para músicas com pouca percussão; manter BPM manual como alternativa.
- O som personalizado é local ao navegador; limpar os dados do Chrome o remove.

Não há vídeo novo nesta entrega. A edição será feita depois das instruções do usuário.
