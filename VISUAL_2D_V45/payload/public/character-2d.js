import {DRAWING_ACTORS} from './character-2d-catalog.js';
import {visualMode,drawingPose,drawingLayout,drawingSocket} from './character-2d-plan.js';

// A small presentation adapter: the existing arena owns movement, cooldowns,
// events and powers. Original actors stay loaded for instant 3D fallback.
export class DrawingCharacter {
  constructor(world,form='base') {
    this.world=world;this.form=form;this.cache=new Map();this.failures=new Set();this.hidden=new Map();this.ticket=0;this.active=false;this.disposed=false;this.pose=0;this.flip=false;
    let saved;try{saved=localStorage.getItem('benCharacterVisual');}catch{}
    this.mode=visualMode(saved);this.installControl();this.ready=this.onFormChange(form);
    world.scene.onDisposeObservable.addOnce(()=>this.dispose());
  }
  installControl(){
    const quality=document.getElementById('quality')?.closest('label');if(!quality)return;
    const label=document.createElement('label');label.textContent='Visual dos personagens';
    this.select=document.createElement('select');this.select.id='character-visual';this.select.setAttribute('aria-label','Visual dos personagens');
    for(const [value,text] of [['drawing','Desenho clássico (4 personagens)'],['models','Modelos 3D originais']]){const option=document.createElement('option');option.value=value;option.textContent=text;this.select.append(option);}
    this.select.value=this.mode;this.onSelect=()=>this.setMode(this.select.value);this.select.addEventListener('change',this.onSelect);label.append(this.select);
    this.note=document.createElement('small');this.note.textContent='Ben, Chama, XLR8 e Diamante em 2D. As outras formas mantêm os modelos 3D.';label.append(this.note);quality.after(label);this.control=label;
  }
  setMode(value){this.mode=visualMode(value);try{localStorage.setItem('benCharacterVisual',this.mode);}catch{}if(this.select)this.select.value=this.mode;this.restore();this.active=false;this.plane?.setEnabled(false);this.shadow?.setEnabled(false);this.failures.delete(this.form);this.ready=this.onFormChange(this.form);return this.ready;}
  async onFormChange(form){
    const ticket=++this.ticket;this.form=form;this.active=false;this.restore();this.plane?.setEnabled(false);this.shadow?.setEnabled(false);this.drawKey=null;
    if(this.mode!=='drawing'||!DRAWING_ACTORS[form]||this.failures.has(form)||this.disposed)return false;
    try{
      let pending=this.cache.get(form);if(!pending){pending=new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Arte indisponível: '+form));image.src=new URL(DRAWING_ACTORS[form].image,import.meta.url).href;});this.cache.set(form,pending);}
      const image=await pending;if(this.disposed||ticket!==this.ticket||this.mode!=='drawing')return false;
      this.image=image;this.actor=DRAWING_ACTORS[form];this.ensureMeshes();this.active=true;this.update();return true;
    }catch(error){if(ticket!==this.ticket||this.disposed)return false;this.failures.add(form);this.cache.delete(form);this.active=false;this.restore();if(this.note)this.note.textContent='A arte não carregou. O modelo 3D continua disponível; selecione o visual novamente para tentar.';console.warn('[drawing-character]',error.message);return false;}
  }
  ensureMeshes(){
    if(this.plane)return;const B=BABYLON,scene=this.world.scene;
    this.texture=new B.DynamicTexture('drawing-character-color',{width:1024,height:1024},scene,false,B.Texture.BILINEAR_SAMPLINGMODE);this.texture.hasAlpha=true;this.texture.wrapU=this.texture.wrapV=B.Texture.CLAMP_ADDRESSMODE;
    this.material=new B.ShaderMaterial('drawing-character-ink',scene,{vertexSource:'precision highp float; attribute vec3 position; attribute vec2 uv; uniform mat4 worldViewProjection; varying vec2 vUV; void main(){vUV=uv;gl_Position=worldViewProjection*vec4(position,1.0);}',fragmentSource:'precision highp float; varying vec2 vUV; uniform sampler2D art; uniform vec3 tint; void main(){vec4 c=texture2D(art,vUV);if(c.a<0.42)discard;gl_FragColor=vec4(c.rgb*tint,smoothstep(0.42,0.68,c.a));}'},{attributes:['position','uv'],uniforms:['worldViewProjection','tint'],samplers:['art'],needAlphaBlending:true});
    this.material.backFaceCulling=false;this.material.setTexture('art',this.texture);this.material.setVector3('tint',new B.Vector3(1,1,1));
    this.plane=B.MeshBuilder.CreatePlane('classic-drawing-character',{size:1},scene);this.plane.billboardMode=B.Mesh.BILLBOARDMODE_Y;this.plane.material=this.material;this.plane.isPickable=false;this.plane.alwaysSelectAsActiveMesh=true;
    this.shadowTexture=new B.DynamicTexture('drawing-contact-shadow',{width:128,height:128},scene,false);const c=this.shadowTexture.getContext(),g=c.createRadialGradient(64,64,2,64,64,62);g.addColorStop(0,'rgba(0,0,0,.35)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,128,128);this.shadowTexture.hasAlpha=true;this.shadowTexture.update();
    this.shadowMaterial=new B.StandardMaterial('drawing-contact-shadow-material',scene);this.shadowMaterial.diffuseTexture=this.shadowTexture;this.shadowMaterial.useAlphaFromDiffuseTexture=true;this.shadowMaterial.diffuseColor=B.Color3.Black();this.shadowMaterial.emissiveColor=B.Color3.Black();this.shadowMaterial.disableLighting=true;this.shadowMaterial.backFaceCulling=false;this.shadowMaterial.specularColor=B.Color3.Black();
    this.shadow=B.MeshBuilder.CreateGround('drawing-contact-shadow',{width:1.1,height:.62},scene);this.shadow.material=this.shadowMaterial;this.shadow.isPickable=false;
  }
  restore(){for(const [mesh,visible] of this.hidden)if(!mesh.isDisposed())mesh.isVisible=visible;this.hidden.clear();}
  hideOriginal(){const w=this.world;for(const root of [w.avatar?.root,w.imported?.root]){if(!root?.isEnabled())continue;for(const mesh of root.getChildMeshes()){if(!this.hidden.has(mesh))this.hidden.set(mesh,mesh.isVisible);mesh.isVisible=false;}}for(const mesh of this.hidden.keys())if(mesh.isDisposed())this.hidden.delete(mesh);}
  paint(pose,red){
    const key=[this.form,pose,this.flip,red].join(':');if(key===this.drawKey)return;
    const c=this.texture.getContext(),layout=drawingLayout(this.actor,pose);c.clearRect(0,0,1024,1024);c.save();if(this.flip){c.translate(1024,0);c.scale(-1,1);}c.drawImage(this.image,layout.sx,layout.sy,layout.sw,layout.sh,layout.dx,layout.dy,layout.dw,layout.dh);
    // Small wrist light follows the original watch's red/green recharge state.
    if(this.form==='base'&&pose<4){const socket=drawingSocket('base',pose,'watch'),x=512+socket.x*this.actor.height/layout.planeHeight*1024,y=1024*.88-socket.y*this.actor.height/layout.planeHeight*1024;c.shadowBlur=red?7:4;c.shadowColor=red?'#ff4439':'#a6ff4a';c.fillStyle=red?'rgba(255,65,49,.75)':'rgba(172,255,73,.45)';c.beginPath();c.arc(x,y,4,0,Math.PI*2);c.fill();}
    c.restore();this.texture.update();this.drawKey=key;
  }
  update(){
    if(!this.active||this.disposed)return;const w=this.world,B=BABYLON,p=w.renderPosition,s=w.adventureState,time=performance.now()/1000;
    // The seated cycle has no authored drawing yet. Keep the complete original
    // chair/body animation instead of showing a jumping drawing as a seated pose.
    this.seated=s?.stance==='sitting';if(this.seated){this.restore();this.plane.setEnabled(false);this.shadow.setEnabled(false);return;}
    const movement=s?.motion?.status==='active'?s.motion.mode:(w.locomotionState||'idle'),velocity=w.previousDrawingPosition?p.subtract(w.previousDrawingPosition):B.Vector3.Zero();w.previousDrawingPosition=p.clone();
    const right=w.camera.getDirection(B.Axis.X);if(Math.abs(B.Vector3.Dot(velocity,right))>.0003)this.flip=B.Vector3.Dot(velocity,right)<0;
    this.pose=drawingPose({animation:w.heroAnimationState(),motion:movement,talking:w.talking,mouth:w.mouthLevel,time,reducedMotion:w.reducedMotion});this.paint(this.pose,s?.watch?.phase==='recharging');
    const layout=drawingLayout(this.actor,this.pose),moving=['walk','run','dash','roll'].includes(movement),bob=w.reducedMotion?0:moving?Math.abs(Math.sin(time*(movement==='walk'?8:13)))*.025:Math.sin(time*2.5)*.007;
    const transform=w.transformMotion?Math.min(1,Math.max(.76,.76+(performance.now()-w.transformMotion.at)/w.transformMotion.duration*.24)):1;
    this.plane.position.set(p.x,p.y+layout.centerHeight*transform+bob,p.z);const spin=(movement==='spin'||w.heroAnimationState()==='spin')&&!w.reducedMotion?Math.cos(time*11):1;this.plane.scaling.set(layout.planeHeight*transform*(Math.abs(spin)<.08?.08:spin),layout.planeHeight*transform,1);this.plane.rotation.z=w.reducedMotion?0:moving?Math.sin(time*8)*.018:0;
    const day=w.dayCycle.day??1,light=Math.max(.72,Math.min(1,.75+day*.25));this.material.setVector3('tint',new B.Vector3(light,light,Math.min(1,light+.035)));this.plane.setEnabled(true);
    this.shadow.position.set(p.x,.028,p.z);this.shadowMaterial.alpha=Math.max(.15,.8-Math.max(0,p.y)*.15);this.shadow.scaling.setAll(Math.max(.45,1-Math.max(0,p.y)*.1));this.shadow.setEnabled(true);this.hideOriginal();
  }
  get bounds(){return this.active&&!this.seated?{height:this.actor.height,width:this.actor.height*.65,depth:.15}:null;}
  socket(kind){if(!this.active||this.seated)return null;const B=BABYLON,w=this.world,p=drawingSocket(this.form,this.pose,kind,this.flip),right=w.camera.getDirection(B.Axis.X);return w.renderPosition.add(right.scale(p.x*this.actor.height)).add(new B.Vector3(0,p.y*this.actor.height,0));}
  watchTarget(){return this.form==='base'?this.socket('watch'):null;}
  powerOrigin(ability){return this.socket(ability==='fire-breath'?'mouth':'hand');}
  dispose(){if(this.disposed)return;this.disposed=true;this.ticket++;this.active=false;this.restore();this.select?.removeEventListener('change',this.onSelect);this.control?.remove();for(const item of [this.plane,this.shadow,this.material,this.texture,this.shadowMaterial,this.shadowTexture])item?.dispose();this.cache.clear();this.failures.clear();}
}
