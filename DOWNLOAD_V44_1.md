# Ben 10 · Clareira LIVE V44.1

[Baixar atualização V44.1 — ZIP](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_ATUALIZACAO_V44_1.zip?v=44.1.0)

[Relatório e instruções — PDF, 4 páginas](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/ATUALIZACAO_V44_1.pdf?v=44.1.0) · [Guia editável](ATUALIZACAO_V44_1.md) · [Prévia](BEN10_V44_1_PREVIA.png) · [Testes](REGISTRO_TESTES_V44_1.json)

## Alterações

- 21 fotos reais dos presentes, guardadas no jogo. O catálogo também aprende as imagens recebidas pela LIVE. Presentes sem imagem mantêm suas regras e entram nos slides quando sua foto estiver disponível.
- Missões com instruções, porcentagem, rodada e recompensas; ranking com medalhas, pontos, curtidas e presentes. Dicas e convite permanente para perguntar qualquer coisa ao Ben.
- FXAA após cel shading, resolução que considera a densidade da tela com limite de pixels e restauração da nitidez ao desativar a adaptação. Personagens e cenário preservados.
- Recuperação limitada do próprio supervisor, encerramento na ordem correta, confirmação da configuração antes de anunciar serviços prontos e rotação dos logs de voz/texto.
- Aviso e restauração do contexto gráfico, com tratamento limitado de erros de frame. A causa original da parada no GT3 continua sem confirmação.

## Instalar

Este ZIP atualiza uma instalação V43.7/V43.8/V44 existente. Mantém modelos, referência, motores de voz, chaves e progresso. Não instala o projeto do zero, não inclui áudio/implementação de clonagem nem pesos e não troca a voz selecionada.

Baixe em Downloads. No Termux:

```bash
cd ~/ben10-v34/game &&
python3 -m zipfile -e ~/storage/downloads/BEN10_ATUALIZACAO_V44_1.zip "$TMPDIR/ben10-v44-1-update" &&
bash "$TMPDIR/ben10-v44-1-update/ATUALIZAR_BEN_V44_1.sh" &&
bash local-ai.sh start
```

Abra http://127.0.0.1:3000/?v=44.1.0 e toque em ♫. Confira 44.1.0 no topo e a conexão com a LIVE. O instalador imprime o backup; `COMO_REVERTER.txt` dentro dele contém a reversão. Não aplique reparos antigos depois desta atualização.

Nas próximas vezes:

```bash
cd ~/ben10-v34/game && bash local-ai.sh start
```

Em LIVE → Configurações, experimente Qualidade Alto. Para manter a nitidez fixa do perfil, desmarque o ajuste de resolução quando o desempenho cair. A opção Equilibrado usa menos GPU; FPS no GT3 ainda requer medição com a transmissão real.

## Verificações

268 testes aprovados; zero falhas e ignorados. Lint e build aprovados. ZIP real extraído e aplicado sobre V44.0, com hashes conferidos, servidor funcional, foto WebP servida, conta respondida pelo fluxo do chat, 321 curtidas preservadas e reversão conferida. Chaves, modelos e motores foram preservados.

Chromium testou fotos, layouts de 320/412/1280 pixels, áudio sintético e fila, FXAA e restauração WebGL. 80 presentes e 80 recompensas completaram com contagens de recursos estáveis, exceto um material adicional após aquecimento. É tempo simulado em Linux/SwiftShader, não uma LIVE prolongada no telefone ou teste da voz clonada.

O relato atual é que a execução para no Termux e a página trava em seguida. A recuperação do supervisor foi testada com SIGKILL em um processo de fixture, incluindo retomada da fila e parada externa sem reinício indevido. O Android ainda pode encerrar todo o Termux; o iniciador interno não impede essa ação. Confira a conexão TikTok depois de recuperar o servidor. Se repetir, os comandos para guardar os logs estão no relatório.

A revisão automática anterior bloqueou a publicação do ZIP completo com áudio/clonagem e proibiu repetir essa categoria. Esta entrega é a atualização incremental de código, imagens e documentação para a instalação existente.

[SHA-256 do ZIP](BEN10_ATUALIZACAO_V44_1.zip.sha256) · [SHA-256 do PDF](ATUALIZACAO_V44_1.pdf.sha256)
