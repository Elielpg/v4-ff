# Pulso Arena 0.4.0 — Anime / Phonk

Data: 17/11/2026. Base: 0.3.0, commit
`6b7fc56e1d7ab6588aad9a202b3fd2edd9c6c05c`. O ZIP anterior foi preservado
antes das alterações. O pacote foi validado localmente e agora está publicado para download por
solicitação do usuário. O conteúdo do ZIP validado foi mantido. A configuração
publicada do ambiente não foi alterada; a referência à entrega local dentro
do ZIP registra a preparação anterior à publicação.

## Combate

O detector já aceitava acentos rápidos, mas o motor filtrava a maioria dos
golpes em `max(180ms, 0,82 × período principal)`. O novo estilo **Anime** usa a
cadência dos acentos aceitos, limitada a um contato a cada 80 ms. No ensaio
controlado de dois segundos com acentos a cada 125 ms, foram 16 ataques no
Anime e quatro no Clássico. Isso é cadência de combate, não benchmark de FPS.

O dano e a energia dos golpes comuns são proporcionais à razão entre o
intervalo dos acentos e o período principal. Há arredondamento de dano e
defesas; não se promete dano idêntico em músicas diferentes. Likes, HP,
compartilhamento, torcida, energia e defesas continuam influenciando a luta.

Cada mascote mantém a iniciativa por até quatro etapas. Defesa ou esquiva
interrompem a sequência e passam a iniciativa. O especial mantém seu impacto,
com pausa de 360 ms no Anime; o Clássico preserva a pausa anterior.

| Mascote | Sequência base |
|---|---|
| Raposa | arrancada com soco → rajada alternada → cruzado com teleporte → chute giratório |
| Hipopótamo | gancho → rajada → uppercut → chute de impacto |
| Guaxinim | rajada → cruzado com teleporte → sequência aérea → chute com teleporte |
| Carneiro | arrancada → uppercut → sequência aérea → chute saltando |

Rajadas contêm movimentos alternados de mãos dentro de um ataque. O dano é
contabilizado uma vez por contato do motor, sem multiplicar HP perdido por cada
rastro ou estrela decorativa. Os acentos principais mantêm o passo da dança;
as subdivisões aceleram detalhes, golpes e luzes.

## Visual e câmera

- Quatro mascotes originais preservados: espécies, cores por semente e progresso.
- Shader local de três faixas, contornos selecionados, olhos e sorriso,
  bandanas, faixa, emblema, ombreiras e botas. O cenário Babylon foi mantido.
- Teleporte atrás do rival, ecos de silhueta, anéis de chegada e recuperação
  curva para a posição de base. Posições limitadas ao ringue.
- Ganchos, rajadas, giros, chutes aéreos e reação de elevação ao uppercut.
- Câmera acompanha a dupla, usa pequenos acentos de zoom/inclinação e baixa o
  enquadramento nos finalizadores. A distância considera a largura da tela e
  a posição dos lutadores. A proteção contra estruturas da 0.3 foi mantida.
- Efeitos limitados a 32 elementos mais oito ecos; no perfil Leve, 16 e dois.
  Reduzir movimentos desativa os ecos e suaviza luzes/câmera.
- Som original curto de teleporte; efeitos de chute, gancho e defesa preservados.

São animações procedurais, não mocap ou desenhos de cada quadro. As capturas
em `previas/ANIME_ARENA.png` e `previas/ANIME_TELEPORTE.png` vêm do renderer
real, com participantes fictícios e quadros preparados para inspeção.

## Arquivos principais

| Arquivo | Responsabilidade |
|---|---|
| server/combat.mjs | configuração dos combos e escala de cadência |
| server/engine.mjs | iniciativa, defesa, dano, energia, estilo salvo |
| public/anime-motion.js | teleporte, limites e enquadramento retrato |
| public/combat-poses.js | poses e rajadas alternadas |
| public/toon.js | shader em faixas e material de compatibilidade |
| public/combat-fx.js | pool de rastros, anéis, estrelas e ecos |
| public/world.js | mascotes, animação, câmera e iluminação |
| public/app.js / index.html | controle Anime/Clássico e indicação de combo |
| public/audio.js | efeito sonoro de teleporte |

