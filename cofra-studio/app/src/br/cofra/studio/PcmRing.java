package br.cofra.studio;

/** A bounded buffer for optional permitted Android music; game audio is master. */
public final class PcmRing {
  private final byte[] data;
  private int start,size;
  public PcmRing(int capacity) {if(capacity<4||capacity%4!=0)throw new IllegalArgumentException();data=new byte[capacity];}
  public synchronized void put(byte[] source,int length) {
    length=Math.min(length,source.length);length-=length%4;
    int offset=Math.max(0,length-data.length);length-=offset;
    int drop=Math.max(0,size+length-data.length);start=(start+drop)%data.length;size-=drop;
    for(int i=0;i<length;i++)data[(start+size+i)%data.length]=source[offset+i];size+=length;
  }
  public synchronized int take(byte[] target,int length) {
    length=Math.min(Math.min(length,target.length),size);length-=length%4;
    for(int i=0;i<length;i++)target[i]=data[(start+i)%data.length];start=(start+length)%data.length;size-=length;return length;
  }
  public synchronized int size(){return size;}
  public static double rms(byte[] data,int length){double sum=0;int n=Math.min(length,data.length)/2;for(int i=0;i<n;i++){int p=(short)((data[2*i]&255)|(data[2*i+1]<<8));sum+=(double)p*p;}return n>0?Math.sqrt(sum/n)/32768:0;}
  public static void mix(byte[] game,byte[] music,int length,double musicGain) {
    for(int i=0;i+1<length;i+=2){int a=(short)((game[i]&255)|(game[i+1]<<8)),b=(short)((music[i]&255)|(music[i+1]<<8));int v=(int)(a*.92+b*musicGain);v=Math.max(-32760,Math.min(32760,v));game[i]=(byte)v;game[i+1]=(byte)(v>>8);}
  }
}
