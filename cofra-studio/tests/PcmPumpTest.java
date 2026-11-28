import br.cofra.studio.*;
import java.io.*;
import java.net.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.atomic.*;

public final class PcmPumpTest {
 static int checks;
 static void check(boolean value){checks++;if(!value)throw new AssertionError("PCM check "+checks);}
 interface Condition {boolean get();}
 static void await(Condition condition,long ms)throws Exception{long end=System.nanoTime()+ms*1000000L;while(!condition.get()&&System.nanoTime()<end)Thread.sleep(3);check(condition.get());}
 static final class SocketSource implements PcmPump.Source {
  final int port;Socket socket;
  SocketSource(int port){this.port=port;}
  public void open()throws Exception{socket=new Socket("127.0.0.1",port);socket.setSoTimeout(160);}
  public int read(byte[] data,int length)throws Exception{new DataInputStream(socket.getInputStream()).readFully(data,0,length);return length;}
  public void close(){try{if(socket!=null)socket.close();}catch(IOException ignored){}}
 }
 static byte[] tone(int count){byte[] b=new byte[count];for(int i=0;i<count/4;i++){short sample=(short)(Math.sin(i*2*Math.PI*440/48000)*12000);for(int c=0;c<2;c++){int p=i*4+c*2;b[p]=(byte)sample;b[p+1]=(byte)(sample>>8);}}return b;}
 public static void main(String[] args)throws Exception{
  Path out=Paths.get(args[0]);Files.createDirectories(out);
  ServerSocket server=new ServerSocket(0,3,InetAddress.getLoopbackAddress());server.setSoTimeout(4000);
  AtomicBoolean peerFailed=new AtomicBoolean();
  Thread peer=new Thread(()->{try{
   for(int attempt=0;attempt<3;attempt++)try(Socket socket=server.accept()){
    if(attempt==1){Thread.sleep(260);continue;}
    int blocks=attempt==0?4:140;byte[] data=tone(4096);
    for(int i=0;i<blocks;i++){socket.getOutputStream().write(data);Thread.sleep(21);}
   }
  }catch(SocketException stopped){}catch(Exception error){peerFailed.set(true);}finally{try{server.close();}catch(IOException ignored){}}},"fixture-pcm-peer");peer.start();
  PcmPump pump=new PcmPump(()->new SocketSource(server.getLocalPort()),5,new long[]{10,20});pump.start();
  int silent=0,sounded=0;boolean warning=false,recovered=false;
  try(OutputStream pcm=Files.newOutputStream(out.resolve("pump-output.pcm"))){
   byte[] data=new byte[4096];long start=System.nanoTime();
   for(int i=0;i<160;i++){
    int n=pump.read(data,data.length);check(n==4096);
    pcm.write(data);boolean audible=PcmRing.rms(data,n)>.01;
    if(audible)sounded++;else silent++;
    warning|=pump.summary().contains("SILÊNCIO");
    recovered|=pump.failureCount()>=2&&audible;
    long until=start+(i+1)*1024*1000000000L/48000-System.nanoTime();
    if(until>0)Thread.sleep(until/1000000,(int)(until%1000000));
   }
   check(silent>5&&sounded>70&&warning&&recovered);
   check(pump.failureCount()>=2&&pump.receivedBytes()>8192);
  }finally{pump.close();server.close();peer.join(1000);}
  check(!peer.isAlive()&&!peerFailed.get());

  AtomicInteger opens=new AtomicInteger();
  PcmPump exhausted=new PcmPump(()->new PcmPump.Source(){
   public void open()throws Exception{opens.incrementAndGet();throw new PcmPump.BridgeError("PCM_AUTHORIZE_HTTP_503");}
   public int read(byte[] b,int n){return 0;}
   public void close(){}
  },5,new long[]{5});
  exhausted.start();await(exhausted::isExhausted,1000);int old=opens.get();Thread.sleep(80);
  check(old==5&&opens.get()==5&&exhausted.summary().contains("SEM ÁUDIO"));
  byte[] data=new byte[4096];Arrays.fill(data,(byte)77);long begin=System.nanoTime();exhausted.read(data,data.length);
  check(PcmRing.rms(data,data.length)==0&&System.nanoTime()-begin<50000000L);
  check(exhausted.diagnostic().contains("PCM_AUTHORIZE_HTTP_503"));
  check(exhausted.retry());await(()->opens.get()==10&&exhausted.isExhausted(),1000);exhausted.close();

  PcmRing ring=new PcmRing(16);ring.put(new byte[16],16);ring.clear();check(ring.size()==0);
  CaptureState state=new CaptureState();state.begin("live");state.progress("rtmp_connect","Conectando");state.fail("RTMP_NETWORK","Falha de rede");state.progress("capturing","Enviando");state.finish("Encerrado");
  check(state.failed()&&state.message().equals("Falha de rede")&&state.diagnostic().contains("RTMP_NETWORK"));
  state.begin("test");check(!state.failed()&&!state.diagnostic().contains("RTMP_NETWORK"));
  String report="{\"ok\":true,\"checks\":"+checks+",\"socket_eof_and_timeout_recovered\":true,\"silence_blocks\":"+silent+",\"audible_blocks\":"+sounded+",\"five_failure_budget_then_manual_retry\":true,\"failure_survives_cleanup\":true,\"scope\":\"JVM real loopback socket PCM outages; no Android capture validation\"}";
  Files.write(out.resolve("pcm-result.json"),report.getBytes("UTF-8"));System.out.println(report);
 }
}
