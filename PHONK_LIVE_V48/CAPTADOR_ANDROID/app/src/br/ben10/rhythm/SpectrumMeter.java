package br.ben10.rhythm;
public final class SpectrumMeter{
 public static double[] measure(byte[] fft,int rate){double bass=0,full=0;int count=0,n=fft.length;for(int k=1;k<n/2;k++){int re=fft[k*2],im=fft[k*2+1];double power=re*re+im*im;full+=power;double hz=(double)rate*k/n;if(hz>=35&&hz<=240){bass+=power;count++;}}return new double[]{Math.sqrt(bass/Math.max(1,count))/128,Math.sqrt(full/Math.max(1,n/2-1))/128};}
}
