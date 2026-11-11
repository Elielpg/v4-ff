import {test} from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,mkdir,writeFile,readFile,rm,symlink} from 'node:fs/promises';import {createHash} from 'node:crypto';import path from 'node:path';import os from 'node:os';import {applyVisualUpdate,rollbackVisualUpdate} from '../scripts/visual2d-update.js';
test('V45 visual update backs up, preserves keys/progress, rejects tampering and restores V44.2',async()=>{
 const temp=await mkdtemp(path.join(os.tmpdir(),'ben45-update-'));try{
  const root=path.join(temp,"game ' quoted"),payload=path.join(temp,'payload');await mkdir(path.join(root,'data/private'),{recursive:true});await mkdir(path.join(payload,'public'),{recursive:true});await writeFile(path.join(root,'package.json'),' {"name":"linel-live-city","type":"module","version":"44.2.0"}');await writeFile(path.join(root,'.env'),'PRIVATE_FIXTURE=unchanged');await writeFile(path.join(root,'data/private/progress.json'),'{"likes":12345}');
  const contents={'package.json':'{"name":"linel-live-city","type":"module","version":"45.0.0"}','public/release.js':"export const BUILD_ID='45.0.0';",'public/character-2d-plan.js':'export const testFixture=true;'};
  for(const [name,bytes] of Object.entries(contents))await writeFile(path.join(payload,name),bytes);
  const manifest={version:'45.0.0',kind:'drawing-update',files:Object.entries(contents).map(([name,bytes])=>({name,sha256:createHash('sha256').update(bytes).digest('hex')}))};await writeFile(path.join(payload,'manifest.json'),JSON.stringify(manifest));
  const result=await applyVisualUpdate(payload,root,{stop:false});assert.equal(JSON.parse(await readFile(path.join(root,'package.json'))).version,'45.0.0');assert.match(await readFile(path.join(result.backup,'COMO_REVERTER.txt'),'utf8'),/visual2d-update/);
  assert.equal(await readFile(path.join(root,'.env'),'utf8'),'PRIVATE_FIXTURE=unchanged');assert.equal(await readFile(path.join(root,'data/private/progress.json'),'utf8'),'{"likes":12345}');
  await rollbackVisualUpdate(result.backup,root,{stop:false});assert.equal(JSON.parse(await readFile(path.join(root,'package.json'))).version,'44.2.0');await assert.rejects(readFile(path.join(root,'public/character-2d-plan.js')));
  await writeFile(path.join(payload,'public/character-2d-plan.js'),'tampered');await assert.rejects(applyVisualUpdate(payload,root,{stop:false}),/SHA-256/);
  manifest.files=[{name:'server/config.js',sha256:'x'}];await writeFile(path.join(payload,'manifest.json'),JSON.stringify(manifest));await assert.rejects(applyVisualUpdate(payload,root,{stop:false}),/fora da atualização/);
  manifest.files=[{name:'public/character-2d-plan.js',sha256:createHash('sha256').update('tampered').digest('hex')}];await writeFile(path.join(payload,'manifest.json'),JSON.stringify(manifest));await symlink(path.join(temp,'escape'),path.join(root,'public'),'dir').catch(()=>{});
  // A destination symlink must be refused before any file is written.
  await rm(path.join(root,'public'),{recursive:true,force:true});await mkdir(path.join(temp,'escape'));await symlink(path.join(temp,'escape'),path.join(root,'public'),'dir');await assert.rejects(applyVisualUpdate(payload,root,{stop:false}),/simbólico/);
 }finally{await rm(temp,{recursive:true,force:true});}
});
