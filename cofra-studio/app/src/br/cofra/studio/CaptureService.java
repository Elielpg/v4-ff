package br.cofra.studio;

import android.app.*;
import android.content.*;
import android.content.pm.*;
import android.graphics.Bitmap;
import android.hardware.display.DisplayManager;
import android.media.*;
import android.media.projection.*;
import android.os.*;
import android.util.DisplayMetrics;
import android.view.*;
import java.nio.ByteBuffer;
import java.util.Arrays;
import br.cofra.studio.rtmp.*;

public final class CaptureService extends Service {
  static volatile boolean active, previewWanted, sourceVisible=true;
  static volatile Bitmap preview;
  static volatile String status="Pronto para um teste local.", encoder="—", lastTest="", musicStatus="";
  static volatile long frames, bytes, sourceFrames;
  static volatile double audioRms;
  private static volatile CaptureService current;
  private volatile boolean running;
  private MediaProjection projection;
  private MediaCodec video,audio;
  private AudioRecord record;
  private GamePcm game;
  private Surface input;
  private ScreenRenderer renderer;
  private RtmpClient client;
  private LocalRecorder recorder;
  private long startUs;
  private String mode, audioMode;
  private int audioDelay;
  private final Handler ui=new Handler(Looper.getMainLooper());
  private final Object resources=new Object();
  private PowerManager.WakeLock wake;
  private DisplayManager displays;
  private DisplayManager.DisplayListener displayListener;
  private Thread connection,videoDrain,audioDrain,audioFeed,musicFeed;
  private final PcmRing music=new PcmRing(48000*4/4);

