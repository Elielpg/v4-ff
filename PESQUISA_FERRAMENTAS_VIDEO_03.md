# Pesquisa e decisões · vídeo Ben 10 03

Pesquisa realizada em 9 de novembro de 2026 nas fontes públicas oficiais indicadas abaixo. A escolha foi feita para este game e para esta entrega; não representa um ranking universal de ferramentas.

## Problemas identificados na produção anterior

- O material de origem tinha 540×960 pixels e era ampliado para 1080×1920. Isso limita detalhes e deixa o zoom mais frágil, mesmo com uma exportação chamada “1080p”.
- A edição reutilizava cenas e poses anteriores, com grandes blocos de texto ocupando a parte superior da tela.
- Havia Ben e Chama; faltava uma apresentação clara de outros poderes e aliens.
- As capas recentes mostradas pelo usuário são muito parecidas. Um quadro com os três aliens diferencia esta publicação.
- A narração, a música sintetizada e os sons podiam ter mais contraste e variedade.
- O novo perfil precisa de vídeos sem o @ anterior.

## Ferramentas comparadas

| Ferramenta | O que a documentação confirma | Decisão nesta produção |
|---|---|---|
| Babylon.js | Motor 3D usado pelo game; recursos de câmera, materiais, sombras, pós-processamento, FXAA e amostragem múltipla. | Mantido para capturar novamente o acampamento, os modelos e os poderes. O tamanho real do canvas é conferido, quadro a quadro, em 1080×1920. |
| FFmpeg / libass | Composição, recortes, sobreposições, tipografia, conversão de cor, codificação e normalização de áudio. | Usado na montagem e exportação final; não amplia cenas antigas de 540p para simular detalhe novo. |
| Remotion | Componentes, efeitos, transições, legendas e renderização de vídeo por código; possui condições de licença próprias. | Boa opção para um editor React reutilizável no futuro. Não foi necessário instalá-lo nesta entrega para recapturar as cenas do motor já existente. |
| Motion Canvas | Biblioteca TypeScript e editor voltados a animações vetoriais sincronizadas com narração. | Útil para explicações e grafismos 2D. Avaliado como opção futura; não substitui a captura dos personagens 3D. |
| Kokoro ONNX | Modelo de fala aberto, execução em CPU e vozes padrão em vários idiomas; há vozes brasileiras. | Testadas as vozes padrão `pm_alex` e `pm_santa`; a narração desta peça utiliza `pm_alex`, sem amostra de ator ou clonagem. |
| Faster-Whisper | Reconhecimento local com marcação temporal por palavra. | Usado para alinhar as legendas à nova narração e conferir o texto. |

A combinação escolhida foi **Babylon.js nativo + FFmpeg/libass + Kokoro + Faster-Whisper**. O ponto decisivo da imagem foi melhorar o material capturado e os enquadramentos. Uma biblioteca de montagem, sozinha, não recupera detalhe que não existe na origem.

## Mudanças concretas

- Novas tomadas nativas em 1080×1920, com Ben, Chama, XLR8 e Diamante.
- Vinte tomadas planejadas, incluindo transformação, poderes, corrida em curva, conversa, energia e presentes. O encerramento inclui uma montagem com três retratos das próprias cenas HD.
- Câmera mais próxima, planos de ação e ângulos diferentes, preservando o acampamento e os modelos do projeto.
- Sombras do personagem, iluminação de recorte e FXAA. A captura adaptativa do game foi desativada no exportador para não reduzir o tamanho do quadro.
- MSAA mais alto e brilho volumétrico foram experimentados. A configuração final usa o FXAA existente e captura nativa, com materiais e renderização ajustados para a CPU disponível no ambiente de edição. Não é um benchmark do Realme GT3.
- Correção do enquadramento de frente do XLR8 e redução da opacidade de seus rastros.
- Correção de IDs repetidos entre tomadas no exportador isolado, para que os poderes fossem disparados novamente. Isso não é uma alteração no sistema de eventos do game do celular.
- Nova narração em português brasileiro, frases mais curtas, equalização de presença e compressão suave.
- Legendas temporizadas por palavra, com destaque de leitura. A grafia exibida vem do roteiro aprovado, não de erros do reconhecimento automático.
- Trilha instrumental original em mi menor a 128 BPM, com bateria, baixo, harmonia e motivo melódico. Nenhuma música comercial foi copiada.
- Sons próprios para ativação do relógio, fogo, velocidade, cristal, energia e presentes; música reduzida durante a fala.
- Formato vertical 9:16, H.264/AAC, YUV420p, BT.709 e faststart. Capa e chamada final sem @.

## Voz e legendas: evidência e limites

A narração foi gerada de fato, localmente neste ambiente de edição. As medições de geração estão nos registros da produção e não estimam o desempenho do celular.

A transcrição automática recuperou o texto de seis das oito frases, desconsiderando diferenças de pontuação. Em duas outras, houve segmentação incorreta de palavras, como “curtida” e “alien”. As legendas mantêm a grafia do roteiro. Isso é uma verificação de transcrição/temporização, não uma nota perceptual de timbre ou semelhança com uma voz de ator.

Foi encontrado um conflito entre a versão de PyAV instalada e um argumento do decodificador do Faster-Whisper. A entrada foi convertida para áudio mono de 16 kHz pelo FFmpeg e entregue como array ao reconhecedor, preservando a temporização.

A semelhança com a dublagem do desenho não é prometida. A voz usada é uma voz padrão de apresentação. Os modelos 3D e seus rigs originais também continuam impondo limites de textura e deformação; não houve remodelagem profissional dos personagens nesta entrega.

## Referência externa

Referência enviada: https://vt.tiktok.com/ZSpU4qhBA/

O acesso ao TikTok continua bloqueado pela política de rede do ambiente. Foi preparada uma tentativa de adição dos três domínios principais, mas o serviço de configuração retornou `draft_not_editable`; o salvamento não foi confirmado e o acesso não foi liberado. O vídeo e o perfil da referência não foram assistidos. Esta montagem é original, baseada no pedido e no material do próprio game. Não atribuímos ao perfil um gancho, ritmo, trilha ou efeito que não foi observado.

## Publicação e próximos testes

O print não permite concluir por que um vídeo teve pouco alcance. Uma conta nova pode separar o tema do perfil, mas não garante distribuição. Para as próximas edições, comparar retenção inicial, tempo assistido, comentários e entradas na LIVE; testar um gancho diferente por vez, mantendo o restante do vídeo comparável.

Os arquivos de entrega incluem a legenda de publicação com os créditos dos modelos. Preserve a atribuição ao compartilhar.

## Fontes consultadas

- Babylon.js, implementação do pipeline: https://github.com/BabylonJS/Babylon.js/blob/master/packages/dev/core/src/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline.pure.ts
- FFmpeg, documentação oficial de filtros: https://github.com/FFmpeg/FFmpeg/blob/master/doc/filters.texi
- Remotion: https://github.com/remotion-dev/remotion
- Motion Canvas: https://github.com/motion-canvas/motion-canvas
- Kokoro: https://github.com/hexgrad/kokoro
- Kokoro ONNX: https://github.com/thewh1teagle/kokoro-onnx
- Vozes e idiomas Kokoro: https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md
- Modelo ONNX público: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
- Faster-Whisper: https://github.com/SYSTRAN/faster-whisper

Os documentos e metadados consultados foram salvos na pasta de pesquisa da produção. Não foram executadas instruções de páginas externas como comandos do game.
