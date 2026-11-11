# Reparo do instalador V46 — R1

Use quando a instalação para com “O servidor ainda responde”. Requer o ZIP V46 original já extraído no mesmo Termux. Não reinstala a IA nem baixa modelos. Os motores de voz e a voz escolhida são preservados.

Baixe `BEN10_REPARO_INSTALADOR_V46.zip` para Downloads. Execute:

```bash
cd ~/ben10-v34/game &&
python3 -m zipfile -e ~/storage/downloads/BEN10_REPARO_INSTALADOR_V46.zip "$TMPDIR/ben10-v46-reparo" &&
bash "$TMPDIR/ben10-v46-reparo/BEN10_REPARO_INSTALADOR_V46/REPARAR_E_ATUALIZAR_V46.sh" "$PWD" &&
bash restart.sh
```

Abra http://127.0.0.1:3000/?v=46.0.0. A revisão do instalador é R1; a versão do jogo permanece 46.0.0.

Se o Android ainda impedir confirmar o processo, o instalador interrompe sem copiar o jogo. Pressione Ctrl+C na aba original que executa o jogo, espere o prompt e repita. Não use `pkill node` ou `killall`: podem encerrar outros programas.

Se a pasta temporária antiga foi removida, use `BEN10_HEROIS_VILOES_V46_R1.zip`, que já contém o instalador corrigido. Não precisa aplicar os dois ZIPs.

O backup do código aparece em `data/backups/before-v46-...`. Para reverter, use o comando exato no arquivo `COMO_REVERTER.txt` desse backup, execute `npm run build` e `bash restart.sh`. A reversão mantém os dados atuais.

302 testes aprovados na nuvem. Instalação e reversão testadas com o servidor real e seu inicializador em execução. As restrições Android foram simuladas; não houve teste no aparelho. Veja o relatório incluído.
