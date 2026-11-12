const mix=(a,b,t)=>a+(b-a)*t,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class PartyCamera{
 constructor(){this.current=null;}
 sample({hero=[0,0,0],height=2.25,focus=null,aspect=.55,dt=.016,music=null,settings={},reducedMotion=false}={}){
  aspect=clamp(aspect,.3,3);const portrait=aspect<1,featured=settings.arrivalCamera!==false&&focus,duet=featured&&focus.kind==='duet';
  let x=hero[0],z=hero[2],h=height,span=Math.max(1.9,height*.8),kind='hero';
  if(featured){kind=focus.kind;const v=focus.position;if(['duet','gift','comment','follow'].includes(kind)){const min=Math.min(hero[0]-height*.45,v[0]-.7),max=Math.max(hero[0]+height*.45,v[0]+.7);x=(min+max)/2;z=(hero[2]+v[2])/2;span=max-min;h=Math.max(height,1.7);}else{x=v[0];z=v[2];span=2.3;h=1.7;}}
  const fov=portrait?.88:.72,fit=span/(2*Math.tan(fov/2)*aspect*.78),base=Math.max(portrait?featured&&!duet?8.4:10.2:13,fit,height*3.7);
  const dancing=music?.musicActive&&settings.beatCamera!==false&&!reducedMotion,intensity=dancing?clamp(settings.lightStrength??.55,0,1):0,pulse=music?.pulse||0,position=music?.position||0;
  const target={x:x+Math.sin(position*Math.PI/4)*.35*intensity,z,y:Math.max(1.8,h*.73)+hero[1]*.8,radius:clamp(base*(1-pulse*.07*intensity),6,26),roll:Math.sin(position*Math.PI)*.022*intensity};
  const blend=1-Math.exp(-clamp(dt,0,.12)*(featured?5:3));if(!this.current)this.current={...target};for(const k of Object.keys(target))this.current[k]=mix(this.current[k],target[k],blend);
  return {...this.current,height:Math.max(5,h*1.75)+hero[1]*.2,fov,kind};
 }
}
