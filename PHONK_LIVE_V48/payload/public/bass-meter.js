// Small audio-thread meter: two low-pass stages reject voice/hi-hats before RMS.
export class BassMeter{
 constructor(rate=48000,window=1024){this.high=Math.exp(-2*Math.PI*35/rate);this.low=1-Math.exp(-2*Math.PI*240/rate);this.window=window;this.previous=0;this.hp=0;this.lp=0;this.lp2=0;this.sum=0;this.full=0;this.level=0;this.count=0;}
 push(value){this.hp=this.high*(this.hp+value-this.previous);this.previous=value;this.lp+=this.low*(this.hp-this.lp);this.lp2+=this.low*(this.lp-this.lp2);this.sum+=this.lp2*this.lp2;this.full+=value*value;if(++this.count<this.window)return null;const energy=Math.sqrt(this.sum/this.count);this.level=Math.sqrt(this.full/this.count);this.full=0;this.sum=0;this.count=0;return energy;}
}
