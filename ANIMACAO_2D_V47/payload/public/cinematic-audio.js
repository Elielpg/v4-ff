// Synthesized locally: no network, copyrighted samples or external sound files.
export class CinematicAudio{
 constructor(manager){this.manager=manager;this.last=0;this.played=0;}
 voice(from,to,duration,volume=.3,type='sine',delay=0){const a=this.manager,c=a.ctx;if(!a.enabled||!c||!a.sfx)return;const t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(from,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,to),t+duration);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0001,volume*a.sfx*(a.speaking?.35:1)),t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g).connect(c.destination);o.onended=()=>{o.disconnect();g.disconnect();};o.start(t);o.stop(t+duration+.02);this.played++;}
 noise(duration=.45,frequency=700,volume=.2,delay=0){const a=this.manager,c=a.ctx;if(!a.enabled||!c||!a.sfx)return;const buffer=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=buffer;f.type='lowpass';f.frequency.value=frequency;g.gain.value=volume*a.sfx*(a.speaking?.35:1);s.connect(f).connect(g).connect(c.destination);s.onended=()=>{s.disconnect();f.disconnect();g.disconnect();};s.start(c.currentTime+delay);}
 play(kind){if(!this.manager.enabled||!['transform','timeout'].includes(kind)&&performance.now()-this.last<110)return;this.last=performance.now();
  if(kind==='new-follower'){[523,784,1047,1568].forEach((f,i)=>this.voice(f,f*1.025,.20,.12,'triangle',i*.11));this.voice(110,220,.4,.10,'sine');return;}
  if(kind==='energy'){this.voice(520,980,.12,.025,'sine');return;}
  if(kind.startsWith('ambient-')){if(!this.manager.music)return;if(kind==='ambient-night'){this.voice(2700,2900,.06,this.manager.music*.18,'sine');this.voice(3100,2750,.07,this.manager.music*.14,'sine',.15);}else{this.noise(.7,500,this.manager.music*.15);this.voice(1250,1900,.12,this.manager.music*.12,'sine',.2);}return;}
  if(kind.startsWith('goal-')){const notes=kind==='goal-speed'?[330,660,990,1320]:kind==='goal-crystal'?[740,1110,1480,1860]:[523,659,784,1047];notes.forEach((f,i)=>this.voice(f,f*1.02,.3,.09,'triangle',i*.1));this.voice(90,180,.5,.1,'sine');this.noise(.25,2400,.06,.2);return;}
  if(kind==='select'){this.voice(660,880,.12,.1,'triangle');this.voice(990,1320,.15,.08,'sine',.09);return;}
  if(kind==='timeout'){this.voice(640,70,.7,.16,'sawtooth');this.voice(220,55,.8,.12,'triangle',.15);return;}
  if(kind==='charged'){[440,660,880].forEach((f,i)=>this.voice(f,f,.2,.09,'triangle',i*.09));return;}
  if(kind==='denied'){this.voice(130,95,.12,.1,'square');this.voice(130,80,.16,.09,'square',.16);return;}
  if(kind==='low'){this.voice(450,350,.12,.08,'square');return;}
  if(kind==='transform'||kind==='level'){[440,660,880,1320,1760].forEach((f,i)=>this.voice(f,f*1.05,.24,.13,'square',i*.07));this.voice(65,160,.7,.28);this.noise(.5,2300,.18,.2);return;}
  if(kind==='rocket'){this.voice(65,620,1.5,.2,'sawtooth');this.noise(1.4,2200,.28);}
  else if(kind==='meteor'){[0,.2,.45].forEach(t=>{this.voice(900,45,.7,.18,'triangle',t);this.noise(.45,1400,.18,t+.4);});}
  else if(kind==='dragon'){this.voice(95,38,.9,.25,'sawtooth');this.noise(1.2,900,.25);this.voice(330,660,.7,.1,'triangle',.3);}
  else if(kind==='crown'||kind==='butterfly'){[659,880,988,1319].forEach((f,i)=>this.voice(f,f,.5,.1,'sine',i*.14));}
  else if(kind==='fireworks'){[0,.22,.5].forEach(t=>{this.voice(500,1600,.3,.08,'sine',t);this.noise(.35,4200,.22,t+.3);});}
  else if(kind==='impact'){this.voice(90,28,.3,.22,'triangle');this.noise(.23,900,.16);}
  else if(kind==='power-rock'){[740,1109,1480,1864].forEach((f,i)=>this.voice(f,f*.98,.4,.09,'sine',i*.045));this.noise(.35,5000,.10);}
  else if(kind==='power-wildvine'){this.noise(.65,1100,.14);this.voice(180,320,.5,.12,'triangle');this.voice(360,180,.4,.07,'sine',.2);}
  else if(kind==='power-shade'){this.voice(220,70,1.1,.12,'sine');this.voice(227,74,1.1,.1,'sine');this.noise(1,650,.10);}
  else if(kind==='power-base'){[660,990,1320].forEach((f,i)=>this.voice(f,f*1.1,.16,.08,'triangle',i*.12));}
  else if(kind==='power-blaze'){this.noise(1.1,1500,.38);this.voice(80,32,.7,.38,'sawtooth');}
  else if(kind==='power-volt'||kind==='lightning'){this.voice(1600,90,.35,.2,'sawtooth');this.noise(.7,4800,.26);[0,.15,.3].forEach(t=>this.voice(110,42,.3,.16,'triangle',t));}
  else if(kind==='power-tide'||kind==='ice'){this.noise(1.1,3000,.22);[880,1320,1760].forEach((f,i)=>this.voice(f,f*1.5,.5,.1,'sine',i*.12));}
  else if(kind==='galaxy'||kind==='power-nova'){[110,165,220,330].forEach((f,i)=>this.voice(f,f*2,1.7,.1,'sine',i*.14));this.noise(1.6,900,.2);}
  else if(kind==='lion'||['power-fourarms','power-cannon','power-beast'].includes(kind)){this.voice(120,28,.85,.38,'sawtooth');this.noise(.7,450,.38);}
  else if(kind==='rose'||kind==='heart'||kind==='confetti'||kind==='money'){[523,659,784,1047,1319].forEach((f,i)=>this.voice(f,f,.28,.12,'triangle',i*.09));this.noise(.25,6000,.09);}
  else{this.voice(280,90,.45,.23,'triangle');this.noise(.5,1900,.18);}
 }
}
