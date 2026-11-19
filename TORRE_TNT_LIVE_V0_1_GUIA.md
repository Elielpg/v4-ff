# Torre TNT · LIVE 0.1.0 — baixar e iniciar

O chat constrói uma torre de 100 blocos e tenta resistir à TNT. Meta: 10 vitórias. Inclui fotos de presentes em slides, ranking, escudo, sons, música original e modo de demonstração.

[Baixar projeto completo — ZIP de 2,8 MB](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/TORRE_TNT_LIVE_V0_1.zip) · [Ver prévia](https://github.com/Elielpg/v4-ff/raw/refs/heads/main/TORRE_TNT_LIVE_V0_1_PREVIA.png) · [Relatório de testes e pendências](TORRE_TNT_LIVE_V0_1_RELATORIO.md)

## Primeira instalação no Termux

Baixe o ZIP para Downloads. Se necessário, execute `termux-setup-storage` e conceda acesso ao armazenamento. Depois:

```bash
cd ~ &&
python3 -m zipfile -e ~/storage/downloads/TORRE_TNT_LIVE_V0_1.zip . &&
cd ~/TORRE_TNT_LIVE_V0_1 &&
bash install.sh &&
bash start.sh
```

Se `python3` não existir, instale com `pkg install python`. Requer Node.js 22.19 ou mais recente; o instalador confere a versão e usa o lockfile. Não precisa de modelo de IA ou chave.

Abra **http://127.0.0.1:3300** no Chrome. Toque em **TESTAR O JOGO** ou **♫** para liberar áudio. A primeira instalação precisa de internet para obter o conector; a demonstração e seus recursos ficam locais depois disso.

## Nas próximas vezes

```bash
cd ~/TORRE_TNT_LIVE_V0_1 && bash start.sh
```

Pare com Ctrl+C na sessão original ou `bash stop.sh` nessa pasta. Uma segunda tentativa de iniciar informa que o jogo já está aberto.

## Como o público participa

- 20 curtidas: +1 bloco; o valor é ajustável.
- BLOCO: constrói; DEFESA: protege; TNT: pequena explosão, com intervalos por pessoa.
- Seguir: +5 blocos; compartilhar: +3 e escudo.
- Rosa: TNT ×10; GG: +80 blocos; outros presentes aparecem nos slides.
- Complete 100 blocos: vitória. Excedentes e novas interações contam na próxima torre.

Em ☰, coloque o @ de uma conta ao vivo e conecte. A demonstração tem dados separados e seus botões não dão curtidas falsas à LIVE. Música local, volumes e qualidade também ficam nos controles. Para transmitir os sons, habilite a captura de áudio do navegador no seu aplicativo de LIVE.

## Progresso e diagnóstico

Os dados ficam em `data/`, com backup automático. Há exportação no painel e o comando `bash diagnose.sh`. O supervisor recupera o servidor com tentativas limitadas; não consegue impedir o Android de fechar o Termux inteiro. Não foi testado fisicamente no Realme GT3 nem numa conta TikTok real. Consulte o relatório e as instruções completas em `docs/` dentro do ZIP.

Os projetos anteriores usam outras pastas e não são alterados. Não extraia uma atualização futura sobre um jogo ainda em execução.
