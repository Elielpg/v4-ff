# Pendências V44

- LOCAL-010: encerramento em cascata corrigido em testes com processos reais simulados. Causa do retorno silencioso ao prompt no GT3 ainda não identificada; requer próximos logs e teste prolongado.
- Voz: palavras enroladas e timbre diferente ainda sem correção neural comprovada. Motores atuais preservados. Corpus e instrumento comparativo criados; Piper original medido em Linux; OpenVoice/Qwen não tiveram avaliação auditiva comparável nesta rodada.
- Android: supervisor interno não sobrevive se o sistema matar todo o Termux. Sensor de bateria pode ser inacessível e não mede temperatura de CPU.
- Desempenho: alvos 30/45/60 FPS precisam de calibração no aparelho com a LIVE ativa. SwiftShader não representa a GPU do GT3.
- IA: modelo pode errar fatos ou alongar respostas. Não há fine-tuning da identidade nem conhecimento completo dos episódios; memória é limitada, local e por espectador.
- Reprodução: recibos cobrem a mesma sessão/origem de navegador; não há eleição de um único consumidor entre várias abas.
- Durabilidade: fila e respostas usam gravação atômica; falha física de armazenamento continua possível. Ranking nativo é salvo em lote; parada abrupta pode perder a última janela ainda não gravada.
- Escala: ranking com muitos espectadores deve migrar para armazenamento incremental/SQLite antes de campanhas muito grandes. O teto atual é 50 mil registros e 5 mil IDs de deduplicação.
- TikTok: conectores testados com eventos normalizados e protobuf; LIVE real e políticas da plataforma não foram verificadas nesta execução.
- Distribuição: publicação do pacote completo com áudio/clonagem permanece bloqueada pela revisão automática anterior. A entrega pública permitida é uma atualização de código que preserva a instalação existente; não contém os arquivos bloqueados.
