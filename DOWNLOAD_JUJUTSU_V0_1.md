# JUJUTSU LIVE · COLÔNIA ZERO 0.1.0

**[Baixar o jogo completo — ZIP (6,6 MB)](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/JUJUTSU_COLONIA_ZERO_V0_1.zip)**

[Relatório, arquitetura e testes](JUJUTSU_COLONIA_ZERO_V0_1_RELATORIO.md) ·
[Prévia da batalha](JUJUTSU_COLONIA_ZERO_V0_1_PREVIA.png) ·
[Personagens da primeira versão](JUJUTSU_COLONIA_ZERO_V0_1_PERSONAGENS.png)

Primeira versão jogável de uma cidade 3D com Gojo, Yuji, Megumi, Yuta, Kenjaku,
Mahito, Jogo e Sukuna como chefe NPC. Modelos procedurais estilizados, técnicas,
invocações, domínios e câmera cinematográfica. Instalação separada do PULSO.

## Como funciona

- Entrou na LIVE: vira cidadão, com proteção inicial.
- Seguiu ou enviou Rosa: ganha acesso e sorteia personagem/time; reserva se a
  batalha estiver cheia. Repetição de Rosa não duplica vagas.
- TAP TAP dá energia e cura gradual. Presentes mapeados dão reversão, técnicas,
  domínio ou despertar. Compartilhar fortalece seu personagem.
- Cinco pontos por feiticeiro, um por cidadão. Com 100 disponíveis, uma regra
  permitida pode ser proposta a Kogane: refúgio, troca, resgate ou fluxo.
- Após eliminação, retorna como cidadão; quem já tem acesso pode comentar LUTAR.

Há 27 falas neurais originais em inglês prontas, efeitos e uma trilha original.
Não precisa de Gemini, clonador ou modelo neural no celular para essas falas.
Também aceita seus arquivos de música e o captador Android na porta 3200.

## Instalar no Termux

Com o ZIP salvo em Downloads e acesso ao armazenamento liberado:

```bash
cd ~ &&
python3 -m zipfile -e ~/storage/downloads/JUJUTSU_COLONIA_ZERO_V0_1.zip . &&
cd ~/JUJUTSU_COLONIA_ZERO_V0_1 &&
bash install.sh &&
bash start.sh
```

Abra **http://127.0.0.1:3200/?v=0.1.0** e toque em **TESTAR A COLÔNIA**.
Se faltar Python/Node: `pkg install python nodejs-lts`. Requer Node 22.19+.
Para liberar Downloads, execute `termux-setup-storage` uma vez.

Nos próximos usos:

```bash
cd ~/JUJUTSU_COLONIA_ZERO_V0_1 && bash start.sh
```

Para conectar sua LIVE, inicie a transmissão no aplicativo habitual e informe
o @ no painel do jogo. O captador Pulso Batida 0.2.1 incluído deve usar a porta
**3200**; quem já tem essa versão pode apenas trocar a porta.

## Verificação e limites

**40 testes passaram**, inclusive após instalar o ZIP em uma pasta limpa.
Foram conferidos entrada, presentes, poderes, regras, voz, dois domínios,
36 ângulos da câmera e arquivo sintético de phonk. Simulação acelerada de
30 minutos virtuais com 1.000 usuários e recuperação do servidor filho também
foram registradas.

Ainda faltam LIVE real, captura GreenTube/Bluetooth, FPS, temperatura e duração
no Realme GT3. A simulação não substitui uma transmissão no aparelho. É uma
adaptação de fã; os modelos são procedurais e as vozes não são a dublagem oficial.

SHA-256 do ZIP:
`69e92fcb7a14d5e8eaafdcc8c555955f5d7c98938458281485790580f2644f82`.
