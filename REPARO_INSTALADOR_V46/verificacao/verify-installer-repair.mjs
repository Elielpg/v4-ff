import {mkdtemp,cp,symlink,mkdir,writeFile,readFile,rm,readdir} from 'node:fs/promises';
import {spawn,execFileSync} from 'node:child_process';import {once} from 'node:events';
import http from 'node:http';import path from 'node:path';import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {rollbackCampaignUpdate} from '../game/scripts/campaign-update.js';
const base='/workspace/ben10-v45-2d/game',source='/workspace/ben10-v46',temp=await mkdtemp('/tmp/ben46-repair-');
const game=path.join(temp,'game'),stage=path.join(temp,'original staging'),local=path.join(temp,'local models'),repair=path.join(temp,'BEN10_REPARO_INSTALADOR_V46');
const sha=b=>createHash('sha256').update(b).digest('hex'),wait=ms=>new Promise(r=>setTimeout(r,ms));let server,outsider,log='';
async function port(){const s=http.createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const n=s.address().port;await new Promise(r=>s.close(r));return n;}
const selectedPort=await port(),env={...process.env,PORT:String(selectedPort),BEN10_LOCAL_ROOT:local};
async function run(command,args,cwd){return new Promise((resolve,reject)=>{const p=spawn(command,args,{cwd,env,stdio:['ignore','pipe','pipe']});let out='';for(const s of [p.stdout,p.stderr])s.on('data',b=>out+=b);p.once('error',reject);p.once('exit',(code,signal)=>code===0?resolve(out):reject(Error(command+' failed '+code+'/'+signal+'\n'+out)));});}
async function ready(build){for(let i=0;i<120;i++){try{const h=await fetch('http://127.0.0.1:'+selectedPort+'/api/health').then(r=>r.json());if(h.build===build)return h;}catch{}await wait(100);}throw Error('Servidor não iniciou\n'+log);}
async function end(child){if(child?.exitCode===null&&child.signalCode===null){const done=once(child,'exit');child.kill('SIGTERM');await done;}}
function start(){const p=spawn(process.execPath,['--env-file=.env','scripts/local-ai/restart.js'],{cwd:game,env,stdio:['ignore','pipe','pipe']});for(const s of [p.stdout,p.stderr])s.on('data',b=>log+=b);return p;}
try{
 await cp(base,game,{recursive:true,filter:p=>!['node_modules','dist','data','.env','__pycache__','.git'].includes(path.basename(p))&&!p.endsWith('.log')});
 await symlink(base+'/node_modules',game+'/node_modules','dir');await mkdir(game+'/data/private',{recursive:true});await mkdir(local);
 const privateFiles={'.env':'PORT='+selectedPort+'\nBEN10_LOCAL_ROOT="'+local+'"\nFIXTURE_ONLY=unchanged\n','data/private/progress.json':'{"likes":12345}','data/config.json':JSON.stringify({hostSpeech:false,conversationProvider:'rules',voiceProvider:'none'})};
 for(const [name,body] of Object.entries(privateFiles))await writeFile(game+'/'+name,body);
 await writeFile(local+'/weights.fixture','unchanged-model-fixture');
 await mkdir(stage);execFileSync('python3',['-m','zipfile','-e',source+'/backups-installer-repair/BEN10_HEROIS_VILOES_V46-original.zip',stage]);
 execFileSync('python3',['-m','zipfile','-e',source+'/BEN10_REPARO_INSTALADOR_V46.zip',temp]);
 const payload=stage+'/BEN10_HEROIS_VILOES_V46/payload',expected=JSON.parse(await readFile(repair+'/patch/manifest.json'));
 const before=new Map();for(const f of expected.files){try{before.set(f.name,sha(await readFile(game+'/'+f.name)));}catch(e){if(e.code!=='ENOENT')throw e;before.set(f.name,null);}}
 await run('npm',['run','build'],game);await writeFile(game+'/unrelated.js','setInterval(()=>{},1000)');outsider=spawn(process.execPath,['unrelated.js'],{cwd:game,stdio:'ignore'});
 server=start();const originalHealth=await ready('45.0.0');
 const release=await readFile(payload+'/public/release.js');await writeFile(payload+'/public/release.js','tampered fixture');
 await assert.rejects(run('bash',[repair+'/REPARAR_E_ATUALIZAR_V46.sh',game,stage+'/BEN10_HEROIS_VILOES_V46'],game),/diferente do esperado/);
 assert.equal((await ready('45.0.0')).runtime.pid,originalHealth.runtime.pid);await writeFile(payload+'/public/release.js',release);
 const output=await run('bash',[repair+'/REPARAR_E_ATUALIZAR_V46.sh',game,stage+'/BEN10_HEROIS_VILOES_V46'],game);
 assert.match(output,/Encerrando inicializador confirmado/);assert.match(output,/Conferidos 47 arquivos/);
 for(const f of expected.files)assert.equal(sha(await readFile(game+'/'+f.name)),f.sha256,f.name);
 assert(server.exitCode!==null||server.signalCode!==null);process.kill(outsider.pid,0);
 const backups=(await readdir(game+'/data/backups')).filter(n=>n.startsWith('before-v46-'));assert.equal(backups.length,1);const backup=game+'/data/backups/'+backups[0];
 server=start();const updatedHealth=await ready('46.0.0');assert.notEqual(updatedHealth.runtime.pid,originalHealth.runtime.pid);
 const reverted=await rollbackCampaignUpdate(backup,game);assert.equal(reverted.version,'45.0.0');
 for(const [name,digest] of before){if(digest===null)await assert.rejects(readFile(game+'/'+name));else assert.equal(sha(await readFile(game+'/'+name)),digest,name);}
 for(const [name,body] of Object.entries(privateFiles))assert.equal(await readFile(game+'/'+name,'utf8'),body);
 assert.equal(await readFile(local+'/weights.fixture','utf8'),'unchanged-model-fixture');process.kill(outsider.pid,0);
 await run('npm',['run','build'],game);
 const result={ok:true,originalArchiveUsed:true,repairArchiveUsed:true,corruptedStagingRefusedWithoutStoppingGame:true,patchFiles:4,payloadFiles:expected.files.length,liveServerStopped:true,outerLauncherStopped:true,unrelatedProcessPreserved:true,updatedGameStarted:true,rollbackStoppedLiveServer:true,allHashesVerified:true,privateConfigurationAndModelFixturesPreserved:true,buildAfterApply:true,buildAfterRollback:true,scope:'Linux cloud; real V45 and V46 HTTP game servers plus their session launcher, original ZIP staging including spaces; no Android hardware or neural inference.'};
 await writeFile(source+'/reports/installer-repair/integration.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{await end(server);await end(outsider);await rm(temp,{recursive:true,force:true});}
