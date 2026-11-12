import {BattleView} from './battle-view.js';
import {ENEMY_MOTION} from './enemy-motion-catalog.js';
import {atlasMaterial} from './atlas-sprite.js';
export class BattleAnimationView extends BattleView{
 constructor(world,options={}){super(world,options);this.motionMaterials=new Map();this.exits=new Map();this.motionImage=new Image();this.motionImage.onload=()=>this.motionLoaded=true;this.motionImage.onerror=()=>this.motionFailed=true;this.motionImage.src=new URL(ENEMY_MOTION.image,import.meta.url).href;}
 material(type,pose){if(!this.motionLoaded)return super.material(type,Math.min(1,pose));const key=type+':'+pose;if(!this.motionMaterials.has(key)){const result=atlasMaterial(this.world,'enemy-motion-'+key,this.motionImage,ENEMY_MOTION.forms[type],pose,256);this.motionMaterials.set(key,result.material);this.textures.push(result.texture);}return this.motionMaterials.get(key);}
 sync(state){if(state&&this.source&&state.source!==this.source&&this.exits){for(const item of this.exits.values())super.remove(item);this.exits.clear();}super.sync(state);}
 remove(item){if(this.inUpdate&&this.motionLoaded){item.label.hidden=true;item.mesh.material=this.material(item.record.type,5);item.exitsAt=performance.now();item.exitScale=item.mesh.scaling.clone();this.exits.set(item.record.id,item);if(this.exits.size>12){const first=this.exits.keys().next().value;super.remove(this.exits.get(first));this.exits.delete(first);}this.world.paperFX?.moment('hit',{position:item.mesh.position.clone()});return;}super.remove(item);}
 update(){
  this.exits??=new Map();this.inUpdate=true;try{super.update();}finally{this.inUpdate=false;}
  if(!this.motionLoaded||!this.state)return;const w=this.world,now=Date.now()+(this.offset||0),time=performance.now();if(!this.items.size)w.battleTarget=null;
  for(const record of this.state.enemies){const item=this.items.get(record.id);if(!item)continue;item.record=record;const age=now-record.born,untilHit=record.nextHit-now,hit=this.state.effect?.type==='ben-hit'&&this.state.effect.target===record.id&&now-this.state.effect.at<340,enemyHit=this.state.effect?.type==='enemy-hit'&&this.state.effect.target===record.id&&now-this.state.effect.at<300;
   const pose=hit?4:enemyHit||untilHit>=0&&untilHit<170?3:untilHit>=170&&untilHit<420?2:age<2800?Math.floor(age/150)%2:0;item.motionPose=pose;item.mesh.material=this.material(record.type,pose);item.mesh.scaling.x*=-1;
   if(pose===3){const toward=w.renderPosition.subtract(item.mesh.position);toward.y=0;if(toward.length()>.01)item.mesh.position.addInPlace(toward.normalize().scale(.11));}
   if(pose===4){item.mesh.rotation.z=Math.sin((now-this.state.effect.at)/340*Math.PI)*.12*(item.mesh.position.x>w.renderPosition.x?-1:1);}else item.mesh.rotation.z=age<2800?Math.sin(age/130)*.013:0;
  }
  for(const [id,item] of this.exits){const t=(time-item.exitsAt)/360;if(t>=1){super.remove(item);this.exits.delete(id);continue;}item.mesh.visibility=1-t;item.mesh.scaling.copyFrom(item.exitScale).scaleInPlace(1-t*.15);item.mesh.rotation.z=Math.sin(t*Math.PI)*.035;}
 }
 dispose(){for(const item of this.exits?.values()||[])super.remove(item);this.exits?.clear();for(const m of this.motionMaterials?.values()||[])m.dispose();this.motionMaterials?.clear();super.dispose();}
}
