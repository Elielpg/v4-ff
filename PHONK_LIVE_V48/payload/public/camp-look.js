import {MeadowWind} from './meadow-wind.js';
// A reversible visual layer over the existing camp and actors. No model replacement.
export class CampLook {
 constructor(world){const B=BABYLON;this.world=world;this.meadow=new MeadowWind(world);this.time=0;this.lastPower=null;this.materials=[];this.modified=new WeakSet();this.impacts=[];this.root=new B.TransformNode('v44-camp-atmosphere',world.scene);
  world.scene.imageProcessingConfiguration.contrast=1.08;world.scene.imageProcessingConfiguration.exposure=1.04;
  world.sun.diffuse=new B.Color3(1,.94,.80);world.sun.shadowMinZ=1;world.sun.shadowMaxZ=100;
  const mat=(name,color,alpha)=>{const m=new B.StandardMaterial(name,world.scene);m.diffuseColor=new B.Color3(...color);m.emissiveColor=m.diffuseColor.clone();m.disableLighting=true;m.alpha=alpha;this.materials.push(m);return m;};
  this.auraMaterial=mat('v44-omnitrix-aura',[.38,1,.13],.19);this.aura=B.MeshBuilder.CreateTorus('v44-hero-aura',{diameter:1.65,thickness:.025,tessellation:36},world.scene);this.aura.parent=this.root;this.aura.material=this.auraMaterial;this.aura.isPickable=false;
  this.guard=B.MeshBuilder.CreateSphere('v44-defense-field',{diameter:2,segments:12},world.scene);this.guard.parent=this.root;this.guard.material=mat('v44-guard-light',[.35,.95,.72],.12);this.guard.isPickable=false;this.guard.setEnabled(false);
  this.impactMaterial=mat('v44-impact-ink',[.52,1,.22],.65);
  const mote=B.MeshBuilder.CreateSphere('v44-firefly-source',{diameter:.045,segments:4},world.scene);mote.material=mat('v44-fireflies',[.85,1,.35],.8);mote.isPickable=false;mote.setEnabled(false);mote.parent=this.root;this.motes=Array.from({length:12},(_,i)=>{const m=mote.createInstance('v44-firefly-'+i);m.parent=this.root;m.isPickable=false;return m;});
  B.Effect.ShadersStore.benCampToonFragmentShader='precision highp float;varying vec2 vUV;uniform sampler2D textureSampler;uniform float strength;void main(){vec4 c=texture2D(textureSampler,vUV);float l=max(dot(c.rgb,vec3(0.2126,0.7152,0.0722)),0.001);float band=(floor(l*5.0)+0.5)/5.0;vec3 toon=c.rgb*clamp(band/l,0.7,1.3);gl_FragColor=vec4(mix(c.rgb,toon,strength),c.a);}';
  try{this.toon=new B.PostProcess('v44-cel-bands','benCampToon',['strength'],null,1,world.camera);this.toon.onApply=effect=>effect.setFloat('strength',world.graphics?.profile.celStrength||0);}catch{this.toon=null;}
  this.fxaa=new B.FxaaPostProcess('v44-final-edge-smoothing',1,world.camera);
  const water=world.camp?.palette.water;if(water){water.alpha=.91;water.specularColor=new B.Color3(.3,.42,.36);const texture=new B.DynamicTexture('v44-water-ripples',{width:256,height:256},world.scene,false),ctx=texture.getContext();ctx.fillStyle='#467b77';ctx.fillRect(0,0,256,256);for(let i=0;i<24;i++){ctx.strokeStyle=i%2?'#acd9bb':'#71a49c';ctx.lineWidth=1+(i%3)*.5;ctx.beginPath();ctx.ellipse((i*73)%256,(i*47)%256,9+(i%5)*8,1.8,0,0,Math.PI*2);ctx.stroke();}texture.update();texture.uScale=texture.vScale=3;water.diffuseTexture=texture;this.water=texture;}
  for(const mesh of world.camp.root.getChildMeshes()){mesh.computeWorldMatrix(true);const name=mesh.material?.name||'';if(!/ground|pond|ridge|glass|fire/.test(name)&&mesh.getBoundingInfo().boundingBox.extendSizeWorld.y>1.2)world.shadow.addShadowCaster(mesh);}
 }
 applyActor(actor){for(const mesh of actor?.root?.getChildMeshes()||[]){const m=mesh.material;if(!m||this.modified.has(m))continue;this.modified.add(m);if(m.specularColor)m.specularColor.scaleInPlace(.65);if(typeof m.metallic==='number')m.metallic*=.3;if(typeof m.roughness==='number')m.roughness=Math.max(.72,m.roughness);}}
 impact(power){if(this.impacts.length>=3)return;const B=BABYLON,m=B.MeshBuilder.CreateTorus('v44-impact-wave',{diameter:.5,thickness:.035,tessellation:32},this.world.scene);m.material=this.impactMaterial;m.position.set(power.position[0],.065,power.position[2]);m.isPickable=false;this.impacts.push({mesh:m,age:0,combo:power.combo||1});}
 update(dt){if(this.world.paperFX?.enabled){this.time+=dt;return;}const B=BABYLON,w=this.world,s=w.adventureState;this.time+=dt;this.meadow.update(dt);const p=w.renderPosition||w.avatar.root.position;this.aura.position.copyFrom(p);this.aura.position.y+=.055;this.aura.scaling.setAll(1+Math.sin(this.time*2.4)*.025);this.auraMaterial.alpha=s?.form!=='base'?0.17:0.08;this.aura.setEnabled(!w.reducedMotion&&s?.watch?.phase!=='recharging');
  this.guard.setEnabled(!!s?.abilities?.defending);this.guard.position.copyFrom(p);this.guard.position.y+=1.1;this.guard.scaling.set(1.1,1.4,1.1);this.guard.rotation.y=this.time*.4;
  const night=1-(w.dayCycle?.day??1),count=w.graphics?.profile.fireflies||0;for(const [i,m] of this.motes.entries()){m.setEnabled(i<count&&night>.3);if(i<count){const a=i*2.399+this.time*.09;m.position.set(Math.cos(a)*(4+i%5),.45+(i%4)*.22+Math.sin(this.time+i)*.15,Math.sin(a)*(4+i%5));}}
  if(this.water){this.water.uOffset=this.time*.004;this.water.vOffset=Math.sin(this.time*.08)*.015;}
  this.applyActor(w.imported?.root?.isEnabled()?w.imported:w.avatar);
  if(s?.power&&s.power.id!==this.lastPower){this.lastPower=s.power.id;if(Date.now()+(w.serverOffset||0)-s.power.at<4000)this.pendingImpact={power:s.power,due:this.time+(s.power.duration||2000)/1000*.45};}
  if(this.pendingImpact&&this.time>=this.pendingImpact.due){this.impact(this.pendingImpact.power);this.pendingImpact=null;}
  for(let i=this.impacts.length-1;i>=0;i--){const e=this.impacts[i];e.age+=dt;e.mesh.scaling.setAll(1+e.age*(5+e.combo));e.mesh.visibility=Math.max(0,1-e.age/1.1);if(e.age>=1.1){e.mesh.dispose();this.impacts.splice(i,1);}}
 }
 dispose(){this.meadow.dispose();this.root.dispose();for(const e of this.impacts)e.mesh.dispose();for(const m of this.materials)m.dispose();this.water?.dispose();this.toon?.dispose();this.fxaa?.dispose();}
}
