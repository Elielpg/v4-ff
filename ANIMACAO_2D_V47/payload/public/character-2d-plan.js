// Pure pose/layout rules shared by the drawing renderer and regression tests.
export const DRAWING_MODES = ['drawing', 'models'];
export function visualMode(value) { return DRAWING_MODES.includes(value) ? value : 'drawing'; }
export function drawingPose({animation='idle', motion='idle', talking=false, mouth=0, time=0, reducedMotion=false}={}) {
  if (['select','transform','charge','defend','guard','shield'].includes(animation)) return 3;
  if (['cast','power','attack','release','impact','strike','recover'].includes(animation)) return 7;
  if (motion==='jump'||animation==='jump'||animation==='sit'||motion==='fly') return 6;
  if (motion==='spin'||animation==='spin') return 7;
  if (['walk','run','dash','roll'].includes(motion)) {
    const pace = motion==='walk'?5:motion==='dash'?13:9;
    return reducedMotion ? 4 : 4+(Math.floor(time*pace)%2);
  }
  if (['wave','cheer','greet','celebrate'].includes(animation)) return 2;
  if (talking && mouth>.12) return 1;
  if (['point','explain','think','nod'].includes(animation)) return 3;
  return 0;
}
export function drawingLayout(actor, pose, size=1024) {
  if (!actor || !Number.isInteger(pose) || pose<0 || pose>=actor.frames.length) throw Error('Pose inválida');
  const frame=actor.frames[pose], reference=actor.frames[0].bounds;
  const scale=size*.78/(actor.referenceHeight||(reference[3]-reference[1]));
  const [sx,sy,sw,sh]=frame.rect;
  return {sx,sy,sw,sh,dx:size/2-sw*scale/2,dy:size*.88-frame.bounds[3]*scale,dw:sw*scale,dh:sh*scale,
    planeHeight:actor.height/.78, centerHeight:(.88-.5)*actor.height/.78};
}
export function drawingSocket(form,pose,kind,flip=false) {
  let x=.18,y=.40;
  if(kind==='mouth'){x=0;y=.87;}
  else if(kind==='watch'){if(pose===3){x=.06;y=.57;}else if(pose===2){x=.15;y=.43;}}
  else {x=form==='base'?-.24:form==='rock'?-.38:.34;y=form==='rock'?.74:.68;if(pose===3){x=.16;y=.57;}}
  return {x:x*(flip?-1:1),y};
}
