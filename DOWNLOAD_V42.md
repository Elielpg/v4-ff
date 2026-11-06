# Ben 10 LIVE V42 · IA e voz locais no Termux

[Baixar BEN10_LIVE_V42_TERMUX.zip](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_LIVE_V42_TERMUX.zip)

Integração para **conversa e voz neural no aparelho, sem chave de API**, preparada com perfil inicial para Realme GT3 ARM64 com 16 GB. O ZIP contém o projeto e o instalador; os pesos são baixados separadamente no próprio celular.

Usa llama.cpp com Qwen3-4B-Instruct-2507 Q4_K_M para conversar e Piper pt_BR-faber-medium para falar. Piper roda em um Debian isolado chamado `ben10-ai`, sem substituir outro ambiente Debian. A personalidade continua sendo Ben criança do clássico. A voz recebe só a frase, sem anunciar suas características.

A vantagem é dispensar chave e cota de provedor. **Não há garantia de qualidade melhor que Gemini**, nem de uma voz igual à dublagem do Ben. Velocidade, consumo e timbre precisam ser medidos com a LIVE no seu GT3.

## Atualizar e instalar

Baixe o ZIP e entre na pasta anterior (ajuste se usar outro caminho):

```sh
cd ~/ben10-v34/game
bash backup.sh
bash update.sh --archive ~/storage/downloads/BEN10_LIVE_V42_TERMUX.zip
bash local-ai.sh install
bash local-ai.sh start
```

Nesta primeira configuração, não use `--start` no atualizador: `local-ai.sh start` inicia os modelos e o jogo juntos. Instalação nova: extraia o ZIP, entre em `game` e rode `bash install.sh` antes dos comandos locais.

A primeira instalação usa internet, baixa vários GB, compila o llama.cpp e instala as bibliotecas do Piper. Reserve pelo menos **8 GB livres**. Os arquivos são conferidos por revisão e hashes; pesos e logs ficam em `~/.local/share/ben10-local-ai`, fora do ZIP e do backup comum do jogo.

Depois de instalar, conversa e voz rodam sem internet e sem chave. **TikTok, eventos e fotos dos visitantes continuam precisando de internet.**

Nas próximas vezes:

```sh
cd ~/ben10-v34/game
bash local-ai.sh start
```

Mantenha a sessão aberta, abra o endereço indicado e toque em **♫**. Confira **V42 / 42.0.0**. O comando seleciona conversa e voz locais no painel sem apagar chaves antigas.

## Testar e diagnosticar

Em **LIVE → IA e voz**, use **Verificar serviços locais**, **Testar conversa selecionada** e **Testar voz IA**. O modo local não exige preencher chaves. Só indica que a IA está respondendo após uma resposta válida.

```sh
bash local-ai.sh status
```

Logs: `~/.local/share/ben10-local-ai/logs/conversa.log` e `voz.log`. Uma falha local informa o problema e mantém legendas/frases básicas; não muda automaticamente para Gemini, ElevenLabs ou a voz do aparelho.

Se precisar reduzir consumo, pare a sessão com Ctrl+C e instale o perfil de 1.5B:

```sh
bash local-ai.sh install --model light
bash local-ai.sh start
```

O perfil leve pode gerar respostas menos precisas. O inicial usa quatro threads para conversa e duas para voz; não foi configurada aceleração GPU Android.

## Recursos preservados

Avatares, nome/foto, recepção, câmera de chegada, cumprimento de seguidores, prioridade de presentes, memória recente, energia 3D no Omnitrix, desbloqueios por curtidas, metas, relógio original, poderes, ranking, ícones e dia/tarde/noite. Gemini e ElevenLabs ficam opcionais no painel. O atualizador preserva chaves, `.env`, modelos 3D personalizados e progresso.

## Verificação e limites

**182 testes aprovados**, incluindo o worker Python e hashes. A integração HTTP verificou pergunta pública e áudio sem chave, seleção persistente, personalidade do clássico e falha sem troca para nuvem. O Chromium verificou painel sem chaves, resposta, reprodução de WAV e layouts.

A revisão fixada do llama.cpp foi compilada e seus argumentos conferidos em **Linux x86_64**. Isso não é um teste de compilação no Android. Não foram baixados os pesos GGUF/ONNX nem executada inferência neural real nesta validação; os hosts de pesos não estão disponíveis na rede cloud. O instalador verifica esses repositórios e arquivos no telefone. LLM/Piper foram simulados por serviços locais e áudio WAV sintético, que não mede qualidade ou velocidade.

Não houve teste em GT3/Android físico ou LIVE real. Valide os dois testes do painel no celular antes da transmissão. Guia, fontes e relatórios: `game/docs/V42_IA_LOCAL_TERMUX.md`, `game/reports/v42/`. Créditos 3D: `game/docs/MODEL_CREDITS.md`; cartões/licenças dos pesos são baixados junto com eles.

[Checksum SHA-256](BEN10_LIVE_V42_TERMUX.zip.sha256)
