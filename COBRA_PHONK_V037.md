# Cobra do PHONK — adaptador 0.3.7

Data: 27/11/2026. Jogo original: Snake Reyers 0.1.9, de Thiago Reyes.

Esta entrega altera o visual por uma extensão própria em tempo de execução. Não extrai fontes privadas, modifica o executável/PCK, troca modelos, altera regras, controla a câmera ou substitui IA e voz.

## Entrega e uso

Com o jogo parado por Ctrl+C, execute:

```sh
cd ~/SNAKE_REYERS_TERMUX_0_2 &&
curl -fL 'https://raw.githubusercontent.com/Elielpg/v4-ff/main/SNAKE_REYERS_PHONK_V037.sh' -o "$HOME/snake-phonk-v037.sh" &&
bash "$HOME/snake-phonk-v037.sh" "$PWD" &&
bash start.sh
```

O script ativa o tema apenas na primeira aplicação sem configuração PHONK anterior. Reaplicar preserva as escolhas. Não reinicializa progresso, músicas, credenciais, vozes, modelos, perfil do GT3 ou seleção Vulkan/OpenGL. Quem já inicia com `SNAKE_RENDERER=mobile bash start.sh` pode manter esse comando.

Abra http://127.0.0.1:9393 e confira Termux 0.3.7. Em **Cobra do PHONK · cores e batidas**, configure:

- Ativação e cor escura da cobra.
- Três cores principais, intensidade do brilho e sensibilidade do detector.
- Pulsos ativados/desativados e troca de cor a cada 1, 2, 4, 8 ou 16 eventos detectados.
- Troca por batida, por faixa ou cor fixa.
- Paleta específica para cada música da biblioteca, com opção de voltar às cores gerais.
- Detecção da música do jogo ou relógio manual de 40 a 300 BPM, calibrado por quatro toques.

A primeira ativação exige reabrir a janela do jogo. Depois, salvar cores e desligar/ligar o tema não exige reiniciar IA, áudio ou o jogo. O arquivo é relido a cada 0,5 segundo; atrasos de renderização podem aumentar esse prazo.

**Outros aplicativos:** o complemento não captura microfone, GreenTube nem áudio de outro aplicativo Android. Fone e Bluetooth não são fontes para este detector. Para acompanhar automaticamente a música, envie a faixa pela biblioteca e toque-a pelo jogo. Para som externo, marque BPM/fase manualmente; é uma estimativa que pode precisar de correção durante a música.

## O que mudou

A cobra mantém sua geometria, rig, olhos, dentes e movimento da boca. A extensão aplica um material próprio escuro com contornos roxos e brilho suave. O terreno mantém texturas e geometria, com tonalidade escura. Há sinalização neon nas bordas e fundo escuro, sem adicionar sombras dinâmicas ou luzes reais para cada pulso.

O shader evita linhas muito densas para reduzir cintilação. Os detalhes próprios anteriores continuam em lotes; o tema acrescenta sete malhas estáticas simples e reaproveita os materiais da sinalização existente. Isso limita o trabalho novo, mas não prova ganho de FPS no telefone.

O apelido da cobra na conversa local passa a ser Cobra do PHONK quando o tema está ativo, preservando o crédito do criador e a instrução de responder à pergunta antes das brincadeiras. Não foi substituído o Qwen nem o motor de voz.

## Arquitetura

| Arquivo | Responsabilidade |
| --- | --- |
| `snake_termux/phonk.py` | Configuração validada, persistência atômica, catálogo público de faixas e endpoints locais. |
| `snake_termux/phonk_ui.js` | Controles privados do operador, cores por faixa e calibração manual. |
| `snake_termux/godot/phonk_scene.gd` | Carrega a cena original pela API pública e instala a extensão própria. |
| `snake_termux/godot/phonk_runtime.gd` | Materiais reversíveis, ambiente por câmera, detector no canal Music e telemetria local. |
| `snake_termux/godot/phonk_beat.gd` | Detecção adaptativa de transientes de grave e agudo, com intervalo mínimo de 85 ms. |
| `snake_termux/godot/phonk_skin.gdshader` | Material próprio da cobra, cor base, contorno e pulso. |
| `scene_graphics.py` / `.gd` | Mantêm o controle gráfico anterior; permitem tema sem forçar o complemento gráfico. |
| `native.py`, `integration.py` | Instalação opcional das rotas e inclusão do painel, sem substituir o motor original. |
| `tests/test_phonk.py` | Validação, preservação, modos de abertura, biblioteca e atualização/reversão. |
| `tools/test_phonk_audio.py` | Regressão real de mistura/análise de áudio com cena e sinal sintéticos próprios. |

