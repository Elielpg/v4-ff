# Torre TNT LIVE 0.2 — preencher até o teto

**18 colunas × 100 andares = 1.800 espaços**, colocados um por um. O construtor atravessa cada fileira, sobe, repara os buracos da TNT e recebe materiais do chat. Há câmera acompanhando, minimapa e botão MAPA para ver todos os andares.

[Baixar ZIP completo — 3,4 MB](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/TORRE_TNT_LIVE_V0_2.zip) · [Ver prévia](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/TORRE_TNT_LIVE_V0_2_PREVIA.png) · [Visão geral](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/TORRE_TNT_LIVE_V0_2_MAPA.png) · [Pesquisa no GitHub](TORRE_TNT_LIVE_V0_2_PESQUISA.md)

## Atualizar a instalação 0.1 preservando progresso

Baixe o ZIP para Downloads e execute no Termux:

```bash
python3 -m zipfile -e ~/storage/downloads/TORRE_TNT_LIVE_V0_2.zip "$TMPDIR/torre-v02" &&
bash "$TMPDIR/torre-v02/TORRE_TNT_LIVE_V0_2/ATUALIZAR_V0_2.sh" "$HOME/TORRE_TNT_LIVE_V0_1" &&
cd ~/TORRE_TNT_LIVE_V0_1 && bash start.sh
```

O atualizador confere os arquivos, encerra apenas os processos dessa instalação e cria um backup antes de substituir o código. Preserva os dados, configurações, vitórias e ranking. A quantidade antiga de blocos continua igual na grade nova; não é necessário recomeçar.

A pasta antiga pode continuar se chamando V0_1. A versão do jogo, no painel de controles, deve ser **0.2.0**. Se a sua pasta tiver outro nome, substitua o caminho do alvo no comando.

## Instalação nova

Se ainda não instalou o jogo, use:

```bash
cd ~ &&
python3 -m zipfile -e ~/storage/downloads/TORRE_TNT_LIVE_V0_2.zip . &&
cd ~/TORRE_TNT_LIVE_V0_2 &&
bash install.sh &&
bash start.sh
```

Se precisar, libere o acesso aos Downloads com `termux-setup-storage`. Python é necessário para extrair e atualizar; se faltar, `pkg install python`. O jogo usa Node.js 22.19 ou mais recente; a instalação baixa o conector com `npm ci`.

Abra **http://127.0.0.1:3300** no Chrome. Toque em TESTAR O JOGO ou ♫ para liberar som e música. Para iniciar nas próximas vezes, entre na pasta onde instalou/atualizou e execute `bash start.sh`. Para parar: Ctrl+C na sessão original ou `bash stop.sh` nessa pasta.

## Regras

O construtor trabalha automaticamente. Curtidas e bônus abastecem a fila rápida, que coloca um bloco por passo. 20 curtidas fornecem 1 material; BLOCO ajuda; DEFESA protege; TNT desafia. Seguir fornece 5 materiais; compartilhar fornece 3 e escudo. Presentes de blocos não fazem uma parede surgir inteira: entram na fila. Rosa manda TNT; outros presentes constroem, dão escudo, raios ou bombardeio.

Só ganha a vitória com **todos os 1.800 espaços preenchidos**. Os excedentes aguardam a próxima torre. Em ☰ ajuste a construção automática, os intervalos, volumes e qualidade. Conecte o @ da conta que já estiver ao vivo para receber eventos reais; os testes de demonstração ficam separados.

[Relatório e pendências](TORRE_TNT_LIVE_V0_2_RELATORIO.md): 54 testes aprovados, instalação limpa, atualização real da 0.1, câmera, áudio e recuperação verificados em Linux/Chromium. Uma LIVE real e o Realme GT3 físico ainda precisam ser validados. O supervisor tem tentativas limitadas e não consegue reviver o Termux se o Android fechar o aplicativo inteiro.

O ZIP inclui código completo, recursos, guia de backup/reversão, pesquisa e registros de teste. Não inclui dados privados ou dependências já instaladas. O backup criado na atualização fica somente na instalação do usuário.
