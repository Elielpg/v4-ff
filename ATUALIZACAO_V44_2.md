# Ben 10 · Clareira LIVE V44.2

Esta atualização mantém o Qwen local, o cenário, personagens, poderes, progresso, ranking, presentes e integrações. A voz padrão passa a ser Piper pt-BR, sem clonagem ou referência de ator. Os arquivos antigos permanecem no aparelho para reversão; não são carregados no fluxo padrão.

## Voz e forma de falar

Ao sair da clonagem, o instalador prefere a voz Cadu já instalada. Uma seleção Piper explícita anterior é respeitada, inclusive os comandos para trocar de voz. Se faltar a voz necessária, pode baixar cerca de 63 MB uma vez, usando o catálogo público com revisão e hashes verificados. Se o download falhar e existir outra voz Piper brasileira válida, o preparador informa qual foi selecionada. Não baixa de novo o Qwen e não muda chaves ou o manifesto dos modelos.

O perfil Claro usa ritmo ligeiramente mais lento, frases segmentadas e pausas de 180 ms entre trechos. O perfil Animado usa pausas de 150 ms e ritmo mais próximo do original. Não há filtro para imitar a voz do dublador. As adaptações de pronúncia de XLR8 e TAP TAP ficam apenas no Piper; legendas e nomes no texto original permanecem. Não existe troca global de R por L.

Em LIVE → Configurações → V44, escolha o estilo da voz e reinicie a sessão para aplicar. A geração continua inteiramente local após a preparação inicial. Não é usada a voz do aparelho.

## Falas entre as interações

O Ben tem 26 comentários curtos e originais sobre o clássico, aliens, aventuras e participação do chat. Eles se alternam quando a fila está livre, por padrão com intervalo de 18 segundos. O intervalo pode ser ajustado entre 12 e 90 segundos ou desligado. O controle geral das falas automáticas precisa estar ativado.

Os interlúdios usam texto preparado, sem ocupar o Qwen com inferências extras. O Qwen continua respondendo às perguntas normalmente. Um comentário, presente ou outra fala com prioridade interrompe somente o interlúdio; a resposta de um espectador não é cortada por um presente. A frase automática interrompida é descartada. Perguntas e presentes seguem na fila.

O cancelamento interrompe o áudio no navegador e libera o consumidor. Uma síntese neutra que já começou pode terminar no serviço e ficar no cache; seu áudio cancelado não é reproduzido. As falas de TAP TAP continuam agrupadas, não existe uma fala por toque.

## Menos painéis sobre o cenário

A tela abre em modo compacto. Energia e Omnitrix ocupam duas faixas menores; presentes mantêm fotos; a missão vira uma barra com progresso e o ranking mostra duas posições. Os comandos continuam acessíveis e o botão Expandir painéis restaura os detalhes. A preferência é salva neste navegador. Modelos e câmera não foram substituídos.

## Instalar

O ZIP atualiza V43.7/V43.8/V44 existentes. Ele contém código, imagens, testes e documentação. Não é uma instalação nova; depende dos recursos, bibliotecas Piper e modelos já instalados pelo projeto.

Baixe BEN10_ATUALIZACAO_V44_2.zip em Downloads. Execute:

```bash
cd ~/ben10-v34/game &&
python3 -m zipfile -e ~/storage/downloads/BEN10_ATUALIZACAO_V44_2.zip "$TMPDIR/ben10-v44-2-update" &&
bash "$TMPDIR/ben10-v44-2-update/ATUALIZAR_BEN_V44_2.sh" &&
bash local-ai.sh start
```

Abra http://127.0.0.1:3000/?v=44.2.0 e toque em ♫. Confira 44.2.0 no topo e a conexão TikTok. A preparação da voz pode precisar de internet uma vez; as próximas sessões funcionam com os arquivos locais.

Para iniciar depois: `cd ~/ben10-v34/game && bash local-ai.sh start`.

Se a preparação parar por rede, repita `node scripts/local-ai/plain-voice-plan.js --ensure` dentro da pasta do jogo e depois inicie a sessão. Confira o nome da voz e o estado dos serviços no painel.

## Backup e reversão

O instalador imprime o backup em data/backups/before-v44-2-.../. COMO_REVERTER.txt dentro dele traz o comando exato para restaurar o código anterior. Chaves, progresso e modelos atuais permanecem. O manifesto antigo de seleção da voz não é reescrito, permitindo que o código anterior retome a seleção anterior. A voz Cadu adicionada pode continuar no disco. Não aplique reparos históricos sobre esta atualização.

## Estabilidade e limites

A recuperação limitada do supervisor continua. O identificador de processos passou a reconhecer o Piper pelos binds desta instalação quando o proot muda de diretório, sem encerrar processos externos. Uma falha de voz continua separada do jogo.

O retorno ao prompt e travamento posterior da página relatados no GT3 ainda não tiveram sua causa original confirmada. O supervisor não impede o Android de encerrar todo o Termux. Rodadas de missão continuam sendo da sessão; ranking, fila e desbloqueios usam suas persistências existentes. Confira a conexão TikTok depois de um reinício do servidor.

Há medições reais do Piper neutro em CPU Linux, sem clonagem: dez WAVs válidos em dois perfis. O perfil Claro gerou as cinco frases em 0,37–0,60 s, com duração de 2,98–6,09 s. Isso não é uma medição do Realme GT3. Clareza percebida, R/L e timbre precisam de escuta humana no aparelho; não foi atribuída uma nota automática.

Os registros desta versão ficam em reports/v44_2/. Testes de navegador usam voz sintética, não a voz clonada. A validação prolongada com LIVE no GT3 permanece pendente.

## Verificações desta entrega

277 testes passaram, sem falhas nem casos ignorados; lint e build também passaram. No Chromium, um comentário interrompeu um interlúdio já em reprodução e recebeu sua resposta. O teste também conferiu geração de texto, cache sem mistura de nomes, confirmação após o áudio, modo compacto/expandido, fotos e efeitos 3D. Foram usados texto e áudio de fixture no navegador. Os tempos desse teste não representam a latência da voz real no telefone.

O ZIP foi extraído e aplicado sobre uma cópia da V44.1. A preparação selecionou Cadu sem clonagem e sem reescrever o manifesto; o servidor serviu os recursos, respondeu a uma conta pelo fluxo do chat e preservou 321 curtidas. Todos os hashes do payload e dos arquivos restaurados foram conferidos, incluindo reversão. Esse teste não executou proot nem uma LIVE real no telefone. As prévias finais passaram em 320/412/1280 pixels, sem sobreposição entre tela cheia e controles.
