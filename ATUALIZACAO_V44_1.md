# Ben 10 · Clareira LIVE V44.1

Atualização sobre V43.7, V43.8 ou V44.0. Mantém Babylon.js, modelos, cenário, voz selecionada, referência, chaves, progresso e integrações. Antes das alterações foi criada uma cópia isolada e o backup local BEN10_V44_ANTES_V44_1.zip, com manifesto SHA-256. O instalador também faz um backup no seu aparelho.

## Interface da LIVE

- Presentes: 21 imagens WebP reais, servidas pelo próprio jogo, com fonte e hashes em public/gifts/ORIGEM.json. Fotos pequenas não dependem de CDN durante a LIVE. Idiomas alternativos do mesmo presente compartilham a imagem; GG, TikTok, Heart Me, Hand Heart e Finger Heart ficam separados.
- O catálogo aprende nome, ID e imagem dos presentes recebidos pelo conector. A imagem da LIVE prevalece sobre a imagem local. Apenas imagens de domínios TikTok/ByteDance previstos são aceitas; os pedidos usam IDs internos, com limite de tamanho, tipo e consultas simultâneas.
- A rotação mostra presentes com foto disponível. Presentes antigos sem imagem continuam nas regras e mantêm seus poderes; entram nos slides quando a LIVE fornece a foto. Não foi colocado o ícone de um presente diferente para preencher uma ausência.
- Missões: dica de como participar, porcentagem, rodada e recompensa. Títulos/recompensas visuais alternam entre rodadas mantendo os tipos de efeito existentes. Metas personalizadas e contagens não foram redefinidas pela mudança de layout.
- Ranking: medalhas originais, nomes, pontos, curtidas, presentes e progresso, com atualização agrupada para reduzir trabalho repetido no navegador.
- Convite permanente no painel: “Pergunte qualquer coisa pro Ben no chat!”. O cartão de dicas alterna perguntas, comandos, TAP TAP e participação. O convite descreve a interação disponível; o modelo ainda pode errar fatos.

## Nitidez e uso de GPU

A V44 calculava o tamanho do framebuffer com escala em pixels CSS. Em uma tela densa, 1,35 reduzia 412 pixels CSS para aproximadamente 305 pixels internos de largura. O cel shading também era um passo de tela sem suavização final.

A V44.1 considera a densidade da tela com limites de 1x/1,5x/2x por perfil e aplica FXAA depois do cel shading. No perfil Equilibrado, a escala inicial 1,35 passa a 0,9 em telas de DPR 1,5 ou maior: cerca de 458 pixels internos em 412 pixels CSS. O perfil Alto prioriza mais detalhe. O limite fica em 1,2 milhão de pixels nos perfis Econômico/Equilibrado e 2 milhões no Alto. A resolução adaptativa continua disponível. Desativá-la pelo painel agora restaura a resolução base do perfil, em vez de congelar a baixa resolução atingida sob carga.

Isso melhora a nitidez sem substituir os modelos, mas não promete eliminar todo serrilhado ou garantir FPS no GT3. Mais resolução custa GPU. Use Equilibrado inicialmente e teste Alto com a LIVE ativa antes de mantê-lo.

## Parada inesperada e recuperação

O relato mais recente confirma que a execução para no Termux e a página fica travada em seguida. A causa original do encerramento no telefone continua sem confirmação. Não é possível declarar um erro de GPU ou falta de memória como causa sem os registros do aparelho.

Foi fechada uma lacuna verificável: o iniciador passa a supervisionar o próprio supervisor, com no máximo duas recuperações da sessão. Cada serviço mantém seu orçamento de três recuperações. Paradas solicitadas com Ctrl+C ou stop não reiniciam a sessão. O esgotamento do limite é informado; não há ciclo infinito.

Durante os testes apareceu uma regressão: enviar SIGTERM ao iniciador e ao filho no mesmo passo podia interromper a limpeza e deixar portas ocupadas. O encerramento agora segue os processos pais antes dos filhos, preservando processos externos. Também foi corrigido o anúncio de serviços prontos antes de confirmar a configuração no servidor.

