# 0.4.0 — Cobra original, cenário e fila da LIVE

Esta revisão desativa o tema PHONK na primeira aplicação e abre novamente o jogo com os materiais, as cores e os modelos originais. Não altera o executável, o pacote Godot, as regras, os presentes, a IA escolhida ou a voz instalada. Reaplicar o atualizador preserva as escolhas feitas depois dessa primeira aplicação.

## Comportamento da fila

- **Presentes recebidos:** têm prioridade sobre comentários e boas-vindas e são atendidos pela ordem de chegada, independentemente do valor. A fala em andamento termina normalmente. Cada evento recebido tem seu próprio agradecimento; um combo informa a quantidade normalizada pelo monitor original.
- **Persistência:** um registro SQLite privado é confirmado em disco antes de o evento sair da fila original. Não existe corte de 12 presentes nem expiração dos recibos pendentes. O recibo só termina depois da confirmação de fim de fala enviada pelo jogo.
- **Comentários e perguntas:** até três aguardando, contando preparação e áudio pronto; a fala já iniciada fica fora desses três. Se estiver cheio, a nova mensagem é rejeitada para resposta. Ela não substitui uma pergunta aceita e não é recuperada depois. A mesma pessoa pode enviar novamente quando houver vaga.
- **Boas-vindas:** usam o evento real `data-member` do monitor TikTok. As entradas próximas ficam em um grupo, com até três nomes na frase e a quantidade adicional. Reentradas da mesma pessoa em menos de dois minutos não repetem a saudação. Presentes e perguntas vêm primeiro. O painel permite desligar as boas-vindas.
- **Carga da IA:** perguntas continuam passando pelo provedor selecionado. Agradecimentos e boas-vindas usam frases locais curtas, com o nome falado já normalizado, sem solicitar uma resposta ao modelo.

Se um presente chegar enquanto uma resposta estiver preparada, o agradecimento passa na frente. O personagem do próximo presente não deve roubar a câmera durante uma fala já iniciada. Músicas especiais, sequências manuais e diálogos emparelhados mantêm as proteções originais de reprodução.

## Falha na voz e recuperação

Uma falha de preparação não conta como agradecimento entregue. Há no máximo três tentativas automáticas, com intervalo. Depois, a primeira pendência fica bloqueada e o painel oferece **Tentar novamente o agradecimento pendente**. Corrija ou teste a voz antes de usar esse botão; não existe reinício infinito.

Reiniciar a sessão limpa comentários antigos e mantém os presentes pendentes. Recuperar a voz não reaplica o efeito de um presente que já começou a ser processado. O banco fica ao lado da configuração privada da IA, em `termux_live_queue.sqlite3`, com arquivos protegidos e histórico concluído limitado. O painel expõe contadores, não o conteúdo das conversas.

Há limites que dependem de outros componentes: o programa não recupera eventos que o TikTok nunca entregou, nem presentes descartados antes desta revisão. Se o processo terminar exatamente entre o efeito no jogo e sua confirmação, a execução do efeito fica incerta. Se a confirmação final de áudio se perder, pode haver repetição do agradecimento ao recuperar; o recibo não é apagado silenciosamente. A confirmação do jogo indica término da reprodução, não que o volume do Android estava audível.

## Cenário e estabilidade

O complemento acrescenta oito jardineiras com flores e um pequeno arco de boas-vindas. Ficam fora das casas jogáveis. São quatro lotes de geometria estática adicionais e um letreiro, sem novos emissores de partículas, física ou mapas de sombra. O cenário anterior continua presente.

O modo de escala fixa e a proteção contra leitura de texturas da GPU agora funcionam também com a aparência original. O motor OpenGL/Vulkan e a resolução já escolhidos são preservados. Isso não comprova a solução do congelamento relatado no GT3; a validação física continua pendente.

## Arquivos envolvidos

| Arquivo do adaptador | Responsabilidade |
| --- | --- |
| `snake_termux/live_queue.py` | Recibos, limite de comentários, grupos de entrada, FIFO, recuperação e tentativas limitadas. |
| `snake_termux/live_policy.py` | Integra a fila ao monitor, ao trabalhador original de eventos, ao TTS e à confirmação do jogo. |
| `snake_termux/live_load.py` | Adia o foco do próximo presente até sua fala e preserva os nomes nas saudações agrupadas. |
| `snake_termux/scene_graphics.py` | Mantém o modo estável sem depender do tema e deixa de anexar o tema quando desativado. |
| `snake_termux/godot/scene_graphics.gd` | Decoração estática nas bordas. Usa APIs públicas do Godot. |
| `snake_termux/ui.js` | Contadores, boas-vindas, retomada de agradecimento e controles de cenário. |
| `snake_termux/original_update.py` | Preferências iniciais reversíveis, sem substituir chaves, modelos ou voz. |
| `tools/restore_adapter.py` | Restaura os arquivos e somente as três preferências de fila alteradas. |

## Instalar na cópia que já funciona

Pare a execução anterior com **Ctrl+C**. Depois:

```sh
cd ~/SNAKE_REYERS_TERMUX_0_2 &&
curl -fL 'https://raw.githubusercontent.com/Elielpg/v4-ff/main/SNAKE_REYERS_ORIGINAL_FILAS_V040.sh' -o "$HOME/snake-original-v040.sh" &&
bash "$HOME/snake-original-v040.sh" "$PWD" &&
bash start.sh
```

Atualize a página do painel e confira **Termux 0.4.0** e **Fila da LIVE · presentes primeiro**. A janela deve ser reaberta para restaurar completamente o visual original. Continue usando seu comando habitual com `SNAKE_RENDERER=mobile` se ele já era necessário no aparelho.

O ZIP completo é o adaptador; o jogo original que você já tem continua necessário. Não precisa reinstalar modelos, drivers ou dependências para aplicar o script acima.

## Backup e reversão

O atualizador informa a pasta de backup em `state/launcher-backups`. Ela contém `REVERTER.py`. Para voltar à revisão anterior, termine os agradecimentos pendentes, pare o jogo e execute:

```sh
python3 /caminho/do/backup/REVERTER.py
```

As alterações posteriores de voz, chaves e portas são preservadas. O banco de recibos não é removido pela reversão; versões anteriores não sabem consumir esse banco.

## Validação e pendências

Veja `docs/evidence/ORIGINAL_FILAS_VALIDACAO_V040.json`, os relatórios de testes Python/Node e as capturas desta revisão. A validação integrada usa o jogo original Godot 4.7, Piper real, PulseAudio privado e Chromium no Linux, com eventos simulados. Não é uma LIVE real nem um benchmark do Realme GT3.

Na integração, dois presentes tiveram seus efeitos preservados e suas falas terminaram na ordem recebida; em seguida terminaram três comentários e uma saudação com dois nomes. O quarto comentário foi rejeitado. Os testes também cobrem rajada de 150 presentes, reinício, comentários concorrentes, falha imediata da voz, prioridade sobre áudio preparado, instalação repetida e reversão.

**Transmissão própria por RTMP/RTMPS e overlays ficam para a próxima etapa.** Nenhuma transmissão, captura de tela ou publicação TikTok é iniciada por esta revisão. O APK de transmissão já existente continua separado; este pacote não anuncia uma nova versão do APK.

Jogo original: **Snake Reyers, de Thiago Reyes**. Esta revisão distribui somente o adaptador independente e suas evidências, sem o executável ou recursos extraídos do jogo.
