# Ben 10 · Clareira LIVE V45 — personagens 2D

A primeira versão funcional do novo visual usa **Ben, Chama, XLR8 e Diamante** em 2D no acampamento 3D existente. A atualização é para a **V44.2.0 já instalada** e preserva dados, voz, IA e integrações. As demais formas e a animação sentada mantêm os modelos originais.

- [Baixar atualização visual V45 — ZIP](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_VISUAL_2D_V45.zip)
- [Baixar vídeo 2D — MP4](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/VIDEO_BEN10_2D_V45.mp4)
- [Baixar vídeo, capa e legendas — ZIP](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/VIDEO_BEN10_2D_V45_COMPLETO.zip)
- [Instalação e reversão](VISUAL_2D_V45/LEIA_PRIMEIRO.md)
- [Relatório de alterações e limites](RELATORIO_VISUAL_V45.md)
- [Registro de testes](REGISTRO_TESTES_V45.json)

## Instalar no Termux

Depois de baixar o ZIP da atualização para Downloads:

```bash
cd ~/ben10-v34/game
python3 -m zipfile -e ~/storage/downloads/BEN10_VISUAL_2D_V45.zip "$TMPDIR/ben10-visual-v45"
bash "$TMPDIR/ben10-visual-v45/BEN10_VISUAL_2D_V45/ATUALIZAR_VISUAL_2D.sh" "$PWD"
bash restart.sh
```

Abra **http://127.0.0.1:3000/?v=45.0.0**. Se usa outra pasta, ajuste a primeira linha. O instalador mostra onde salvou o backup.

Para alternar: **Controles → Configurações → Visual dos personagens**. A opção Desenho clássico está ativada por padrão; Modelos 3D originais continua disponível.

A suíte final passou em **281 testes**; os testes gráficos verificaram carregamento, retorno ao 3D, origem dos poderes e energia, persistência da preferência e recursos após 24 trocas de visual. Instalação e reversão dos 19 arquivos foram verificadas numa cópia da V44.2. Ainda não há benchmark ou teste de LIVE prolongada no Realme GT3 nesta entrega. O LOCAL-010 continua pendente de reprodução no aparelho.

O vídeo tem 26,13 segundos, 1080 × 1920 e 30 fps. São novas capturas do game com os desenhos; a narração padrão, música e efeitos reutilizam o áudio claro da produção anterior. Sem o @ antigo. Não há promessa de alcance.
