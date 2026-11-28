import br.cofra.studio.rtmp.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

/** Synthetic loopback only; never prints destination, key or exception text. */
public final class ConnectionProbe {
 public static void main(String[] args) throws Exception {
  AtomicReference<String> failure=new AtomicReference<>();
  CountDownLatch failed=new CountDownLatch(1);
  AtomicInteger callbacks=new AtomicInteger();
  RtmpClient client=new RtmpClient(message->{callbacks.incrementAndGet();failure.compareAndSet(null,message);failed.countDown();});
  boolean connected=false;String connectError="";
  try {
   client.connect(new Endpoint(args[0],"fixture-key"),320,568,15,false);
   connected=true;
   // Only protocol framing is tested here; real H264/AAC has a separate test.
   byte[] payload="stall".equals(args[1])?new byte[7*1024*1024]:new byte[]{0x17,1,0,0,0,0,0,0,1,0x65};payload[0]=0x17;payload[1]=1;
   client.offerVideo(payload,0);
   if(!"accept".equals(args[1]))failed.await("stall".equals(args[1])?20:4,TimeUnit.SECONDS);
   else Thread.sleep(150);
  } catch(Exception error) {connectError=error.getClass().getSimpleName();}
  finally {client.close();}
  String message=failure.get();
  System.out.println("{\"connected\":"+connected+",\"connect_error\":\""+connectError+"\",\"failure_callback\":"+(message!=null)+",\"failure_callbacks\":"+callbacks.get()+",\"video_frames_sent\":"+client.videoFrames+"}");
  boolean expectConnect=!"reject".equals(args[1]);
  if(connected!=expectConnect||("disconnect".equals(args[1])||"post-reject".equals(args[1])||"stall".equals(args[1]))&&(message==null||callbacks.get()!=1)||"accept".equals(args[1])&&message!=null)System.exit(2);
 }
}
