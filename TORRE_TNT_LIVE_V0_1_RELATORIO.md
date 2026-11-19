# Testes, correções e pendências — 0.1.0

Verificação realizada em 19/11/2026 em Linux x64, Node v24.22.1, Chromium 155.0.8059.79. Esta é a primeira versão deste novo jogo de torre, separada dos projetos anteriores.

## Evidências

| Verificação | Resultado observado |
|---|---|
| Unitários e integração HTTP | 40 testes aprovados, 0 falhas |
| Construção | 1.200 curtidas de teste geraram 60 blocos |
| Explosão | Rosa removeu 10 blocos, com antecipação visual e som |
| Defesa | 3 cargas absorveram 3 unidades antes do dano restante |
| Vitória | 43 blocos + GG de 80: 1 vitória e 23 blocos na próxima torre |
| Interações durante comemoração | Continuam no estado da próxima torre |
| Áudio no Chrome | AudioContext running, WAV reproduzindo e amostras não nulas no efeito; liberação por clique, sem desligar a política de autoplay |
| Imagens | Fotos dos presentes decodificadas pelo navegador |
| Layout | 360×800, 450×960, 916×2040 e 1280×720 sem rolagem lateral nem torre/ajudantes escondidos pelo rodapé |
| Renderização observada | 59 a 60 FPS em amostras curtas do navegador deste ambiente, perfil equilibrado |
| Separação LIVE/DEMO | Eventos falsos e toques locais não concedem likes no modo LIVE |
| Console e recursos | 0 erros JavaScript e 0 respostas HTTP de erro no fluxo visual |
| Recuperação | Servidor filho isolado interrompido com SIGKILL, reiniciado em 2151 ms com progresso preservado |
| Limite de reinícios | Teste com limite 1: segunda interrupção encerrou o supervisor, sem terceiro processo |
| Instância duplicada | Recusada com código 78; supervisor original preservado |
| Estado corrompido | Arquivo JSON corrompido recuperado da cópia .bak em teste |
| SDK instalado | Importação e métodos de configuração conferidos sem iniciar conta real |

O teste de recuperação preservou 47 blocos, 2 vitórias, 240 curtidas, 278 pontos, 1 presente e 10 cargas de escudo, no modo LIVE. Os processos interrompidos pertenciam exclusivamente a uma cópia temporária de teste.

## Benchmark de CPU

36.000 eventos, 1.000 usuários e uma hora de **tempo virtual** foram processados em 235.43 ms, com 339 ms de CPU e RSS final de 52.7 MB neste computador. O snapshot tinha 385189 bytes e foi restaurado com os mesmos contadores. Esse ensaio mede apenas a lógica; não representa uma LIVE real de uma hora, FPS no celular, temperatura ou desempenho de rede. A reprodução de voz e modelos locais não se aplicam a este jogo.

## Problemas tratados durante o desenvolvimento

- Curtidas históricas da sala não viram blocos ao conectar. Os campos reais `count`/`total` do SDK e os alternativos `likeCount`/`totalLikeCount` são reconhecidos.
- Eventos só com total agregado chegam ao motor. Totais atrasados não reduzem a base nem geram créditos falsos quando se repetem.
- Presentes em sequência usam o incremento e retêm a confirmação final, evitando duplicação. O progresso mantém o histórico necessário ao reinício.
- Interações da comemoração não desaparecem: afetam a próxima torre e são informadas na tela.
- O rodapé não esconde mais a base nem os ajudantes nas resoluções testadas.
- Um encerramento do servidor é registrado e recuperado com limite; uma falha ao gravar o log não deve derrubar o supervisor.

## Pendências e limites conhecidos

1. **TikTok real:** autenticação pública, disponibilidade dos presentes por região e eventos reais ainda precisam de validação numa conta ao vivo. Foram testados payloads e cliente simulado, além da ponte HTTP; não foi usada uma conta real do usuário.
2. **Realme GT3:** autonomia, aquecimento, captura de áudio e uma sessão prolongada precisam de medição física. FPS observado aqui não é resultado no aparelho.
3. **Android encerrando Termux:** o supervisor recupera seu servidor filho, mas não revive o aplicativo inteiro. Não há logs suficientes para atribuir a causa dos encerramentos antigos. Wake lock e permissão de segundo plano ajudam, sem garantia de impedir o Android.
4. **Rede e reconexão:** com o serviço indisponível, o jogo conserva o estado e permite reconectar pelo painel. O SDK está configurado sem repetição de conexão infinita. Após perda da página, o snapshot restaura o tabuleiro; efeitos antigos não são reproduzidos novamente.
5. **Fotos/IDs regionais:** o catálogo tem dez regras padrão e imagens locais. Presentes desconhecidos concedem escudo limitado; configure o mapa se o nome/ID diferir.
6. **Áudio de aplicativos externos:** esta versão reproduz sua trilha ou arquivo local. Não escuta Green Tube ou outro aplicativo e não configura o áudio da transmissão.
7. **Persistência:** curtidas/comentários têm checkpoint periódico de aproximadamente 1 segundo; um corte abrupto pode perder o último intervalo ainda não gravado. Presentes pela ponte/HTTP aguardam salvamento; no SDK, a escrita é solicitada após aplicar o efeito. Não há confirmação transacional com o TikTok.
8. **Escala:** até 4.000 participantes em memória e filas visuais limitadas. Rajadas podem agrupar animações, mantendo a regra no servidor. O ranking é de pontos do jogo, não de moedas.

## Reproduzir

```bash
npm ci --omit=dev --ignore-scripts
npm test
npm run test:recovery
npm run benchmark
```

O teste visual opcional requer Chromium e `playwright-core` num computador de desenvolvimento; não é dependência do jogo. Defina `CHROMIUM_PATH` e `PLAYWRIGHT_MODULE` se estiverem fora dos locais padrão e execute `npm run test:browser`. Relatórios brutos estão em `docs/relatorios/`. As imagens em `docs/previas/` foram capturadas da própria versão em demonstração.

## Pacote entregue

O ZIP final foi extraído numa pasta temporária limpa. `bash install.sh` instalou as dependências; os 40 testes passaram novamente e todos os hashes do manifesto conferiram. `bash start.sh` e `bash stop.sh` foram executados nessa cópia. Após reiniciar, 45 blocos, 1.000 curtidas e o ranking permaneceram salvos. HTML, WAV e foto da Rosa responderam com os tipos corretos. Isso valida o pacote em Linux, sem substituir o teste físico no Android.

SHA-256: `95bec67cf539f2cac4d469aec759370d70878169341432ce31af975810f74f8d`.
