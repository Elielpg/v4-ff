import {BassMeter} from './bass-meter.js';
class BenBeatMeter extends AudioWorkletProcessor{
 constructor(){super();this.meter=new BassMeter(sampleRate);}
 process(inputs,outputs){
  const channels=inputs[0]||[],first=channels[0],second=channels[1];
  for(const channel of outputs[0]||[])channel.fill(0);
  if(first)for(let i=0;i<first.length;i++){const energy=this.meter.push(second?(first[i]+second[i])*.5:first[i]);if(energy!==null)this.port.postMessage({energy,audioTime:(currentFrame+i+1)/sampleRate});}
  return true;
 }
}
registerProcessor('ben-beat-meter',BenBeatMeter);
