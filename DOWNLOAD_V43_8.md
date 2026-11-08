# Ben 10 · Clareira LIVE · V43.8

[Baixar BEN10_CONVERSA_V43_8.zip](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_CONVERSA_V43_8.zip?v=43.8.0)

Esta é uma atualização de código para quem já usa a V43.7. Prioriza demora e precisão das respostas. Não baixa modelos nem modifica a voz selecionada.

## Instalar

Baixe BEN10_CONVERSA_V43_8.zip para Downloads. Na pasta do jogo:

```bash
cd ~/ben10-v34/game &&
python3 -m zipfile -e ~/storage/downloads/BEN10_CONVERSA_V43_8.zip "$TMPDIR/ben10-conversa-43-8" &&
bash "$TMPDIR/ben10-conversa-43-8/ATUALIZAR_CONVERSA_V43_8.sh" &&
bash local-ai.sh start
```

Abra http://127.0.0.1:3000/?v=43.8.0 e toque em ♫. Mantenha o Termux aberto e conecte sua LIVE no painel. Nas próximas vezes: `cd ~/ben10-v34/game && bash local-ai.sh start`. Para parar: `bash local-ai.sh stop`.

## Respostas e espera

Contas simples, algumas perguntas verificadas sobre o clássico e o próximo desbloqueio recebem resposta direta, identificada como RESPOSTA DIRETA. Perguntas compostas ou não previstas continuam no modelo Qwen3 de 4B já instalado. O teste de IA continua consultando o modelo real; uma resposta direta não confirma que o modelo está online.

O início prepara o contexto uma vez antes de abrir o jogo. O prefixo fica estável para o cache de contexto. Perguntas independentes dispensam histórico sem relação; perguntas de seguimento mantêm até duas interações da mesma pessoa. Respostas gerais iguais podem ser reaproveitadas por até dois minutos. Perguntas pessoais, de seguimento e de estado/tempo ficam fora desse cache.

O modelo recebe menos instruções e devolve até duas frases curtas. A aplicação remove nomes repetidos e evita referências do desenho sem relação com a pergunta. Nas contas calculadas, o resultado fica em algarismos na legenda e segue por extenso para a voz. Não altera a pronúncia do modelo de voz nem promete um timbre diferente.

Avisos automáticos de chegada, TAP TAP, comandos e falas de ambiente que aguardam mais de 20 segundos saem da fila. Perguntas, presentes e agradecimentos por seguir são preservados. Presentes continuam com prioridade, sem cortar a fala em reprodução. O preparo da próxima resposta/voz continua funcionando.

LIVE → IA e voz → copiar diagnóstico inclui tempos separados da fila, resposta, entrega da voz, síntese e reprodução. Isso ajuda a localizar a espera restante.

## Limites da validação

No teste com o modelo real Qwen3-4B-Instruct-2507 Q4_K_M em CPU Linux, sem renderizar o cenário, contas e uma pergunta verificada levaram de 0 a 33 ms; perguntas gerais levaram aproximadamente 7 a 14 s. O contexto inicial levou cerca de 7 s para preparar. O modelo explicou fotossíntese, respondeu Tóquio e admitiu não saber o aniversário da pessoa, sem repetir seu nome. Não são resultados do Realme GT3 nem incluem geração da voz.

A voz atual é preservada. A etapa experimental de um novo clonador foi bloqueada por um filtro de conteúdo e não está incluída nesta atualização. Uma voz de IA original e mais clara permanece uma alternativa; nenhuma voz foi trocada automaticamente. Não é usada voz do aparelho.

## Dados preservados

O instalador confere a integridade e a sintaxe dos arquivos e guarda backup em `data/installer-backups`. Mantém .env, chaves, configurações, progresso, modelos, referência e seleção da voz. Não consulta APT nem baixa dependências. É específico para V43.7/V43.8; não substitui o pacote completo.

## Testes desta atualização

229 testes de regressão passaram após ajustar uma pergunta de teste para continuar exercitando a IA em vez da nova resposta direta. Foram executados os testes de conversa, fila, HTTP, voz simulada, inicialização, curtidas, música e interface. Os testes que geram pacotes completos ou exercitam clonadores não foram executados nesta rodada. A sintaxe JavaScript foi conferida.

O Chromium validou conta sem chamar o modelo, números por extenso no pedido de voz, resposta geral com modelo simulado, cache entre duas pessoas sem trocar seus nomes e confirmação somente após a reprodução. O áudio desse teste é um tom sintético; não avalia a voz do personagem.

O instalador foi aplicado em uma cópia de teste V43.7, conferindo os 16 arquivos por SHA-256 e preservação de configuração, progresso e seleção de voz. O backup foi conferido. Repetição, versão incompatível, conteúdo corrompido e destino com link simbólico também foram verificados.


## Relatório técnico

[Baixar relatório técnico em PDF — 11 páginas](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/RELATORIO_TECNICO_BEN10_V43_8.pdf?v=43.8.0) · [Versão editável](RELATORIO_TECNICO_BEN10_V43_8.md)

Arquitetura, estrutura do código, problemas da IA local e da voz, testes e melhorias pendentes. Inclui o novo bug LOCAL-010, parada inesperada no Termux durante a LIVE, ainda sem causa confirmada.

O projeto completo V43.8 foi preparado e passou em 235 testes, além de build e verificação do servidor extraído. Sua publicação permanece pendente. Os links anteriores desta página continuam apontando para a atualização incremental já publicada.
