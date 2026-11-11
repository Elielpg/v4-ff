import {powerFrame,advancePowerTime} from './power-timeline.js';
export function createComicPower(world,power,target){
 const B=BABYLON,form=power.form,start=world.getPowerOrigin?.(form,power.ability)?.clone()||world.renderPosition.add(new B.Vector3(0,1.3,0)),right=world.camera.getDirection(B.Axis.X),sign=world.character2D?.flip?-1:1;
 const end=(target||world.battleTarget)?.clone()||start.add(right.scale(sign*3.1));if(target||world.battleTarget)end.y+=.6;
 const e={paper:true,targeted:!!(target||world.battleTarget),world,start,end,form,ability:power.ability,variant:power.variant||0,strength:Math.min(5,power.strength||1),time:0,startedAt:power.at-(world.serverOffset||0),duration:(power.duration||powerFrame(form,0).duration*1000)/1000,phase:'anticipation',timeScale:1,power};
 world.powerUntil=e.startedAt+e.duration*1000;world.powerAction={form,phase:'charge',until:world.powerUntil,ability:e.ability,variant:e.variant,strength:e.strength};world.paperFX.power=e;return e;
}
export function updateComicPower(world,e,dt){
 e.time=advancePowerTime(e,dt);const factor=powerFrame(e.form,0).duration/e.duration;e.frame=powerFrame(e.form,e.time*factor);e.phase=e.frame.phase;
 if(world.powerAction)world.powerAction.phase=({anticipation:'charge',cast:'cast',impact:'impact',recovery:'recover'})[e.phase];
 if(e.phase==='anticipation'){const origin=world.getPowerOrigin?.(e.form,e.ability);if(origin)e.start.copyFrom(origin);}
 return e.time>=e.duration;
}
export function disposeComicPower(e){if(e?.world.paperFX.power===e)e.world.paperFX.power=null;}
