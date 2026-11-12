import {DanceClock} from './dance-clock.js';
const median=a=>{const s=[...a].sort((x,y)=>x-y);return s[Math.floor(s.length/2)]||0;};
// Bounded periodicity estimate: syncopated kicks should not redefine tempo per hit.
export class TempoGrid{
 constructor(){this.reset();}
 reset(){this.samples=[];this.lastFit=-Infinity;this.previous=null;}
 feed(energy,at){
  if(this.samples.length&&at<this.samples.at(-1).at-50)this.reset();
  this.samples.push({at,energy});while(this.samples.length>900||at-this.samples[0].at>14000)this.samples.shift();
  if(at-this.lastFit<900||at-this.samples[0].at<4200)return null;this.lastFit=at;
  const origin=this.samples[0].at,values=[];let index=0;
  for(let t=origin;t<=at;t+=25){while(index+1<this.samples.length&&this.samples[index+1].at<=t)index++;values.push(this.samples[index].energy);}
  const weights=values.map((v,i)=>Math.max(0,v-median(values.slice(Math.max(0,i-10),Math.min(values.length,i+11))))),total=weights.reduce((a,b)=>a+b,0);if(total<.05)return null;
  let best=null;const bins=48;
  for(let bpm=75;bpm<=205;bpm+=.5){const period=60000/bpm,hist=new Float64Array(bins);for(let i=0;i<weights.length;i++)hist[Math.floor((i*25%period)/period*bins)]+=weights[i];let peak=0,phase=0;for(let k=0;k<bins;k++){const s=hist[k]+.5*(hist[(k+1)%bins]+hist[(k+bins-1)%bins])+.2*(hist[(k+2)%bins]+hist[(k+bins-2)%bins]);if(s>peak){peak=s;phase=k;}}let score=peak/(total/bins*2.4);if(this.previous&&Math.abs(bpm-this.previous.bpm)<1.3)score*=1.025;if(!best||score>best.score)best={bpm,score,phase,period};}
  if(best.score<1.8)return null;const anchor=origin+best.phase/bins*best.period,beatAt=anchor+Math.floor((at-anchor)/best.period)*best.period;this.previous=best;return {...best,beatAt};
 }
}
export class PhonkClock extends DanceClock{
 constructor(options={}){super(options);this.grid=new TempoGrid();this.gridLock=-Infinity;}
 reset(now=0){super.reset(now);this.grid?.reset();this.gridLock=-Infinity;}
 analyze(energy,now){const fit=this.grid.feed(energy,now);if(fit){const position=this.sample(fit.beatAt).position;this.bpm=fit.bpm;this.epoch=fit.beatAt;this.anchorBeat=Math.round(position);this.gridLock=now;this.detected=true;this.confidence=Math.min(1,(fit.score-1.5)/1.2);this.lastNow=now;this.beats=Math.max(this.beats,this.anchorBeat);return true;}if(now-this.gridLock<3000){this.lastNow=now;return false;}return super.analyze(energy,now);}
}
