import {AbilityRuntime} from './ability-runtime.js';
import {MOVEMENT_ABILITIES} from '../public/ability-catalog.js';
import {GESTURES,EXPRESSIONS} from '../public/ben-behavior.js';
import {moveInCamp} from '../public/arena-terrain.js';
import {FORM_IDS,POWERS,powerAbility,POWER_LOADOUTS} from '../public/transformations.js';
import {POWER_TIMINGS} from '../public/power-timeline.js';
import {FLYING_FORMS,constrainArena} from '../public/arena-commands.js';
const clone=x=>x==null?null:JSON.parse(JSON.stringify(x));
export class ArenaSession{
 constructor({now=Date.now(),onChange=()=>{},canTransform=()=>({allowed:true})}={}){this.abilities=new AbilityRuntime(now);this.comboSequence=null;this.comboReadyAt=0;this.onChange=onChange;this.canTransform=canTransform;this.form='base';this.selected='blaze';this.position=[0,0,0];this.heading=0;this.revision=0;this.sequence=0;this.lastTick=now;this.lastEmit=now;this.motion=null;this.power=null;this.gesture=null;this.pending=null;this.pendingPower=null;this.nextPower=0;this.nextMovement=0;this.variant=0;this.externalActionUntil=0;this.stance='standing';this.stanceUntil=null;this.expression=null;this.nextIdleAt=now+22000;this.idleStep=0;this.lastWelcome=-Infinity;this.options={durationSeconds:45,rechargeSeconds:18,autoWander:false,idleLife:true};this.watch={phase:'ready',endsAt:null,activeEndsAt:null,changedAt:now,selectionEndsAt:null,switchAt:0,id:0};}
 snapshot(now=this.lastTick){const w=this.watch;return {arena:true,serverTime:now,abilities:this.abilities.snapshot(now),comboSequence:clone(this.comboSequence),revision:this.revision,form:this.form,selected:this.selected,position:[...this.position],heading:this.heading,motion:clone(this.motion),gesture:clone(this.gesture),stance:this.stance,expression:clone(this.expression),nextIdleAt:this.nextIdleAt,power:clone(this.power),nextPower:this.nextPower,nextMovement:this.nextMovement,pending:clone(this.pending),options:{...this.options},watch:{...w,remainingMs:Math.max(0,(w.phase==='recharging'?w.endsAt:w.activeEndsAt||0)-now),durationMs:this.options.durationSeconds*1000,rechargeMs:this.options.rechargeSeconds*1000},quest:null,offers:[],history:[],missionKinds:{},completed:0};}
 emit(now=this.lastTick){this.lastEmit=now;this.revision++;this.onChange(this.snapshot(now));}
 formAccess(form){return this.canTransform(form);}
 assertFormAccess(form){const a=this.formAccess(form);if(a?.allowed===false)throw Object.assign(Error((a.name||form)+' bloqueado · faltam '+(a.remaining||0)+' curtidas para liberar o DNA.'),{code:'alien_locked',remaining:a.remaining,form});}
 reconcileAccess(now=this.lastTick){if(this.form!=='base'&&!this.formAccess(this.form).allowed||this.watch.phase==='transforming'&&!this.formAccess(this.selected).allowed)return this.revert(now);if(this.watch.phase==='selecting'&&!this.formAccess(this.selected).allowed){this.watch.phase=this.form==='base'?'ready':'active';this.watch.selectionEndsAt=null;this.watch.id++;this.emit(now);}}
 configure(data,now=this.lastTick){for(const [key,min,max] of [['durationSeconds',20,120],['rechargeSeconds',8,60]])if(data[key]!==undefined){if(!Number.isFinite(data[key])||data[key]<min||data[key]>max)throw Error('Tempo do Omnitrix fora do intervalo');this.options[key]=data[key];}if(typeof data.idleLife==='boolean')this.options.idleLife=data.idleLife;if(typeof data.autoWander==='boolean')this.options.autoWander=data.autoWander;this.emit(now);}
 select(form,now=this.lastTick){if(!FORM_IDS.includes(form)||form==='base')throw Error('Escolha uma forma alienígena');this.assertFormAccess(form);if(this.watch.phase==='recharging')throw Error('Omnitrix descarregado · aguarde a recarga');if(this.watch.phase==='transforming')throw Error('Transformação em andamento');if(this.form!=='base'&&now<this.watch.switchAt)throw Error('Seleção recarregando por alguns segundos');this.touch(now);this.stance='standing';this.stanceUntil=null;this.selected=form;this.watch.phase='selecting';this.watch.selectionEndsAt=now+10000;this.watch.changedAt=now;this.watch.id++;this.emit(now);return this.snapshot(now);}
 requestTransform(form,source='chat',now=this.lastTick){if(!FORM_IDS.includes(form))throw Error('Forma inválida');if(form==='base')return this.revert(now);this.assertFormAccess(form);if(this.form===form&&this.watch.phase==='active'||source==='gift'&&this.watch.phase==='transforming'&&this.selected===form)return this.snapshot(now);if(this.watch.phase==='recharging'||this.watch.phase==='transforming'||this.form!=='base'&&now<this.watch.switchAt){if(source==='gift'){this.pending={form,source};this.emit(now);return this.snapshot(now);}throw Error('Omnitrix recarregando ou ocupado');}this.select(form,now);return this.confirm(now,source);}
 confirm(now=this.lastTick,source='chat'){if(this.watch.phase!=='selecting')throw Error('Selecione um alien primeiro');this.assertFormAccess(this.selected);this.motion=null;this.gesture=null;this.power=null;this.pending=null;this.watch.phase='transforming';this.watch.endsAt=now+1400;this.watch.changedAt=now;this.watch.id++;this.watch.source=source;this.emit(now);return this.snapshot(now);}
 revert(now=this.lastTick){if(this.form==='base'&&this.watch.phase!=='transforming'&&this.watch.phase!=='active')return this.snapshot(now);this.touch(now);this.stance='standing';this.stanceUntil=null;this.form='base';this.motion=null;this.power=null;this.gesture=null;this.position[1]=0;this.pendingPower=null;this.watch={...this.watch,phase:'recharging',activeEndsAt:null,endsAt:now+this.options.rechargeSeconds*1000,changedAt:now,id:this.watch.id+1};this.emit(now);return this.snapshot(now);}
 requestMovement(mode,now=this.lastTick,direction=null,charge=true){if(!['walk','run','dash','fly','jump','spin','land','roll'].includes(mode))throw Error('Movimento inválido');if(this.watch.phase==='transforming')throw Error('Aguarde a transformação');if(mode==='dash'&&this.form!=='volt')throw Error('Supervelocidade só com XLR8');if(mode==='roll'&&this.form!=='cannon')throw Error('Rolamento só com Bola de Canhão');if(mode==='fly'&&!FLYING_FORMS.includes(this.form))throw Error('Esta forma não pode voar');if(now<this.nextMovement)throw Error('Movimento recarregando');if(direction&&(!Array.isArray(direction)||direction.length!==2||!direction.every(Number.isFinite)||Math.hypot(...direction)<.01))throw Error('Direção inválida');if(charge)this.abilities.move(mode,now);this.touch(now);this.stance='standing';this.stanceUntil=null;let vector=direction||[-Math.sin(this.heading),-Math.cos(this.heading)];const length=Math.hypot(...vector);vector=vector.map(n=>n/length);if(mode!=='spin')this.heading=Math.atan2(-vector[0],-vector[1]);this.motion={id:++this.sequence,mode,status:'active',at:now,until:now+MOVEMENT_ABILITIES[mode].durationMs,duration:0,direction:vector,from:[...this.position],heading:this.heading};this.motion.duration=this.motion.until-now;this.nextMovement=now+(mode==='jump'?650:250);this.emit(now);return this.snapshot(now);}
 stop(now=this.lastTick){this.cancelCombo();this.touch(now);this.motion=null;this.gesture=null;this.emit(now);return this.snapshot(now);}
 touch(now=this.lastTick){this.nextIdleAt=now+22000+(this.sequence%5)*2300;}
 requestGesture(kind,now=this.lastTick){
  if(kind==='jump'||kind==='spin')return this.requestMovement(kind,now);
  if(this.watch.phase==='transforming'||this.watch.phase==='selecting'||now<this.nextPower)throw Error('Aguarde a ação terminar');
  if(kind==='sit'||kind==='stand'){
   if(kind==='sit'&&this.form!=='base')throw Error('Volte a Ben para sentar no banquinho do acampamento');
   this.stance=kind==='sit'?'sitting':'standing';this.stanceUntil=null;this.motion=null;this.gesture=null;
  }else if(kind==='smile'){this.expression={kind:'happy',until:now+4500};}
  else {if(!GESTURES.includes(kind))throw Error('Gesto inválido');this.gesture={id:++this.sequence,kind,at:now,until:now+(kind==='explain'?4200:2400)};}
  this.touch(now);this.emit(now);return this.snapshot(now);
 }
 react({gesture='explain',expression='confident'}={},now=this.lastTick){
  if(!GESTURES.includes(gesture)||!EXPRESSIONS.includes(expression))throw Error('Reação inválida');
  if(this.watch.phase==='transforming'||this.watch.phase==='selecting'||now<this.nextPower)return this.snapshot(now);
  this.expression={kind:expression,until:now+5000};this.gesture={id:++this.sequence,kind:gesture,at:now,until:now+(gesture==='explain'?4200:2400)};this.touch(now);this.emit(now);return this.snapshot(now);
 }
 welcome(now=this.lastTick){if(now-this.lastWelcome<10000)return;this.lastWelcome=now;return this.react({gesture:'wave',expression:'happy'},now);}
 idle(now){
  const step=this.idleStep++%6;
  if(step===0||step===4){const angle=this.idleStep*2.4,nearEdge=Math.hypot(this.position[0],this.position[2])>10,dir=nearEdge?[-this.position[0],-this.position[2]]:[Math.sin(angle),Math.cos(angle)];this.requestMovement('walk',now,dir);this.motion.until=now+2400;this.motion.duration=2400;}
  else if(step===2&&this.form==='base'){this.requestGesture('sit',now);this.stanceUntil=now+7000;}
  else this.react({gesture:step===1?'wave':step===3?'nod':'shrug',expression:step===1?'happy':'curious'},now);
  this.touch(now);
 }

