# Cobra do Caos · Ilha Panorâmica 3D · V0.4.0

Evolução da Cobra do Caos para LIVE no Termux: ilha panorâmica com vegetação e lago, tabuleiro ampliado, cobra erguida com boca ligada à fala real, câmera de frente e superior, avatares variados com apresentação individual, gaiola de espectadores, missões de fuga, banquetes, presentes coloridos, playlist e dia/noite. O piloto, presentes, ranking, voz local, estúdio RTMP e reparo de APT da versão anterior continuam disponíveis.

## Atualizar sua pasta atual e preservar progresso

Baixe `COBRA_DO_CAOS_V0_4.zip` em Downloads. Termine sua transmissão antes de atualizar. O atualizador encerra somente o jogo da pasta indicada, confere o manifesto e faz backup de código e estados antes de copiar os arquivos novos.

```bash
cd ~/COBRA_DO_CAOS_V0_1 &&
python3 -m zipfile -e ~/storage/downloads/COBRA_DO_CAOS_V0_4.zip "$TMPDIR/cobra-v04" &&
bash "$TMPDIR/cobra-v04/COBRA_DO_CAOS_V0_4/ATUALIZAR_V0_4.sh" "$PWD" &&
bash install.sh &&
bash start.sh
```

**A pasta continua sendo `~/COBRA_DO_CAOS_V0_1`, com o jogo na V0.4.0.** Abra **http://127.0.0.1:3500/?v=0.4.0** e confira V0.4.0 no topo.

Para iniciar nas próximas vezes:

```bash
cd ~/COBRA_DO_CAOS_V0_1 && bash start.sh
```

O progresso, ranking, configurações de IA, `.env`, cache privado e modelos existentes são preservados. O instalador continua usando somente a fonte principal configurada do Termux, com assinaturas exigidas. Se o FFmpeg estiver pendente, o jogo abre e o estúdio RTMP informa essa pendência. Para instalar apenas ele: `bash scripts/termux-packages.sh ffmpeg`.

## Instalação nova

Com Python disponível e o ZIP em Downloads:

```bash
cd ~ &&
python3 -m zipfile -e ~/storage/downloads/COBRA_DO_CAOS_V0_4.zip . &&
cd ~/COBRA_DO_CAOS_V0_4 &&
bash install.sh &&
bash start.sh
```

Use Node 22.19 ou mais recente. Pare outra instalação que esteja usando a porta 3500 antes de iniciar essa cópia. A primeira instalação das dependências usa internet; imagens locais, falas prontas e trilha incluída funcionam sem CDN, chave ou modelo de IA.


## O que muda no ritmo

- Movimento entre **280 e 230 ms por casa**, conforme o tamanho; a versão anterior podia chegar a 65 ms. A animação interpola as curvas entre estados do servidor.
- Uma comida ambiente, **até três comidas comuns visíveis**, com créditos extras na fila e reposição espaçada em 800 ms.
- Crescimento limitado a um segmento a cada **900 ms**, inclusive quando há créditos de presentes ou banquetes. O banquete de 50 avatares continua separado da comida comum e mantém seus donos e créditos persistentes.
- Curtidas coletivas geram uma comida a cada 50; **a missão de fuga continua sendo 500 curtidas da própria pessoa**, ou dez comentários, ou uma rosa.

## Gaiola e missões

Cada espectador identificado é cadastrado na gaiola quando chega à LIVE. Se o evento de entrada não vier, a primeira interação identificada também cria esse cadastro. Entradas repetidas da mesma pessoa não ocupam duas vagas.

Antes de completar **50 presos**, o espectador pode cumprir **qualquer uma** destas missões:

| Missão | O que conta |
|---|---|
| **500 curtidas próprias** | Deltas de curtidas identificados com o usuário, desde a entrada na gaiola |
| **1 rosa** | A primeira rosa confirmada já abre a porta, inclusive durante um combo |
| **10 comentários** | Comentários não vazios desde a entrada; o mesmo texto pode ser enviado novamente, mas o mesmo ID de evento não é contado duas vezes |

