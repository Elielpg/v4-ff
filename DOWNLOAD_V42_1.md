# V42.1 · Reparo do instalador da IA local

> Para instalações com `termux.sources` (Deb822), use a [correção V42.2](DOWNLOAD_V42_2.md). O reparo V42.1 não reconhecia esse formato.

[Baixar reparo pequeno para V42 já instalada](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_REPARO_IA_V42_1.zip)

O erro `NO_PUBKEY 5A897D96E57CF20C` no repositório extra `termux-glibc` impediu a instalação das ferramentas. O jogo já foi atualizado, mas os modelos locais ainda não foram instalados. Por isso o comando de iniciar mostra “Instale primeiro”. A ausência de `.env` não causou a falha e não exige criar esse arquivo para o modo local.

O instalador da V42 chamava o `pkg` geral. O reparo passa a instalar só ferramentas ausentes e consulta apenas o principal oficial da edição instalada (`termux.net` ou `termux-main`), preservando `Signed-By` quando configurado. Usa fontes/listas/cache temporários e mantém assinaturas verificadas. As fontes extras não são editadas nem removidas. Se a assinatura do oficial também falhar, a instalação para.

## Aplicar na V42 já instalada

Baixe o ZIP pequeno acima. Na pasta do jogo:

```sh
cd ~/ben10-v34/game
python3 -m zipfile -e ~/storage/downloads/BEN10_REPARO_IA_V42_1.zip "$TMPDIR/ben10-reparo-42-1" &&
bash "$TMPDIR/ben10-reparo-42-1/REPARAR_IA_LOCAL_V42_1.sh" &&
bash local-ai.sh install &&
bash local-ai.sh start
```

Os `&&` interrompem a sequência em caso de falha. O reparo é autônomo: não baixa mais scripts, verifica hashes/sintaxe e substitui apenas quatro arquivos. Guarda os antigos em `data/installer-backups/`. Não reinstala o jogo nem apaga chaves, `.env`, progresso ou modelos.

A instalação da IA depois do reparo ainda usa internet e baixa vários GB. O reparo pequeno não inclui os modelos. O número da versão da interface instalada pode continuar V42.0; ele corrige apenas o instalador. O `.env` existente continua carregado; sua ausência deixa de gerar aviso.

## Pacote completo atualizado

[Baixar BEN10_LIVE_V42_1_TERMUX.zip](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_LIVE_V42_1_TERMUX.zip)

Esse pacote já contém a correção e mostra V42.1 / 42.1.0. Para uma atualização completa:

```sh
bash backup.sh
bash update.sh --archive ~/storage/downloads/BEN10_LIVE_V42_1_TERMUX.zip
bash local-ai.sh install && bash local-ai.sh start
```

Os recursos da V42 são mantidos. Consulte [IA local no Termux](DOWNLOAD_V42.md) para requisitos e limites dos modelos.

## Verificação

189 testes aprovados. Os novos testes reproduzem a falha com repositórios simulados, verificam seleção do principal oficial, preservação das fontes/listas, bloqueio de assinatura oficial inválida, progresso do instalador até o download e inicialização com/sem `.env`. O reparo foi aplicado a uma instalação fictícia V42, conferindo os quatro arquivos, backups e preservação de dados. O ZIP completo foi extraído e seu servidor iniciado.

Não houve instalação APT no telefone nem inferência neural real. O acesso aos repositórios/modelos será confirmado no seu aparelho. Relatórios: `game/reports/v42_1/`; guia: `game/docs/V42_1_REPARO_TERMUX.md`.

[Checksum do reparo](BEN10_REPARO_IA_V42_1.zip.sha256) · [Checksum do pacote completo](BEN10_LIVE_V42_1_TERMUX.zip.sha256)
