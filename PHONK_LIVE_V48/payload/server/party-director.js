import {randomInt} from 'node:crypto';
import {FORM_IDS} from '../public/transformations.js';
import {partySettings} from '../public/party-settings.js';
export function migratePartyConfig(config){
 const result={...config,party:partySettings(config.party||{})};
 if(config.partyVersion!==48){result.partyVersion=48;result.alienUnlocks={...config.alienUnlocks,enabled:false};result.hostAmbientEnabled=false;}
 return result;
}
export class PartyDirector{
 constructor({adventure,getSettings=()=>({}),onChange=()=>{},now=Date.now,random=n=>randomInt(n)}={}){Object.assign(this,{adventure,getSettings,onChange,now,random});this.lastRotation=now();this.holdUntil=0;this.nextBeat=null;this.pulse=null;this.deck=[];this.sequence=0;}
 manual(now=this.now()){this.holdUntil=now+30000;}
 music(data,now=this.now()){
  if(typeof data.active!=='boolean'||!Number.isFinite(data.bpm)||data.bpm<40||data.bpm>240||!Number.isInteger(data.beat)||data.beat<0||data.beat>1e9||!Number.isFinite(data.phase)||data.phase<0||data.phase>=1)throw Error('Marcação musical inválida');
  const source=String(data.source||'manual');if(!['local','android','microphone','screen','manual','chat'].includes(source))throw Error('Fonte musical inválida');
  if(!this.pulse||now-this.pulse.at>4500||source!==this.pulse.source||data.beat+1<this.pulse.beat)this.nextBeat=Math.ceil((data.beat+8)/4)*4;
  this.pulse={...data,source,at:now};
 }
 choose(){if(!this.deck.length){this.deck=FORM_IDS.filter(f=>f!=='base');for(let i=this.deck.length-1;i>0;i--){const j=this.random(i+1);[this.deck[i],this.deck[j]]=[this.deck[j],this.deck[i]];}}let index=this.deck.findIndex(f=>f!==this.adventure.form&&this.adventure.formAccess(f)?.allowed!==false);return index<0?null:this.deck.splice(index,1)[0];}
 tick(now=this.now(),busy=false){
  const settings=partySettings(this.getSettings()),a=this.adventure,musical=this.pulse?.active&&now-this.pulse.at<4500,position=musical?this.pulse.beat+this.pulse.phase+(now-this.pulse.at)/(60000/this.pulse.bpm):0;
  if(!settings.enabled||!settings.autoTransform||busy||now<this.holdUntil||now<a.nextPower||a.motion?.status==='active'||a.comboSequence||['transforming','selecting','recharging'].includes(a.watch.phase)||now<a.watch.switchAt)return false;
  const due=musical?this.nextBeat!==null&&position>=this.nextBeat:now-this.lastRotation>=45000;if(!due)return false;
  const form=this.choose();if(!form)return false;
  try{a.requestTransform(form,'auto',now);if(musical){const period=60000/this.pulse.bpm,revealBeat=Math.round(position+1400/period);a.watch.endsAt=now+Math.max(650,(revealBeat-position)*period);a.emit?.(now);}}catch{return false;}
  this.sequence++;this.lastRotation=now;this.nextBeat=musical?Math.ceil((position+settings.transformBeats)/4)*4:null;this.onChange({id:this.sequence,form,at:now,musical:!!musical});return true;
 }
 snapshot(now=this.now()){return {sequence:this.sequence,nextBeat:this.nextBeat,holdUntil:this.holdUntil,musicActive:!!this.pulse?.active&&now-this.pulse.at<4500};}
}
