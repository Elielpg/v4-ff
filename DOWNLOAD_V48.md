# Ben 10 · PHONK LIVE 2D — V48

[Baixar atualização — ZIP, 41 MB](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_PHONK_V48.zip) · [Captador Android — APK](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BATIDA_OMNITRIX_V48.apk) · [Relatório](RELATORIO_V48.md) · [Testes](REGISTRO_TESTES_V48.json)

Atualização para o jogo V45/V46/V47 já instalado. Inclui o visual e os quadros da V47, preservando IA local, voz, progresso, ranking, times, presentes e configurações. Não é necessário reinstalar o Qwen nem baixar modelos de voz.

## Atualizar no Termux

Baixe `BEN10_PHONK_V48.zip` em Downloads e execute:

```bash
cd ~/ben10-v34/game &&
python3 -m zipfile -e ~/storage/downloads/BEN10_PHONK_V48.zip "$TMPDIR/ben10-v48" &&
bash "$TMPDIR/ben10-v48/BEN10_PHONK_V48/ATUALIZAR_V48.sh" "$PWD" &&
bash restart.sh
```

Abra **http://127.0.0.1:3000/?v=48.0.0**. Para iniciar nas próximas sessões: `cd ~/ben10-v34/game && bash restart.sh`.

O instalador confere os arquivos, faz backup e encerra apenas os processos confirmados desta instalação. Se o Android não permitir confirmar a parada, pressione Ctrl+C na aba original, espere o prompt e repita o comando. O caminho do backup é informado na instalação.

## O que muda na live

- As dez formas disponíveis no projeto ficam livres. As curtidas e o progresso anteriores continuam registrados. O Omnitrix mantém o tempo da forma e a recarga vermelha.
- Ben alterna aliens automaticamente durante a música. Perguntas, falas em andamento, seleção, poderes, recarga e comandos manuais têm prioridade. Sem música, existe uma alternância mais espaçada. Uma ação manual segura as trocas automáticas por 30 segundos.
- A câmera destaca quem entra e enquadra os dois personagens quando há uma dupla. No ritmo PHONK, adiciona aproximações, balanço lateral e leve inclinação, sem girar a cena 2D inteira.
- Luzes coloridas, fachos, aros e acentos acompanham a mesma marcação da dança. As opções de movimentos reduzidos continuam sendo respeitadas.
- **Rosa/Rose ou Rosa Branca/White Rose** coloca quem enviou para dançar junto com Ben por 16 segundos, com efeito rosa. Há uma fila limitada. Repetir a rosa pode estender a mesma dupla até 24 segundos, sem prender a câmera para sempre. As demais regras de presentes continuam disponíveis.
- Ben fala menos: perguntas, saudações digitadas e mensagens chamando “Ben” entram na conversa. Falas automáticas de curtidas, entradas e comandos ficam em silêncio no modo festa; os avisos visuais permanecem. Quem presenteia continua tendo prioridade nas perguntas da fila.
- PHONK e Shuffle ampliam as sequências e o movimento de corpo usando os quadros existentes. Não são novos modelos nem novos atlas de animação.

## Música em fone ou Bluetooth

No jogo, abra **Ações → Dança e som de seguidor**. O mesmo painel oferece câmera, luzes, frequência das trocas e silêncio das falas automáticas.

Para uma música tocada no próprio jogo, escolha o arquivo. A detecção é automática.

Para **GreenTube ou outro app**, use o captador Android opcional:

1. No painel, toque **Baixar captador Android**. O APK também está na raiz do ZIP e pode ser instalado pelo gerenciador de arquivos.
2. Gere um código no painel do jogo.
3. Abra **Batida Omnitrix**, digite o código e deixe **Captura compartilhada avançada** desmarcada.
4. Toque **Conectar e captar a batida** e permita o acesso de áudio. O modo padrão tenta ler a energia da saída sem abrir outra captura de tela.
5. Toque a música e volte ao navegador do jogo. Confira o texto **captador Android** e o BPM.

O captador exige Android 10 ou superior. No modo padrão, depende de o aparelho e a saída fornecerem sinal ao Visualizer de áudio do Android. Se o painel mostrar **conectado, sem som capturável**, a conexão existe, mas não há música chegando: confira a permissão de áudio e a saída do aparelho. Algumas rotas Bluetooth ou apps podem não fornecer esse sinal. Não há captura garantida de conteúdo protegido. A opção avançada de compartilhamento é separada e fica desligada: **uma nova captura compartilhada pode interromper uma LIVE que já esteja compartilhando a tela**. Não a ative durante esse tipo de transmissão. Ela permite filtrar o app da música, mas depende da permissão de compartilhamento do próprio app.

Só os níveis da energia são enviados ao Termux no próprio celular; não há gravação da faixa, envio de PCM ou servidor externo. O microfone não é usado pelo captador Android. Há, separadamente, um botão de microfone no navegador para caixa/alto-falante, com sua permissão; ele não ouve música dentro de um fone.

Para Bluetooth, ajuste **Adiantar / atrasar dança**. Valores positivos atrasam a dança. Sem captura disponível, ative **Música em outro app / dançar com BPM** e toque quatro batidas. O painel distingue BPM manual de áudio realmente captado. O captador identifica o ritmo; não é um serviço de identificação do título da música.

O APK foi compilado, assinado e verificado em Linux. O filtro e o transporte foram testados; a permissão de captura e a compatibilidade com o GreenTube ainda precisam ser conferidas no seu aparelho.

## Reversão e limites

O backup fica em `data/backups/before-v48-...` e contém `COMO_REVERTER.txt`. Exemplo:

```bash
cd ~/ben10-v34/game
node scripts/phonk-update.js --rollback 'data/backups/before-v48-SEU-BACKUP'
npm run build
bash restart.sh
```

A reversão restaura o código e mantém os dados atuais. O captador Android é opcional e independente; pare ou desinstale-o se voltar à V47.

O relatório e os resultados de testes acompanham esta entrega. LOCAL-010, o encerramento espontâneo do Termux, ainda exige diagnóstico no Android. Esta atualização não comprova a resolução desse problema nem foi medida em uma LIVE prolongada no GT3.
