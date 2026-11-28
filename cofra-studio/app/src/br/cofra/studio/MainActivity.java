package br.cofra.studio;

import android.Manifest;
import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.media.projection.*;
import android.net.Uri;
import android.os.*;
import android.text.InputType;
import android.view.*;
import android.widget.*;
import java.net.*;
import java.io.*;
import java.util.Locale;
import org.json.JSONObject;
import br.cofra.studio.rtmp.Endpoint;

/** Private controls; no overlay is drawn over the selected game. */
public final class MainActivity extends Activity {
 private EditText url,key;
 private Spinner profile,audio;
 private SeekBar top,bottom,side,delay;
 private TextView status,director;
 private ImageView preview;
 private Button live,test;
 private final Handler handler=new Handler(Looper.getMainLooper());
 private boolean visible,fetching;
 private String pendingMode,pendingUrl,pendingKey,pendingAudio;
 private int pendingProfile;
 private long lastFrames,lastBytes,lastAt;
 private final Runnable poll=new Runnable(){public void run(){
   long now=System.currentTimeMillis(),dt=now-lastAt;double fps=dt>0?Math.max(0,CaptureService.frames-lastFrames)*1000.0/dt:0,mbps=dt>0?Math.max(0,CaptureService.bytes-lastBytes)*.008/dt:0;
   status.setText(CaptureService.session.message()+"\nEncoder: "+CaptureService.encoder+String.format(Locale.US,"\nSaída: %.1f FPS · %.2f Mbps · áudio %.1f dBFS",fps,mbps,20*Math.log10(Math.max(.000001,CaptureService.audioRms)))+"\n"+CaptureService.audioStatus());
   lastFrames=CaptureService.frames;lastBytes=CaptureService.bytes;lastAt=now;
   live.setEnabled(!CaptureService.active);test.setEnabled(!CaptureService.active);
   if(CaptureService.preview!=null)preview.setImageBitmap(CaptureService.preview);
   if(!fetching)fetchDirector();if(visible)handler.postDelayed(this,1500);
 }};
 @Override public void onCreate(Bundle saved){
  super.onCreate(saved);getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);getWindow().setStatusBarColor(Color.rgb(10,20,28));getWindow().setNavigationBarColor(Color.rgb(10,20,28));
  ScrollView scroll=new ScrollView(this);LinearLayout layout=new LinearLayout(this);layout.setOrientation(LinearLayout.VERTICAL);layout.setPadding(24,20,24,28);layout.setBackgroundColor(Color.rgb(10,20,28));scroll.addView(layout);setContentView(scroll);
  label(layout,"COFRA STUDIO · BETA 0.1.1",28,Color.rgb(178,255,99));
  label(layout,"Termux:X11 → teste local ou RTMP/RTMPS",15,Color.WHITE);
  label(layout,"Encerre o compartilhamento de tela do TikTok. Abra o jogo pelo Termux e use o teste local primeiro. No Android 14 ou superior, selecione apenas o aplicativo Termux:X11 na autorização. Em versões anteriores, a captura inclui a tela inteira; mantenha o jogo visível.",14,Color.LTGRAY);
  button(layout,"ABRIR TERMUX:X11",this::openGame);
  profile=options(layout,"Imagem · H264 por hardware · 30 FPS",new String[]{"720 × 1280 · 4 Mbps · recomendado","1080 × 1920 · 6 Mbps · testar carga"});
  audio=options(layout,"Áudio",new String[]{"Jogo e voz · mixer próprio do Termux","Jogo + músicas de outros apps permitidos","Áudio interno do Android","Microfone","Sem áudio"});
  label(layout,"O áudio do jogo exige o complemento Termux 0.3.4. O modo misto captura músicas apenas se o aplicativo permitir e reduz a música durante a fala. Fones/Bluetooth não impedem o envio do mixer. O teste confirma o resultado real.",12,Color.LTGRAY);
  top=slider(layout,"Cortar topo",30);bottom=slider(layout,"Cortar rodapé",30);side=slider(layout,"Cortar cada lateral",20);
  delay=slider(layout,"Atraso de áudio (valor − 300, em ms)",600);delay.setProgress(300);
  label(layout,"Os cortes preservam a proporção e podem ser ajustados durante o teste. A prévia abaixo só aparece neste painel e atualiza uma vez por segundo enquanto ele estiver aberto.",12,Color.LTGRAY);
  test=button(layout,"1 · AUTORIZAR TESTE LOCAL DE 10 SEGUNDOS",()->begin("test"));
  button(layout,"ABRIR ÚLTIMO TESTE SALVO",()->{if(CaptureService.lastTest.isEmpty()){status.setText("Ainda não há um teste salvo nesta sessão.");return;}try{startActivity(new Intent(Intent.ACTION_VIEW).setDataAndType(Uri.parse(CaptureService.lastTest),"video/mp4").addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION));}catch(Exception e){status.setText("Abra Filmes/CofraStudio na galeria.");}});
  url=field(layout,"URL de entrada · Restream ou TikTok","rtmps://servidor/live",false);
  key=field(layout,"Chave de transmissão · somente neste aparelho","Cole aqui para transmitir",true);
  label(layout,"Se usar Restream, copie dele a URL de entrada e a chave; configure o TikTok como destino no Restream. URL e chave precisam pertencer ao mesmo serviço. Não confunda o link da página de prévia com a URL RTMP/RTMPS.",12,Color.LTGRAY);
  live=button(layout,"2 · AUTORIZAR CAPTURA E TRANSMITIR",()->begin("live"));
  button(layout,"ENCERRAR CAPTURA / TRANSMISSÃO",()->{pendingKey=null;key.setText("");if(CaptureService.active)startService(new Intent(this,CaptureService.class).setAction("STOP"));});
  status=label(layout,CaptureService.session.message(),14,Color.rgb(178,255,99));
  button(layout,"TENTAR ÁUDIO DO JOGO NOVAMENTE",CaptureService::retryGameAudio);
  button(layout,"COPIAR DIAGNÓSTICO · SEM CHAVES",()->{android.content.ClipboardManager clipboard=(android.content.ClipboardManager)getSystemService(CLIPBOARD_SERVICE);clipboard.setPrimaryClip(ClipData.newPlainText("Diagnóstico Cofra Studio",CaptureService.diagnostic()));Toast.makeText(this,"Diagnóstico copiado; não inclui URL ou chave.",Toast.LENGTH_SHORT).show();});
  director=label(layout,"Espectadores e FPS do jogo: aguardando painel local…",14,Color.CYAN);
  preview=new ImageView(this);preview.setAdjustViewBounds(true);preview.setMaxHeight(640);layout.addView(preview,new LinearLayout.LayoutParams(-1,-2));
  label(layout,"A chave fica apenas na memória e não é enviada ao painel Termux. Esta tela é protegida contra captura. Não há bolha flutuante nem reconexão automática da LIVE. A ponte de áudio tenta recuperar com limite; se ficar indisponível, aparece aviso de silêncio e a imagem continua. Mantenha o jogo aberto e a tela acesa. BETA: valide o MP4 e a transmissão no celular.",12,Color.LTGRAY);
 }
 private void begin(String mode){
  if(CaptureService.active)return;pendingMode=mode;pendingProfile=profile.getSelectedItemPosition();
  pendingAudio=new String[]{"game","mix","internal","mic","none"}[audio.getSelectedItemPosition()];
  pendingUrl=null;pendingKey=null;
  if("live".equals(mode)){
   try{new Endpoint(url.getText().toString(),key.getText().toString());}catch(Exception e){status.setText("Confira a URL RTMP/RTMPS e a chave, em campos separados.");return;}
   pendingUrl=url.getText().toString().trim();pendingKey=key.getText().toString().trim();
  }
  if(("mix".equals(pendingAudio)||"internal".equals(pendingAudio)||"mic".equals(pendingAudio))&&checkSelfPermission(Manifest.permission.RECORD_AUDIO)!=PackageManager.PERMISSION_GRANTED){requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO},41);return;}
  if(Build.VERSION.SDK_INT>=33&&checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED){requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},42);return;}
  permission();
 }
 private void permission(){MediaProjectionManager m=(MediaProjectionManager)getSystemService(MEDIA_PROJECTION_SERVICE);Intent i=Build.VERSION.SDK_INT>=34?m.createScreenCaptureIntent(MediaProjectionConfig.createConfigForUserChoice()):m.createScreenCaptureIntent();startActivityForResult(i,43);}
 @Override public void onRequestPermissionsResult(int code,String[] permissions,int[] grants){super.onRequestPermissionsResult(code,permissions,grants);if(code==41){if(grants.length>0&&grants[0]==PackageManager.PERMISSION_GRANTED)begin(pendingMode);else{pendingKey=null;status.setText("Permissão de áudio recusada. Selecione Jogo e voz ou Sem áudio para testar.");}}else if(code==42)permission();}
 @Override public void onActivityResult(int request,int result,Intent permission){
  super.onActivityResult(request,result,permission);if(request!=43)return;
  if(result!=RESULT_OK||permission==null||pendingMode==null){pendingKey=null;status.setText("Captura não autorizada; nada foi transmitido.");return;}
  Intent i=new Intent(this,CaptureService.class).putExtra("permission",permission).putExtra("mode",pendingMode).putExtra("audio",pendingAudio).putExtra("url",pendingUrl).putExtra("key",pendingKey).putExtra("width",pendingProfile==0?720:1080).putExtra("height",pendingProfile==0?1280:1920).putExtra("bitrate",pendingProfile==0?4000000:6000000).putExtra("top",top.getProgress()/100f).putExtra("bottom",bottom.getProgress()/100f).putExtra("side",side.getProgress()/100f).putExtra("delay",delay.getProgress()-300);
  pendingKey=null;pendingMode=null;key.setText("");try{startForegroundService(i);openGame();}catch(Exception e){CaptureService.session.begin("capture");CaptureService.session.fail("ANDROID_SERVICE_START","O Android não autorizou iniciar a captura. Abra o app, conceda as permissões e tente novamente.");status.setText(CaptureService.session.message());}
 }
 private void openGame(){try{startActivity(new Intent().setComponent(new ComponentName("com.termux.x11","com.termux.x11.MainActivity")).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));}catch(Exception e){if(status!=null)status.setText("Abra manualmente o Termux:X11 depois de iniciar o jogo com bash start.sh.");}}
 private void fetchDirector(){fetching=true;new Thread(()->{
   String result="Painel local indisponível. Inicie o jogo e o complemento 0.3.4.";HttpURLConnection c=null;
   try{c=(HttpURLConnection)new URL("http://127.0.0.1:9393/termux/director/status").openConnection();c.setConnectTimeout(1200);c.setReadTimeout(1200);c.setInstanceFollowRedirects(false);ByteArrayOutputStream out=new ByteArrayOutputStream();try(InputStream in=c.getInputStream()){byte[] b=new byte[4096];int n;while((n=in.read(b))>0){out.write(b,0,n);if(out.size()>65536)throw new IOException();}}JSONObject d=new JSONObject(out.toString("UTF-8"));JSONObject audience=d.optJSONObject("audience"),game=d.optJSONObject("game");JSONObject perf=game==null?null:game.optJSONObject("performance");result="Espectadores: "+(audience==null?"—":(audience.isNull("count")?"—":audience.optString("count","—"))+(audience.optBoolean("stale",true)?" (desatualizado)":""))+" · FPS do jogo: "+(perf==null?"—":perf.optString("fps","—"))+"\nPainel privado · saída do encoder e FPS do jogo são medidas diferentes.";}catch(Exception ignored){}finally{if(c!=null)c.disconnect();}
   final String text=result;handler.post(()->{fetching=false;if(visible)director.setText(text);});
  },"cofra-director").start();}
 @Override protected void onResume(){super.onResume();visible=true;CaptureService.previewWanted=true;lastAt=0;lastFrames=CaptureService.frames;lastBytes=CaptureService.bytes;handler.removeCallbacks(poll);handler.post(poll);}
 @Override protected void onPause(){visible=false;CaptureService.previewWanted=false;handler.removeCallbacks(poll);super.onPause();}
 @Override protected void onDestroy(){pendingKey=null;handler.removeCallbacks(poll);super.onDestroy();}
 private TextView label(LinearLayout l,String text,int size,int color){TextView t=new TextView(this);t.setText(text);t.setTextSize(size);t.setTextColor(color);t.setPadding(0,8,0,8);l.addView(t);return t;}
 private EditText field(LinearLayout l,String title,String hint,boolean secret){label(l,title,14,Color.WHITE);EditText e=new EditText(this);e.setSaveEnabled(false);e.setSingleLine(true);e.setTextColor(Color.WHITE);e.setHintTextColor(Color.GRAY);e.setHint(hint);e.setInputType(InputType.TYPE_CLASS_TEXT|(secret?InputType.TYPE_TEXT_VARIATION_PASSWORD:InputType.TYPE_TEXT_VARIATION_URI));e.setImportantForAutofill(View.IMPORTANT_FOR_AUTOFILL_NO_EXCLUDE_DESCENDANTS);l.addView(e);return e;}
 private Spinner options(LinearLayout l,String title,String[] choices){label(l,title,14,Color.WHITE);Spinner s=new Spinner(this);s.setAdapter(new ArrayAdapter<String>(this,android.R.layout.simple_spinner_dropdown_item,choices));l.addView(s);return s;}
 private SeekBar slider(LinearLayout l,String title,int max){TextView t=label(l,title+" · 0",14,Color.WHITE);SeekBar s=new SeekBar(this);s.setMax(max);s.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener(){public void onProgressChanged(SeekBar b,int n,boolean from){t.setText(title+" · "+n);if(top!=null&&bottom!=null&&side!=null)CaptureService.crop(top.getProgress()/100f,bottom.getProgress()/100f,side.getProgress()/100f);}public void onStartTrackingTouch(SeekBar b){}public void onStopTrackingTouch(SeekBar b){}});l.addView(s);return s;}
 private Button button(LinearLayout l,String text,Runnable action){Button b=new Button(this);b.setText(text);b.setOnClickListener(v->action.run());l.addView(b);return b;}
}
