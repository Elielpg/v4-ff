# Realme GT3 e Cofra Studio — complemento 0.3.4

Data de referência: 25/11/2026. Este pacote atualiza somente o adaptador independente. O Snake Reyers original, modelos instalados, progresso, biblioteca musical, chaves e provedor de voz permanecem no aparelho.

## Diagnóstico sustentado pelos registros

O usuário já confirmou o jogo em Zink/Turnip, com Adreno reconhecida e imagem aberta no Termux:X11. Portanto, não é correto afirmar que o jogo inteiro ainda está sendo desenhado pela CPU. OpenGL → Zink → Vulkan continua sendo uma camada adicional, e a lógica do jogo pode limitar a velocidade mesmo com GPU disponível. O consumo total de RAM não identifica esse limite.

O iniciador local do Qwen usava três threads, contexto 2048 e uma requisição por vez. Ele não possui offload GPU/NPU nesta configuração. O Piper usa ONNX CPU, com até duas threads e espera ativa desativada. Aumentar todos os limites ao mesmo tempo pode prejudicar áudio e renderização; não há razão técnica para ocupar todos os 16 GB ou todos os núcleos permanentemente.

Os diagnósticos atuais do GT3, versão do Android e comparação com/sem transmissão foram solicitados, mas ainda não recebidos. As causas possíveis incluem thread principal, carga de inferência, GPU, temperatura e captura. **Não foi identificada uma única causa física definitiva nem comprovado ganho no GT3 nesta entrega.**

## O que foi implementado

| Parte | Alteração | Evidência e limite |
|---|---|---|
| Perfis | GT3 LIVE 720×1280/30; detalhe 864×1536/30; alto 1072×1920/30, além dos perfis anteriores | Resolução continua protegida pela confirmação da GPU. 30 é limite, não FPS obtido. 1072 respeita a largura múltipla de 8 do X11. |
| CPU | Qwen configurável entre 1 e 4 threads; Piper 1 ou 2; prioridade reduzida opcional só do Qwen próprio | Teste de início verifica argumentos e prioridade real de processo controlado. Não altera processos externos, Android global ou afinidade. |
| Perfil inicial do reparo | GT3 LIVE; Qwen 3/3 threads com nice +3; Piper 2; modelos inalterados | Aplicado uma vez com backup; não reaplicado sobre escolhas posteriores. Não é um benchmark do melhor ajuste possível. |
| Métricas | FPS do log atual, renderizador observado, CPU por processo/thread, RAM, CPUs permitidas, falhas maiores de página e sensores disponíveis | Dados ausentes ficam desconhecidos. GPU é o aparelho inteiro. CPU 100% significa um núcleo ocupado. Proot e seus filhos são separados. |
| Gravação de diagnóstico | Seis amostras em cerca de 15 s por thread do servidor, JSON baixável | Continua com Chrome em segundo plano; não depende do temporizador da página. Somente um trabalho e fila limitada. |
| Vulkan direto | Seletor opcional Mobile/Vulkan, separado de OpenGL, aplicação ao reabrir a janela | Arena original carregou e processo encerrou corretamente no Godot Linux com Lavapipe. **Esse teste é software, não Adreno.** Aparência, desempenho e estabilidade no GT3 não foram validados. Não é selecionado pelo reparo. |
| Áudio de transmissão | Ponte PCM do mixer privado do jogo, loopback, autorização temporária em cabeçalho e um leitor por vez | Teste real Godot/Piper/Pulse confirmou sinal e liberação ao desconectar; jogo continuou aberto. Não acessa o PulseAudio compartilhado. |
| Cofra Studio | APK Android independente, H264 por hardware, 720p/4 Mbps ou 1080p/6 Mbps a 30 FPS, AAC estéreo 48 kHz, teste local e RTMP/RTMPS | Compilação/assinatura, testes JVM e receptor FFmpeg passaram. Captura/encoder no Android físico continuam pendentes. |

O motor de voz atual não foi trocado. Chaves de nuvem, personalidade, memória, fila social, presentes e conexão por @ continuam disponíveis. Não se promete que a alteração de recursos melhorará a qualidade perceptiva da voz; engasgo por falta de tempo de CPU e timbre/pronúncia são problemas diferentes.

## Atualizar a instalação existente

Encerre o iniciador do jogo com Ctrl+C na sessão que o executa. Mantenha a sessão Tor se ela já estiver funcionando; não inicie outra cópia.

```sh
cd ~/SNAKE_REYERS_TERMUX_0_2 &&
curl -fL 'https://raw.githubusercontent.com/Elielpg/v4-ff/main/SNAKE_REYERS_GT3_STUDIO_V034.sh?v=0.3.4' -o "$HOME/snake-gt3-v034.sh" &&
bash "$HOME/snake-gt3-v034.sh" "$PWD" &&
bash start.sh
```

O reparo verifica que a porta 9393 está desocupada. Não encerra processos alheios. Na primeira aplicação, guarda as duas configurações anteriores e os arquivos substituídos em `state/launcher-backups/gt3-studio-v034…`; o caminho aparece no terminal e em `state/gt3-v034-applied.json`. Reaplicar preserva escolhas feitas posteriormente no painel. Não baixa outro modelo, não reinstala driver e não ativa transmissão.

Quem usar o ZIP completo deve continuar utilizando a própria cópia original licenciada do Snake Reyers e o procedimento de instalação do README. Não é preciso reinstalar para aplicar este reparo.

