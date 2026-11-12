export class ExternalBeatInput{
 constructor({audio,onSample=()=>{},onState=()=>{}}){Object.assign(this,{audio,onSample,onState});this.mode='android';this.lastPacket=-Infinity;this.lastSignal=-Infinity;this.level=0;this.generation=0;}
 receive(frame,mode=this.mode){if(mode!==this.mode||!Number.isFinite(frame.energy)||!Number.isFinite(frame.level))return;const now=performance.now();this.lastPacket=now;this.level=frame.level;if(frame.level>.0005)this.lastSignal=now;const age=Math.max(0,Math.min(2500,Date.now()-frame.at));this.onSample(frame.energy,now-age,frame.level);}
 get state(){const now=performance.now();return {source:this.mode,connected:now-this.lastPacket<2500,signal:now-this.lastSignal<1500&&now-this.lastPacket<2500,level:this.level};}
 async start(kind){
  this.stop();this.mode=kind;const ticket=this.generation;await this.audio.unlock();
  if(!navigator.mediaDevices)throw Error('Este navegador não oferece captura de áudio. Use o captador Android ou um arquivo local.');
  const options={echoCancellation:false,noiseSuppression:false,autoGainControl:false};let stream;
  if(kind==='screen'){if(!navigator.mediaDevices.getDisplayMedia)throw Error('Compartilhamento de áudio indisponível neste navegador. Use o captador Android.');stream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:options});}
  else stream=await navigator.mediaDevices.getUserMedia({audio:options,video:false});
  if(ticket!==this.generation){stream.getTracks().forEach(t=>t.stop());return;}
  if(!stream.getAudioTracks().length){stream.getTracks().forEach(t=>t.stop());throw Error('O compartilhamento veio sem áudio. Use o captador Android ou o arquivo no jogo.');}
  this.stream=stream;stream.getTracks().forEach(t=>t.onended=()=>this.stop());const c=this.audio.ctx;this.source=c.createMediaStreamSource(stream);this.silent=c.createGain();this.silent.gain.value=0;this.silent.connect(c.destination);
  try{await c.audioWorklet.addModule(new URL('./beat-worklet.js',import.meta.url));if(ticket!==this.generation)return;this.node=new AudioWorkletNode(c,'ben-beat-meter');this.source.connect(this.node);this.node.connect(this.silent);this.node.port.onmessage=e=>{const d=e.data;if(c.currentTime-d.audioTime>.8)return;this.receive({energy:d.energy,level:d.level??d.energy,at:Date.now()-(c.currentTime-d.audioTime)*1000},kind);};}
  catch{if(ticket!==this.generation)return;this.analyser=c.createAnalyser();this.analyser.fftSize=2048;this.analyser.smoothingTimeConstant=.12;this.samples=new Uint8Array(this.analyser.frequencyBinCount);this.source.connect(this.analyser);this.analyser.connect(this.silent);}
  this.onState(this.state);
 }
 poll(analyze){if(!this.analyser)return;this.analyser.getByteFrequencyData(this.samples);let level=0;for(const v of this.samples)level+=v*v;level=Math.sqrt(level/this.samples.length)/255;this.receive({energy:analyze(this.samples,{sampleRate:this.audio.ctx.sampleRate,fftSize:this.analyser.fftSize}),level,at:Date.now()},this.mode);}
 useAndroid(){this.stop();this.mode='android';}
 stop(){this.generation++;const stream=this.stream;this.stream=null;if(stream)for(const t of stream.getTracks()){t.onended=null;t.stop();}if(this.node)this.node.port.onmessage=null;for(const n of [this.source,this.node,this.silent,this.analyser])n?.disconnect();this.source=this.node=this.silent=this.analyser=null;this.lastPacket=this.lastSignal=-Infinity;this.level=0;this.onState(this.state);}
}
export class BeatGain{
 constructor(){this.peak=.002;this.last=null;}
 sample(energy,at){const dt=this.last===null?21:Math.max(0,Math.min(200,at-this.last));this.last=at;this.peak=Math.max(.0005,energy,this.peak*Math.exp(-dt/3500));return Math.min(1,energy/this.peak);}
}
