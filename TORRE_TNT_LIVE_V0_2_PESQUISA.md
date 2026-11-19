# Pesquisa no GitHub — 19/11/2026

Foram pesquisados jogos de TNT, construção e TikTok LIVE, com leitura dos repositórios e arquivos abaixo. Nenhum instalador externo foi executado e nenhum modelo, textura ou música desses projetos foi incluído no pacote. O código novo foi implementado sobre a Torre TNT 0.1.

| Projeto consultado | O que foi conferido | Decisão para este jogo |
|---|---|---|
| [BedrockLive/TNTCoin](https://github.com/BedrockLive/TNTCoin) | README, licença MIT, `BlockFill.ts` e `TntCoinBuilder.ts`; commit `09011b87c5d07dffc75fe3c64d0fe324bb15564e` | É o exemplo mais próximo: preencher uma estrutura enquanto presentes provocam TNT. O preenchimento é dividido em passos. Depende de `@minecraft/server`; não é um jogo independente para Termux. Aqui a fila, a grade e a colocação gradual são nativas do servidor existente. |
| [landsbetween/tiktok-tower-stack](https://github.com/landsbetween/tiktok-tower-stack) | README, ponte de eventos e configuração de fila; commit `ae9d6b5ecab28cc71140e6e65d4a9da0275c8b62` | Demonstra separação entre eventos LIVE e colocação dos blocos. É um jogo Godot com física e inicialização de desktop; a Torre TNT mantém sua integração e o navegador no Android. |
| [ikx337/kubo-sandbox](https://github.com/ikx337/kubo-sandbox) | README e rotinas `updateCamera`/`drawWorld` do Canvas; commit `6f7e3c34c2a4f437028d4a456d26e78db57bca42` | Referência de câmera acompanhando o jogador e desenho apenas dos tiles visíveis. Não foi identificada licença explícita nessa cópia; nenhum trecho ou recurso foi incorporado. |
| [devzex/minecraft-mobile-tiktok-live-tnt-game](https://github.com/devzex/minecraft-mobile-tiktok-live-tnt-game) | Árvore do commit `8fb83a2410a047c6df938265a6332e63da0571f9` e README | O README menciona Termux, mas a revisão consultada não contém o motor completo nem o instalador apontado. Não foi adotado como base de execução. |

Também foi consultado `yungrezac/efir-block-pulse`, cuja revisão disponível continha apenas uma descrição curta. Isso não fornece um motor para adaptar.

Os resultados fundamentaram a escolha de manter o projeto atual: grade explícita de 1.800 células, construção por passos, fila persistente e câmera com recorte dos andares visíveis. As referências não comprovam funcionamento no Realme GT3; os testes desta versão estão registrados separadamente.