## Como ajustar e medir no celular

1. Abra o jogo e aguarde o carregamento da arena. Confirme a voz antes de transmitir.
2. No painel 127.0.0.1:9393, seção **GT3 · recursos e diagnóstico**, clique em **Iniciar medição de 15 segundos**. Volte imediatamente ao Termux:X11, deixe o jogo visível e faça uma interação com fala.
3. Retorne ao painel e baixe `COFRA_GT3_DIAGNOSTICO.json`. Registre também se estava transmitindo, a versão do Android, modo de captura e se houve som engasgado.
4. Compare uma única mudança de cada vez, na mesma cena e condição: perfil gráfico; depois 2/3/4 threads do Qwen; depois captura. Salvar CPU exige reiniciar o iniciador e só afeta serviços que ele próprio cria. Se o Qwen/Piper já estava rodando fora desse iniciador, ele é preservado e esses limites não são reaplicados.
5. Vulkan direto é um ensaio opcional. Salve o seletor, feche e abra apenas a janela pelo painel. Se fechar, perder imagem ou piorar, selecione OpenGL/Zink novamente e reabra. Não desinstale nada e não altere progresso. Se precisar forçar a opção antiga no terminal: `SNAKE_RENDERER=gl_compatibility bash start.sh`.

Menor tempo de espera da IA não significa necessariamente melhor FPS; uma configuração mais agressiva pode reduzir latência de texto e causar áudio irregular. Se houver sensor térmico indisponível, isso não comprova temperatura baixa. Compare também depois de 15–30 minutos; o complemento não remove proteções térmicas do aparelho.

## Transmitir sem a bolha do TikTok

Use o APK **Cofra Studio BETA**, separado do Termux. Pare o compartilhamento de tela do TikTok e mantenha o monitor de comentários por @ no painel. Faça primeiro o MP4 local de 10 s: sem URL/chave, sem conexão de transmissão. Para som, comece com **Jogo e voz**, que usa a ponte do mixer; depois teste **Jogo + músicas** se necessário.

Android 14+ permite escolher apenas Termux:X11 na autorização; Android 10–13 pode capturar o display inteiro. O app oferece cortes e mantém a proporção. Não desenha bolha flutuante; os indicadores de privacidade do Android continuam no aparelho. Os controles protegidos não são uma fonte de vídeo; abrir o painel durante captura da tela inteira pode escurecer o envio.

Após ouvir e assistir ao teste, insira sua URL e chave **somente no app** e autorize a transmissão. H264 por hardware é exigido pelo app, mas o funcionamento do encoder deve ser confirmado no teste físico. RTMP não impede que o TikTok recodifique o vídeo. A estabilidade também depende de upload sustentado. Não foi iniciada uma LIVE pública nesta entrega.

Detalhes, permissões e compilação estão em `COFRA_STUDIO_GUIA.md`. A prévia privada e o contador de espectadores não são elementos do jogo. O contador depende do evento atual de audiência, sem confundir visualizações totais com pessoas assistindo agora.

## Reversão

Para reverter só o renderizador, use OpenGL/Zink no painel; não precisa reverter a instalação. Para voltar aos perfis anteriores, selecione-os no painel. Configuração anterior ao reparo está no backup indicado em `state/gt3-v034-applied.json`.

Para voltar o código inteiro à versão 0.3.3 conhecida, pare o jogo e aplique o reparo antigo pelo commit imutável, sem executar a seleção de provedor:

```sh
cd ~/SNAKE_REYERS_TERMUX_0_2 &&
curl -fL 'https://raw.githubusercontent.com/Elielpg/v4-ff/a163e7e708574b69710f8478695e372e3b4386bd/SNAKE_REYERS_CONVERSA_LOCAL_V033.sh' -o "$HOME/snake-voltar-v033.sh" &&
bash "$HOME/snake-voltar-v033.sh" --files-only "$PWD"
```

Em seguida, se quiser restaurar também as opções anteriores (o jogo deve estar parado):

```sh
python3 - <<'PY'
import json
from pathlib import Path
root=Path.cwd().resolve();state=root/'state'
m=json.loads((state/'gt3-v034-applied.json').read_text())
b=Path(m['settings_backup']).resolve()
assert b.is_relative_to((state/'launcher-backups').resolve())
presence=json.loads((b/'gt3-config-presence.json').read_text())
for name in ('presentation-config.json','performance-config.json'):
    target=state/name
    if presence[name]: target.write_bytes((b/name).read_bytes())
    else: target.unlink(missing_ok=True)
(state/'render-config.json').unlink(missing_ok=True)
(state/'gt3-v034-applied.json').unlink()
print('Opções anteriores restauradas. Execute bash start.sh')
PY
```

O APK é independente: encerrar/desinstalar Cofra Studio não apaga jogo, modelos, músicas ou progresso.

## Pendências para aceitar como estável no GT3

- Diagnósticos com/sem captura e com fala simultânea.
- Teste MP4 do APK: imagem real, permissão, áudio, cor, enquadramento e sincronismo.
- Compatibilidade Green Tube/áudio externo e Bluetooth no Android utilizado.
- Teste de LIVE privada/controlada e posterior longa duração, calor e consumo.
- Comparação visual Vulkan versus OpenGL, sem substituir automaticamente a opção já funcional.
- Captura de nomes por pronúncia e conhecimento de respostas não foram reavaliados nesta etapa.
