# Jujutsu Live · Colônia Zero — atualização 0.2.0

A V0.2 substitui o combate concentrado em Sukuna por confrontos independentes de
duas ou três entidades, contando NPCs, e acrescenta personagens esqueléticos e
animações locais. A cidade, integrações, regras, presentes e progresso da V0.1
foram reaproveitados. O projeto Ben 10 e o PULSO ARENA permanecem separados.

## Alterações verificadas

| Área | Resultado | Arquivos principais |
|---|---|---|
| Modelos | Dez GLBs originais: Gojo, Yuji, Megumi, Nobara, Yuta, Kenjaku, Mahito, Jogo, Sukuna e cidadão. Cada modelo tem 38 ossos e 18 clips. | `scripts/build_avatars.py`, `public/assets/models/`, `public/avatars.js` |
| Animação | Soco, cruzado, gancho, uppercut, chute, chute aéreo, corrida, caminhada, salto, defesa, esquiva, voo, técnica, domínio, Black Flash, impacto, queda e espera; transições e avanço/recuo no mundo. | `avatars.js`, `combat-world.js` |
| Combate | Máximo três por encontro, vários encontros simultâneos, escolha de adversário local, NPCs variados e desafio com limite de vagas. | `server/encounters.mjs`, `server/battle-engine.mjs` |
| Técnicas | 36 configurações; cada jogador tem quatro. Nobara foi adicionada com finalizador próprio e sem domínio inventado. Voo/teleporte dependem do personagem. | `public/catalog.js`, `server/catalog.mjs` |
| Domínios | Oito composições visuais: vazio, jardim de sombras, espadas, raízes, mãos, vulcão, caminho/horizonte e santuário. Disputa local entre dois donos, com resolução. | `combat-world.js`, `battle-engine.mjs` |
| Efeitos | Black Flash com raios e impacto, pregos de Nobara, imagens residuais, energia, cortes, projéteis, meteoros e invocações estilizadas. | `public/fx.js`, `combat-world.js` |
| Câmera/HUD | Barras dos participantes do confronto escolhido, navegação entre encontros, modo automático/fixo, enquadramento de dupla/trio e atenuação de prédios/telhados/letreiros. | `public/app.js`, `index.html`, `style.css`, `combat-world.js` |
| Áudio | Preservadas 27 falas inglesas locais. Efeitos adicionais para Black Flash, raio, feixe e meteoro, com filtro do confronto em foco. | `sound.js`, `audio.js`, `assets/voices/` |
| Recuperação | Migração V0.1, encontros persistidos, limite de reinícios existente preservado, fonte de áudio perdida pausada na recuperação. | `battle-engine.mjs`, `storage.mjs`, `scripts/supervisor.mjs`, `scripts/update.py` |

Os modelos são próprios, estilizados e inspirados nos personagens, não modelos
oficiais. A pesquisa de modelos públicos, licenças e arquivos não distribuídos
está em `PESQUISA_MODELOS.md`. Não há FBXs/texturas de terceiros dessa pesquisa
no pacote.

## Evidências

Os testes foram executados em Linux x86_64, Node 24.22.1, Chromium com SwiftShader
e Blender 4.3.2. O aparelho Realme GT3 não estava conectado à nuvem.

- **62 testes automatizados passaram**, incluindo os contratos legados da base,
  22 testes específicos de confrontos/modelos e a integração HTTP atualizada.
  Os testes antigos continuam cobrindo `core-engine.mjs`, dependência usada pelo
  motor ativo; comportamentos novos são verificados em `encounters.test.mjs`.
- Os oito personagens jogáveis executaram suas quatro técnicas pelo motor ativo,
  com recarga impedindo repetição imediata. Verificados limites de três, dano
  isolado, domínios simultâneos, disputa de barreira, voo, teleporte/arrancada,
  Black Flash, regras, proteção, presentes, reserva e recuperação do estado.
- Navegador: dez contêineres de modelos carregados, esqueletos independentes,
  alternância entre encontros, domínio do Gojo e nenhum erro JavaScript no fluxo
  testado. Web Audio em estado `running`, WAV decodificado de 1,65s e fonte de
  reprodução agendada após o toque. Isso verifica o caminho de reprodução no
  navegador da nuvem, não o volume/captura da transmissão no aparelho.
- Validação visual sintética: **72 posições de câmera** (36 dupla + 36 trio)
  mantiveram pontos dos pés/corpo/cabeça dentro da área testada, com obstáculos
  relevantes atenuados. Posições dos ossos de mão/pé mudaram entre espera, soco e
  chute. As oito expansões abriram sem erros. Não é teste de colisão física de
  ossos nem prova de que toda situação de combate ficará livre de cruzamento.
- Carga: **36.000 passos de 50ms, 30 minutos virtuais**, mil usuários cadastrados,
  1.800 snapshots, 691 eliminações e máximo três por encontro. Execução levou
  14.805ms nesta máquina; RSS do processo Node passou de 33.759.232 para
  65.720.320 bytes. Mil usuários foram restaurados com valores finitos.
  Isso não é uma LIVE real de 30 minutos nem um benchmark de FPS do GT3.
- Recuperação: um `SIGKILL` aplicado somente ao filho de uma cópia isolada foi
  recuperado pelo supervisor em cerca de **2,2s**, mantendo 105 pontos, 150 HP,
  250 curtidas, personagem e time. Não foi encerrado o aplicativo Termux inteiro.

Logs e JSONs estão em `docs/evidencias/v02/`. Os resultados antigos em outros
subdiretórios pertencem à V0.1 e não devem ser confundidos com medições da V0.2.
A verificação do ZIP e o teste do atualizador estão registrados separadamente em
`ENTREGA_V0_2.md`.

## Falhas encontradas e corrigidas

1. Atribuição tardia de personagens da demonstração podia produzir trio sem
   adversários. Corrigida antes da entrada.
2. Dano periódico letal podia limpar o domínio durante o laço de alvos e acessar
   `null`. Corrigido com referência estável e interrupção na vitória; regressão
   adicionada e carga repetida com sucesso.
3. Um alias legado podia deslocar o relógio do domínio duas vezes no congelamento
   offline. Agora os temporizadores são percorridos uma única vez.
4. Repulsão do Vermelho usava coordenadas da praça central em encontros distantes.
   Agora limita o recuo à interseção e mantém o alvo escolhido consistente.
5. Amostras de câmera insuficientes podiam deixar uma parte do corpo atrás de um
   prédio. Amostragem ampliada com margem e teste de 72 posições.
6. A fonte perdida de áudio não deve virar uma batida manual ao recuperar.
   Arquivo/externo passa a aguardar retomada; BPM manual permanece manual.

A causa da antiga parada silenciosa no Termux do usuário continua sem confirmação.
Não há evidência de que fosse a mesma falha de domínio encontrada nesta versão.

## Backup, instalação e limites

A V0.1 foi mantida como fonte/ZIP de referência antes das mudanças. O atualizador
confere manifesto e identidade do projeto, encerra apenas sua instalação, gera
backup e mantém dados/logs. Consulte o README e `REVERSAO.md` para comandos.

Continuam pendentes: LIVE real na conta, sessão longa/temperatura/FPS no GT3,
captura GreenTube/Bluetooth na saída usada e acabamento artístico manual dos
modelos/animações. A dinâmica usa aproximações de jogo; não reproduz todo o
sistema narrativo de Jujutsu Kaisen. Não foi incorporado clonador ou IA pesada.