 requestPower(form=this.form,now=this.lastTick,variant=null){if(form!==this.form)throw Error('Transforme-se primeiro para usar este poder');if(now<this.nextPower)throw Error('Poder recarregando');return this.usePower(now,false,1,variant);}
 usePower(now=this.lastTick,busy=false,strength=1,variant=null){if(busy)throw Error('Aguarde a fala terminar');if(this.watch.phase==='transforming')throw Error('Aguarde a transformação');if(this.form==='base'&&this.watch.phase==='recharging')throw Error('Omnitrix descarregado');if(now<this.nextPower)throw Error('Poder recarregando');const choices=POWER_LOADOUTS[this.form].length,v=variant==null?this.variant++%choices:Math.abs(Math.floor(Number(variant)||0))%choices,ability=this.abilities.trigger(this.form,v,now),level=Math.min(5,Math.max(1,Number(strength)||1)),duration=Math.round(POWER_TIMINGS[this.form].reduce((a,b)=>a+b,0)*1000*(1+(level-1)*.22));this.touch(now);this.stance='standing';this.stanceUntil=null;this.gesture=null;this.nextPower=now+Math.max(duration+200,ability.cooldownMs);this.motion=null;this.power={id:++this.sequence,form:this.form,name:ability.name,ability:ability.id,variant:v,position:[...this.position],heading:this.heading,at:now,duration,strength:level,combo:ability.combo,category:ability.category,result:'Poder livre na clareira'};if(this.form==='volt'&&v===0){this.nextMovement=0;this.requestMovement('dash',now,null,false);}this.emit(now);return this.power;}
 cancelCombo(){this.comboSequence=null;}
 requestDefense(now=this.lastTick){if(['selecting','transforming','recharging'].includes(this.watch.phase)||now<this.nextPower)throw Error('Aguarde o relógio e a ação terminarem');this.abilities.defend(now);this.requestGesture('hero',now);this.emit(now);return this.snapshot(now);}
 requestCombo(now=this.lastTick){if(now<this.comboReadyAt||this.comboSequence)throw Error('Combo recarregando');if(['transforming','selecting'].includes(this.watch.phase))throw Error('Aguarde a transformação');this.requestPower(this.form,now,0);this.comboReadyAt=now+15000;this.comboSequence={form:this.form,next:1,status:'active',until:now+20000};this.emit(now);return this.snapshot(now);}
 holdExternalAction(until){this.externalActionUntil=Math.max(this.externalActionUntil,until);}
 locate(){return this.snapshot();} // Position is server-authoritative in the free arena.
 tick(now=Date.now(),busy=false){const dt=Math.min(.12,Math.max(0,(now-this.lastTick)/1000));this.lastTick=now;const beforeEnergy=Math.round(this.abilities.energy);this.abilities.tick(now);const w=this.watch;let changed=beforeEnergy!==Math.round(this.abilities.energy);if(this.comboSequence){const sequence=this.comboSequence;if(sequence.form!==this.form||now>sequence.until)this.cancelCombo();else if(!busy&&!this.comboPaused&&now>=this.abilities.defenseUntil&&now>=this.nextPower&&now>=this.externalActionUntil&&!['selecting','transforming','recharging'].includes(w.phase)){try{this.requestPower(this.form,now,sequence.next++);if(sequence.next>=3)this.cancelCombo();}catch{this.cancelCombo();}changed=true;}}
  if(w.activeEndsAt&&now>=w.activeEndsAt&&w.phase!=='recharging'){this.revert(now);return;}
  if(w.phase==='transforming'&&now>=w.endsAt){this.form=this.selected;w.phase='active';w.activeEndsAt=w.activeEndsAt||now+this.options.durationSeconds*1000;w.endsAt=null;w.switchAt=now+7000;w.changedAt=now;w.id++;changed=true;}
  if(w.phase==='selecting'&&now>=w.selectionEndsAt){w.phase=this.form==='base'?'ready':'active';w.selectionEndsAt=null;w.id++;changed=true;}
  if(w.phase==='recharging'&&now>=w.endsAt){w.phase='ready';w.endsAt=null;w.changedAt=now;w.id++;changed=true;}
  if(this.pending&&this.formAccess(this.pending.form).allowed&&w.phase!=='recharging'&&w.phase!=='transforming'&&(this.form==='base'||now>=w.switchAt)&&!busy){const p=this.pending;this.pending=null;this.requestTransform(p.form,p.source,now);return;}
  if(this.expression&&now>=this.expression.until){this.expression=null;changed=true;}
  if(this.stanceUntil&&now>=this.stanceUntil){this.stance='standing';this.stanceUntil=null;this.touch(now);changed=true;}
  if(this.gesture&&now>=this.gesture.until){this.gesture=null;changed=true;}
  const motion=this.motion;if(motion?.status==='active'){
   if(now>=motion.until){motion.status='complete';if(['jump','fly','land'].includes(motion.mode))this.position[1]=0;changed=true;}
   else if(w.phase!=='transforming'){
    const t=(now-motion.at)/motion.duration,speed=MOVEMENT_ABILITIES[motion.mode].speed,next=moveInCamp([this.position[0],this.position[2]],this.position[0]+motion.direction[0]*speed*dt,this.position[2]+motion.direction[1]*speed*dt,this.position[1]>2);this.position[0]=next[0];this.position[2]=next[1];
    this.position[1]=motion.mode==='jump'?Math.sin(t*Math.PI)*1.5:motion.mode==='fly'?Math.sin(Math.min(1,t*5)*Math.PI/2)*Math.min(1,(1-t)*6)*3:motion.mode==='land'?motion.from[1]*(1-t):0;
    this.heading=motion.mode==='spin'?motion.heading+t*Math.PI*4:motion.heading;changed=true;
   }
  }else if(this.options.autoWander&&!busy&&!this.gesture&&w.phase!=='transforming'&&now>this.nextPower&&now>this.externalActionUntil){if(now>this.nextMovement+6000){const a=Math.sin(now/7311)*Math.PI;this.requestMovement('walk',now,[Math.sin(a),Math.cos(a)]);}}
  if(this.options.idleLife&&!this.options.autoWander&&!busy&&!this.gesture&&this.stance==='standing'&&this.motion?.status!=='active'&&!['transforming','selecting'].includes(w.phase)&&now>this.nextPower&&now>this.externalActionUntil&&now>=this.nextIdleAt){this.idle(now);changed=true;}
  if(this.motion?.status!=='active'&&!this.gesture&&w.phase!=='transforming'&&now>this.nextPower){const angle=Math.atan2(Math.sin(-this.heading),Math.cos(-this.heading));if(Math.abs(angle)>.015){this.heading+=angle*(1-Math.exp(-dt*2));changed=true;}}
  if(changed&&(now-this.lastEmit>=100||motion?.status==='complete'))this.emit(now);
 }
}
