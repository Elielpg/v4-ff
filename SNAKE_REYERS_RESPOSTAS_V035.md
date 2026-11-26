# Respostas e execução no Realme GT3 — adaptador 0.3.5

26/11/2026. Complemento independente para o Snake Reyers 0.1.9 de Thiago Reyes. Mantém a cópia original, sem decompilar, extrair ou redistribuir a fonte privada do jogo. Não substitui personagens, cenário, progresso, chaves, voz, modelos ou músicas. Não transmite uma LIVE automaticamente.

## O que conseguimos confirmar

A demora tem etapas diferentes: fila do chat, geração textual, síntese da voz, envio ao jogo e início da reprodução/animação. A câmera da resposta no jogo original é acionada junto da preparação da fala. Uma espera antes desse momento pode parecer travamento da câmera sem que seja exclusivamente um problema gráfico.

O código local usava geração completa e só depois cortava a resposta ao tamanho aproveitável. Também aguardava a foto antes de enviar o evento de seleção do personagem. São esperas concretas que o adaptador pode reduzir sem substituir o motor.

Nos dois diagnósticos anteriores, a GPU já estava ativa. O primeiro identificou Zink/Turnip e média amostrada de 14 FPS; o segundo identificou Turnip diretamente e média de 32 FPS. Ambos foram feitos sem transmissão e com a IA ociosa. Resolução e limite efetivo não foram registrados nesses arquivos: não são um ensaio controlado do ganho por Vulkan. O uso do jogo perto de 100% de CPU representa aproximadamente um núcleo, não o uso de todo o Snapdragon. Ter RAM livre não faz uma thread usar todos os núcleos.

O Qwen instalado atualmente faz inferência na CPU. Este complemento não ativa GPU ou NPU para o modelo. Isso depende do binário, backend, operações suportadas e medição no aparelho; dividir a GPU com o jogo também pode piorar a fluidez. Não aumentamos threads, paralelismo ou prioridade automaticamente.

A documentação oficial do Termux:X11 descreve ainda a possibilidade de o Android tratar o Termux como segundo plano enquanto a janela X11 aparece em outro aplicativo. É uma hipótese importante, mas ainda não comprovada neste telefone. Não trocamos APK, assinatura, origem do Termux ou configuração de bateria. O APK sharedUid exige Termux compatível do GitHub; não deve ser instalado às cegas sobre outra origem. Fonte: https://github.com/termux/termux-x11#avoiding-slowdowns

O calor dos sensores aumentou no segundo teste, mas falta o estado efetivo de limitação térmica e do escalonador. Não atribuímos uma causa única sem essas leituras. A pesquisa completa, com links Godot/Mesa/Android e procedimento de coleta, está em `INVESTIGACAO_CAUSA_GT3.md`.

## Alterações desta revisão

- `snake_termux/client.py`: lê o fluxo SSE do Qwen local. Quando já existe texto além do limite aproveitável, fecha a requisição, permitindo cancelar a geração restante. A limpeza e o corte por frase continuam no fluxo existente, antes de gerar áudio. Não fala tokens parciais nem inclui ferramentas de sistema. A resposta JSON antiga continua compatível quando o servidor não envia SSE. Desativar o ajuste retorna à requisição anterior, sem duplicar chamadas.
- `snake_termux/live_load.py`: quando a fila admite um comentário e não há outra fala, envia o evento original de seleção do espectador antes de aguardar a foto. A foto completa é associada ao mesmo trabalho de fala. Durante outra resposta, o próximo espectador continua aguardando: o foco não é roubado. Preserva presentes, fila limitada de uma preparação adiantada e modo diálogo.
- `snake_termux/responsive.py`: mede espera na fila, tempo da IA, primeiro texto, início/fim da síntese, envio da fala e confirmação de início/fim pelo jogo. Guarda somente 32 registros na sessão, sem nomes, perguntas, respostas ou chaves. O mapa interno de trabalhos é limitado a 128. Os tempos de personagem/áudio são pedidos e confirmações distintos.
- `snake_termux/ui.js`: controles reversíveis e download dos tempos no painel privado, sem acrescentar HUD à LIVE. Mostra provedores ativos e origem do Termux, quando informada. Não faz chamadas periódicas de IA para medir velocidade.
- `snake_termux/native.py`: inclui a correção já investigada do iniciador secundário: respeitar o limite do perfil em vez de assumir 60 FPS. Preserva limites explícitos do chamador e não redimensiona a janela principal. Isso não prova que essa rota estava ativa no seu teste.
- `tools/restore_adapter.py` e reparador: backup dos arquivos próprios e reversão verificável. Nenhum preset gráfico ou de voz é forçado por este reparo.

