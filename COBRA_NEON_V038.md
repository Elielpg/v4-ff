# Cobra do PHONK 0.3.8 — raios, aura e piso reativo

Data: 27/11/2026. Complemento próprio para Snake Reyers 0.1.9, de Thiago Reyes.

## Problema relatado

Depois de algum tempo, a imagem congela enquanto o som continua. O relato indica um problema no caminho de atualização/apresentação da imagem, mas não identifica sozinho o ponto exato. Não foi reproduzido fisicamente no GT3 nem confirmado um erro do driver.

A versão anterior também não entregava o efeito visual esperado: o chão recebia apenas uma tonalidade escura e a cobra tinha contorno luminoso, sem raios percorrendo o corpo ou aura externa.

## Mudanças

- Raios com linhas ramificadas que percorrem a superfície do corpo. Ficam mais fortes no quadro da batida e decaem depois dela, evitando que um FPS baixo apague o pico antes de desenhá-lo.
- Aura externa suave, com a mesma cor, que se expande na batida. Usa uma passagem adicional nos dois modelos existentes do corpo e da cabeça, sem duplicar malhas, gerar partículas ou criar luzes com sombras.
- Piso com grade neon e ondas luminosas que acompanham a cor e os pulsos. Mantém a malha, colisão e textura do chão original.
- Modo de cores neon aleatórias, com transição suave e intervalo mínimo de meio segundo entre novos alvos. Os modos de paleta por batida/faixa e cor fixa continuam disponíveis.
- Limpeza periódica de referências de objetos/câmeras removidos, limites para a fila visual e os caches, e varredura dividida entre os quadros.
- Material único para a sinalização neon, em vez de atualizar um material de cada objeto a cada quadro.
- Diagnóstico privado que registra a idade da atualização da cena, processo, memória do motor, limites dos caches e sinais conhecidos de erro gráfico. Não executa reinicialização automática nem exporta o conteúdo dos comentários/vozes/chaves.

O efeito continua analisando apenas a música no canal Music do jogo. A fala não dispara as batidas. GreenTube e outros aplicativos continuam exigindo BPM manual; não foi acrescentada captura externa do Android.

## Auditoria do acúmulo

Foi reproduzido um problema concreto na extensão própria 0.3.7: em um ensaio sintético de dez segundos, 1.600 modelos removidos continuavam registrados e a lista de câmeras tinha 201 entradas. A memória estática medida pelo Godot passou de aproximadamente 24,53 para 30,09 MB. Isso demonstra retenção nessa extensão; não comprova que foi a causa única do congelamento do telefone.

A atualização usa referências fracas, limpa registros removidos a cada dois segundos e aplica estes limites:

| Recurso próprio | Limite |
| --- | --- |
| Fila de objetos aguardando inspeção | 2.048 |
| Objetos com material temporário rastreado | 2.048 |
| Câmeras rastreadas | 16 |
| Materiais do terreno em cache | 128, com reserva para o piso |
| Materiais reativos do piso | 16 |
| Trabalho de varredura | até 64 objetos, verificando o orçamento de 2 ms entre objetos |

Uma operação individual pode ultrapassar 2 ms; o valor é um orçamento de divisão do trabalho, não um limite absoluto do driver. Ao atingir os limites, novos efeitos podem deixar de ser aplicados a alguns objetos, sem apagar personagens ou modificar a lógica do jogo.

O teste prolongado da limpeza durou 180 segundos, criou 31.816 modelos e terminou sem falhas. O pico foi de 330 registros; após a remoção, ficaram os dois registros de objetos ativos. A lista de câmeras ficou limitada a 16. A memória estática nas últimas 30 amostras variou entre 28,06 e 28,70 MB. São medidas de uma cena sintética no Godot/Linux, não RSS total do programa nem teste de LIVE no GT3.

## Instalação e reversão

Pare a sessão com Ctrl+C e aguarde o prompt:

