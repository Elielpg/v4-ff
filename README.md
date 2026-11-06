# Ben 10 · Clareira LIVE

[Correção V42.2 e comandos para continuar a instalação](DOWNLOAD_V42_2.md)

O instalador agora reconhece `termux.sources` (Deb822), preserva `Signed-By` e a fonte principal da edição instalada. Não seleciona um endereço padrão de outra edição quando não reconhece a configuração. Fontes extras ficam fora dos comandos; assinaturas continuam verificadas.

[Pacote completo V42.2](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_LIVE_V42_2_TERMUX.zip) · [Reparo pequeno](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_REPARO_IA_V42_2.zip)

Para o aparelho que já confirmou `apt-get update` com seu `termux.sources`, o guia inclui a instalação direta das quatro ferramentas ausentes, sem exigir outro ZIP.

Mantém conversa local com llama.cpp/Qwen e voz neural Piper, sem chave depois de instalar os modelos. O perfil inicial é para Realme GT3 ARM64 com 16 GB. A instalação inicial baixa vários GB; TikTok ainda precisa de internet. Qualidade e velocidade precisam ser medidas no telefone.

193 testes aprovados. A fonte principal foi validada pelo usuário no aparelho; os testes automatizados de APT são simulados. Sem inferência neural real nesta validação cloud.

Histórico: [V42.1](DOWNLOAD_V42_1.md) · [V42](DOWNLOAD_V42.md) · [V41.1](DOWNLOAD_V41_1.md) · [V41](DOWNLOAD_V41.md).
