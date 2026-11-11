# Relatório — Clareira LIVE V45.0.0

## Alteração entregue

A camada visual 2D funciona sobre o Babylon.js existente. ArenaSession continua responsável por posições, energia, recargas, transformações e eventos. O cenário do acampamento, o Omnitrix do painel, o ranking, as missões de engajamento, os presentes e os comandos permanecem na aplicação.

Quatro personagens recebem arte nova: Ben, Chama, XLR8 e Diamante. Cada atlas transparente tem oito poses: repouso, fala, cumprimento, preparação, dois passos de corrida, salto e ataque. As imagens têm 1774 × 887 pixels; cada célula tem aproximadamente 444 pixels por lado. A composição do vídeo é 1080 × 1920, mas isso não aumenta a resolução original dos desenhos.

## Estrutura do código

| Arquivo | Responsabilidade |
|---|---|
| `public/character-2d.js` | Carregamento limitado a quatro artes, textura dinâmica única, plano voltado para a câmera, sombra de contato, seletor e restauração dos modelos |
| `public/character-2d-plan.js` | Prioridade de poses, normalização de escala, apoio dos pés e posição de mão/boca/relógio |
| `public/character-2d-catalog.js` | Configuração das quatro formas e retângulos das poses |
| `public/characters-2d/` | Artes PNG originais e manifesto com hashes |
| `public/world.js` | Pontos de integração no ciclo de renderização, transformação, enquadramento e origem dos poderes |
| `public/omni-absorption.js` | Destino das bolinhas de energia no pulso desenhado |
| `scripts/visual2d-update.js` | Atualização restrita a arquivos visuais, validação de hash, backup e reversão |
| `scripts/evolution-update.js` | Contrato histórico V44.2 fixado em 44.2, para preservar o instalador e seus testes após a mudança de versão |
| `public/release.js`, `public/index.html`, `package*.json` | Identificação consistente da V45.0.0 |

O renderer oculta somente as malhas do personagem atual; não desativa o controlador de movimento. A seleção de 3D, uma forma sem desenho ou uma falha ao carregar a arte restaura os modelos. Uma troca rápida de personagem usa um identificador de solicitação para ignorar carregamentos antigos. O cache é limitado às quatro imagens e não cresce por interação.

Sentar mantém o ciclo 3D original. A fala 2D alterna boca aberta/fechada usando o nível de boca já fornecido pelo áudio; não é sincronização fonética por visema. Partículas e poderes continuam tridimensionais. As origens de energia e poder acompanham os pontos do desenho e o espelhamento.

## IA, voz e estabilidade

Esta entrega é visual. Os arquivos dos serviços de IA, voz, supervisão e integração TikTok não foram alterados. O pacote distribuído não contém modelos neurais, amostras de voz, chaves ou dados de espectadores. Os arquivos privados da instalação são mantidos.

O relato LOCAL-010 continua exigindo diagnóstico no aparelho: o Termux volta ao prompt e a página trava. Sem um log do encerramento e uma reprodução no Android, não há evidência suficiente para atribuir a causa a memória, bateria, sinal do sistema ou falha de processo. A V45 não deve ser anunciada como correção confirmada desse problema.

## Desempenho e pendências

O renderizador reutiliza uma textura GPU de 1024 × 1024, repintada somente quando mudam pose, forma, direção ou estado do relógio. Quatro atlas decodificados representam aproximadamente 24 MiB de pixels, além da textura e dos modelos 3D já carregados para retorno imediato. Não se promete redução geral de RAM ou FPS superior sem medição no celular.

Próximas melhorias: poses sentadas próprias, vistas laterais/costas, mais quadros intermediários de caminhada, expressões faciais independentes e artes maiores para closes. As outras sete formas ainda precisam de artes 2D. Validar orientação dos projéteis em câmera social e sessões longas no aparelho. O salto e o giro utilizam poses e transformações do plano, não ciclos completos desenhados.

## Validação

A base V44.2 passou nos 277 testes antes das alterações. O registro desta entrega documenta os testes adicionais e os testes de navegador; não é um benchmark do Realme GT3. A primeira tentativa dentro do sandbox falhou por restrições de execução/portas e foi interrompida. A rodada com portas locais autorizadas passou. Veja `REGISTRO_TESTES_V45.json` para os números finais e limitações.