As três missões são alternativas completas, sem somar partes de uma com outra. **Comente STATUS** para destacar seus contadores na tela. A câmera mostra a gaiola, a porta abre e o avatar de quem escapou vai para o lado livre. O fugitivo fica protegido de nova captura nesta sessão, inclusive ao reconectar ou reiniciar o servidor. Os registros visuais são limitados a 1.500 perfis e a proteção de fuga mantém até 50 mil marcas de identificação por sessão.

Ao atingir **50 pessoas ainda presas**, os avatares saem da gaiola, se transformam em comida e caem no meio do tabuleiro. A gaiola fica disponível para os próximos espectadores. O banquete só pode ser consumido depois da queda; quando a cabeça da cobra passa pelo centro, ele gera créditos de crescimento com os donos correspondentes. Esses créditos continuam nas rodadas seguintes até serem usados.

A fuga precisa ocorrer **antes** de o banquete daquele grupo ser disparado. O avatar já despachado como comida não volta à gaiola ao enviar uma missão depois. Isso não impede a pessoa de comentar, ajudar ou sabotar o jogo.

O número da gaiola representa avatares cadastrados no jogo; não é o número de pessoas simultaneamente assistindo no TikTok. A disponibilidade dos eventos de entrada e da identificação nas curtidas depende do conector. Curtidas sem usuário alimentam o total coletivo, sem serem atribuídas a uma pessoa. O operador pode conferir isso em **LIVE → Gaiola e missões individuais**.

## Compartilhar, presentes e regras anteriores

**Compartilhar muda a cor da cobra e faz sua aura pulsar por nove segundos. Não liberta da gaiola.** Mantém o bônus de comida e o intervalo individual de 20 segundos da versão anterior.

| Interação | Efeito do jogo |
|---|---|
| HERÓI no chat | 1 comida grátis a cada 6,5 s por pessoa |
| VILÃO no chat | 1 bomba grátis a cada 11 s por pessoa |
| 50 curtidas coletivas | 1 comida |
| 100 curtidas coletivas | 1 carga de escudo |
| Seguir pela primeira vez reconhecida | 3 comidas |
| Compartilhar | 2 comidas e efeito de cor |
| Rosa | Fuga, se ainda estiver preso; também mantém 1 bomba |
| GG | 3 comidas |
| Heart Me | 3 cargas de escudo |
| Galáxia | Limpa as bombas e agenda crescimento de 8 segmentos |
| Confete | 8 bombas |
| Leão | Mordida de 8 segmentos, limitada a 12 por evento agrupado |

O tabuleiro tem **18 colunas × 28 linhas: 504 casas**, em 27 × 42 unidades de cenário. Na migração das V0.1–V0.3, corpo e objetos são reposicionados em um caminho válido: comprimento, donos, pontos, ranking e missões são conservados. Comidas antigas acima do novo limite passam para a fila. A cobra tenta preencher essas casas. Com três segmentos após dano, a rodada termina em queda; há revanche automática. O piloto evita paredes e o próprio corpo, sem evitar as bombas. Presentes e missões não garantem resultados monetários. As imagens e nomes dos presentes podem variar por região; valide os eventos reais da conta antes da transmissão.

## Câmera, luz e som

O botão **CINEMA** alterna entre percurso automático, acompanhamento de frente para a cobra, visão do tabuleiro inteiro e foco na gaiola. No percurso automático, novos visitantes aparecem num palco com seu avatar, nome e foto quando disponível. Há seis famílias de mascotes, cores, proporções e acessórios estáveis por usuário. Presentes fazem a câmera agradecer de perto e deixam a cobra colorida. A boca acompanha a amplitude da voz realmente reproduzida e também faz uma curta mastigação ao comer. O som original de mastigação é disparado junto da chegada visual à comida. Ao pausar a voz, o movimento de fala cessa. **CENA AMPLA** recolhe os painéis, com botão para restaurá-los. O layout se adapta a retrato e paisagem. A câmera faz transições suaves e reage a entradas, fugas e banquetes. O menu LIVE oferece os mesmos controles e a opção de reduzir movimento/luzes.

