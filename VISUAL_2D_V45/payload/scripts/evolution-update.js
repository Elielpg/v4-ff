// This installer remains the historical V44.2 migration contract.
const BUILD_ID='44.2.0';
import {readFile,writeFile,mkdir,lstat,realpath,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import path from 'node:path';
import http from 'node:http';
import {installStaged} from './phone-update.js';
const shellQuote=value=>"'"+String(value).replace(/'/g,"'\\''")+"'";
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
function relative(name){if(typeof name!=='string'||name.startsWith('/')||name.includes('\\')||name.split('/').some(p=>!p||p==='.'||p==='..'||['data','node_modules','.git','.agents','.codex'].includes(p)||p.startsWith('.env')&&p!=='.env.example'))throw Error('Caminho privado ou inválido no pacote');return name;}
async function noSymlink(root,name){let current=root;for(const part of relative(name).split('/')){current=path.join(current,part);try{if((await lstat(current)).isSymbolicLink())throw Error('Link simbólico no destino: '+name);}catch(error){if(error.code!=='ENOENT')throw error;}}return current;}
function health(port){return new Promise(resolve=>{const request=http.get({hostname:'127.0.0.1',port,path:'/api/health',timeout:1000},response=>{let raw='';response.on('data',part=>{raw+=part;if(raw.length>1024*1024)request.destroy();});response.on('end',()=>{try{resolve(JSON.parse(raw));}catch{resolve(null);}});});request.on('timeout',()=>request.destroy());request.on('error',()=>resolve(null));});}
async function stopInstalled(root){const script=path.join(root,'scripts/local-ai/restart.js');try{await lstat(script);}catch{return;}execFileSync(process.execPath,[script,'--stop'],{cwd:root,stdio:'inherit'});const port=Number(process.env.PORT||3000);for(let i=0;i<10;i++){const active=await health(port);if(!active||active.runtime?.root!==root)return;await new Promise(r=>setTimeout(r,200));}throw Error('O servidor ainda responde. Pare a sessão original antes de atualizar.');}
export async function applyEvolutionUpdate(payload,root,{stop=true}={}){
 root=await realpath(root);payload=await realpath(payload);const manifest=JSON.parse(await readFile(path.join(payload,'manifest.json'),'utf8')),pkg=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
 if(pkg.name!=='linel-live-city'||!/^43\.[78]\.\d+$|^44\.[012]\.0$/.test(pkg.version)||manifest.version!==BUILD_ID||manifest.kind!=='code-update')throw Error('Atualização V44.2 requer o Ben V43.7/V43.8 ou V44 já instalado.');
 if(!Array.isArray(manifest.files)||manifest.files.length>1000)throw Error('Manifesto inválido');const names=new Set(),before=[];
 for(const entry of manifest.files){relative(entry.name);if(names.has(entry.name))throw Error('Arquivo duplicado');names.add(entry.name);await noSymlink(root,entry.name);const file=await realpath(path.join(payload,entry.name));if(!file.startsWith(payload+path.sep))throw Error('Arquivo fora do pacote');const bytes=await readFile(file);if(digest(bytes)!==entry.sha256)throw Error('SHA-256 incorreto: '+entry.name);if(entry.name.endsWith('.js'))execFileSync(process.execPath,['--check',file],{stdio:'inherit'});else if(entry.name.endsWith('.json'))JSON.parse(bytes);else if(entry.name.endsWith('.sh'))execFileSync('bash',['-n',file],{stdio:'inherit'});let old=null;try{old=await readFile(path.join(root,entry.name));}catch(error){if(error.code!=='ENOENT')throw error;}before.push({name:entry.name,existed:old!==null,sha256:old===null?null:digest(old)});}
 for(const dir of ['data','data/backups']){try{if((await lstat(path.join(root,dir))).isSymbolicLink())throw Error('O backup precisa ficar no armazenamento privado da instalação.');}catch(error){if(error.code!=='ENOENT')throw error;}}
 const backup=path.join(root,'data/backups','before-v44-2-'+Date.now()+'-'+process.pid);await mkdir(backup,{recursive:true,mode:0o700});
 // Import only the public ranking snapshot from a verified instance; no keys/config.
 if(stop){const h=await health(Number(process.env.PORT||3000));if(h?.runtime?.root===root){try{await lstat(path.join(root,'data/private/engagement-state.json'));}catch(error){if(error.code==='ENOENT'&&Array.isArray(h.ranking)){await mkdir(path.join(root,'data/private'),{recursive:true,mode:0o700});await writeFile(path.join(root,'data/private/engagement-state.json'),JSON.stringify({version:1,totalEnergy:h.energy||0,ranking:h.ranking,seen:[],migration:'visible-top-20'}),{mode:0o600});}}}await stopInstalled(root);}
 await writeFile(path.join(backup,'rollback.json'),JSON.stringify({kind:'ben44-code-backup',root,from:pkg.version,to:manifest.version,files:before},null,2),{mode:0o600});
 await installStaged(payload,root,{version:manifest.version,files:manifest.files.map(f=>f.name)},path.join(backup,'code'));
 const guide='cd '+shellQuote(root)+'\nnode scripts/evolution-update.js --rollback '+shellQuote(backup)+'\n';await writeFile(path.join(backup,'COMO_REVERTER.txt'),guide);
 return {version:manifest.version,files:manifest.files.length,backup,preserved:['data/','.env','modelos locais','voz selecionada','referência local']};
}
export async function rollbackEvolution(backup,root,{stop=true}={}){
 root=await realpath(root);backup=await realpath(backup);if(!backup.startsWith(path.join(root,'data/backups')+path.sep))throw Error('Backup fora da instalação');const metadata=JSON.parse(await readFile(path.join(backup,'rollback.json'),'utf8'));if(metadata.kind!=='ben44-code-backup'||metadata.root!==root)throw Error('Backup de outra instalação');
 for(const entry of metadata.files){await noSymlink(root,entry.name);if(entry.existed){const file=await realpath(path.join(backup,'code',relative(entry.name)));if(!file.startsWith(backup+path.sep)||digest(await readFile(file))!==entry.sha256)throw Error('Backup corrompido: '+entry.name);}}
 if(stop)await stopInstalled(root);
 for(const entry of [...metadata.files].reverse()){const destination=path.join(root,entry.name);if(entry.existed){await mkdir(path.dirname(destination),{recursive:true});await writeFile(destination,await readFile(path.join(backup,'code',entry.name)));}else await rm(destination,{force:true});}
 return {version:metadata.from,restoredFiles:metadata.files.length,preserved:'Dados, modelos e chaves atuais mantidos.'};
}
if(process.argv[2]==='--rollback'){const result=await rollbackEvolution(path.resolve(process.argv[3]),process.cwd());console.log(JSON.stringify(result,null,2));console.log('Reversão do código concluída. Execute bash local-ai.sh start.');}
