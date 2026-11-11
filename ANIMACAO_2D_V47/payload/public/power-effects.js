import {createToonPower} from './toon-vfx.js';
import {createComicPower,updateComicPower,disposeComicPower} from './comic-power.js';
import {createPowerPolish,updatePowerPolish,disposePowerPolish} from './power-polish.js';
import {buildAbilitySculpture,updateAbilitySculpture} from './ability-sculptures.js';
import {POWERS,powerAbility} from './transformations.js';
import {powerFrame,advancePowerTime} from './power-timeline.js';
const frameName=phase=>({anticipation:'charge',cast:'cast',impact:'impact',recovery:'recover'})[phase];
export function createPowerEffect(world,power,target){
 if(world.paperFX?.enabled)return createComicPower(world,power,target);
 const B=BABYLON,root=new B.TransformNode('power-'+power.id,world.scene),hero=world.avatar.root,variant=Math.abs(Math.floor(Number(power.variant??power.id)||0))%3,ability=power.ability||powerAbility(power.form,variant)?.id,start=world.toLocalPosition?world.toLocalPosition(power.position):new B.Vector3(...power.position),mouth=power.form==='blaze'&&ability==='fire-breath';
 start.y=Math.max(0,hero.position.y)+(mouth?2.1:1.35);
 const forward=new B.Vector3(-Math.sin(hero.rotation.y),0,-Math.cos(hero.rotation.y)),end=target?target.add(new B.Vector3(0,.6,0)):start.add(forward.scale(5));const color=POWERS[power.form].color;
 const material=world.material(color).clone('power-'+power.form+'-glow');material.emissiveColor=new B.Color3(...color).scale(.9);material.disableLighting=true;material.alpha=.95;
 const accent=material.clone('power-core');accent.diffuseColor=new B.Color3(1,.96,.8);accent.emissiveColor=new B.Color3(1,.96,.8);const materials=[material,accent];
 const parts=[],add=(kind='sphere',index=0)=>{const m=world.mesh({p:[0,0,0],s:[.01,.01,.01],c:color,kind},'ability-'+power.form+'-'+index);m.parent=root;m.material=index%5===0?accent:material;m.isPickable=false;parts.push(m);return m;};
 const count=world.quality==='economy'?16:32;for(let i=0;i<count;i++)add(['rock','blaze','fourarms'].includes(power.form)?'crystal':['wildvine','volt'].includes(power.form)?'cylinder':'sphere',i);
 const rings=[];for(let i=0;i<4;i++){const m=B.MeshBuilder.CreateTorus('ability-wave',{diameter:1,thickness:i===0?.09:.035,tessellation:32},world.scene);m.parent=root;m.material=i%2?material:accent;m.isPickable=false;rings.push(m);}
 const core=add('sphere',count);core.material=accent;
 let beam=null,innerBeam=null;if(['blaze','tide','wildvine','base'].includes(power.form)){for(let i=0;i<2;i++){const m=B.MeshBuilder.CreateCylinder('ability-stream',{height:1,diameter:1,tessellation:12},world.scene);m.parent=root;m.material=i?accent:material;m.isPickable=false;if(i)innerBeam=m;else beam=m;}}
 const effect={root,start,end,parts,rings,core,beam,innerBeam,material,materials,time:0,startedAt:Date.now(),form:power.form,ability,strength:Math.max(1,Math.min(5,Math.floor(Number(power.strength)||1))),duration:powerFrame(power.form,0).duration,phase:'anticipation',variant};
  const intensity=1+(effect.strength-1)*.22;effect.timeScale=(world.previewActive?.68:1)/intensity;effect.sculpture=buildAbilitySculpture(world,effect);effect.materials.push(...effect.sculpture.materials);world.powerUntil=Date.now()+effect.duration/effect.timeScale*1000;world.powerAction={form:power.form,phase:'charge',until:world.powerUntil,strength:effect.strength,variant:effect.variant,ability};
 if(power.form==='volt'&&world.form===2)world.triggerLocomotion('dash',world.previewActive?Math.ceil(effect.duration/effect.timeScale*1000):1200,{recoil:true});
 if(power.form==='cannon'&&world.form===9)world.triggerLocomotion('roll',1450,{recoil:true});
 effect.toon=createToonPower(world,effect);effect.polish=createPowerPolish(world,effect,color);return effect;
}
function segment(mesh,start,end,width){const B=BABYLON,delta=end.subtract(start),length=Math.max(.001,delta.length());mesh.position.copyFrom(start.add(delta.scale(.5)));mesh.scaling.set(width,length,width);mesh.rotationQuaternion=B.Quaternion.FromUnitVectorsToRef(B.Axis.Y,delta.scale(1/length),new B.Quaternion());}
export function updatePowerEffect(world,e,dt){
 if(e.paper)return updateComicPower(world,e,dt);
 const B=BABYLON;e.time=e.timeScale===1?advancePowerTime(e,dt):Math.max(e.time+dt*(e.timeScale||1),(Date.now()-e.startedAt)/1000*(e.timeScale||1));const f=powerFrame(e.form,e.time);e.phase=f.phase;if(world.powerAction)world.powerAction.phase=frameName(f.phase);const cast=f.release,hit=f.contact,fade=f.fade,charged=f.charge,boost=1+(e.strength-1)*.18;
 // The origin follows the actual hands/body through anticipation, then the shot travels to its target.
 const activeRoot=world.imported?.root.isEnabled()?world.imported.root:world.avatar.root;
  if(f.phase==='anticipation'){const mouth=e.form==='blaze'&&e.ability==='fire-breath',forward=new B.Vector3(-Math.sin(activeRoot.rotation.y),0,-Math.cos(activeRoot.rotation.y));e.start.copyFrom(activeRoot.position).addInPlace(forward.scale(mouth?.34:.65));e.start.y+=mouth?2.1:1.35;const socket=world.getPowerOrigin?.(e.form,e.ability);if(socket)e.start.copyFrom(socket);}
 const center=B.Vector3.Lerp(e.start,e.end,cast),delta=e.end.subtract(e.start),length=Math.max(.01,delta.length()),direction=delta.scale(1/length),chargeScale=(f.phase==='anticipation'?.1+charged*.28:f.phase==='cast'?.3*(1-cast):0)*boost;
 e.core.position.copyFrom(e.start);e.core.scaling.setAll(Math.max(.001,chargeScale));
 const count=e.parts.length-1;
 for(let i=0;i<count;i++){const m=e.parts[i],k=i/count,a=k*Math.PI*2+e.time*7,seed=Math.sin(i*12.9898)*.5+.5;
  if(f.phase==='anticipation'){m.position.copyFrom(e.start).addInPlace(new B.Vector3(Math.cos(a)*(.75-charged*.55),Math.sin(a)*(.75-charged*.55),Math.sin(a*2)*.15));m.scaling.setAll((.02+charged*.045)*boost);continue;}
  const trail=Math.max(0,cast-k*.33),spread=hit*(.7+seed*1.5);m.position.copyFrom(B.Vector3.Lerp(e.start,e.end,trail)).addInPlace(new B.Vector3(Math.cos(a)*.1,Math.sin(a)*.1,0));m.scaling.setAll((.09+seed*.08)*fade*boost);
  if(e.form==='blaze'){m.position.copyFrom(B.Vector3.Lerp(e.start,e.end,trail));m.position.addInPlace(new B.Vector3(Math.cos(a)*(.13+hit),Math.sin(a)*(.13+hit)+hit*.7,Math.sin(a*2)*.1));m.scaling.set((.13+seed*.13)*fade,(.28+seed*.3)*(1-hit*.6)*fade,.12*fade);m.rotation.set(Math.sin(a)*.4,0,Math.sin(a*2)*.5);}
  else if(e.form==='tide'){const p=(k+e.time*1.2)%1;m.position.copyFrom(B.Vector3.Lerp(e.start,e.end,cast*p));m.position.y+=Math.sin(p*Math.PI)*.35-hit*.7;m.position.addInPlace(new B.Vector3(Math.cos(a)*(.07+hit*.4),Math.sin(a)*.06,Math.sin(a)*(.07+hit*.4)));m.scaling.set(.07*fade,(.15+seed*.1)*fade,.07*fade);}
  else if(e.form==='rock'){const angle=k*Math.PI*2;const radius=.35+seed*.95;m.position.copyFrom(e.end).addInPlace(new B.Vector3(Math.cos(angle)*radius,-.5+cast*(.5+seed*.7),Math.sin(angle)*radius));m.scaling.set((.12+seed*.12)*fade,Math.max(.001,cast*(.65+seed)*fade),(.13+seed*.1)*fade);m.rotation.z=Math.cos(angle)*.28;}
  else if(e.form==='wildvine'){const p=k,tendril=Math.floor(i/8),wave=Math.sin(p*Math.PI+e.time*2)*.25;m.position.copyFrom(B.Vector3.Lerp(e.start,e.end,Math.min(cast,p)));m.position.addInPlace(new B.Vector3(Math.cos(tendril*2.1+p*6)*.22,wave,Math.sin(tendril*2.1+p*6)*.22));m.scaling.set(.075*fade,length/8*.95*fade,.075*fade);m.rotationQuaternion=B.Quaternion.FromUnitVectorsToRef(B.Axis.Y,direction,new B.Quaternion());}
  else if(e.form==='volt'&&e.ability==='speed-vortex'){const p=i/count,angle=p*Math.PI*8+e.time*14;m.position.copyFrom(world.avatar.root.position).addInPlace(new B.Vector3(Math.cos(angle)*(1-p*.4),p*3,Math.sin(angle)*(1-p*.4)));m.scaling.set(.035*fade,.08*fade,.5*fade);m.rotation.y=-angle;}
  else if(e.form==='volt'){const root=world.avatar.root,p=(k+e.time*2.5)%1,back=p*5.8;m.position.copyFrom(root.position).subtractInPlace(new B.Vector3(-Math.sin(root.rotation.y)*back,0,-Math.cos(root.rotation.y)*back));m.position.y+=.12+seed*.45;m.scaling.set(.04*fade,.04*fade,(.45+seed*.8)*fade);m.rotationQuaternion=null;m.rotation.set(0,root.rotation.y,0);}
  else if(e.form==='fourarms'){const angle=k*Math.PI*2;m.position.copyFrom(e.end).addInPlace(new B.Vector3(Math.cos(angle)*hit*(1+seed*2),-.4+Math.sin(hit*Math.PI)*(.5+seed),Math.sin(angle)*hit*(1+seed*2)));m.scaling.setAll(Math.max(.001,(.07+seed*.17)*cast*fade));m.rotation.set(a,a*.6,a*.3);}
  else if(e.form==='cannon'){m.position.copyFrom(center);m.position.y=.7;m.scaling.setAll(i===0?.9*fade:.02*fade);m.rotation.x=e.time*22;if(i>0){m.position.addInPlace(new B.Vector3(Math.cos(a)*hit*1.8,-.3+Math.sin(hit*Math.PI)*.5,Math.sin(a)*hit*1.8));m.scaling.setAll(.05*fade);}}
  else if(e.form==='shade'){m.position.copyFrom(center).addInPlace(new B.Vector3(Math.cos(a)*(.3+k*.6),k*1.5-.25,Math.sin(a)*(.3+k*.6)));m.scaling.set(.08*fade,(.4+seed*.45)*fade,.08*fade);}
  else if(e.form==='beast'){m.position.copyFrom(B.Vector3.Lerp(e.start,e.end,k));m.position.y=.10+Math.sin(e.time*5+k*8)*.06;m.scaling.setAll((.055+Math.sin(e.time*5-k*10)**2*.065)*fade);}
  else if(e.form==='nova'){m.position.copyFrom(e.end).addInPlace(new B.Vector3(Math.cos(a)*(1+cast),Math.sin(a*2)*1.4+1,Math.sin(a)*(1+cast)));m.scaling.setAll((.04+seed*.1)*fade);}
  else {m.position.copyFrom(center).addInPlace(new B.Vector3(Math.cos(a)*(.4+hit),Math.sin(a)*(.4+hit),0));}
 }
 const ground=['fourarms','cannon','beast','volt','rock','wildvine'].includes(e.form);for(const [i,ring] of e.rings.entries()){const burst=Math.max(0,cast-.2*i);ring.position.copyFrom(f.phase==='anticipation'?e.start:ground?e.end:center);if(ground&&f.phase!=='anticipation')ring.position.y=.06+i*.015;ring.rotation.set(ground&&f.phase!=='anticipation'?0:Math.PI/2,e.form==='shade'?e.time*.7:0,e.form==='nova'?i*Math.PI/4:0);ring.scaling.setAll(Math.max(.001,(f.phase==='anticipation'?.2+charged*.5:burst*(1.2+i*.7)+hit*(1+i*.2))*fade*boost));}
  if(e.beam){const fireBreath=e.form!=='blaze'||e.ability==='fire-breath',endpoint=B.Vector3.Lerp(e.start,e.end,cast),active=fireBreath&&(f.phase==='cast'||f.phase==='impact'),width=(e.form==='blaze'?.28:e.form==='tide'?.19:.07)*(active?1-hit*.75:0)*fade*boost;segment(e.beam,e.start,endpoint,Math.max(.001,width));segment(e.innerBeam,e.start,endpoint,Math.max(.001,width*.32));}
 e.material.alpha=(e.form==='shade'?.44:.88)*fade;e.material.emissiveColor.scaleInPlace(1);e.materials[1].alpha=.94*fade;
 e.toon?.update(f,dt);updateAbilitySculpture(world,e,f);updatePowerPolish(e,f);return f.done;
}
export function disposePowerEffect(effect){if(!effect)return;if(effect.paper){disposeComicPower(effect);return;}disposePowerPolish(effect);effect.toon?.dispose();effect.root.dispose();for(const material of effect.materials||[effect.material])material.dispose();}
