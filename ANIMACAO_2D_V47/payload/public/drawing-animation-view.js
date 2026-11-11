import {DrawingCharacter as OriginalDrawing} from './character-2d.js';
import {MOTION_ACTORS} from './motion-catalog.js';
import {DrawingAnimator} from './animation-2d.js';
import {drawingLayout,drawingPose,drawingSocket} from './character-2d-plan.js';

// Extend the existing actor; original atlases and explicit model mode stay usable.
export class DrawingCharacter extends OriginalDrawing{
 constructor(world,form='base'){super(world,form);this.animator??=new DrawingAnimator();this.motionCache??=new Map();if(this.note)this.note.textContent='Ciclos 2D de movimento, luta, dança e sentar.';}
 async onFormChange(form){
  this.motionActor=null;this.motionImage=null;this.motionFrame=null;this.motionCache??=new Map();
  const ok=await super.onFormChange(form);if(!ok||this.disposed||form!==this.form)return ok;
  const ticket=this.ticket,definition=MOTION_ACTORS[form];
  if(definition){try{let image=this.motionCache.get(form);if(!image){image=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Ciclo 2D indisponível'));i.src=new URL(definition.image,import.meta.url).href;});if(this.disposed||ticket!==this.ticket)return false;}this.motionCache.delete(form);this.motionCache.set(form,image);this.motionActor=definition;this.motionImage=image;while(this.motionCache.size>3)this.motionCache.delete(this.motionCache.keys().next().value);}catch{}}
  this.animator=new DrawingAnimator();this.drawKey=null;this.update();return true;
 }
 ensureMeshes(){super.ensureMeshes();this.plane.metadata={paper2D:true};this.shadow.metadata={paper2D:true};}
 setMode(value){const pending=super.setMode(value),mode=this.mode;if(this.world.comicStage&&this.world.comicStage.mode!==(mode==='models'?'models':'drawing'))this.world.comicStage.setMode(mode==='models'?'models':'drawing');if(mode==='models'&&this.world.modelSources?.[this.form])void this.world.loadFormModel(this.form);return pending;}
 paint(pose,red){
  if(this.motionFrame===null||this.motionFrame===undefined||!this.motionImage)return super.paint(pose,red);
  const key=this.form+':motion:'+this.motionFrame+':'+this.flip;if(key===this.drawKey)return;
  const c=this.texture.getContext(),l=drawingLayout(this.motionActor,this.motionFrame);c.clearRect(0,0,1024,1024);c.save();if(this.flip){c.translate(1024,0);c.scale(-1,1);}c.drawImage(this.motionImage,l.sx,l.sy,l.sw,l.sh,l.dx,l.dy,l.dw,l.dh);c.restore();this.texture.update();this.drawKey=key;
 }
 update(){
  if(!this.active||this.disposed)return;
  this.animator??=new DrawingAnimator();const w=this.world,B=BABYLON,p=w.renderPosition,s=w.adventureState,time=performance.now()/1000,serverNow=Date.now()+(w.serverOffset||0);
  this.seated=s?.stance==='sitting';const movement=s?.motion?.status==='active'?s.motion.mode:(w.locomotionState||'idle'),velocity=w.previousDrawingPosition?p.subtract(w.previousDrawingPosition):B.Vector3.Zero();w.previousDrawingPosition=p.clone();
  const right=w.camera.getDirection(B.Axis.X);if(Math.abs(B.Vector3.Dot(velocity,right))>.0003)this.flip=B.Vector3.Dot(velocity,right)<0;
  const combat=w.battleState?.effect,dance=w.danceFrame,attack=combat?.type==='ben-hit'&&serverNow-combat.at<430&&!w.talking&&w.heroAnimationState()==='idle';if(attack&&w.battleTarget)this.flip=B.Vector3.Dot(w.battleTarget.subtract(p),right)<0;
  this.pose=movement==='roll'&&this.form==='cannon'?7:drawingPose({animation:attack?'attack':w.heroAnimationState(),motion:movement,talking:w.talking,mouth:w.mouthLevel,time,reducedMotion:w.reducedMotion});
  const a=this.animator.sample({now:performance.now(),serverNow,position:[p.x,p.y,p.z],motion:s?.motion,animation:w.talking?'talk':w.heroAnimationState(),power:s?.power,battle:combat,dance,seated:this.seated,reducedMotion:w.reducedMotion,form:this.form});
  this.animation=a;this.motionFrame=this.motionActor?a.frame:null;this.paint(this.pose,s?.watch?.phase==='recharging');
  const layout=drawingLayout(this.motionFrame!==null?this.motionActor:this.actor,this.motionFrame??this.pose),transform=w.transformMotion?Math.min(1,Math.max(.76,.76+(performance.now()-w.transformMotion.at)/w.transformMotion.duration*.24)):1;
  const scale=transform*(movement==='roll'&&this.form==='cannon'?.75:1);this.plane.position.set(p.x,p.y+layout.centerHeight*scale,p.z);if(a.lunge)this.plane.position.addInPlace(right.scale(a.lunge*(this.flip?-1:1)));
  const spin=(movement==='spin'||w.heroAnimationState()==='spin')&&!w.reducedMotion?Math.cos(time*11):1;
  this.plane.scaling.set(layout.planeHeight*scale*(Math.abs(spin)<.08?.08:spin)*a.squashX,layout.planeHeight*scale*a.squashY,1);this.plane.rotation.z=movement==='roll'&&this.form==='cannon'&&!w.reducedMotion?time*(this.flip?-12:12):a.lean;if(dance?.active&&!w.reducedMotion)this.plane.position.y+=dance.bounce;
  const day=w.dayCycle.day??1,light=Math.max(.72,Math.min(1,.75+day*.25));this.material.setVector3('tint',new B.Vector3(light,light*(1-a.flash*.35),Math.min(1,light+.035)*(1-a.flash*.35)));this.plane.setEnabled(true);
  this.shadow.position.set(p.x,.028,p.z);this.shadowMaterial.alpha=Math.max(.15,.8-Math.max(0,p.y)*.15);this.shadow.scaling.setAll(Math.max(.45,1-Math.max(0,p.y)*.1));this.shadow.setEnabled(true);this.hideOriginal();
 }
 get bounds(){return this.active?{height:this.actor.height*(this.seated?.65:1),width:this.actor.height*.65,depth:.15}:null;}
 powerOrigin(ability){return this.socket(['fire-breath','sonic-roar'].includes(ability)?'mouth':'hand');}
 socket(kind){if(!this.active)return null;const B=BABYLON,w=this.world,p=drawingSocket(this.form,this.pose,kind,this.flip),right=w.camera.getDirection(B.Axis.X);if(kind==='hand'&&this.motionFrame===14)p.x=Math.abs(p.x)*(this.flip?-1:1);return w.renderPosition.add(right.scale(p.x*this.actor.height)).add(new B.Vector3(0,p.y*this.actor.height*(this.seated?.65:1),0));}
 dispose(){this.motionCache?.clear();super.dispose();}
}
