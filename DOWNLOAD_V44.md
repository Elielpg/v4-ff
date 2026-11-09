# Ben 10 · Clareira LIVE V44

[Baixar atualização V44 em ZIP](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_ATUALIZACAO_V44.zip?v=44.0.0)

[Baixar relatório em PDF — 9 páginas](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/RELATORIO_V44_BEN10.pdf?v=44.0.0) · [Relatório editável](RELATORIO_V44_BEN10.md) · [Registro de testes](REGISTRO_TESTES_V44.json) · [Pendências](PENDENCIAS_V44.md)

## O que o ZIP contém

Atualização de código para a V43.7/V43.8 já instalada no Termux. Preserva os personagens, cenário, Omnitrix, ranking, controles, progresso, integrações, motores e referência de voz existentes. Não é uma instalação nova completa. Não inclui áudio, implementação de clonagem nem pesos grandes; esses arquivos permanecem na sua instalação. Não baixa novos modelos ou altera chaves.

A V44 mantém Babylon.js 9.32.1 e acrescenta:

- Supervisão independente de jogo, IA e voz, com no máximo três recuperações por serviço e logs de saída. A queda da voz deixa o jogo disponível.
- Persistência de fila, respostas, recibos, memória por espectador e ranking, com limites e retenção documentados.
- Arquitetura das 33 habilidades atuais, vigor, recargas, combo e defesa, com regras de LIVE configuráveis e ações separadas da IA social.
- Iluminação, sombras, cel shading discreto, vegetação, água, auras, impactos e câmera suave sobre os recursos atuais.
- Perfis gráficos, resolução adaptativa, orçamento de CPU e diagnóstico de processos.
- Normalização textual, números por extenso, envelope labial e corpus para comparar a voz já selecionada. O timbre e as palavras enroladas continuam pendentes de validação; nenhum motor foi substituído.

## Instalar sobre a sua versão atual

Baixe o ZIP acima em Downloads. No Termux:

```bash
cd ~/ben10-v34/game &&
python3 -m zipfile -e ~/storage/downloads/BEN10_ATUALIZACAO_V44.zip "$TMPDIR/ben10-v44-update" &&
bash "$TMPDIR/ben10-v44-update/ATUALIZAR_BEN_V44.sh" &&
bash local-ai.sh start
```

Abra http://127.0.0.1:3000/?v=44.0.0 e toque em ♫. Confira a conexão com a LIVE no painel. Para iniciar nos próximos dias:

```bash
cd ~/ben10-v34/game && bash local-ai.sh start
```

O instalador valida hashes e sintaxe, encerra somente os processos identificados desta instalação e imprime o backup em `data/backups/before-v44-.../`. O arquivo `COMO_REVERTER.txt` dentro dele traz a reversão para a sua pasta. [Guia completo de instalação, execução, diagnóstico e reversão](INSTALACAO_E_REVERSAO_V44.md).

## Validação e limites

255 testes aprovados, zero falhas e zero ignorados; lint e build aprovados. O ZIP foi extraído, instalado em uma cópia temporária e revertido. O servidor atualizado serviu os módulos novos, respondeu a uma conta pelo fluxo do chat e preservou 321 curtidas. Chaves, modelos e referência foram preservados. Chromium verificou áudio sintético, confirmação após reprodução, dia/noite, shader, combo, defesa e estabilidade dos recursos em três recargas.

Os benchmarks separados usam CPU Linux e renderização SwiftShader; não representam o Realme GT3. A voz original Piper foi medida sem referência de personagem; avaliações de clareza/timbre ficaram sem nota humana. Não houve comprovação de melhora neural do clonador, comparação auditiva equivalente dos três motores ou LIVE real prolongada no telefone.

LOCAL-010: o relato de retorno silencioso ao prompt foi registrado. O encerramento em cascata foi corrigido e testado com falhas controladas; a causa original no GT3 continua não confirmada. O supervisor interno não sobrevive ao encerramento de todo o Termux pelo Android. A aceitação final requer 60–120 minutos no aparelho com LIVE, IA e voz simultâneas.

A revisão automática anterior rejeitou a publicação de um ZIP completo com áudio/clonagem e proibiu repetir essa categoria. Esta entrega pública contém apenas a atualização de código e os relatórios, preservando a instalação existente.

[SHA-256 do ZIP](BEN10_ATUALIZACAO_V44.zip.sha256) · [SHA-256 do PDF](RELATORIO_V44_BEN10.pdf.sha256)
