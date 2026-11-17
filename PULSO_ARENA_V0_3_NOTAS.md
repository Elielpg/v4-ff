# Pulso Arena 0.3.0 — câmera, combate e comemoração

Entrega de 17/11/2026. Evolução do projeto existente, preservando mascotes, progresso, integração, música e regras de participação.

## Câmera e iluminação

O defeito foi reproduzido: o painel em z=-8,5 cruzava a linha entre a câmera e o centro do ringue. Foi reposicionado para z=-15,5, fora da órbita normal. Uma proteção adicional verifica se postes, cordas, arquibancada ou placar cruzam as linhas de visão dos lutadores. Essas estruturas ficam translúcidas e recuperam a opacidade quando saem da frente.

O placar também obedece à proteção. A correção não altera a opacidade dos lutadores: eles podem se sobrepor entre si em enquadramentos naturais do combate. A luz próxima à câmera ajuda a leitura dos rostos e do corpo durante a volta; os feixes foram suavizados para não formar uma cortina sobre o ringue.

## Golpes, movimentos e efeitos

O conjunto normal possui jab, cruzado, gancho lateral, uppercut, chute, chute saltando e giro. O chute de entrada e o especial continuam existentes. Há preparação/recuperação de articulações, inclinação do corpo, equilíbrio dos braços nos chutes e movimento de salto. Dano e cura mantêm a economia anterior.

Efeitos: linhas de velocidade, arcos de movimento, estrela de impacto, escudo de bloqueio, rastros de esquiva e anéis de salto/aterrissagem. Os efeitos usam um conjunto fixo de 32 objetos, com orçamento menor no perfil Leve; partículas têm teto de 28 no Leve, 80 nos demais e 16 com movimentos reduzidos. Sons de chute e gancho têm variações próprias, e os nós de áudio são desconectados ao terminar.

**PULAR / PULO / SALTAR** usa o intervalo de comandos de pose de 2,5 s e executa um salto visual de aproximadamente um segundo. Não evita dano automaticamente. DEFESA, ESQUIVA, DANÇAR e LUTAR permanecem disponíveis.

As animações continuam procedurais sobre os modelos originais; não são captura de movimentos nem um novo pacote de personagens.

## Identidade e vitória

Cada uma das quatro bases tem quatro farpas curtas próprias, totalizando 16 frases. O sorteio evita repetir imediatamente a última. Há estilos shuffle, bounce, spin e robot, com escolha ligada ao repertório de cada mascote.

A vitória produz frase/emoji no balão e dança. A janela dura 6,5 s; não remove ninguém da fila. Ao final, a câmera pode enquadrar o ranking antes de retomar o combate. Durante esse enquadramento o balão automático cede espaço ao placar. Comentários escritos depois da vitória têm prioridade sobre a farpa automática.

O nome/HP em 3D cede lugar ao balão quando necessário. O derrotado aparece com HP zero e indicação DERROTADO. As farpas são texto; não foi adicionado motor de voz.

## Ranking dentro do cenário

Painel flutuante acima da plateia, com Top 3, vitórias, pontos e ocupante da coroa. O ranking já existente no menu foi preservado. O painel só redesenha a textura quando os dados mudam. Há opção de ocultar e botão para mostrar na câmera; o movimento reduzido mantém o enquadramento estável.

## Arquivos principais

| Arquivo | Responsabilidade |
|---|---|
| public/world.js | Cena, luz, câmera, visibilidade, balões e painel |
| public/visibility.js | Interseção de segmento com caixa de volume |
| public/combat-poses.js | Poses de golpe e estilos de dança |
| public/combat-fx.js | Conjunto limitado de efeitos reutilizáveis |
| server/celebrations.mjs | Repertório de frase, emoji e dança por mascote |
| server/engine.mjs | Novos golpes, comando de salto e janela de vitória |
| public/audio.js | Variação de sons e liberação dos nós de áudio |
| public/onset.js | Proteção extra contra dobrar o andamento após poucas subdivisões perdidas |

## Evidências

- **50 testes Node passaram**, incluindo os anteriores de regras, áudio, ponte, armazenamento e HTTP.
- Bug do painel reproduzido antes da alteração e registrado em BUG_REPRODUZIDO.json.
- **36 ângulos / 216 linhas de visão** no renderer, sem bloqueio pelos elementos estruturais considerados. Teste controlado com dois lutadores e plateia.
- Renderização de sete golpes, incluindo bloqueio e esquiva, com efeitos ativos; chute saltando elevou o corpo. Comemoração exibiu frase e emoji do vencedor; estado reconstruído manteve vencedor e derrotado no ringue.
- Painel 3D visível e com dados atualizados; layout sem overflow na viewport móvel testada.
- Música no jogo: 51 ataques detectados e 51 entregues no instante da leitura, 120 BPM, dança contínua e controle de sensibilidade funcionando. Isso é teste com arquivo sintético no computador.

Atualização de uma cópia 0.2.1 para 0.3 testada com backup: 250 curtidas, HP 150 e fila preservados. Após SIGKILL somente no servidor filho dessa cópia, retomou em 2.107 ms com os dados observados. Não simula o Android encerrando todo o Termux.

Registros: `docs/evidencias/v0_3/`. Prévias em `docs/previas/` são capturas reais do renderer em qualidade Detalhado, com participantes fictícios e quadros pausados para revisão. Não são resultados de FPS nem uma LIVE real.

## Instalação, atualização e limites

O ZIP contém o projeto completo e o captador 0.2.1 compatível. Quem já instalou esse captador não precisa trocar o APK.

Use ATUALIZAR.sh da pasta nova apontando para a pasta da arena instalada. O script valida o manifesto, para somente essa instância, cria backup ZIP e preserva data/logs. O formato do progresso segue schema 1. Para reverter, pare o jogo e restaure o backup de código/dados antes de executar install.sh/start.sh. Comandos completos no README.

Ainda pendem teste de LIVE real, medições de FPS/temperatura/duração no Realme GT3 e confirmação do sinal de cada saída Bluetooth/GreenTube. O supervisor cobre o servidor filho; não impede o Android de encerrar todo o Termux.