No menu LIVE, **Cor da cobra** permite cores suaves automáticas, arco-íris contínuo ou verde clássico. Presentes e compartilhamentos mantêm o efeito colorido temporário. A ilha recebeu flores, cristais, vitórias-régias e vaga-lumes à noite, com qualidade adaptada ao perfil. Os braços dos mascotes agora têm ombro, cotovelo e punho conectados.

O botão de período alterna entre **automático, dia fixo e noite fixa**. O ciclo automático dura oito minutos e muda o céu e a iluminação gradualmente. O efeito de compartilhamento colore o material da cobra; com movimento reduzido, o brilho deixa de pulsar e a câmera fica na visão geral.

Em **Música**, selecione vários arquivos de uma vez. Até 32 faixas ficam na playlist local. A ordem aleatória usa todas as faixas antes de refazer o ciclo, evitando repetir imediatamente a última música. Há seleção manual, remoção e botão Próxima. Com uma faixa, ela se repete; sem arquivos pessoais, toca a trilha original incluída.

Os arquivos selecionados ficam apenas na sessão do navegador do aparelho; selecione-os novamente ao recarregar a página. A cobra continua mesmo com música e voz pausadas. O captador Android Pulso Batida continua disponível para batidas de outro aplicativo, quando o Android/app permitem captura. O captador envia características das batidas, sem encaminhar a música para o RTMP; para transmitir música, carregue o arquivo no painel.

## Caos Live · app Android de captura real

O APK está em `public/downloads/CAOS_LIVE_V0_1.apk` e no botão de download da aba **Transmitir**. Android 10 ou superior. O jogo continua sendo executado pelo Node no Termux; o app abre essa mesma página local numa WebView de tela cheia. Não é um APK com modelos de IA nem um segundo servidor de jogo.

1. Inicie o jogo com `bash start.sh` e mantenha o Termux executando.
2. Instale **Caos Live** e abra o app. Preencha servidor RTMP/RTMPS e chave nos campos separados.
3. Escolha formato/qualidade, áudio interno, microfone ou sem áudio. Ajuste cortes de topo, rodapé e laterais se necessário; a proporção é preservada.
4. Toque **AUTORIZAR CAPTURA E TRANSMITIR**, conceda as permissões e confirme o diálogo do Android. O app abre o jogo; toque para liberar o som. Conecte seu @ na aba LIVE do jogo.
5. Use **CENA AMPLA** para dar mais espaço ao cenário. Para encerrar a captura, use a notificação do app ou o botão de encerramento.

A captura compartilha a tela inteira, incluindo outros apps que você exibir. A tela privada de configurações é protegida e aparece preta se aberta durante a captura. A chave não é salva nem enviada ao servidor do jogo. O destino RTMP recebe imagem e áudio pelo próprio app, sem FFmpeg no Termux. RTMPS usa TLS com verificação do certificado.

**Sincronizar luzes com a batida no jogo** reaproveita o mesmo áudio interno capturado: envia somente medidas numéricas de energia ao jogo local. Há pareamento automático com a porta **3500**. O controle de compensação Bluetooth na aba Música passa a valer também para esse caminho. Não execute o Pulso Batida com outra captura MediaProjection ao mesmo tempo; o Caos Live já realiza as duas funções. Se o jogo local estiver indisponível, falha da ponte de batidas não encerra o RTMP.

A música e as vozes do jogo podem entrar no áudio interno. GreenTube e outros players precisam permitir AudioPlaybackCapture; conteúdo protegido pode ficar silencioso. O microfone é uma opção separada, sem mistura automática com áudio interno. A playlist do jogo é o caminho mais previsível para imagem, música e efeitos juntos.

**Não inicie o RTMP do navegador ao mesmo tempo que o do app.** São alternativas. A conta da plataforma precisa ter servidor/chave liberados; preencher uma chave não libera essa função na conta.

O APK foi compilado e a assinatura conferida. Seu cliente Java enviou H.264/AAC para um receptor RTMP local. **MediaProjection, EGL, MediaCodec, permissões e captura física no GT3 ainda exigem teste no aparelho**; esses caminhos não foram executados em um Android nesta sessão. Detalhes em `android-live/README.md`.

## LIVE, RTMP do navegador e IA local