## Evidências

### Qwen real, mesmo modelo

`docs/evidence/QWEN_REAL_V035.json`: Qwen3-4B-Instruct-2507 Q4_K_M real, CPU Linux x86_64, três threads, contexto 2048, uma requisição por vez, prompts aquecidos iguais e semente fixa. Limite de 150 caracteres, já disponível na opção Curta. Sem chamadas externas.

| Pergunta | Geração anterior | Geração limitada | Texto aproveitado igual |
| --- | ---: | ---: | --- |
| Capital da França | 0,757 s | 0,772 s | sim |
| Por que o céu é azul | 2,924 s | 3,192 s | sim |
| Provocação sobre vencer a LIVE | 5,326 s | 3,680 s | sim |

A última amostra reduziu a espera em cerca de 31%, pois havia texto a descartar. Nas outras não houve ganho. Não é média de várias repetições, benchmark do GT3 ou promessa de velocidade na LIVE. No log do llama-server, a última tarefa recebeu `cancel task` após fechar o fluxo; não foi apenas esconder texto enquanto o servidor continuava toda a geração.

A resposta sobre o céu manteve um erro de expressão/conteúdo do modelo: “menor comprimida”. A mudança não melhora, por si só, o conhecimento ou a precisão do Qwen. O início frio pode ser mais lento; este ensaio foi aquecido. O padrão Equilibrada continua em até 220 caracteres; o ajuste não o muda silenciosamente. Se a resposta já acaba antes do limite escolhido, não há cauda para economizar.

### Jogo original e Piper reais

`docs/evidence/NATIVE_RESPONSE_V035.json`: Godot 4.7 real, jogo original, Piper real, PulseAudio privado e Xvfb em Linux. Para isolar a ordem dos eventos, o texto teve atraso controlado de 2 s e a foto de 0,9 s. Isso não mede a velocidade da IA. O primeiro evento de personagem foi enviado em 0,969 s no controle e 0,041 s com antecipação, contando desde o comentário. Os logs do jogo confirmaram personagem sem foto, atualização da foto, preparação e início/fim das duas falas.

A câmera original continuou registrando `MAIN_CAMERA_RESPONSE_FOCUS` junto da fala pronta. Antecipar o personagem NÃO comprova antecipar ou suavizar a trajetória da câmera. A animação interna foi preservada. A voz estava em cache nesse ensaio final; tempos de síntese não servem para comparar aceleração do Piper. O Xvfb usou renderização por software: não se deve comparar seus FPS com o GT3.

### Regressão e interface

304 testes Python passaram, incluindo 67 originais; três testes Node passaram. Há verificação de fluxo truncado/inválido, limite de leitura, prazo total, preservação de voz/chaves, privacidade, ordem dos eventos, fila anterior e aplicação/reversão do reparo. Os avisos são principalmente de depreciação de lifespan do FastAPI; não são falhas de teste.

Chromium em 412 × 915: os dois controles aparecem, salvam, persistem ao recarregar, reativam e permitem atualizar/baixar o JSON sem transbordamento horizontal ou erros JavaScript. Registro e imagem em `docs/evidence/BROWSER_RESPONSE_V035.json` e `PANEL_RESPONSE_V035.png`.

