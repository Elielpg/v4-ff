package br.ben10.rhythm;
import android.app.*;import android.os.*;import android.content.*;import android.content.pm.ServiceInfo;import android.media.*;import android.media.audiofx.Visualizer;import android.media.projection.*;import java.net.*;import java.io.*;import java.util.Locale;
public final class CaptureService extends Service {
 public static final String STATUS="br.ben10.rhythm.STATUS";private volatile boolean running;private MediaProjection projection;private AudioRecord record;private Visualizer visualizer;private Thread reader,sender;private String token;private int port;private long sequence;private Packet pending;private long lastNotice;
 private static final class Packet{double energy,level;long at;Packet(double e,double l,long t){energy=e;level=l;at=t;}}
 public IBinder onBind(Intent i){return null;}
 public int onStartCommand(Intent i,int flags,int id){
  if(i==null||"STOP".equals(i.getAction())){stopSelf();return START_NOT_STICKY;}if(running)return START_NOT_STICKY;
  token=i.getStringExtra("token");port=i.getIntExtra("port",3000);if(token==null||!token.matches("[a-f0-9]{64}")||port<1024||port>65535){stopSelf();return START_NOT_STICKY;}
  boolean shared=i.getBooleanExtra("shared",false);
  try{
   NotificationManager notifications=getSystemService(NotificationManager.class);notifications.createNotificationChannel(new NotificationChannel("beat","Análise de batida",NotificationManager.IMPORTANCE_LOW));
   PendingIntent stop=PendingIntent.getService(this,1,new Intent(this,CaptureService.class).setAction("STOP"),PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);PendingIntent open=PendingIntent.getActivity(this,2,new Intent(this,MainActivity.class),PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
   Notification n=new Notification.Builder(this,"beat").setSmallIcon(android.R.drawable.ic_media_play).setContentTitle("Batida Omnitrix ativa").setContentText(shared?"Captura compartilhada → jogo local":"Energia do áudio · sem nova captura de tela").setContentIntent(open).setOngoing(true).addAction(new Notification.Action.Builder(null,"Parar",stop).build()).build();
   int type=shared?ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION:Build.VERSION.SDK_INT>=34?ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE:0;startForeground(48,n,type);running=true;sequence=0;
   if(shared)startShared(i);else startVisualizer();
   sender=new Thread(this::send,"omni-local-level");sender.start();notice(shared?"Captura compartilhada ativa. Toque a música e volte ao jogo.":"Visualizador de energia ativo, sem nova captura de tela. Toque a música e volte ao jogo.");
  }catch(Exception e){running=false;notice(shared?"Captura indisponível: "+e.getMessage():"O aparelho não liberou o visualizador de saída. Nenhuma captura de tela foi iniciada. Use o player do jogo ou BPM manual.");stopSelf();}
  return START_NOT_STICKY;
 }
 private void startVisualizer(){
  visualizer=new Visualizer(0);int size=Visualizer.getCaptureSizeRange()[1];if(visualizer.setCaptureSize(size)!=Visualizer.SUCCESS)throw new IllegalStateException("Tamanho do visualizador");visualizer.setScalingMode(Visualizer.SCALING_MODE_AS_PLAYED);
  int result=visualizer.setDataCaptureListener(new Visualizer.OnDataCaptureListener(){public void onWaveFormDataCapture(Visualizer v,byte[] b,int rate){}public void onFftDataCapture(Visualizer v,byte[] fft,int rate){if(!running)return;double[] levels=SpectrumMeter.measure(fft,Math.max(8000,rate/1000));offer(levels[0],levels[1],System.currentTimeMillis()-11);}},Math.min(20000,Visualizer.getMaxCaptureRate()),false,true);
  if(result!=Visualizer.SUCCESS||visualizer.setEnabled(true)!=Visualizer.SUCCESS)throw new IllegalStateException("Visualizador indisponível");
 }
 private void startShared(Intent i)throws Exception{
  Intent data=i.getParcelableExtra("projection");if(data==null)throw new Exception("Compartilhamento não autorizado");MediaProjectionManager manager=(MediaProjectionManager)getSystemService(MEDIA_PROJECTION_SERVICE);projection=manager.getMediaProjection(i.getIntExtra("result",-1),data);projection.registerCallback(new MediaProjection.Callback(){public void onStop(){if(running){notice("O compartilhamento de áudio terminou.");stopSelf();}}},new Handler(getMainLooper()));
  AudioPlaybackCaptureConfiguration.Builder builder=new AudioPlaybackCaptureConfiguration.Builder(projection).addMatchingUsage(AudioAttributes.USAGE_MEDIA).addMatchingUsage(AudioAttributes.USAGE_GAME);int uid=i.getIntExtra("musicUid",-1);if(uid>=0)builder.addMatchingUid(uid);
  int min=AudioRecord.getMinBufferSize(48000,AudioFormat.CHANNEL_IN_MONO,AudioFormat.ENCODING_PCM_16BIT);record=new AudioRecord.Builder().setAudioFormat(new AudioFormat.Builder().setSampleRate(48000).setEncoding(AudioFormat.ENCODING_PCM_16BIT).setChannelMask(AudioFormat.CHANNEL_IN_MONO).build()).setBufferSizeInBytes(Math.max(min*2,8192)).setAudioPlaybackCaptureConfig(builder.build()).build();if(record.getState()!=AudioRecord.STATE_INITIALIZED)throw new Exception("Android não iniciou a captura");record.startRecording();reader=new Thread(this::capture,"omni-audio-level");reader.start();
 }
 private synchronized void offer(double e,double level,long at){if(pending==null||e>=pending.energy)pending=new Packet(e,level,at);else pending.level=Math.max(pending.level,level);}
 private void capture(){try{BeatMeter meter=new BeatMeter(48000);short[] buffer=new short[1024];while(running){int n=record.read(buffer,0,buffer.length,AudioRecord.READ_BLOCKING);if(n<0)throw new Exception("leitura de áudio "+n);for(int k=0;k<n;k++){double e=meter.push(buffer[k]/32768.0);if(e>=0)offer(e,meter.level,System.currentTimeMillis()-11);}}}catch(Exception e){if(running){notice("A captura parou: "+e.getMessage());stopSelf();}}}
 private void send(){int failures=0;long lastSound=System.currentTimeMillis(),lastSend=0;while(running){try{
   Thread.sleep(50);Packet p;synchronized(this){p=pending;pending=null;}if(p==null){if(System.currentTimeMillis()-lastSend<500)continue;p=new Packet(0,0,System.currentTimeMillis());}lastSend=System.currentTimeMillis();if(p.level>.0005)lastSound=System.currentTimeMillis();
   String body=String.format(Locale.US,"{\"energy\":%.7f,\"level\":%.7f,\"at\":%d,\"seq\":%d}",p.energy,p.level,p.at,sequence++);byte[] bytes=body.getBytes("UTF-8");HttpURLConnection q=(HttpURLConnection)new URL("http://127.0.0.1:"+port+"/api/rhythm/frame").openConnection();q.setConnectTimeout(900);q.setReadTimeout(900);q.setRequestMethod("POST");q.setRequestProperty("Content-Type","application/json");q.setRequestProperty("Authorization","Bearer "+token);q.setFixedLengthStreamingMode(bytes.length);q.setDoOutput(true);try(OutputStream out=q.getOutputStream()){out.write(bytes);}int status=q.getResponseCode();InputStream response=status<400?q.getInputStream():q.getErrorStream();if(response!=null){byte[] b=new byte[256];while(response.read(b)>0){}response.close();}
   if(status==401||status==403){notice("Pareamento encerrado no jogo. Conecte novamente.");stopSelf();return;}if(status!=200)throw new IOException("jogo respondeu "+status);failures=0;
   if(System.currentTimeMillis()-lastNotice>2000)notice(System.currentTimeMillis()-lastSound>5000?"Conectado, mas sem energia de áudio disponível. Tente o player local ou BPM manual.":"Batida enviada ao jogo. Volte ao navegador.");
  }catch(InterruptedException e){return;}catch(Exception e){if(++failures>=5){notice("O jogo não respondeu. Análise encerrada; inicie o Termux e conecte novamente.");stopSelf();return;}}}}
 private void notice(String text){lastNotice=System.currentTimeMillis();sendBroadcast(new Intent(STATUS).setPackage(getPackageName()).putExtra("text",text));}
 public void onDestroy(){running=false;if(sender!=null)sender.interrupt();if(visualizer!=null){try{visualizer.setEnabled(false);}catch(Exception ignored){}visualizer.release();visualizer=null;}if(record!=null){try{record.stop();}catch(Exception ignored){}record.release();record=null;}if(reader!=null)reader.interrupt();if(projection!=null){MediaProjection p=projection;projection=null;p.stop();}token=null;synchronized(this){pending=null;}stopForeground(STOP_FOREGROUND_REMOVE);super.onDestroy();}
}