Schema de dados permanece **1**. TikTok, fila por rosa, plateia, ranking,
comemorações, balões, comandos, detector multifaixa, pareamento Android e
supervisor foram mantidos. O APK **Pulso Batida 0.2.1** incluído não foi
recompilado nem substituído: o protocolo não mudou.

## Evidências desta versão

- Baseline: 50 testes existentes passaram antes das alterações.
- Suíte final: **58 testes passaram**, incluindo oito regressões novas de
  cadência, iniciativa, dano, energia, persistência, poses, teleporte e retrato.
  A integração HTTP também confere o estilo salvo em disco.
- Chromium/SwiftShader: dez materiais novos prontos, sem fallback ou erro de
  shader/JavaScript. Nove movimentos com coordenadas finitas. 36 ângulos de
  câmera, 72 linhas de visão, sem estrutura opaca bloqueando os alvos testados.
- Tela 360 × 800 sem overflow horizontal. Controle Anime/Clássico funcionou
  pela interface e pela API.
- Arquivo sintético de oito segundos/120 BPM: AudioWorklet ativo, **64 acentos
  detectados e entregues**, 58 ataques, sendo 54 com duração inferior a 250 ms.
  As pausas dos especiais podem agrupar/suprimir contatos visuais; não são
  perda de acentos no transporte.
- Rajada artificial de 120 eventos no perfil Leve: 280 meshes antes/depois,
  12 efeitos e um eco ativos no instante registrado; zero ecos com redução de
  movimento. É um teste de limites, não uma LIVE prolongada.
- Atualização real de uma cópia 0.3 para 0.4: backup ZIP conferido e HP 150,
  250 curtidas e fila preservados. Após SIGKILL apenas no servidor filho de
  teste, o supervisor retomou em 2.136 ms, com o mesmo progresso. Isso não
  simula o Android encerrando todo o Termux. Registro:
  `evidencias/v0_4/ATUALIZACAO_RECUPERACAO.json`.

Os registros estão em `evidencias/v0_4/`. Dados históricos foram mantidos nas
pastas das respectivas versões. FPS do renderizador de software da nuvem não
é uma medida do Realme GT3.

## Atualizar preservando os dados

Com o ZIP em Downloads, para a instalação habitual em `~/PULSO_ARENA_V0_1`:

```bash
cd ~ &&
python3 -m zipfile -e ~/storage/downloads/PULSO_ARENA_V0_4.zip . &&
bash ~/PULSO_ARENA_V0_4/ATUALIZAR.sh ~/PULSO_ARENA_V0_1 &&
cd ~/PULSO_ARENA_V0_1 &&
bash start.sh
```

Se a instalação estiver em outra pasta, substitua `~/PULSO_ARENA_V0_1` pela
pasta onde estão `start.sh` e `data/`. Abra
`http://127.0.0.1:3100/?v=0.4.0`. Em Música e batida, selecione **Anime** se o
Clássico tiver sido salvo. O modo é independente para demo e LIVE.

Uma instalação nova usa `bash install.sh` e depois `bash start.sh` dentro da
pasta extraída. Nos próximos usos da instalação atualizada:

```bash
cd ~/PULSO_ARENA_V0_1 && bash start.sh
```

O atualizador confere o manifesto, encerra somente a instalação indicada e
cria `backups/antes-0.4.0-DATA-HORA.zip`, incluindo os dados anteriores. Para
reverter: pare a arena, extraia esse backup na mesma instalação, execute
`bash install.sh` e `bash start.sh`. Guarde o backup em outro local também.

## Pendências reais

Ainda precisam de teste físico: FPS, temperatura, consumo e LIVE de 30/60 min
no GT3; áudio do GreenTube/Bluetooth nas saídas usadas; compatibilidade do novo
shader na GPU do telefone; eventos de uma LIVE real. APK e protocolo local
não garantem que todo aplicativo Android disponibilize áudio para captura.

O Android ainda pode encerrar todo o Termux. O supervisor recupera somente o
servidor filho e tem limite de tentativas; não há promessa de execução
ilimitada. Consulte `PROBLEMAS_PENDENTES.md` para os limites preservados.
