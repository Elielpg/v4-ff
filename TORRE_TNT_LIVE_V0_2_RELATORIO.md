# Testes, resultados e pendências — 0.2.0

Verificação em 19/11/2026, Linux x64, Node v24.22.1 e Chromium 155.0.8059.79. O código 0.1 foi copiado para backup antes das alterações. Esta versão evolui o mesmo projeto; música, sons, presentes, conexão e dados anteriores foram preservados.

## Resultado observado

| Verificação | Evidência |
|---|---|
| Testes unitários e HTTP | 54 aprovados, 0 falhas |
| Geometria | 18 colunas × 100 andares, 1.800 células distintas |
| Construção gradual | 36 colocações reais recebidas pelo navegador: todas com quantidade 1 e horários distintos |
| Caminho | Vizinhos adjacentes em zigue-zague; fecha os 18 espaços antes de subir |
| Vitória | 1.799 blocos não vencem; o último espaço completa 1.800. Uma coluna até a altura 100 com buracos também não vence |
| Percentual | 1.795 de 1.800 ainda exibem 99%; chega a 100% apenas com a grade completa |
| TNT | Remove células reais; o construtor repõe os menores vãos antes de continuar |
| Escudo | Absorve dano antes de remover blocos |
| Bônus | GG fornece 80 materiais na fila; não aparece uma fileira inteira de uma vez |
| Filas | Rodízio por espectador, contagem preservada e agrupamento sem perda de materiais |
| Próxima torre | 15 materiais excedentes aguardaram a comemoração e foram colocados depois |
| Câmera | Seguiu progresso restaurado no andar 40 e alcançou o teto do andar 100 |
| Visão geral | MAPA exibiu os 100 andares e todos os 720 blocos de uma prévia parcial |
| Layout | Conferido em 360×800, 450×960, 916×2040 e 1280×720; sem rolagem lateral ou construtor oculto pelo rodapé |
| Renderização | 52–60 FPS em amostras curtas no Chromium desta máquina; recorte de células fora da tela confirmado |
| Áudio | AudioContext ativo após clique, WAV reproduzindo e efeito com amostras não nulas |
| Recursos | Fotos de presentes decodificadas; zero erros JavaScript ou respostas HTTP de erro no fluxo visual |
| LIVE/DEMO | Toques e presentes falsos da demonstração bloqueados no modo LIVE |
| Recuperação | Servidor de teste interrompido com SIGKILL; retornou em 2143 ms, preservando a grade de 1.800 células e 17 materiais pendentes |
| Limite de recuperação | Com limite 1, uma segunda falha encerrou as tentativas; instância duplicada recusada |
| Migração lógica | Schema 1: preservou 63 blocos, vitórias, ranking e seguidores; schema 2 passou a guardar grade e fila |

As cenas de câmera foram testadas com estados de demonstração restaurados e determinísticos. A vitória final foi acionada por cinco colocações reais após um estado de 1.795 blocos. Não se afirma que uma torre inteira tenha sido filmada em tempo real neste teste.

## CPU e memória do motor

Foram processados 36.000 eventos de 1.000 usuários, com 72.000 ticks e uma hora de tempo virtual. O motor levou 1387.99 ms de parede e 1579 ms de CPU nesta máquina; RSS final de 60.9 MB e snapshot de 460313 bytes. Grade, fila e contadores coincidiram ao salvar/restaurar. Este é um ensaio de lógica, não uma LIVE real de uma hora, temperatura do celular, medição de rede ou benchmark gráfico no Realme GT3.

## Limites e próximos passos

1. Conexão TikTok, nomes/IDs regionais e eventos de uma conta real ainda precisam de validação no celular do usuário. O conector, os payloads, a ponte e a separação dos modos foram testados sem conta real.
2. Uma sessão longa no Realme GT3, aquecimento, bateria e captura de áudio precisam de teste físico. Os FPS acima são deste computador.
3. O supervisor recupera o servidor filho e registra a saída, mas não pode reviver o aplicativo Termux se o Android o encerrar inteiro. Não há dados para atribuir uma causa aos encerramentos antigos.
4. A obra é gradual. Grandes quantidades de material podem permanecer na fila durante várias torres; não são removidas só para acelerar a animação. Intervalos de construção são ajustáveis entre 80 e 2.000 ms.
5. O checkpoint periódico tem intervalo de aproximadamente 1 segundo. Uma interrupção abrupta pode perder o último intervalo ainda não gravado. Não existe confirmação transacional com o TikTok.
6. Algumas animações de uma rajada são agrupadas para limitar o trabalho visual. A regra e os materiais são registrados no servidor. Após reconectar a página, o estado atual retorna e os efeitos antigos não são repetidos.
7. O jogo reproduz trilha original ou arquivo de música escolhido. Não escuta Green Tube nem configura a captura da transmissão.
8. O pacote não inclui Minecraft nem depende dele. As referências do GitHub estão documentadas em `PESQUISA_GITHUB.md`.

## Reproduzir os testes

```bash
npm ci --omit=dev --ignore-scripts
npm test
npm run test:recovery
npm run benchmark
npm run test:update -- /caminho/TORRE_TNT_LIVE_V0_1.zip
```

O teste de navegador exige Chromium e `playwright-core`, opcionais para desenvolvimento. Configure `CHROMIUM_PATH` e `PLAYWRIGHT_MODULE` se necessário e execute `npm run test:browser`. Relatórios brutos estão em `docs/relatorios/`; as imagens em `docs/previas/` são capturas da demonstração desta versão.

## Atualização real do pacote 0.1

O teste extraiu o ZIP publicado da 0.1 numa pasta temporária, iniciou seu servidor sem supervisor e aplicou o atualizador 0.2. O servidor correto foi encerrado graciosamente; foi criado e verificado um backup ZIP com código e dados schema 1. A versão 0.2 abriu com os mesmos 63 blocos, 3 vitórias, 3.450 curtidas, saldo parcial de 10, 63 pontos, seguidor reconhecido, regra de presente personalizada e token da ponte preservado. O salvamento passou para schema 2 com grade de 1.800 posições.

O atualizador também recusou uma pasta de outro projeto e um pacote com arquivo alterado. Esses testes usaram somente dados artificiais e processos temporários deste ensaio, sem conta TikTok real. Uma comemoração de 100 blocos da 0.1 não é reaproveitada como vitória visual de 1.800 blocos; os troféus já conquistados são mantidos.

## Verificação do ZIP final

O arquivo foi extraído numa pasta limpa: `bash install.sh`, os 54 testes e todos os hashes do manifesto passaram. O atualizador dessa cópia também foi executado contra o ZIP original 0.1. `bash start.sh` e `bash stop.sh` preservaram 45 blocos, 1.000 curtidas, ranking e a mesma grade de 1.800 posições ao reiniciar. HTML, grade JavaScript, música WAV e foto de presente responderam corretamente.

SHA-256 do ZIP: `eca7e66d9a36af2082bd27383967029984a12b2d8e00a8c7b17931ff2f9640ad`.
