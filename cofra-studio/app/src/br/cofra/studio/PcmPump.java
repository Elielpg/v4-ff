package br.cofra.studio;

import java.io.*;
import java.net.SocketTimeoutException;
import java.util.Arrays;

/** Bounded, independent PCM recovery. An unavailable game mixer never blocks video. */
public final class PcmPump implements AutoCloseable {
 public interface Source extends AutoCloseable {
  void open() throws Exception;
  int read(byte[] data,int length) throws Exception;
  void close();
 }
 public interface Factory {Source create();}
 private final Factory factory;
 private final PcmRing ring=new PcmRing(48000); // 250 ms, stereo s16le 48 kHz.
 private final int maxFailures;
 private final long[] delays;
 private volatile boolean running,exhausted;
 private volatile Source source;
 private volatile Thread worker;
 private volatile long received,lastReceivedNs;
 private volatile int attempts,failures;
 private volatile String state="idle",lastError="";
 private long silentReads;

 public PcmPump(Factory factory){this(factory,5,new long[]{1000,2000,4000,8000});}
 public PcmPump(Factory factory,int maxFailures,long[] delays){
  if(maxFailures<1||delays.length==0)throw new IllegalArgumentException();
  this.factory=factory;this.maxFailures=maxFailures;this.delays=delays.clone();
 }
 public synchronized void start(){if(running)return;running=true;launch();}
 private void launch(){worker=new Thread(this::produce,"cofra-game-pcm");worker.start();}
 private void produce(){
  byte[] data=new byte[4096];
  while(running&&failures<maxFailures){
   Source current=null;
   try{
    attempts++;state="connecting";current=factory.create();source=current;current.open();
    if(!running)break;
    state="waiting";
    while(running){
     int n=current.read(data,data.length);
     if(n<=0)throw new EOFException();
     if(n%4!=0||n>data.length)throw new IOException();
     ring.put(data,n);received+=n;lastReceivedNs=System.nanoTime();state="receiving";
    }
   }catch(Exception error){
    if(!running)break;
    failures++;lastError=errorCode(error);state=failures>=maxFailures?"exhausted":"retrying";
    // Stale samples must not be replayed after reconnection.
    ring.clear();
   }finally{
    if(current!=null)try{current.close();}catch(RuntimeException ignored){}
    source=null;
   }
   if(running&&failures<maxFailures){try{Thread.sleep(delays[Math.min(failures-1,delays.length-1)]);}catch(InterruptedException stop){Thread.currentThread().interrupt();break;}}
  }
  if(running){exhausted=true;state="exhausted";}
 }
 /** Caller paces 48 kHz timestamps. Empty input is explicit, audible silence. */
 public int read(byte[] out,int wanted){
  wanted=Math.min(wanted,out.length);wanted-=wanted%4;Arrays.fill(out,0,wanted,(byte)0);
  int copied=ring.take(out,wanted);if(copied<wanted)silentReads++;
  return wanted;
 }
 public synchronized boolean retry(){
  if(!running||!exhausted||worker!=null&&worker.isAlive())return false;
  exhausted=false;failures=0;ring.clear();launch();return true;
 }
 public String summary(){
  boolean stale=lastReceivedNs==0||System.nanoTime()-lastReceivedNs>1500000000L;
  if("receiving".equals(state)&&!stale)return "Áudio do jogo ativo";
  if(exhausted)return "SEM ÁUDIO DO JOGO · imagem continua · recuperação pausada; toque em Tentar áudio novamente";
  if(!running)return "Ponte de áudio encerrada";
  return "ÁUDIO DO JOGO EM SILÊNCIO · "+("retrying".equals(state)?"reconectando":"aguardando a ponte")+" · imagem continua · tentativa "+attempts;
 }
 public String diagnostic(){return "pcm_state="+state+"\npcm_attempts="+attempts+"\npcm_failures="+failures+"\npcm_last_error="+lastError+"\npcm_received_bytes="+received+"\npcm_silent_reads="+silentReads;}
 public boolean isExhausted(){return exhausted;}
 public int failureCount(){return failures;}
 public long receivedBytes(){return received;}
 private static String errorCode(Exception e){
  if(e instanceof BridgeError)return ((BridgeError)e).code;
  if(e instanceof SocketTimeoutException)return "PCM_READ_TIMEOUT";
  if(e instanceof EOFException)return "PCM_EOF";
  if(e instanceof java.net.ConnectException)return "PCM_CONNECT_FAILED";
  return "PCM_SOURCE_ERROR";
 }
 public static final class BridgeError extends IOException{
  public final String code;
  public BridgeError(String code){super("Ponte local indisponível");this.code=code;}
 }
 public void close(){
  running=false;Thread t=worker;if(t!=null)t.interrupt();Source current=source;if(current!=null)try{current.close();}catch(RuntimeException ignored){}ring.clear();
 }
}
