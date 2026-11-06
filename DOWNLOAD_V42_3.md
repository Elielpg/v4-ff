# V42.3 · Catálogo público do modelo sem token

O perfil GT3 tentava primeiro um endereço que retornava HTTP 401 e parava antes de chegar ao modelo público alternativo. O usuário confirmou, sem autenticação, o catálogo `unsloth/Qwen3-4B-Instruct-2507-GGUF` e o arquivo `Qwen3-4B-Instruct-2507-Q4_K_M.gguf`.

## Continuar na instalação existente

O endereço antigo pode ser removido do arquivo atual com backup:

```sh
cd ~/ben10-v34/game &&
mkdir -p data/installer-backups &&
cp scripts/local-ai/download_models.py "data/installer-backups/download_models-$(date +%s).py" &&
sed -i 's@"Qwen/Qwen3-4B-Instruct-2507-GGUF", @@' scripts/local-ai/download_models.py &&
python3 -m py_compile scripts/local-ai/download_models.py &&
bash local-ai.sh install &&
bash local-ai.sh start
```

Isso remove somente a entrada antiga da lista. Continua usando o mesmo modelo de 4B, não exige chave e mantém ferramentas/modelos já existentes. O download e a compilação iniciais ainda precisam terminar.

## Correção permanente

[Pacote completo V42.3](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_LIVE_V42_3_TERMUX.zip)

[Reparo autônomo V42.3](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/BEN10_REPARO_IA_V42_3.zip)

O novo downloader consulta o catálogo público confirmado e confere os catálogos de texto/voz antes de baixar pesos. Distingue falha de catálogo e de arquivo, mostra o repositório/arquivo e o status HTTP, sem imprimir URLs temporárias assinadas. Catálogos privados ou com acesso condicionado são rejeitados. Um 401/403/404 só pode levar a outra opção pública explicitamente configurada; um 429 não gira catálogos. Não solicita token.

A verificação de hashes permanece e arquivos parciais podem ser retomados. O pacote inclui a correção Deb822 da V42.2. O reparo autônomo valida cinco scripts e faz backup antes de copiá-los, preservando os dados e a versão da interface existente.

## Verificação

194 testes aprovados, incluindo testes Python de catálogo, fallback sem autenticação, recusa de acesso restrito, checagem de voz antes do GGUF, retomada de parcial e SHA-256. O reparo curto foi testado com backup e sintaxe. O ZIP completo foi extraído e iniciado.

O catálogo/arquivo foram confirmados pelo usuário no telefone; isso não é um teste da inferência ou do download completo dos pesos. A rede e os arquivos dos testes automatizados são simulados. Sem inferência neural real ou medição de desempenho no GT3 nesta validação.

Guia: `game/docs/V42_3_CATALOGO_PUBLICO.md`; relatórios: `game/reports/v42_3/`.

[Checksum do reparo](BEN10_REPARO_IA_V42_3.zip.sha256) · [Checksum do pacote completo](BEN10_LIVE_V42_3_TERMUX.zip.sha256)