Os 127 arquivos originais recebidos foram conferidos por tamanho e SHA-256 na preparação da entrega. Modelos, executável/PCK original e credenciais não fazem parte do ZIP.

## Instalação existente

Pare o iniciador com Ctrl+C e espere o prompt. Não pare o Tor que estiver em outra sessão.

```sh
cd ~/SNAKE_REYERS_TERMUX_0_2 &&
curl -fL 'https://raw.githubusercontent.com/Elielpg/v4-ff/main/SNAKE_REYERS_RESPOSTA_RAPIDA_V035.sh' -o "$HOME/snake-resposta-v035.sh" &&
bash "$HOME/snake-resposta-v035.sh" "$PWD" &&
bash start.sh
```

A atualização recusa executar enquanto houver serviço na porta 9393. Mostra o caminho do backup e o comando de reversão. Recarregue http://127.0.0.1:9393 e confira Termux 0.3.5.

Em Conversa Qwen, use **Curta — até 150 caracteres** se preferir menos espera e falas menores. Em Ritmo das respostas e câmera, use Resposta direta. Essas opções já existiam: não são aplicadas automaticamente para preservar sua escolha. Os novos controles estão em Tempo de resposta. Não é necessário baixar outro modelo nem ligar uma API.

O motor gráfico selecionado é preservado. Se o Vulkan direto já estava escolhido no painel, permanece escolhido. Se era usado só por `SNAKE_RENDERER=mobile bash start.sh`, repita essa variável ao iniciar; variáveis passadas a um comando não são salvas pelo shell para a próxima abertura. Se o teste de Vulkan piorar a imagem/estabilidade, volte ao modo anterior no seletor; a voz não depende dessa troca.

O ZIP completo contém o complemento independente atualizado. Para primeira instalação, siga a seção de instalação completa do README e use sua cópia original do Snake Reyers. Não substitua a pasta de estado por uma vazia ao atualizar. O novo reparador é a opção indicada para esta instalação já funcional.

## Medição que falta no GT3

Depois de alguns comentários reais, vá ao painel e clique em Atualizar tempos das últimas respostas e Baixar diagnóstico de respostas. O arquivo `COFRA_TEMPOS_RESPOSTAS.json` separa fila, IA, voz e início confirmado pelo jogo. Sem `speech_started_ms`, ainda não houve confirmação de reprodução para aquele trabalho; sucesso no HTTP não basta.

Aparecer o personagem não confirma movimento concluído da câmera. O campo de IA pode ficar ausente em saudações instantâneas, que não chamam o Qwen. Se o servidor reiniciar, o histórico da sessão começa vazio.

Para investigar CPU/GPU/agendamento, há também `SNAKE_REYERS_INVESTIGAR_GT3.py`. Execute em outra sessão com o jogo aberto e deixe o X11 visível durante a coleta, conforme o relatório de pesquisa. Esse coletor é somente leitura e salva um JSON; não altera clocks, prioridades, APKs ou proteções térmicas.

Pendências: tempo real no GT3 com música/voz/transmissão; possível política de segundo plano; estabilidade e qualidade do Vulkan nessa cena; eventual limitação térmica; trajetória interna da câmera; precisão factual e dicção do modelo atual. O hardware/backend do criador não foi medido: não prometemos tempo idêntico ao dele.

## Reversão

Pare o jogo. Execute exatamente o comando `python3 "…/REVERTER.py"` mostrado pelo reparador dentro de `state/launcher-backups/responsive-v035.…`. Ele restaura os arquivos que já existiam e remove os novos que não existiam, após validar o backup. Voz, modelos, chaves, música e progresso não são alterados. Em seguida rode o iniciador como antes. O backup não deve ser apagado antes do teste no telefone.
