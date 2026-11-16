# Correção de batidas rápidas e fracas — 0.2.1

## Causas identificadas na 0.2

- O detector tinha intervalo mínimo de 270 ms; o player repetia esse limite e o servidor descartava pulsos abaixo de 250 ms. Subdivisões de 125 ou 167 ms não podiam atravessar a cadeia inteira.
- O limiar era 1,6 vez a média anterior do grave. Um bumbo forte podia esconder a batida fraca seguinte.
- O player analisava principalmente a faixa grave. Cowbells, caixas e outros ataques médios/agudos ficavam sub-representados.
- Cada acento reiniciava a fase da dança. Com subdivisões rápidas, braços e pés não completavam o movimento.
- O captador guardava somente o maior pico pendente, descartando amostras menores entre envios.

## Alterações

Detecção por variação positiva de energia, piso de ruído e análise separada de graves/percussão. O modo Phonk admite ataques separados por aproximadamente 95 ms, o Sensível por 85 ms e o Suave por 150 ms. Esses limites são de detecção, não uma promessa de capturar qualquer instrumento em qualquer mixagem.

O andamento principal é estimado separadamente das subdivisões. Acentos fortes consistentes orientam o tempo; intervalos rápidos são agrupados com estabilidade de oitava. Música ambígua pode exigir BPM/TAP manual. O controle manual agora vai de 50 a 240 BPM.

A dança avança continuamente e corrige a fase de forma gradual nos acentos fortes. Luzes têm uma resposta mais curta para distinguir ataques próximos. A luta continua com limite de golpes no andamento principal; subdivisões não multiplicam o dano nem interrompem todos os golpes em andamento.

O captador acrescenta a energia de percussão, usa suavização de janela para não confundir a oscilação de um grave contínuo com bateria e envia lotes de até 12 quadros com tempos individuais. A fila tem limite de 64 quadros; dados atrasados não provocam uma longa sequência de efeitos acumulados. O Visualizer pede até 60 Hz, respeitando o máximo do aparelho.

## Testes executados

- **41 testes Node aprovados**: inclui os 33 anteriores e oito novos de subdivisões, batidas fracas, ruído, andamento, limite de dano, transporte, sensibilidade e continuidade de fase.
- **Comparação com a 0.2 no Chrome**: fixture PCM de oito segundos, grave contínuo e 64 ataques a cada 125 ms. Após a janela inicial, o detector anterior reconheceu 15 ataques; o novo reconheceu **63 de 63 referências**, com tolerância de alinhamento de 45 ms. Andamento final aproximado: **120,19 BPM**, nominal 120. Isso é resultado controlado, não uma taxa de acerto em músicas comerciais.
- **Jogo completo no Chrome/SwiftShader**: 51 ataques detectados, 50 já entregues no instante da leitura, andamento 120 BPM, dança com fase contínua e controle Sensível funcionando. Nenhum erro JavaScript. Uma amostra ainda podia estar em trânsito no momento da leitura.
- **Filtros Java + ponte Node**: mesmo PCM com 63 ataques reconhecidos e alinhados às referências. Grave sustentado de 60 Hz por três segundos: **zero ataques falsos**. Não é teste de captura do Android real.
- APK 0.2.1 compilado e assinado. Certificado mantido para instalar sobre a versão anterior.

Evidências em `docs/evidencias/v0_2_1/`. Fixtures e referência temporal acompanham `tests/fixtures/`. O teste Java `PhonkPcmProbe` aceita as fixtures mono PCM16/48 kHz; não pretende ser um leitor WAV genérico.

## Uso

Atualize o ZIP e, se usar música de outro aplicativo, instale também **Pulso Batida 0.2.1** sobre o APK anterior. Pare a captura anterior e gere outro código no jogo.

No menu **Música e batida → Detecção de batidas**:

- **Phonk:** ponto de partida para graves e subdivisões.
- **Sensível:** ataques fracos; se reagir a detalhes demais, volte a Phonk.
- **Suave:** reduz a quantidade de reações.

A compensação Bluetooth ajusta atraso da saída. Ela não equivale à sensibilidade. A compatibilidade com o sinal do GreenTube/Visualizer, o comportamento térmico e a precisão em cada música no Realme GT3 ainda dependem de teste no aparelho. As restrições de captura compartilhada da 0.2 continuam valendo.

## Instalar ou atualizar

O ZIP é completo. A instalação nova usa install.sh e start.sh. Para manter o progresso de uma instalação existente, use o ATUALIZAR.sh da pasta nova apontando para a pasta onde a arena já está instalada. Ele cria backup antes de copiar o código e preserva data/ e logs/. O formato de progresso permanece schema 1.
