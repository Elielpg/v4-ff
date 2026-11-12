const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const median=values=>{const s=[...values].sort((a,b)=>a-b),m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2;};
export function spectrumEnergy(data,{sampleRate,fftSize,lowHz=40,highHz=240}={}){
 if(!data?.length)return 0;
 const bin=sampleRate&&fftSize?sampleRate/fftSize:null,start=bin?Math.max(1,Math.floor(lowHz/bin)):1,end=bin?Math.min(data.length,Math.ceil(highHz/bin)+1):Math.min(40,data.length);
 let sum=0;for(let i=start;i<end;i++)sum+=(data[i]/255)**2;return Math.sqrt(sum/Math.max(1,end-start));
}
export function danceEligible({animation='idle',motion='idle',talking=false,watch='ready',power=null,now=0}={}){
 if(talking||['selecting','transforming'].includes(watch)||['walk','run','dash','jump','fly','roll','spin'].includes(motion))return false;
 if(power&&Number.isFinite(power.at)&&now<power.at+(power.duration||3000))return false;
 return ['idle','dance'].includes(animation);
}
export class DanceClock{
 constructor({bpm=96}={}){this.bpm=clamp(Number(bpm)||96,40,240);this.offsetMs=0;this.reset(0);}
 reset(now=0){this.epoch=now;this.lastBeat=-Infinity;this.lastNow=null;this.average=.02;this.previous=0;this.taps=[];this.intervals=[];this.detected=false;this.beats=0;this.anchorBeat=0;this.confidence=0;}
 setBpm(value,now=0){if(!Number.isFinite(value)||value<40||value>240)throw Error('Use um ritmo entre 40 e 240 BPM.');this.bpm=value;this.reset(now);}
 setOffset(value){if(!Number.isFinite(value)||Math.abs(value)>400)throw Error('Use um ajuste entre -400 e 400 ms.');this.offsetMs=value;}
 tap(now){
  if(!Number.isFinite(now))return this.bpm;
  if(this.taps.length&&now-this.taps.at(-1)>2500)this.taps=[];
  this.taps=this.taps.filter(t=>now-t<9000);if(this.taps.length&&now-this.taps.at(-1)<240)return this.bpm;
  this.taps.push(now);if(this.taps.length>9)this.taps.shift();
  const intervals=this.taps.slice(1).map((t,i)=>t-this.taps[i]).filter(t=>t>=250&&t<=1500);
  if(intervals.length){const center=median(intervals),good=intervals.filter(t=>Math.abs(t-center)<center*.22);this.bpm=clamp(60000/median(good),40,240);}
  this.detected=false;this.epoch=now;this.lastBeat=now;this.anchorBeat=this.taps.length-1;this.confidence=Math.min(1,intervals.length/3);return this.bpm;
 }
 analyze(energy,now){
  if(!Number.isFinite(now))return false;
  if(this.lastNow!==null&&now<this.lastNow-80)this.reset(now);
  const dt=this.lastNow===null?33:Math.max(1,Math.min(250,now-this.lastNow));this.lastNow=now;
  energy=clamp(Number(energy)||0,0,1);const flux=energy-this.previous,baseline=this.average;
  this.average+=(energy-this.average)*(1-Math.exp(-dt/650));this.previous=energy;
  const refractory=Math.max(240,Math.min(380,60000/this.bpm*.49));
  if(energy<.035||energy<baseline*1.28||flux<.008||now-this.lastBeat<refractory)return false;
  const interval=now-this.lastBeat,oldPeriod=60000/this.bpm;
  if(Number.isFinite(this.lastBeat)&&interval>=250&&interval<=1500){this.intervals.push(interval);if(this.intervals.length>9)this.intervals.shift();const center=median(this.intervals),good=this.intervals.filter(x=>Math.abs(x-center)<center*.23);if(good.length)this.bpm=clamp(60000/(good.reduce((sum,v)=>sum+v,0)/good.length),40,240);}
  const elapsed=Math.max(0,(now-this.epoch)/oldPeriod);this.anchorBeat=this.detected?this.anchorBeat+Math.max(1,Math.round(elapsed)):0;
  this.epoch=now;this.lastBeat=now;this.beats++;this.detected=true;this.confidence=Math.min(1,this.intervals.length/4+.2);return true;
 }
 sample(now,{reducedMotion=false,style='groove'}={}){
  const period=60000/this.bpm,position=Math.max(0,this.anchorBeat+(now-this.epoch-this.offsetMs)/period),beat=Math.floor(position),phase=position-beat,pulse=(1-phase)**3;
  const half=position*2,index=Math.floor(half)%8,patterns={groove:[1,0,1,2,1,3,1,2],hero:[0,1,2,1,3,1,2,1],robot:[0,3,1,2,3,0,2,1],phonk:[1,0,1,2,1,3,1,2],shuffle:[0,2,1,3,2,0,3,1]},pattern=patterns[style]||patterns.groove;
  const phonk=style==='phonk',shuffle=style==='shuffle',slideX=reducedMotion?0:Math.sin(position*Math.PI)*(shuffle?.15:phonk?.10:.035),lift=reducedMotion?0:Math.max(0,Math.sin(position*Math.PI*2))*(shuffle?.075:phonk?.035:0),motionFrame=shuffle&&beat%8<2?[0,2,1,3][index%4]:phonk&&beat%8===7?12:undefined;
  return {slideX,lift,motionFrame,phase,pulse,beat,position,frame:pattern[index],nextFrame:pattern[(index+1)%8],blend:half%1,pose:[2,4,2,5][beat%4],bounce:reducedMotion?0:Math.sin(phase*Math.PI)*.075,lean:reducedMotion?0:Math.sin(position*Math.PI)*.055,confidence:this.confidence,bpm:this.bpm};
 }
}
