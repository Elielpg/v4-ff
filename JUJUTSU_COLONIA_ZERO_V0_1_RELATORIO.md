# Relatório — Jujutsu Live · Colônia Zero 0.1.0

Data de referência: 17/11/2026, America/Sao_Paulo.
Estado: **primeira versão jogável**, com validação local. Testes físicos do
Realme GT3 e da conta TikTok ainda pendentes.

## Entrega

Projeto independente do PULSO ARENA, porta 3200, Node + Babylon.js. Cidade
procedural de aproximadamente 130 × 130 m, com combate no cruzamento central,
prédios iluminados, placas, barreira e sinais de perigo. Câmera com órbita,
foco no atacante/dupla e prioridade para técnicas fortes/domínios.

Sete personagens jogáveis: Gojo, Yuji, Megumi, Yuta, Kenjaku, Mahito e Jogo.
Sukuna é chefe NPC. Quatro técnicas configuradas por perfil: 28 dos jogadores e
quatro do chefe. Modelos e animações são procedurais estilizados, não rigs ou
cenas extraídos do anime.

Quem chega vira cidadão. Seguir ou enviar Rosa concede acesso e sorteia
personagem/time. Reserva FIFO, proteção inicial, retorno após eliminação,
comentários sobre os personagens, energia/vida por TAP TAP, apoio por share e
seis tipos de presentes estão implementados. Nas próximas entradas de quem já
tem acesso, LUTAR evita a necessidade de outro presente.

Cinco pontos por feiticeiro e um por cidadão; Kogane cobra 100 apenas quando
aceita uma regra válida. Refúgio, troca, resgate e fluxo têm limites definidos.
A lógica mantém a colônia aberta. Proteção, respawn, janela única de domínio e
regras temporárias são adaptações para a LIVE, não reprodução integral do mangá.

Há 27 falas neurais em inglês, renderizadas previamente em WAV, efeitos
sintetizados e uma trilha original de 32 segundos/120 BPM. O celular não precisa
instalar modelo neural ou API para falar. As vozes são interpretações originais,
não a dublagem oficial. Prioridade e descarte evitam acumular falas antigas.

## Testes automatizados

**40 testes passaram**, incluindo regras da colônia e bibliotecas reaproveitadas.
O registro completo está em `evidencias/TESTES.txt`.

- Chegada, proteção, entrada gratuita por follow, sorteio de facções e personagens.
- Fechamento de streak de Rosa, deduplicação, limite e promoção da reserva.
- Energia, cura gradual, reversão e cura guardada na eliminação.
- Quatro técnicas por personagem, energia, recarga e janela de domínio.
- Defesa/esquiva, controle por Azul e repulsão por Vermelho.
- Pontuação 5/1, crédito único, retorno e preservação de saldo.
- Custo/validação de regras, transferência conservativa e resgate da mesma equipe.
- Sinalização de perigo, cancelamento após derrota de Sukuna e congelamento offline.
- Presente sem alvo convertido em energia; mapeamento de IDs controlado.
- Persistência, projeto distinto, IDs duplicados e regras vigentes.
- Rotas HTTP, origem, pareamento e token oculto; ferramentas demo recusadas na LIVE.
- Todos os clipes referenciados existem e seus dados PCM têm sinal não silencioso.
- Atualizador recusa outra instalação antes de parar processos ou copiar código.

## Navegador e renderização

Chromium/SwiftShader na nuvem, não GPU do GT3:

- Sem erros JavaScript, console ou respostas HTTP inesperadas no roteiro final.
- Cidadão criado e entrada por follow confirmados pela API e pela interface.
- Roxo, Vazio Ilimitado e Santuário Malevolente ativados pelo caminho do jogo.
- Regra Fluxo aplicada e saldo de 100 descontado; total conquistado preservado.
- Arquivo de voz Santuário decodificado e iniciado em AudioContext; duração do
  buffer observada: 2.674 s.