Logs de conversa e voz passam a ter rotação: até 2 MiB por arquivo mais uma cópia anterior. Exceções fatais e saídas do supervisor são registradas. Falhas de armazenamento do log não encerram o jogo.

No navegador, a perda do contexto WebGL exibe um aviso e aguarda a restauração do próprio Babylon. Uma exceção de frame tenta o perfil Econômico; uma segunda interrompe apenas o desenho, informa a falha e mantém o código de chat/voz ativo. A página não fica recarregando sozinha em ciclo. Quando a conexão com o servidor cai, ela avisa que está reconectando ao jogo e aguarda o servidor. A renderização pausa quando a aba está oculta.

O supervisor interno e seu iniciador não sobrevivem se o Android encerrar todo o Termux. É necessário testar a LIVE no GT3 por 60–120 minutos. Não foi feita uma sessão física equivalente neste ambiente.

## Instalação

Baixe BEN10_ATUALIZACAO_V44_1.zip em Downloads e execute:

```bash
cd ~/ben10-v34/game &&
python3 -m zipfile -e ~/storage/downloads/BEN10_ATUALIZACAO_V44_1.zip "$TMPDIR/ben10-v44-1-update" &&
bash "$TMPDIR/ben10-v44-1-update/ATUALIZAR_BEN_V44_1.sh" &&
bash local-ai.sh start
```

Abra http://127.0.0.1:3000/?v=44.1.0 e toque em ♫. Confira a versão 44.1.0 no topo e a conexão com a LIVE.

Nas próximas vezes: `cd ~/ben10-v34/game && bash local-ai.sh start`.

O ZIP é incremental: código, imagens dos presentes, testes e documentação. Não inclui motores/áudio de clonagem ou pesos e não faz novos downloads de IA. Depende dos recursos da instalação existente. Não aplique reparos antigos sobre essa versão.

## Diagnóstico se repetir

Logo após voltar ao prompt: `echo $?`. Em outra sessão, execute:

```bash
cd ~/ben10-v34/game
bash local-ai.sh status
task_logs="${BEN10_LOCAL_ROOT:-$HOME/.local/share/ben10-local-ai}/logs"
tail -n 80 "$task_logs/supervisor.jsonl"
tail -n 50 "$task_logs/inicializacao.log"
tail -n 50 "$task_logs/voz.log"
tail -n 50 "$task_logs/conversa.log"
tail -n 30 data/diagnostics/render.jsonl
```

O arquivo render.jsonl só existe após um incidente reportado pelo navegador. Logs podem conter textos e nomes do chat; revise antes de compartilhá-los. Nenhum registro do telefone é enviado automaticamente.

## Reverter

O instalador imprime o backup em data/backups/before-v44-1-.../. Dentro dele, COMO_REVERTER.txt contém o comando exato. A reversão restaura apenas código e imagens alterados, mantendo os dados atuais, chaves, modelos e voz. Dados privados não estão no ZIP público.

## Evidências e limites

A suíte final passou nos 268 testes, sem falhas nem casos ignorados; lint e build passaram. O ZIP real foi aplicado em uma cópia temporária da V44, iniciou o servidor e serviu a foto WebP. O fluxo de comentário respondeu à conta de teste; 321 curtidas, chaves, modelos e motores foram preservados. A reversão passou com conferência SHA-256 dos arquivos restaurados.

No Chromium, as fotos carregaram, o framebuffer Equilibrado ficou em 457 × 1016 pixels para 412 × 915 pixels CSS com escala 0,9 e o FXAA compilou. A perda do contexto gráfico foi detectada e restaurada. Em 80 presentes e 80 recompensas com tempo simulado, a contagem ficou em 195 meshes antes/depois, 62 → 63 materiais, 15 texturas e 55 nós: não houve crescimento contínuo observado nesse teste. Consulte reports/v44_1/test-record.json, testes.log, browser.json e package-test.json para os resultados desta versão. Os testes de serviços e de áudio usam fixtures locais; nenhuma nova clonagem ou mudança de voz foi feita. A avaliação visual é Chromium/SwiftShader em Linux, não a GPU do GT3. O teste de efeitos repete animações com tempo simulado; não equivale a horas de LIVE real. A suíte V44 e seu relatório histórico continuam no projeto.
