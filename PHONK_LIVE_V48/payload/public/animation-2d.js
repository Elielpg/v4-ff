import {powerFrame} from './power-timeline.js';
const clamp=v=>Math.max(0,Math.min(1,v));
export const DRAWN_CLIPS=Object.freeze({walk:[0,1,2,3],run:[4,5,6,7],jump:[8,9,10,11],fight:[12,13,14,15],dance:[16,17,18,19],sit:[20,21,22,23]});
export class DrawingAnimator{
 constructor(){this.state='idle';this.entered=0;this.lastMovement='idle';this.landUntil=0;this.riseUntil=0;this.distance=0;this.lastPosition=null;}
 sample({now=0,serverNow=now,position=[0,0,0],motion=null,animation='idle',power=null,battle=null,dance=null,seated=false,reducedMotion=false,form='base'}={}){
  if(this.lastPosition)this.distance+=Math.hypot(position[0]-this.lastPosition[0],position[2]-this.lastPosition[2]);this.lastPosition=[...position];
  const movement=motion?.status==='active'?motion.mode:'idle';
  if(this.lastMovement==='jump'&&movement!=='jump')this.landUntil=now+180;
  if(this.state==='sit'&&!seated)this.riseUntil=now+180;
  this.lastMovement=movement;
  const activePower=power&&serverNow<power.at+(power.duration||3000),age=battle?serverNow-battle.at:Infinity;
  let state=seated?'sit':movement==='jump'?'jump':movement==='roll'?'roll':['walk','run','dash'].includes(movement)?movement==='walk'?'walk':'run':activePower||['charge','cast','impact','recover','power','attack','guard','defend','shield'].includes(animation)||battle&&age>=0&&age<430?'fight':dance?.active?'dance':movement==='fly'?'jump':'idle';
  if(this.landUntil>now&&state==='idle')state='landing';if(this.riseUntil>now&&state==='idle')state='rising';
  if(state!==this.state){this.state=state;this.entered=now;}
  const elapsed=now-this.entered;let frame=null,phase=0,squashX=1,squashY=1,lean=0,lunge=0,flash=0;
  if(state==='walk'||state==='run'){
   const stride=(state==='walk'?1.25:movement==='dash'?4.2:2.65)*(form==='beast'?.8:1);phase=(this.distance/stride)%1;frame=DRAWN_CLIPS[state][Math.floor(phase*4)%4];
   if(!reducedMotion){squashY=1+Math.sin(phase*Math.PI*4)*.016;squashX=1/Math.sqrt(squashY);lean=Math.sin(phase*Math.PI*2)*.012;}
  }else if(state==='jump'){
   phase=motion?.duration?clamp((serverNow-motion.at)/motion.duration):.5;frame=phase<.12?8:phase<.32?9:phase<.84?10:11;
   if(!reducedMotion){squashX=phase<.12?1.08:phase>.84?1.06:.97;squashY=phase<.12?.91:phase>.84?.94:1.04;}
  }else if(state==='landing'){frame=11;phase=clamp(elapsed/180);if(!reducedMotion){squashY=.92+.08*phase;squashX=1.05-.05*phase;}}
  else if(state==='rising'){frame=23;phase=clamp(elapsed/180);}
  else if(state==='sit'){frame=elapsed<180?20:animation==='talk'?22:21;}
  else if(state==='dance'){
   phase=dance.phase;frame=dance.motionFrame??16+(dance.frame??0);
   if(!reducedMotion){squashY=1-dance.pulse*.035;squashX=1+dance.pulse*.022;lean=dance.lean||0;}
  }else if(state==='fight'){
   if(activePower){phase=clamp((serverNow-power.at)/(power.duration||2200));const timing=powerFrame(form,phase*powerFrame(form,0).duration);frame=timing.phase==='anticipation'?13:timing.phase==='recovery'?15:14;}
   else if(['charge','cast','impact','recover','power'].includes(animation)){frame=animation==='charge'?13:animation==='recover'?15:14;phase=animation==='charge'?.1:animation==='recover'?.95:.5;}
   else{phase=clamp(age/430);frame=phase<.23?13:phase<.63?14:15;}
   if(['guard','defend','shield'].includes(animation))frame=12;
   if(battle?.type==='enemy-hit'&&age>=0&&age<300){frame=15;flash=1-age/300;}
   if(!reducedMotion){lunge=Math.sin(phase*Math.PI)*.09;lean=Math.sin(phase*Math.PI)*.025;squashX=1+Math.sin(phase*Math.PI)*.035;squashY=1-Math.sin(phase*Math.PI)*.012;}
  }
  if(state==='idle'&&!reducedMotion)squashY=1+Math.sin(now*.0025)*.004;
  return {state,frame,phase,squashX,squashY,lean,lunge,flash,elapsed,slideX:state==='dance'?dance.slideX||0:0,lift:state==='dance'?dance.lift||0:0};
 }
}
