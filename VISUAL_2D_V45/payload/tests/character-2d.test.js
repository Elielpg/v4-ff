import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {DRAWING_ACTORS} from '../public/character-2d-catalog.js';
import {drawingPose,drawingLayout,drawingSocket,visualMode} from '../public/character-2d-plan.js';

test('drawing atlases: four real PNG files, intact checksums, valid non-divisible grid and bounds',async()=>{
  assert.deepEqual(Object.keys(DRAWING_ACTORS),['base','blaze','volt','rock']);
  for(const actor of Object.values(DRAWING_ACTORS)){
    const bytes=await readFile(new URL('../public/'+actor.image.slice(2),import.meta.url));
    assert.equal(bytes.toString('hex',0,8),'89504e470d0a1a0a');assert.equal(createHash('sha256').update(bytes).digest('hex'),actor.sha256);
    assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],actor.imageSize);assert.equal(actor.frames.length,8);
    for(let i=0;i<8;i++){const {rect:[x,y,w,h],bounds:[l,t,r,b]}=actor.frames[i];assert(x>=0&&y>=0&&x+w<=actor.imageSize[0]&&y+h<=actor.imageSize[1]);assert(l>=0&&t>=0&&r<=w&&b<=h&&l<r&&t<b);const plan=drawingLayout(actor,i);assert(Math.abs(plan.dy+b*plan.dh/h-901.12)<.001,'Feet stay at the same ground anchor');assert(plan.dw<=1024&&plan.dh<=1024);}
  }
});
test('drawing animation: gameplay wins over speech, run has two steps, reduced motion is stable',()=>{
  assert.equal(drawingPose({animation:'select',talking:true,mouth:1}),3);
  assert.equal(drawingPose({animation:'cast',motion:'run',talking:true,mouth:1}),7);
  assert.equal(drawingPose({motion:'jump'}),6);assert.equal(drawingPose({animation:'wave'}),2);
  assert.equal(drawingPose({talking:true,mouth:1}),1);assert.equal(drawingPose({talking:true,mouth:0}),0);
  assert.notEqual(drawingPose({motion:'run',time:0}),drawingPose({motion:'run',time:.12}));
  assert.equal(drawingPose({motion:'run',time:0,reducedMotion:true}),drawingPose({motion:'run',time:.12,reducedMotion:true}));
  assert.equal(visualMode(null),'drawing');assert.equal(visualMode('models'),'models');
});
test('2D hand/watch sockets follow mirrored art, never invert height',()=>{
  for(const kind of ['hand','watch','mouth']){const normal=drawingSocket('base',3,kind),mirrored=drawingSocket('base',3,kind,true);assert.equal(normal.x, -mirrored.x);assert.equal(normal.y,mirrored.y);assert(normal.y>0&&normal.y<1);}
});
