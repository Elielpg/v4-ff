# Reparo R1 do instalador V46 — 11/11/2026

O erro “O servidor ainda responde” interrompeu a atualização antes de copiar o código do jogo. O instalador anterior aceitava a confirmação de um utilitário antigo, mas depois constatava que a porta continuava aberta. Dados, modelos e configurações não foram substituídos nessa interrupção.

## Causa e limites do diagnóstico

A inspeção encontrou dois problemas: o reconhecimento exigia ler `/proc/PID/exe`, que pode ser negado no Android mesmo quando UID, pasta e comando estão disponíveis; e a verificação posterior aguardava apenas cerca de dois segundos. A mensagem apresentada pelo usuário não permite distinguir qual ocorreu no aparelho. Os dois casos foram reproduzidos em testes controlados. A suíte anterior não reproduzia essa combinação no instalador com um servidor ativo.

## Alterações

| Arquivo | Mudança |
|---|---|
| `scripts/local-ai/project-processes.js` | Leitura de `exe` opcional, descoberta por PID conhecido e estado local, confirmação independente de UID/pasta/comando, busca do inicializador e envio único de sinal por processo/início |
| `scripts/update-stop.js` | Parada com prazo de 30 segundos, conferência da instalação, consultas HTTP limitadas, leitura de PORT e confirmação de que a porta permanece fechada |
| `scripts/campaign-update.js` | Usa o verificador corrigido do pacote temporário, em vez de depender do utilitário antigo instalado; inclui os novos arquivos na lista restrita |
| `tests/update-stop.test.js` | Seis regressões de identificação, encerramento lento, programas externos e configurações |

O inicializador confirmado recebe SIGTERM para permitir limpeza e persistência. O reparo não usa `pkill`, não ignora a porta ocupada e não autoriza matar um processo apenas porque o endpoint HTTP declarou um PID. Os supervisores existentes mantêm sua própria política de encerramento dos filhos.

O ZIP pequeno corrige quatro arquivos e o manifesto no pacote temporário já extraído. Confere os 47 hashes esperados antes de executar o instalador. Este faz backup e só copia o código depois de verificar a parada. O ZIP V46 R1 contém o pacote incremental inteiro já corrigido. A versão do jogo continua 46.0.0; R1 identifica a revisão do instalador.

## Evidências

- 302 testes aprovados, sem falhas, cancelamentos ou casos ignorados.
- Dez testes direcionados aprovados, incluindo as seis novas regressões.
- Lint e build aprovados.
- Instalação do pacote de 47 arquivos sobre cópia V45 e reversão com todos os hashes conferidos.
- Teste integrado usando o ZIP original, diretórios com espaços, servidor V45 e inicializador reais em execução, reparo, build e início da V46.
- Reversão com o servidor V46 ligado, preservando configurações, progresso de teste e arquivo de modelo de teste. Processo independente na mesma pasta permaneceu vivo.

Executado em Linux na nuvem com Node v24.22.1. A restrição de `/proc/exe` foi simulada; não houve execução no Realme GT3, inferência neural nem LIVE real. O registro detalhado está em `REGISTRO_TESTES_V46.json`.

## Se o Android impedir a confirmação

O reparo interrompe a cópia com uma mensagem específica. Vá à aba original que executa o jogo no Termux, pressione Ctrl+C até o prompt reaparecer e repita o comando de atualização. Se não localizar essa aba, fechar e reabrir o Termux encerra todas as sessões dele; salve antes outros trabalhos abertos.

Este reparo trata a instalação. Não comprova a correção de LOCAL-010, o encerramento espontâneo durante a LIVE, que continua exigindo logs no aparelho. Os motores de voz, os modelos e a escolha de voz não foram alterados.
