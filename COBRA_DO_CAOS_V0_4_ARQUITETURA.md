# Cobra do Caos V0.4.0 · alterações e arquitetura

Atualização incremental da V0.3, em 23/11/2026. Babylon.js, piloto, Termux, integração de LIVE, gaiola, ranking, RTMP e APK foram preservados. O ZIP original V0.3 foi guardado antes de editar. Cada atualização no aparelho também cria seu próprio backup.

## Mudanças verificáveis

| Área | Arquivos principais | Mudança |
|---|---|---|
| Regras e duração | `public/rules.js`, `server/engine.mjs` | Tabuleiro lógico 18 × 28, passo 280–230 ms, até 3 comidas comuns, geração espaçada e crescimento a cada 900 ms. 50 curtidas coletivas por comida. Missões individuais mantidas. |
| Migração | `server/board-migration.mjs` | Converte o ciclo 12 × 18 para 18 × 28. Preserva comprimento/donos e redistribui objetos sem sobreposição. Excedentes visíveis passam à fila; grava as dimensões para evitar migrar novamente. |
| Movimento | `public/motion.js`, `world.js`, `cinematic-world.js` | Interpolação visual de curvas, cauda anterior e relógio do movimento transmitidos pelo servidor. A física continua discreta e validada pelo piloto. Mastigação e partículas no instante visual da comida. O envelope da fala usa tempo real entre quadros para fechar a boca mesmo com FPS baixo. |
| Ilha e câmera | `scene-design.js`, `island-environment.js` | O foco de entrada espera o avatar chegar ao estado visual antes de abrir o destaque. Dimensões físicas acompanham o tabuleiro; gaiola e enquadramentos reposicionados; flora, cristais, vegetação aquática e vaga-lumes limitados. Quatro malhas da cabeça projetam sombras. |
| Mascotes | `cage-stage.js` | Braços e pernas ligados por articulações, cumprimento com punho conectado. Atlas de retratos 1024² em Leve/Equilibrado; 2048² no perfil Detalhado ao abrir a página. Letras de reserva quando a foto não permite CORS. |
| Cores | `cage-stage.js`, `app.js`, `index.html` | Modos suave automático, arco-íris ou verde. Compartilhamentos/presentes mantêm seus efeitos temporários. Movimento reduzido reduz brilho e mantém visão geral. |
| Sons | `audio.js`, `assets/sfx/eat.wav` | Som original de mastigação, carregado uma vez e reutilizado. Limitador de disparo e fila de temporizadores limitada. Música e voz continuam disponíveis em WebAudio/RTMP. |
| Apresentador | `server/host.mjs`, `app.js` | Oito falas ambiente sem repetição no ciclo; WAVs prontos gerados com Kokoro/pm_alex, sem modelo extra no celular; 40 s entre falas, silêncio recente do público e fila vazia. Prioridade inferior a saudações, perguntas e presentes. Intervalo/desativação no painel. |
| Conversa | `server/host.mjs` | Mantém contexto, memória e perguntas ao Qwen local, com regras atualizadas para 504 casas. Falha da voz mantém legenda. Sem executar instruções de sistema vindas do modelo. |
| Atualização | `tools/update.mjs`, `ATUALIZAR_V0_4.sh` | Manifesto SHA-256, parada somente da instância selecionada, backup e reversão de código/estado. Configuração local e modelos externos permanecem. |

## Fluxos

`TikTok / ponte local → identidade / deduplicação → SnakeEngine + CageSystem → SSE → movimento interpolado / HUD / efeitos`.

`Comentário → ShowHost → regra curta ou fila Qwen local → normalização → Piper/cache → evento speech → fila com prioridades → WebAudio e envelope da boca`.

`Relógio do apresentador → verifica pausa, interação recente e fila → frase ambiente pré-gerada → prioridade zero`. Esse caminho não carrega o Qwen nem gera um WAV novo a cada comentário ambiente.

O piloto é matemático. IA social, física do jogo e transmissão continuam independentes. Node escuta em loopback. As portas de IA/voz aceitam somente serviços locais configurados. A voz atual não foi substituída por clonagem.

## Recursos mantidos

Três alternativas de fuga (500 curtidas próprias OU uma rosa OU dez comentários), proteção por sessão, banquetes de 50, atribuição de donos, HERÓI/VILÃO, presentes, combos sem duplicação, ranking, playlist aleatória, ciclo dia/noite, batidas externas, fonte APT assinada/isolada, supervisor limitado, backup, APK Caos Live e estúdio RTMP do navegador.

O APK é exatamente o já entregue e tem o mesmo SHA-256. A query antiga `?v=0.3.0` da WebView é cosmética; os recursos do servidor local não são servidos com cache permanente. A interface e a API exibem 0.4.0. Não houve nova validação física de captura Android.

## Limitações e próximos testes

- TikTok pode omitir entradas ou identificar curtidas apenas em lote; o total da gaiola não é a audiência simultânea. Curtidas sem identidade não entram na missão individual.
- É necessário tocar para liberar áudio no navegador e manter o som do dispositivo ativo. Voz ambiente já vem no pacote; perguntas livres precisam do Qwen e Piper iniciados e ativados no painel.
- As falas prontas usam Kokoro/pm_alex; a geração das respostas livres mantém o Piper já instalado, portanto o timbre pode diferir. O teste de conversa usa texto controlado para verificar o caminho de áudio. Não demonstra qualidade das respostas do modelo ou latência no GT3.
- O fim de todo o Termux pelo Android não é recuperável por um supervisor dentro do próprio Termux. Fazer teste prolongado físico com tela desbloqueada, áudio, Bluetooth, rede e transmissão.
- Perfis gráficos são limites de renderização, sem garantia de FPS. Verificar temperatura, consumo de bateria e memória com os modelos locais ativos no GT3.
- O atlas é escolhido ao abrir a página; depois de mudar para Detalhado, recarregar também aumenta a resolução dos retratos.
- Comidas comuns e filas têm limites; grandes picos podem atingir esses limites. O jogo não promete resultados de monetização ou alcance da LIVE.

## Instalação e reversão

Siga o README. Atualize a pasta onde já joga para conservar seus dados. Não extraia por cima manualmente. O atualizador mostra `data/update-backups/v0.4.0-*`. Para voltar, encerre transmissão e execute o `REVERTER.sh` do backup indicado. Ele restaura o estado do instante anterior; as regras e as coordenadas antigas também voltam com aquele estado.