- Tela 360 × 800 sem overflow horizontal no jogo ou menu.
- 36 ângulos da câmera em volta do centro: zero prédios opacos bloqueando Sukuna
  e centro do combate dentro da tela. Isso não significa mostrar todos os
  participantes ao mesmo tempo.
- 31 materiais de personagem prontos, sem fallback no ambiente testado.
- 160 eventos de efeito em sequência: 530 meshes antes e
  530 depois; pool de 48 elementos e quatro invocações.

As prévias em `previas/` são capturas reais do renderer com participantes de
exemplo. A imagem de personagens usa posicionamento preparado para inspeção.
Nenhuma delas comprova FPS do telefone ou uma conexão LIVE real.

## Áudio e phonk

Fixture sintética de oito segundos, 120 BPM, com acentos a cada 125 ms:
AudioWorklet ativo, **64 detectados, 64 entregues ao motor e
137 ações de ataque** de jogadores/chefe observadas. Esse total inclui vários
atores, não um golpe único por acento. Técnicas, controle e recargas alteram
quantos personagens atacam. Resultado não é taxa de acerto em músicas arbitrárias.

A trilha original foi composta por síntese, sem gravações comerciais. A geração
dos WAVs ingleses analisou RMS/duração; testes também leem os dados PCM. Ainda
precisa avaliar clareza, mixagem e volume na saída real da LIVE.

## Motor / CPU / memória

Simulação acelerada de **30 minutos virtuais**, sem renderização, com 1.000
usuários, 36.000 passos e 1.800 snapshots. Readmissões dos bots foram forçadas
pelo roteiro de teste para manter a carga.

- Tempo de parede nesta execução: 10018 ms.
- CPU user: 10389 ms; CPU system: 90 ms.
- RSS do processo Node: 33890304 → 53084160 bytes.
- Snapshot final: 485403 bytes; 1.000 usuários recuperados.
- Eventos recentes limitados a 40; coordenadas, vida, energia e pontos finitos.

Não é uma LIVE de 30 minutos reais e não mede temperatura, GPU ou bateria do GT3.
Dados completos: `evidencias/BENCHMARK_MOTOR.json`.

## Recuperação e integridade

O servidor filho de uma instalação temporária foi interrompido com SIGKILL.
O supervisor retomou em **2154 ms**, preservando 105 pontos, 150 HP,
250 curtidas, personagem Kenjaku e equipe. Esse teste não simula o Android
encerrando todo o aplicativo Termux. Registro: `evidencias/RECUPERACAO.json`.

O pacote possui manifesto SHA-256 de cada arquivo e validação CRC do ZIP. Uma
instalação limpa do ZIP é conferida antes da publicação; registros adicionais
ficam em `evidencias/INSTALACAO_EXTRAIDO.txt` e `TESTES_EXTRAIDO.txt`.

## Instalar / iniciar

```bash
cd ~ &&
python3 -m zipfile -e ~/storage/downloads/JUJUTSU_COLONIA_ZERO_V0_1.zip . &&
cd ~/JUJUTSU_COLONIA_ZERO_V0_1 &&
bash install.sh &&
bash start.sh
```

Abra http://127.0.0.1:3200/?v=0.1.0 e toque em TESTAR A COLÔNIA. Para a LIVE,
inicie a transmissão no app habitual e conecte o @ no painel. A fonte do
captador Android está incluída; configure porta 3200 no APK já instalado.

Para reverter uma atualização futura, pare a instalação, restaure seu backup
com código e dados e reinstale dependências. Esta primeira versão pode ser
removida/parada independentemente do PULSO. Não atualize uma pasta PULSO com ela.

## Pendências

Conexão real ao TikTok, captura real do GreenTube/Bluetooth, teste térmico e
LIVE prolongada no GT3; acabamento de modelos/poses; variações de técnicas e
confronto entre domínios. `PROBLEMAS_PENDENTES.md` detalha os limites. Kogane
é um sistema de regras permitido pelo motor, não um modelo que executa comandos.
