# Captador Batida Omnitrix — V48

Aplicativo Android opcional para alimentar o ritmo do jogo no mesmo celular, inclusive com fone ou caixa Bluetooth. Requer Android 10 ou posterior. O APK foi compilado e sua assinatura foi verificada em Linux; a captura real ainda precisa ser conferida no aparelho do usuário.

1. Atualize o jogo para V48 e deixe o Termux executando.
2. No jogo: **Ações → Dança e som de seguidor → Gerar código de conexão**.
3. Instale `BATIDA_OMNITRIX_V48.apk`. Abra o captador, digite o código e mantenha a porta 3000, salvo se você usa outra porta no jogo.
4. Deixe **Captura compartilhada avançada** desmarcada. O modo padrão usa o visualizador de energia do áudio do Android, sem iniciar outra captura de tela.
5. Toque **Conectar e captar a batida** e permita o acesso de áudio solicitado pelo Android.
6. Toque a música no aplicativo escolhido e volte ao jogo. O painel mostra **captador Android**, o BPM e se há batidas detectadas.

O Android solicita permissão de áudio e de configuração de áudio para acessar o Visualizer da saída global. Esse é o modo padrão, sem MediaProjection e sem ligar a entrada do microfone. Não cria arquivo de música, não envia PCM, não transmite imagens e não se conecta a um servidor externo. Só manda quatro números — energia grave, nível geral, instante e sequência — para `127.0.0.1` no próprio celular, usando um token obtido pelo código temporário.

O aparelho e a saída de som precisam fornecer energia ao Visualizer. Certas rotas Bluetooth, offload ou aplicativos podem não fornecer esse sinal. O jogo distingue **conectado sem som** de **batidas detectadas**. Nessa situação, use um arquivo no player do jogo ou BPM manual; não há tentativa de contornar a proteção do app.

**Captura compartilhada avançada:** fica desmarcada por padrão. Usa AudioPlaybackCapture/MediaProjection e permite escolher o aplicativo da música para filtrar a própria voz do Ben. A lista de aplicativos fica somente no captador, sem ser enviada ao jogo. Exige consentimento adicional e que o app de origem permita compartilhar áudio. **No Android, iniciar outra captura compartilhada pode interromper uma LIVE/gravação que já esteja compartilhando a tela. Não use essa opção durante esse tipo de transmissão.** O captador nunca passa do modo padrão para ela automaticamente.

Para Bluetooth, ajuste **Adiantar / atrasar dança** no jogo. Valores positivos atrasam a dança. O atraso percebido depende do fone/caixa; não foi medido no Realme GT3.

Para encerrar, use **Parar captura** no aplicativo/notificação ou **Desconectar captador** no jogo. Não inicia sozinho após reiniciar o celular. Após cinco falhas de comunicação, encerra e pede reconexão, sem reiniciar indefinidamente.

## Reproduzir a compilação em Linux

O código Java, manifesto e recursos acompanham o pacote. Não inclui SDK, chave de assinatura, senha ou dados do usuário.

- JDK com compilador Java, `keytool` e Python 3.
- SDK oficial da Google: plataforma Android 35 e build-tools 35.0.0.
- Extraia `platform-35_r02.zip` em `sdk/` (pasta resultante `android-35`) e `build-tools_r35_linux.zip` em `sdk/` (pasta resultante `android-15`, nome interno do arquivo oficial).
- SHA-1 oficiais usados nesta compilação: plataforma `0bb560a90a7a2cbd0dd8348224d518b638fe7949`; build-tools `2cfaa0bbb2336e9ec18ed3ecea84fa2e2af607bc`.
- Execute `python3 build.py --output output/BATIDA_OMNITRIX_V48.apk`. O script cria uma nova chave local em `private/`, compila, alinha, assina e verifica o APK. Uma assinatura nova exige desinstalar a edição anterior do captador; isso não apaga os dados do jogo no Termux.

Teste do filtro sem Android: compile `app/src/br/ben10/rhythm/BeatMeter.java` e `app/src/br/ben10/rhythm/SpectrumMeter.java` com `tests/BeatMeterTest.java` e execute `BeatMeterTest`. Esse teste mede o filtro numérico, não as permissões de captura do Android.

Referência das permissões do Visualizer: [código oficial AOSP](https://github.com/aosp-mirror/platform_frameworks_base/blob/master/media/java/android/media/audiofx/Visualizer.java).
