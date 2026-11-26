package br.cofra.studio;

import android.content.*;
import android.media.*;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.MediaStore;
import java.nio.ByteBuffer;
import java.util.*;

/** A ten-second local MP4 test; it never opens a streaming connection. */
final class LocalRecorder implements AutoCloseable {
  private final Context context;
  private final boolean audio;
  private MediaMuxer muxer;
  private ParcelFileDescriptor descriptor;
  private Uri uri;
  private MediaFormat videoFormat,audioFormat;
  private int videoTrack=-1,audioTrack=-1;
  private boolean started,closed,wroteVideo;
  private final ArrayList<Pending> pending=new ArrayList<>();
  private int queuedBytes;
  private static final class Pending {final boolean video;final byte[] bytes;final long pts;final int flags;Pending(boolean v,byte[] b,long t,int f){video=v;bytes=b;pts=t;flags=f;}}
  LocalRecorder(Context c,boolean hasAudio)throws Exception {
    context=c;audio=hasAudio;ContentValues values=new ContentValues();values.put(MediaStore.Video.Media.DISPLAY_NAME,"COFRA_TESTE_"+System.currentTimeMillis()+".mp4");values.put(MediaStore.Video.Media.MIME_TYPE,"video/mp4");values.put(MediaStore.Video.Media.RELATIVE_PATH,"Movies/CofraStudio");values.put(MediaStore.Video.Media.IS_PENDING,1);
    uri=context.getContentResolver().insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI,values);if(uri==null)throw new IllegalStateException();
    try {descriptor=context.getContentResolver().openFileDescriptor(uri,"w");if(descriptor==null)throw new IllegalStateException();muxer=new MediaMuxer(descriptor.getFileDescriptor(),MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4);}catch(Exception e){close();throw e;}
  }
  synchronized void format(boolean video,MediaFormat format)throws Exception {
    if(closed||started)return;if(video)videoFormat=format;else audioFormat=format;
    if(videoFormat!=null&&(!audio||audioFormat!=null)){
      videoTrack=muxer.addTrack(videoFormat);if(audio)audioTrack=muxer.addTrack(audioFormat);muxer.start();started=true;
      for(Pending p:pending)write(p);pending.clear();queuedBytes=0;
    }
  }
  synchronized void frame(boolean video,byte[] bytes,long pts,int flags)throws Exception {
    if(closed)return;Pending p=new Pending(video,bytes,Math.max(0,pts),flags);
    if(started)write(p);else {queuedBytes+=bytes.length;if(pending.size()>=128||queuedBytes>8*1024*1024)throw new IllegalStateException("Formatos não ficaram prontos");pending.add(p);}
  }
  private void write(Pending p){int track=p.video?videoTrack:audioTrack;if(track<0)return;MediaCodec.BufferInfo info=new MediaCodec.BufferInfo();info.set(0,p.bytes.length,p.pts,p.flags);muxer.writeSampleData(track,ByteBuffer.wrap(p.bytes),info);if(p.video)wroteVideo=true;}
  public synchronized void close(){
    if(closed)return;closed=true;boolean success=started&&wroteVideo;
    try{if(started)muxer.stop();}catch(Exception e){success=false;}try{if(muxer!=null)muxer.release();}catch(Exception ignored){}try{if(descriptor!=null)descriptor.close();}catch(Exception ignored){}
    try{if(uri!=null){if(success){ContentValues v=new ContentValues();v.put(MediaStore.Video.Media.IS_PENDING,0);context.getContentResolver().update(uri,v,null,null);CaptureService.lastTest=uri.toString();}else context.getContentResolver().delete(uri,null,null);}}catch(Exception ignored){}
    pending.clear();
  }
}
