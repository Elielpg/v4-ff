# PULSO ARENA 0.4 — Anime / Phonk

[Baixar ZIP completo (7,1 MB)](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/PULSO_ARENA_V0_4.zip)

[Relatório de alterações e testes](PULSO_ARENA_V0_4_NOTAS.md)

Combos rápidos, teleporte, rajadas alternadas de socos, chutes aéreos,
novos rastros/impactos, visual em três faixas e enquadramento dos lutadores.
O estilo Anime segue os acentos rápidos do phonk, mantendo dano e energia
proporcionais à cadência. O estilo Clássico continua selecionável.

58 testes passaram, inclusive em instalação limpa do ZIP. Atualização de uma
cópia 0.3 para 0.4 preservou HP, curtidas e fila, com backup conferido. FPS,
captura de áudio e duração de LIVE no Realme GT3 ainda precisam de teste físico.

## Atualizar no Termux

Se a instalação está em `~/PULSO_ARENA_V0_1`, com o ZIP salvo em Downloads:

```bash
cd ~ &&
python3 -m zipfile -e ~/storage/downloads/PULSO_ARENA_V0_4.zip . &&
bash ~/PULSO_ARENA_V0_4/ATUALIZAR.sh ~/PULSO_ARENA_V0_1 &&
cd ~/PULSO_ARENA_V0_1 &&
bash start.sh
```

Se usa outra pasta, substitua o caminho da instalação. O atualizador cria um
backup antes de copiar o código e mantém os dados. Abra
http://127.0.0.1:3100/?v=0.4.0 e selecione **Música e batida → Anime**.

Para instalar do zero, extraia o ZIP e execute `bash install.sh` e
`bash start.sh` dentro de `PULSO_ARENA_V0_4`.

O captador **Pulso Batida 0.2.1** incluído permanece compatível. Não é
necessário reinstalar o APK se já usa essa versão.

SHA-256 do ZIP: `e8ce98a4db95194c905d1f21904bdf9714e20b0c002ff8a5e77ce80e9d1d3319`.
O ZIP publicado é o mesmo arquivo validado na entrega local anterior.
