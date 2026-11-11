export class ComicStage{
 constructor(world){this.world=world;this.hidden=new Map();this.mode='drawing';this.ready=false;try{this.mode=localStorage.getItem('benComicScene')==='models'?'models':'drawing';}catch{}
  const B=BABYLON;this.layer=new B.Layer('drawn-clearing',new URL('./comic-assets/camp.png',import.meta.url).href,world.scene,true);this.layer.texture.onLoadObservable.addOnce(()=>{this.ready=true;});this.layer.texture.onErrorObservable?.add(()=>{this.setMode('models');});
  const label=document.createElement('label');label.textContent='Cenário';this.select=document.createElement('select');this.select.id='scene-visual';for(const [value,text] of [['drawing','Clareira desenhada 2D'],['models','Acampamento 3D original']]){const o=document.createElement('option');o.value=value;o.textContent=text;this.select.append(o);}this.select.value=this.mode;this.select.onchange=()=>this.setMode(this.select.value);label.append(this.select);document.getElementById('quality')?.closest('label')?.after(label);this.control=label;
  world.scene.onBeforeRenderObservable.add(()=>this.update());world.scene.onDisposeObservable.addOnce(()=>this.dispose());
 }
 setMode(mode){this.mode=mode==='models'?'models':'drawing';try{localStorage.setItem('benComicScene',this.mode);}catch{}if(this.select)this.select.value=this.mode;if(this.mode==='models')this.restore();}
 hide(mesh){if(!mesh||mesh.isDisposed())return;if(!this.hidden.has(mesh))this.hidden.set(mesh,mesh.isVisible);mesh.isVisible=false;}
 restore(){for(const [mesh,visible] of this.hidden)if(!mesh.isDisposed())mesh.isVisible=visible;this.hidden.clear();}
 update(){const w=this.world,B=BABYLON,enabled=this.mode==='drawing'&&this.ready;this.layer.isEnabled=enabled;if(!enabled){this.restore();return;}
  for(const mesh of w.camp.root.getChildMeshes())this.hide(mesh);this.hide(w.campLook.meadow.mesh);this.hide(w.dayCycle.sky);this.hide(w.dayCycle.stars);
  for(const a of w.audienceView.actors.values()){for(const mesh of a.actor.root.getChildMeshes())this.hide(mesh);}
  const p=w.renderPosition,portrait=w.canvas.clientWidth<w.canvas.clientHeight;let centerX=p.x-Math.max(-.9,Math.min(.9,p.x*.2)),centerZ=p.z-Math.max(-.8,Math.min(.8,p.z*.2));
  const focus=w.audienceView.state.greeting||w.audienceView.current,viewer=focus&&w.audienceView.actors.get(focus.viewerId);if(viewer&&!w.battleState?.enemies?.length){const v=viewer.actor.root.position;centerX=(p.x+v.x)/2;centerZ=(p.z+v.z)/2;}
  this.centerX=(this.centerX??centerX)+(centerX-(this.centerX??centerX))*.12;this.centerZ=(this.centerZ??centerZ)+(centerZ-(this.centerZ??centerZ))*.12;centerX=this.centerX;centerZ=this.centerZ;w.camera.position.set(centerX+.25,5.8+p.y*.2,centerZ-(portrait?10.8:15));w.camera.setTarget(new B.Vector3(centerX,2.1,centerZ+.3));w.camera.fov=portrait?.88:.72;w.camera.getViewMatrix(true);w.scene.updateTransformMatrix(true);
  const aspect=w.canvas.clientWidth/Math.max(1,w.canvas.clientHeight),imageAspect=2/3;const sx=aspect<imageAspect?aspect/imageAspect:1,sy=aspect>imageAspect?imageAspect/aspect:1;
  // Cover the viewport without stretching the drawing. Overscan allows subtle parallax.
  this.layer.scale.set(1,1);this.layer.offset.set(0,0);this.layer.texture.uScale=sx*.95;this.layer.texture.vScale=sy*.95;this.layer.texture.uOffset=(1-sx*.95)/2+Math.max(-.018,Math.min(.018,p.x*.0015));this.layer.texture.vOffset=(1-sy*.95)/2+Math.max(-.015,Math.min(.015,p.z*.001));this.layer.texture.wrapU=this.layer.texture.wrapV=B.Texture.CLAMP_ADDRESSMODE;
  const day=w.dayCycle.day,sunset=w.dayCycle.sunset;this.layer.color=new B.Color4(.36+day*.64,.44+day*.56-sunset*.1,.66+day*.34-sunset*.22,1);
 }
 dispose(){this.restore();this.control.remove();this.layer.dispose();}
}
