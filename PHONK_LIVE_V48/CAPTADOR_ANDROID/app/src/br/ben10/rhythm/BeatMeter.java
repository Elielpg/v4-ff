package br.ben10.rhythm;
public final class BeatMeter {
 private final double high,low;private double previous,hp,lp,lp2,sum,full;private int count;
 public double level;
 public BeatMeter(int rate){high=Math.exp(-2*Math.PI*35/rate);low=1-Math.exp(-2*Math.PI*240/rate);}
 public double push(double value){hp=high*(hp+value-previous);previous=value;lp+=low*(hp-lp);lp2+=low*(lp-lp2);sum+=lp2*lp2;full+=value*value;if(++count<1024)return -1;double energy=Math.sqrt(sum/count);level=Math.sqrt(full/count);sum=0;full=0;count=0;return energy;}
}
