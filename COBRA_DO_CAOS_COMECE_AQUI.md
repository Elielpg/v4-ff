# Cobra do Caos · jogo e estúdio RTMP · v0.1.0

[Baixar projeto completo para Termux](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/COBRA_DO_CAOS_V0_1.zip)

[Ver o quadro de transmissão](COBRA_DO_CAOS_PREVIA.png) · [Ver os controles de enquadramento](COBRA_DO_CAOS_STUDIO.png) · [Validação do ZIP](COBRA_DO_CAOS_RELEASE_CHECK.json)

Cobra 3D automática, chat HERÓI/VILÃO, comida, bombas, escudo, seis efeitos de presentes, ranking, trilha original e falas neurais locais. Demonstração e LIVE têm progresso separado. Qwen/Piper existentes podem ser conectados opcionalmente.

O estúdio RTMP tem saída vertical, mistura de voz/música/efeitos, zoom, posicionamento e gravação de teste de dez segundos. O teste recebeu H.264/AAC em 720 × 1280 por um servidor RTMP local; não foi feita LIVE pública no TikTok nem benchmark do GT3. A conta precisa ter endereço RTMP e chave liberados. Preencha a chave somente no painel local e mantenha o jogo visível no Chrome.

Salve o ZIP em Downloads. No Termux, com Python disponível:

```bash
cd ~ &&
python3 -m zipfile -e ~/storage/downloads/COBRA_DO_CAOS_V0_1.zip . &&
cd ~/COBRA_DO_CAOS_V0_1 &&
bash install.sh &&
bash start.sh
```

É necessário Python para extrair o ZIP. O instalador cuida de Node e FFmpeg pela fonte principal configurada, preservando os repositórios extras e a autenticação. Abra **http://127.0.0.1:3500** e toque em **TESTAR COM SOM**.

Para iniciar depois:

```bash
cd ~/COBRA_DO_CAOS_V0_1 && bash start.sh
```

Transmissão: **☰ → Transmitir**. Eventos do chat: **☰ → LIVE**. Documentação, regras, arquitetura, testes e pendências estão no ZIP. O encerramento de todo o Termux pelo Android e o desempenho prolongado no celular ainda precisam de validação; o supervisor recupera quedas do servidor com limite de tentativas.

Este jogo é independente dos projetos anteriores e não declara vínculo com @cobradoabismo.

## Reparo do instalador 0.1.1

Se a instalação parar com `NO_PUBKEY` no repositório extra `termux-glibc`, use o [pequeno reparo](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/COBRA_REPARO_APT_V0_1_1.zip) e siga [as instruções](COBRA_REPARO_APT_V0_1_1.md). Ele faz backup do instalador e preserva os dados. O ZIP completo acima também foi corrigido. A ausência do FFmpeg deixa somente a transmissão RTMP pendente, sem impedir iniciar o jogo.