  public IBinder onBind(Intent intent){return null;}
  public static void crop(float top,float bottom,float side){CaptureService s=current;if(s!=null&&s.renderer!=null)s.renderer.crop(top,bottom,side);}
  public int onStartCommand(Intent i,int flags,int id){
    if(i==null){stopSelf();return START_NOT_STICKY;}
    if("STOP".equals(i.getAction())){running=false;status="Encerrando captura…";stopSelf();return START_NOT_STICKY;}
    if(active)return START_NOT_STICKY;
    mode=i.getStringExtra("mode");audioMode=i.getStringExtra("audio");
    if(!"test".equals(mode)&&!"live".equals(mode)){stopSelf();return START_NOT_STICKY;}
    try{
      final int w=i.getIntExtra("width",720),h=i.getIntExtra("height",1280),fps=30,bitrate=i.getIntExtra("bitrate",4000000);
      if(!((w==720&&h==1280)||(w==1080&&h==1920))||bitrate<2000000||bitrate>6000000)throw new IllegalArgumentException();
      if(!Arrays.asList("game","mix","internal","mic","none").contains(audioMode))throw new IllegalArgumentException();
      audioDelay=Math.max(-300,Math.min(300,i.getIntExtra("delay",0)));
      final Endpoint destination="live".equals(mode)?new Endpoint(i.getStringExtra("url"),i.getStringExtra("key")):null;i.removeExtra("key");
      notifyStart();
      Intent permission=Build.VERSION.SDK_INT>=33?i.getParcelableExtra("permission",Intent.class):i.getParcelableExtra("permission");
      projection=((MediaProjectionManager)getSystemService(MEDIA_PROJECTION_SERVICE)).getMediaProjection(Activity.RESULT_OK,permission);i.removeExtra("permission");
      projection.registerCallback(new MediaProjection.Callback(){
        public void onStop(){if(running)fail("O Android encerrou a captura. Autorize uma nova sessão para voltar.");}
        public void onCapturedContentResize(int width,int height){if(renderer!=null)renderer.resize(width,height);}
        public void onCapturedContentVisibilityChanged(boolean visible){sourceVisible=visible;}
      },ui);
      wake=((PowerManager)getSystemService(POWER_SERVICE)).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,"CofraStudio:capture");wake.acquire(4*60*60*1000L);
      if("test".equals(mode))lastTest="";
      active=true;running=true;current=this;frames=0;bytes=0;sourceFrames=0;audioRms=0;sourceVisible=true;preview=null;musicStatus="";
      float top=FrameMath.bound(i.getFloatExtra("top",0),.3f),bottom=FrameMath.bound(i.getFloatExtra("bottom",0),.3f),side=FrameMath.bound(i.getFloatExtra("side",0),.2f);
      status="test".equals(mode)?"Preparando teste local de 10 segundos…":"Conectando ao servidor configurado…";
      connection=new Thread(()->{
        try{
          synchronized(resources){if(!running)return;if("test".equals(mode))recorder=new LocalRecorder(this,!"none".equals(audioMode));else client=new RtmpClient(this::fail);}
          if(client!=null)client.connect(destination,w,h,fps,!"none".equals(audioMode),2,48000);
          synchronized(resources){if(!running)return;startEncoding(w,h,fps,bitrate,top,bottom,side);}
          if(!running)return;
          status="test".equals(mode)?"Gravando TESTE LOCAL · não transmite para o TikTok":"ENVIANDO · servidor confirmou a publicação";
          if("test".equals(mode))ui.postDelayed(()->{if(running){status="Finalizando o teste local…";running=false;stopSelf();}},10000);
        }catch(Exception e){if(running)fail("Não foi possível iniciar imagem/áudio. Confira o jogo aberto, permissões e, para LIVE, servidor/chave. Faça primeiro um teste local.");}
      },"cofra-start");connection.start();
    }catch(Exception e){status="Não foi possível autorizar esta captura. Volte ao aplicativo e tente novamente.";stopSelf();}
    return START_NOT_STICKY;
  }
  private void notifyStart(){
    NotificationManager nm=getSystemService(NotificationManager.class);NotificationChannel channel=new NotificationChannel("studio","Captura do jogo",NotificationManager.IMPORTANCE_LOW);channel.setSound(null,null);nm.createNotificationChannel(channel);
    PendingIntent stop=PendingIntent.getService(this,1,new Intent(this,CaptureService.class).setAction("STOP"),PendingIntent.FLAG_IMMUTABLE|PendingIntent.FLAG_UPDATE_CURRENT);
    PendingIntent open=PendingIntent.getActivity(this,2,new Intent(this,MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT),PendingIntent.FLAG_IMMUTABLE|PendingIntent.FLAG_UPDATE_CURRENT);
    Notification n=new Notification.Builder(this,"studio").setSmallIcon(android.R.drawable.ic_media_play).setContentTitle("Cofra Studio · captura autorizada").setContentText("test".equals(mode)?"Teste local de 10 segundos, sem transmissão":"Captura e envio ao destino configurado").setContentIntent(open).addAction(new Notification.Action.Builder(null,"Encerrar",stop).build()).setOngoing(true).build();
    int types=ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION;if("mic".equals(audioMode))types|=ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE;
    startForeground(7,n,types);
  }
  private MediaCodec hardwareVideo(MediaFormat format)throws Exception {
    for(MediaCodecInfo info:new MediaCodecList(MediaCodecList.REGULAR_CODECS).getCodecInfos()){
      if(!info.isEncoder()||!info.isHardwareAccelerated())continue;
      try{
        MediaCodecInfo.CodecCapabilities caps=info.getCapabilitiesForType(MediaFormat.MIMETYPE_VIDEO_AVC);
        if(!caps.getVideoCapabilities().isSizeSupported(format.getInteger(MediaFormat.KEY_WIDTH),format.getInteger(MediaFormat.KEY_HEIGHT)))continue;
        if(caps.getEncoderCapabilities().isBitrateModeSupported(MediaCodecInfo.EncoderCapabilities.BITRATE_MODE_CBR))format.setInteger(MediaFormat.KEY_BITRATE_MODE,MediaCodecInfo.EncoderCapabilities.BITRATE_MODE_CBR);else format.setInteger(MediaFormat.KEY_BITRATE_MODE,MediaCodecInfo.EncoderCapabilities.BITRATE_MODE_VBR);
        boolean main=false;for(MediaCodecInfo.CodecProfileLevel p:caps.profileLevels)if(p.profile==MediaCodecInfo.CodecProfileLevel.AVCProfileMain)main=true;
        format.setInteger(MediaFormat.KEY_PROFILE,main?MediaCodecInfo.CodecProfileLevel.AVCProfileMain:MediaCodecInfo.CodecProfileLevel.AVCProfileBaseline);
        MediaCodec codec=MediaCodec.createByCodecName(info.getName());try{codec.configure(format,null,null,MediaCodec.CONFIGURE_FLAG_ENCODE);encoder=info.getName()+" · hardware";return codec;}catch(Exception e){codec.release();}
      }catch(Exception ignored){}
    }
    throw new IllegalStateException("Codificador H264 por hardware não disponível neste perfil");
  }
  private void startEncoding(int width,int height,int fps,int bitrate,float top,float bottom,float side)throws Exception {
    MediaFormat format=MediaFormat.createVideoFormat(MediaFormat.MIMETYPE_VIDEO_AVC,width,height);format.setInteger(MediaFormat.KEY_COLOR_FORMAT,MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface);format.setInteger(MediaFormat.KEY_BIT_RATE,bitrate);format.setInteger(MediaFormat.KEY_FRAME_RATE,fps);format.setInteger(MediaFormat.KEY_I_FRAME_INTERVAL,2);format.setInteger(MediaFormat.KEY_MAX_B_FRAMES,0);format.setInteger(MediaFormat.KEY_PRIORITY,0);
    video=hardwareVideo(format);input=video.createInputSurface();video.start();startUs=System.nanoTime()/1000;
    DisplayMetrics m=new DisplayMetrics();((WindowManager)getSystemService(WINDOW_SERVICE)).getDefaultDisplay().getRealMetrics(m);
    renderer=new ScreenRenderer(top,bottom,side,this::fail);renderer.start(projection,input,m.widthPixels,m.heightPixels,m.densityDpi,width,height,fps);
    if(Build.VERSION.SDK_INT<34){displays=getSystemService(DisplayManager.class);displayListener=new DisplayManager.DisplayListener(){public void onDisplayAdded(int id){}public void onDisplayRemoved(int id){}public void onDisplayChanged(int id){if(running&&renderer!=null){DisplayMetrics d=new DisplayMetrics();((WindowManager)getSystemService(WINDOW_SERVICE)).getDefaultDisplay().getRealMetrics(d);renderer.resize(d.widthPixels,d.heightPixels);}}};displays.registerDisplayListener(displayListener,ui);}
    videoDrain=new Thread(()->drain(video,true),"cofra-h264");videoDrain.start();if(!"none".equals(audioMode))startAudio();
  }
  private AudioRecord makeRecord(boolean mic)throws Exception {
    AudioFormat f=new AudioFormat.Builder().setSampleRate(48000).setChannelMask(AudioFormat.CHANNEL_IN_STEREO).setEncoding(AudioFormat.ENCODING_PCM_16BIT).build();int min=AudioRecord.getMinBufferSize(48000,AudioFormat.CHANNEL_IN_STEREO,AudioFormat.ENCODING_PCM_16BIT);
    AudioRecord.Builder b=new AudioRecord.Builder().setAudioFormat(f).setBufferSizeInBytes(Math.max(16384,min*4));
    if(mic)b.setAudioSource(MediaRecorder.AudioSource.MIC);else{
      AudioPlaybackCaptureConfiguration.Builder config=new AudioPlaybackCaptureConfiguration.Builder(projection).addMatchingUsage(AudioAttributes.USAGE_MEDIA).addMatchingUsage(AudioAttributes.USAGE_GAME).addMatchingUsage(AudioAttributes.USAGE_UNKNOWN);
      if("mix".equals(audioMode)){int uid=getPackageManager().getApplicationInfo("com.termux",0).uid;config.excludeUid(uid);}
      b.setAudioPlaybackCaptureConfig(config.build());
    }
    AudioRecord r=b.build();if(r.getState()!=AudioRecord.STATE_INITIALIZED){r.release();throw new IllegalStateException();}return r;
  }
  private void startAudio()throws Exception {
    boolean fromGame="game".equals(audioMode)||"mix".equals(audioMode);
    if(fromGame){game=new GamePcm();game.open();}
    if(!"game".equals(audioMode)){
      try{record=makeRecord("mic".equals(audioMode));record.startRecording();}
      catch(Exception e){if(!fromGame)throw e;record=null;musicStatus="Músicas externas indisponíveis; áudio do jogo continua ativo.";}
    }
    if("mix".equals(audioMode)&&record!=null){musicFeed=new Thread(()->{byte[] data=new byte[4096];try{while(running){int n=record.read(data,0,data.length,AudioRecord.READ_BLOCKING);if(n<0)throw new IllegalStateException();music.put(data,n);}}catch(Exception e){musicStatus="Música externa interrompida; áudio do jogo preservado.";}},"cofra-music");musicFeed.start();}
    MediaFormat f=MediaFormat.createAudioFormat(MediaFormat.MIMETYPE_AUDIO_AAC,48000,2);f.setInteger(MediaFormat.KEY_AAC_PROFILE,MediaCodecInfo.CodecProfileLevel.AACObjectLC);f.setInteger(MediaFormat.KEY_BIT_RATE,128000);f.setInteger(MediaFormat.KEY_MAX_INPUT_SIZE,8192);audio=MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_AUDIO_AAC);audio.configure(f,null,null,MediaCodec.CONFIGURE_FLAG_ENCODE);audio.start();
    audioDrain=new Thread(()->drain(audio,false),"cofra-aac");audioDrain.start();
    audioFeed=new Thread(()->{byte[] pcm=new byte[4096],bg=new byte[4096];long samples=0,base=System.nanoTime()/1000-startUs;try{while(running){int index=audio.dequeueInputBuffer(15000);if(index<0)continue;ByteBuffer buffer=audio.getInputBuffer(index);buffer.clear();int wanted=Math.min(buffer.remaining(),pcm.length);wanted-=wanted%4;int n=game!=null?game.read(pcm,wanted):record.read(pcm,0,wanted,AudioRecord.READ_BLOCKING);if(n<0)throw new IllegalStateException();n-=n%4;
      if("mix".equals(audioMode)){Arrays.fill(bg,(byte)0);music.take(bg,n);PcmRing.mix(pcm,bg,n,PcmRing.rms(pcm,n)>.04?.12:.35);}
      audioRms=PcmRing.rms(pcm,n);buffer.put(pcm,0,n);long pts=Math.max(0,base+samples*1000000/48000+audioDelay*1000L);audio.queueInputBuffer(index,0,n,pts,0);samples+=n/4;
    }}catch(Exception e){if(running)fail("A fonte de áudio parou. Confira a ponte no painel ou escolha outro modo e faça um novo teste.");}},"cofra-pcm");audioFeed.start();
  }
  private static byte[] data(ByteBuffer value){if(value==null)return new byte[0];ByteBuffer b=value.duplicate();byte[] out=new byte[b.remaining()];b.get(out);return out;}
  private void drain(MediaCodec codec,boolean isVideo){
    MediaCodec.BufferInfo info=new MediaCodec.BufferInfo();long firstPts=Long.MIN_VALUE,firstAt=0;boolean absolute=false;
    try{while(running){int index=codec.dequeueOutputBuffer(info,15000);
      if(index==MediaCodec.INFO_OUTPUT_FORMAT_CHANGED){MediaFormat format=codec.getOutputFormat();if(recorder!=null)recorder.format(isVideo,format);else if(isVideo)client.offerVideo(FlvCodec.avcConfig(data(format.getByteBuffer("csd-0")),data(format.getByteBuffer("csd-1"))),0);else client.offerAudio(FlvCodec.audio(data(format.getByteBuffer("csd-0")),true),0);}
      else if(index>=0){if(info.size>0&&(info.flags&MediaCodec.BUFFER_FLAG_CODEC_CONFIG)==0){ByteBuffer b=codec.getOutputBuffer(index);b.position(info.offset);b.limit(info.offset+info.size);byte[] payload=new byte[info.size];b.get(payload);long pts=info.presentationTimeUs;
        if(isVideo){if(firstPts==Long.MIN_VALUE){firstPts=pts;firstAt=System.nanoTime()/1000-startUs;absolute=pts>=startUs-1000000;}pts=absolute?pts-startUs:firstAt+pts-firstPts;}
        pts=Math.max(0,pts);if(recorder!=null){recorder.frame(isVideo,payload,pts,info.flags);if(isVideo)frames++;bytes+=payload.length;}else{if(isVideo)client.offerVideo(FlvCodec.video(payload,(info.flags&MediaCodec.BUFFER_FLAG_KEY_FRAME)!=0),pts/1000);else client.offerAudio(FlvCodec.audio(payload,false),pts/1000);frames=client.videoFrames;bytes=client.sentBytes;}
      }codec.releaseOutputBuffer(index,false);}
    }}catch(Exception e){if(running)fail("O codificador de "+(isVideo?"imagem":"áudio")+" parou. Faça um teste com o perfil 720p.");}
  }
  private void fail(String reason){if(!running)return;status=reason;running=false;ui.post(this::stopSelf);}
  public void onDestroy(){
    running=false;stopForeground(STOP_FOREGROUND_REMOVE);
    new Thread(()->{synchronized(resources){release();}if(current==this){active=false;current=null;}if("test".equals(mode)&&!lastTest.isEmpty())status="Teste salvo em Filmes/CofraStudio. Abra o vídeo e confira imagem, voz e enquadramento.";else if(!status.contains("parou")&&!status.contains("Não foi")&&!status.contains("encerrou"))status="Captura encerrada. O jogo continua independente.";},"cofra-release").start();super.onDestroy();
  }
  private void release(){
    if(client!=null)client.close();if(game!=null)game.close();if(displays!=null&&displayListener!=null)displays.unregisterDisplayListener(displayListener);
    if(record!=null)try{record.stop();}catch(Exception ignored){}
    if(renderer!=null)renderer.close();
    for(MediaCodec c:new MediaCodec[]{video,audio})if(c!=null)try{c.stop();}catch(Exception ignored){}
    for(Thread t:new Thread[]{audioFeed,audioDrain,videoDrain,musicFeed})if(t!=null)try{t.join(800);}catch(InterruptedException ignored){}
    if(record!=null)try{record.release();}catch(Exception ignored){}
    for(MediaCodec c:new MediaCodec[]{video,audio})if(c!=null)try{c.release();}catch(Exception ignored){}
    if(recorder!=null)try{recorder.close();}catch(Exception ignored){}
    if(input!=null)input.release();if(projection!=null)projection.stop();if(wake!=null&&wake.isHeld())wake.release();
  }
}
