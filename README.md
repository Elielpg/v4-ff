# Ben 10 · Clareira LIVE

[V43.2 · Reparo SIGILL no clonador](DOWNLOAD_V43_2.md)

Reconstrói apenas o motor da voz com ARMv8-A, desativa a detecção nativa e limpa as opções antigas do CMake. Reutiliza os GGUF convertidos, sem repetir downloads, conversão ou instalação de PyTorch. O preview passa a ter log com etapas e faulthandler.

[Reparo pequeno — 32 KB](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_REPARO_SIGILL_V43_2.zip?v=43.2.0) · [ZIP completo V43.2](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_LIVE_V43_2_TERMUX.zip?v=43.2.0)

207 testes do jogo e um teste adicional do reparo aprovados. Compilação e operação de matrizes GGML verificadas em Linux x86_64; o desaparecimento do SIGILL e a velocidade ainda precisam ser confirmados no GT3. O perfil básico pode ser mais lento.

Histórico: [V43.1 com áudio incluído](DOWNLOAD_V43_1.md) · [V43](DOWNLOAD_V43.md) · [V42.4](DOWNLOAD_V42_4.md).