```sh
cd ~/SNAKE_REYERS_TERMUX_0_2 &&
curl -fL 'https://raw.githubusercontent.com/Elielpg/v4-ff/main/SNAKE_REYERS_NEON_FLUIDEZ_V038.sh' -o "$HOME/snake-neon-v038.sh" &&
bash "$HOME/snake-neon-v038.sh" "$PWD" &&
bash start.sh
```

Mantenha seu motor gráfico já usado; quem utiliza `SNAKE_RENDERER=mobile bash start.sh` pode continuar com esse comando. O atualizador não muda drivers, motor, resolução, perfil gráfico, modelos de IA, vozes, chaves, músicas ou progresso.

A primeira aplicação 0.3.8 ativa raios, aura leve, piso reativo e cores aleatórias. Preserva a paleta e a fonte/BPM da música. Reaplicações respeitam as escolhas posteriores. O script cria backup com `REVERTER.py` e informa o comando exato para voltar, com o jogo parado.

Abra http://127.0.0.1:9393, confira **Termux 0.3.8** e expanda **Cobra do PHONK · raios, chão e batidas**. Ajuste força/velocidade dos raios, intensidade da aura, brilho do piso e cores. Pode desligar aura, raios ou piso independentemente. A instalação inicial da camada é gradual; mudanças de intensidade/cor são lidas a cada meio segundo depois de carregada.

O ZIP é o adaptador completo atualizado, sem o executável/PCK original, recursos privados do criador ou pesos de IA. Sua instalação original continua necessária.

## Se a imagem congelar novamente

Antes de reiniciar, abra o painel e baixe **Baixar diagnóstico do efeito**. O arquivo `COBRA_PHONK_DIAGNOSTICO.json` permite comparar:

- Processo vivo com atualização da cena antiga: a atualização do jogo parou; ainda é necessário localizar o motivo.
- Atualização recente com imagem visualmente congelada: investigar apresentação X11/captura e renderização; não é prova isolada de causa.
- Sinais conhecidos de perda de dispositivo ou falta de memória nos últimos 32 KB do log gráfico.
- Quantidade de registros, fila visual, materiais, câmeras e quadros demorados.

Os intervalos são medidos por relógio monotônico: o diagnóstico não depende apenas do `delta` que o Godot pode limitar após uma pausa. Nenhum processo é reiniciado ou encerrado por esse diagnóstico. Não foram introduzidos ciclos de recuperação.

## Testes e pendências

Passaram 347 testes Python (67 originais), três Node, 24 verificações com áudio Godot real e sete verificações no navegador.

Registros de teste, comparação da versão anterior, ensaio de 180 s, áudio real e capturas do jogo original ficam em `docs/evidence/NEON_*` e `ALL_TESTS_V038.xml`. O ensaio prolongado cobre os caches; a adição posterior da aura é verificada separadamente por testes de áudio/alternância e pelo jogo original.

Permanece pendente validar no GT3 o congelamento específico, o tempo de LIVE, temperatura, uso de CPU/GPU, driver e captura simultânea. Não há promessa de ganho de FPS nem declaração de que o congelamento físico foi eliminado. Não foi feita transmissão pública neste trabalho.

## Arquivos principais

| Arquivo | Alteração |
| --- | --- |
| `phonk_runtime.gd` | Limites, limpeza, tempo real entre quadros, piso, aura e cores suaves. |
| `phonk_skin.gdshader` | Raios animados e brilho no pico da batida. |
| `phonk_floor.gdshader` | Grade e ondas no material do chão existente. |
| `phonk_aura.gdshader` | Camada externa suave em corpo/cabeça. |
| `scene_graphics.gd` | Preserva a categoria do terreno quando a textura filtrada perde o caminho do recurso. |
| `phonk.py` / `phonk_ui.js` | Controles validados e download do diagnóstico. |
| `tests/test_phonk.py` / `tests/godot/phonk_audio.gd.in` | Regressões, alternância, áudio e criação/remoção repetida de objetos. |
| `tools/build_repairs.py` | Atualizador próprio com configuração inicial única e reversão. |
