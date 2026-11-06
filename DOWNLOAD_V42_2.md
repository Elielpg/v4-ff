# V42.2 · Reconhecer termux.sources

A configuração informada usa `termux.sources` (Deb822), além de `tur.sources` e `glibc.list`. A V42.1 só lia `.list`, não encontrava o principal e escolhia um endereço padrão de outra edição. Esse endereço falhou com `NO_PUBKEY`.

O usuário confirmou no aparelho que consultar somente o principal funciona: `Hit:1 https://termux.net stable InRelease`, seguido de `Reading package lists... Done`. Não é necessário importar chaves ou desativar assinaturas para essa fonte.

## Continuar na instalação atual

Como a atualização da fonte correta já passou, instale as quatro ferramentas ausentes por ela:

```sh
cd ~/ben10-v34/game &&
apt-get \
  -o "Dir::Etc::sourcelist=$PREFIX/etc/apt/sources.list.d/termux.sources" \
  -o "Dir::Etc::sourceparts=-" \
  install -y cmake ninja libandroid-spawn proot-distro &&
bash local-ai.sh install &&
bash local-ai.sh start
```

O instalador existente verifica as ferramentas antes de consultar APT. Com todas prontas, pula essa etapa e segue para os modelos. Não exige outro ZIP para esse caminho de continuação. A instalação inicial ainda baixa vários GB; a sequência para se alguma etapa falhar.

Esses comandos usam o arquivo principal que acabou de passar na verificação no aparelho. Não dispensam autenticação e não modificam fontes. Não precisa criar `.env` para o modo local.

## Correção permanente

[Baixar reparo pequeno V42.2](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_REPARO_IA_V42_2.zip)

[Baixar pacote completo V42.2](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_LIVE_V42_2_TERMUX.zip)

A V42.2 prioriza `sources.list.d/termux.sources`, copia o arquivo inteiro para a área temporária e deixa o APT ler o formato. Preserva o endereço, `Signed-By` e chaves inline. Recusa opções que dispensam autenticação. Em configurações antigas, continua reconhecendo as fontes `.list`. Se não encontrar o principal, para sem escolher outro endereço padrão.

O reparo autônomo `REPARAR_IA_LOCAL_V42_2.sh` pode ser executado na pasta da V42 já instalada. Confere hashes e sintaxe dos quatro scripts, faz backup em `data/installer-backups/` e preserva dados/fontes. O ZIP completo já inclui a correção e mostra 42.2.0.

## Verificação

193 testes aprovados. Os testes adicionais conferem prioridade de Deb822 sobre listas antigas, cópia literal de `Signed-By` e chave inline, recusa de `Trusted: yes` e ausência de endereço alternativo para fonte desconhecida. O reparo foi validado em instalação fictícia, preservando dados e backups. O ZIP completo foi extraído e iniciado.

O usuário confirmou a atualização da fonte principal no aparelho. Os demais testes de APT são simulados; a instalação de pacotes e a inferência dos modelos ainda precisam terminar no telefone. Relatórios em `game/reports/v42_2/`; guia em `game/docs/V42_2_DEB822.md`.

[Checksum do reparo](BEN10_REPARO_IA_V42_2.zip.sha256) · [Checksum do pacote completo](BEN10_LIVE_V42_2_TERMUX.zip.sha256)