A conexão do chat e o envio de vídeo são separados. Inicie o RTMP em **Transmitir** ou use seu aplicativo habitual; depois conecte o @ ao vivo na aba LIVE e aguarde a confirmação de eventos. A demonstração é identificada como fictícia e seus participantes, ranking, gaiola e missões ficam separados da LIVE. Botões de simulação são recusados no servidor em modo LIVE.

O estúdio RTMP inclui a cena 3D, contagem da gaiola, missões, presentes, legendas, música, efeitos e voz. Sua conta precisa ter endereço RTMP e chave liberados pela plataforma. Preencha a chave somente no painel local; ela não vai para o vídeo, backup de configuração ou logs. Mantenha o Chrome visível durante o envio. Uma amostra WEBM de dez segundos pode ser gravada sem chave.

Há perfis de saída 540p/24 FPS, 720p/30 FPS e 1080p/30 FPS. A renderização usa limite de 24 FPS no perfil Leve e 30 nos demais, sem prometer que o aparelho alcance esses valores. Bitrate, rede e hardware determinam o resultado; há recodificação de vídeo. O teste RTMP desta entrega foi para um receptor local, sem publicar LIVE real no TikTok.

Inclui **24 falas neurais PT-BR prontas**, com explicações das regras e oito assuntos para os momentos tranquilos. A cada 40 segundos sem fala, e sem interação nos últimos 12 segundos, Zig pode comentar sobre a ilha, a aventura ou o chat. Ele não inicia esse comentário enquanto prepara uma resposta. Saudações e respostas interrompem as falas ambiente. Em **Apresentador**, você pode desativá-las ou ajustar o intervalo de 20 a 120 segundos. Não precisa gerar cada frase novamente na IA. Para perguntas livres, reaproveite seu Qwen/Piper existente em outra sessão do Termux:

```bash
cd ~/COBRA_DO_CAOS_V0_1 && bash ia-local.sh
```

Em instalação nova, use a pasta V0_4. O comando reaproveita a instalação anterior de IA sem baixar modelos ou ativar o clonador. A identidade da conversa é Zig; `ben-classico-local` é apenas o alias técnico do servidor anterior. A IA não controla o piloto nem executa comandos do sistema.

## Backup, reversão e estabilidade

O atualizador mostra o backup em `data/update-backups/v0.4.0-*`. Para reverter, encerre a transmissão e execute **o `REVERTER.sh` daquele backup**. Ele restaura o código e os estados do instante anterior à atualização; o progresso obtido depois será substituído. `.env`, modelos externos e arquivos do operador fora do manifesto ficam preservados.

O supervisor recupera falhas do servidor no máximo quatro vezes em 15 minutos. Logs em `logs/`. Isso não recupera o encerramento de todo o Termux pelo Android. No GT3, mantenha as permissões de segundo plano e confira bateria/temperatura em uma sessão real. Clientes SSE lentos são desconectados quando a fila excede 256 KB e podem reconectar; estados visuais são enviados a cada 100 ms. A retomada do servidor preserva gaiola e missões salvas, mas a conexão TikTok e o RTMP precisam ser conferidos/reabertos manualmente.

## Arquitetura e validação

`server/cage.mjs` cuida de missões, imunidade, grupos de comida e créditos persistentes. `server/identity.mjs` concilia IDs e @. `public/cinematic-world.js` e `cage-stage.js` criam câmera, cena e avatares. `public/playlist.js` cuida das faixas. O piloto, integração e estúdio anteriores continuam nos módulos existentes.

Babylon.js foi mantido para aproveitar o WebGL e a captura do jogo no navegador/Termux. Uma migração para Godot exigiria exportação Web ou APK e adaptação do caminho de transmissão, sem necessidade para estas funções.

Execute `npm test`. Evidências em `docs/`: testes, simulação acelerada, navegador, avatares e RTMP. A simulação não equivale a duas horas reais no Android. Os testes da integração TikTok, foto real do perfil, latência de IA e duração no GT3 continuam pendentes no aparelho. Alterações e limites em [COBRA_DO_CAOS_V0_4_ARQUITETURA.md](COBRA_DO_CAOS_V0_4_ARQUITETURA.md). A arquitetura anterior permanece documentada em `docs/ARQUITETURA_V0_3.md`.