O analisador FFT de 1024 amostras é inserido somente no bus **Music** já existente. A voz continua em **Voice**. Não há leitura do mixer Master nem mudança de volume, driver ou rota de reprodução. Desativar remove apenas o efeito criado por esta extensão e restaura os materiais e ambientes anteriores.

A faixa atual é identificada pelo estado público de execução do jogo e pelo catálogo da biblioteca. Configurações por música usam identificadores internos, não caminhos enviados pelo navegador. Não são aceitos scripts, comandos, URLs ou caminhos arbitrários no painel.

As cores têm aplicação em materiais e sinalização; os modelos dos espectadores e seu figurino permanecem originais. A análise não é uma transcrição nem um identificador de músicas. O contador de pulsos não representa necessariamente o BPM: uma música pode ter mais de um transiente por tempo.

## Evidências e limites

- 337 testes Python passaram, incluindo os 67 testes originais preservados; três testes Node passaram.
- No Godot 4.7 real com PulseAudio privado, um sinal sintético com 16 ataques de grave em quatro segundos produziu 15 detecções no intervalo medido. Isso testa o mecanismo; não demonstra a mesma precisão em todas as músicas phonk.
- Silêncio e áudio somente no canal Voice não geraram pulsos. Parar a música interrompeu a detecção automática.
- A paleta de outra faixa foi selecionada corretamente. Desativar restaurou material e ambientes das duas câmeras após alternar entre elas, preservando um efeito de áudio previamente existente.
- O relógio manual funcionou sem fingir captura externa. As rotas Music e Voice permaneceram iguais.
- O jogo original abriu com a extensão, tocou uma faixa convertida pela biblioteca, usou sua paleta e iniciou/finalizou uma fala Piper real. A geração de texto nesse ensaio foi controlada, não um benchmark de Qwen.
- Controles móveis verificados no Chromium, com persistência e sem transbordamento horizontal.

Registros e capturas reais estão em `docs/evidence/PHONK_*` e `ALL_TESTS_V037.xml`. A prévia é do jogo original em execução com a extensão, não da arte conceitual anterior.

Os ensaios foram realizados em Linux, com renderização por software. **Não houve teste físico no Realme GT3, transmissão TikTok, medição térmica ou comprovação de ganho de FPS/latência no celular.** Os testes não autorizam afirmar que a LIVE ficou estável por horas. Ainda é necessário conferir no aparelho o FPS, a temperatura, o som e a sincronização com suas faixas e captura.

## Backup e reversão

Antes das alterações foi guardado um backup do adaptador de desenvolvimento. No telefone, o atualizador cria `state/launcher-backups/phonk-v037.XXXXXX` com os arquivos anteriores, um manifesto e `REVERTER.py`. O caminho exato aparece no terminal.

Para reverter: pare a sessão com Ctrl+C e execute o comando `python3 "/caminho/do/backup/REVERTER.py"` mostrado pelo atualizador. Ele restaura arquivos/configurações anteriores e remove os arquivos novos, sem apagar modelos ou a instalação original. Não execute com o painel ainda ouvindo na porta 9393.

Para voltar somente ao visual anterior, desmarque **Ativar tema** e salve. O complemento gráfico 0.3.6 continua com sua própria configuração independente.

## Pendências

1. Validar FPS/áudio/temperatura e estabilidade com LIVE real no GT3, comparando tema ligado/desligado na mesma câmera e resolução.
2. Ajustar a sensibilidade com as faixas reais; masterização muito comprimida pode exigir sensibilidade diferente. Transientes fracos/rápidos podem ser perdidos.
3. Captura de áudio de outros aplicativos exigiria integração Android própria e autorização de captura. Não está incluída nesta versão.
4. A cor/luz dos modelos originais de espectadores e presentes não é substituída pelo tema. A intervenção intencionalmente preserva sua identificação e expressões.
5. A câmera e os gargalos internos do jogo original continuam sujeitos ao seu funcionamento; a extensão não promete corrigir travamentos internos ou executar a IA na GPU/NPU.
