# Ben 10 · Clareira LIVE V44.2

[Baixar atualização V44.2 — ZIP](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_ATUALIZACAO_V44_2.zip?v=44.2.0)

[Instruções e relatório — PDF, 3 páginas](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/ATUALIZACAO_V44_2.pdf?v=44.2.0) · [Guia editável](ATUALIZACAO_V44_2.md) · [Prévia](BEN10_V44_2_PREVIA.png) · [Testes](REGISTRO_TESTES_V44_2.json)

## O que mudou

O Qwen local de conversa foi mantido. A voz padrão passa a ser Piper pt-BR, sem referência clonada. Ao sair da clonagem, a rotina prefere Cadu; uma seleção Piper explícita é respeitada. O perfil Claro tem ritmo ligeiramente mais lento, frases menores e pausas; o estilo Animado também está disponível no painel. Não há promessa de imitar o dublador.

O Ben tem 26 interlúdios originais sobre aliens, aventuras e o clássico, alternados quando a fila está livre. O intervalo padrão é 18 segundos e pode ser ajustado ou desligado. Comentários e presentes interrompem somente os interlúdios para atender o público. Respostas a espectadores mantêm a prioridade existente.

O modo compacto libera mais espaço do cenário, com faixas menores de energia/relógio, fotos dos presentes, missão com progresso e duas posições do ranking. O botão Expandir painéis restaura os detalhes. Personagens, poderes e controles continuam disponíveis.

## Instalar sobre o projeto existente

Este ZIP é uma atualização para V43.7/V43.8/V44 já instalado. Não é uma instalação nova completa. Mantém os modelos e arquivos antigos no aparelho para reversão; não inclui áudio de referência, pesos ou implementação de clonagem.

Baixe o ZIP em Downloads e execute:

```bash
cd ~/ben10-v34/game &&
python3 -m zipfile -e ~/storage/downloads/BEN10_ATUALIZACAO_V44_2.zip "$TMPDIR/ben10-v44-2-update" &&
bash "$TMPDIR/ben10-v44-2-update/ATUALIZAR_BEN_V44_2.sh" &&
bash local-ai.sh start
```

O instalador prepara a voz neutra e pode baixar cerca de 63 MB uma vez se necessário, com revisão e hashes verificados. Não baixa novamente o Qwen, não reinstala pacotes APT e não pede chave de API. Depois da preparação, a síntese roda localmente. Se a rede impedir o preparo e não houver voz válida, repita `node scripts/local-ai/plain-voice-plan.js --ensure` na pasta do jogo.

Abra http://127.0.0.1:3000/?v=44.2.0 e toque em ♫. Confira a versão no topo e a conexão TikTok. Para iniciar nos próximos dias:

```bash
cd ~/ben10-v34/game && bash local-ai.sh start
```

Em LIVE → Configurações, mantenha as falas automáticas ativadas. O intervalo de interlúdios aceita 12–90 segundos. O estilo da voz aplica ao reiniciar a sessão. O instalador imprime o backup e a reversão está em COMO_REVERTER.txt dentro dele.

## Evidências

277 testes, lint e build aprovados. O ZIP foi aplicado sobre uma cópia da V44.1, selecionou Cadu existente sem alterar o manifesto dos modelos, iniciou o servidor, respondeu pelo fluxo do chat, preservou 321 curtidas e passou pela reversão com conferência dos hashes.

No Chromium, um comentário interrompeu um interlúdio em reprodução e recebeu resposta, sem confirmar o áudio cancelado. Controles compactos/expandidos, fila, fotos, efeitos e restauração WebGL foram conferidos. As prévias de 320/412/1280 pixels passaram. O navegador usa áudio sintético e texto de fixture; não mede a voz real no GT3.

Um teste separado produziu dez WAVs com a voz Cadu neutra real, sem clonagem. Nas cinco frases do perfil Claro, a geração mediu 0,37–0,60 s em CPU Linux. Clareza, R/L e timbre precisam de escuta no aparelho; não foi atribuída nota automática.

A causa original da parada no GT3 e a validação prolongada com LIVE continuam pendentes. A recuperação limitada foi preservada e a identificação do Piper/proot foi testada para deixar processos externos intactos. O Android ainda pode encerrar todo o Termux. Confira a conexão TikTok depois de reiniciar o servidor. Rodadas de missão continuam contadas por sessão; ranking, fila e desbloqueios mantêm suas persistências existentes.

[SHA-256 do ZIP](BEN10_ATUALIZACAO_V44_2.zip.sha256) · [SHA-256 do PDF](ATUALIZACAO_V44_2.pdf.sha256)
