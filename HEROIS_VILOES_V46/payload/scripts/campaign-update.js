// V46 campaign installer. Models, voice engines and private data are never copied.
const BUILD_ID='46.0.0';
import {readFile,writeFile,mkdir,lstat,realpath,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {stopInstalledGame} from './update-stop.js';
import {pathToFileURL} from 'node:url';
const ALLOWED=new Set(["package-lock.json", "package.json", "public/arena-app.js", "public/atlas-sprite.js", "public/audience-drawing-catalog.js", "public/audience-drawing.js", "public/battle-hud.js", "public/battle-rules.js", "public/battle-view.js", "public/battle.css", "public/ben-behavior.js", "public/character-2d-plan.js", "public/character-2d.js", "public/cinematic-audio.js", "public/comic-assets/aliens-a.png", "public/comic-assets/aliens-b.png", "public/comic-assets/audience.png", "public/comic-assets/camp.png", "public/comic-assets/manifest.json", "public/comic-assets/villains.png", "public/comic-stage.js", "public/dance-clock.js", "public/extra-drawing-catalog.js", "public/index.html", "public/live-audience-view.js", "public/live-engagement.js", "public/live-media.js", "public/release.js", "public/world.js", "scripts/campaign-update.js", "scripts/phone-update.js", "scripts/update-stop.js", "scripts/local-ai/project-processes.js", "tests/update-stop.test.js", "server/ai-session.js", "server/battle-dialogue.js", "server/classic.js", "server/index.js", "server/live-audience.js", "server/live-battle.js", "server/live-host.js", "tests/battle-dialogue.test.js", "tests/battle-presentation.test.js", "tests/campaign-update.test.js", "tests/comic-assets.test.js", "tests/dance-clock.test.js", "tests/live-battle.test.js"]);
import {installStaged} from './phone-update.js';
const shellQuote=value=>"'"+String(value).replace(/'/g,"'\\''")+"'";
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
function relative(name){if(typeof name!=='string'||name.startsWith('/')||name.includes('\\')||name.split('/').some(p=>!p||p==='.'||p==='..'||['data','node_modules','.git','.agents','.codex'].includes(p)||p.startsWith('.env')&&p!=='.env.example'))throw Error('Caminho privado ou inválido no pacote');return name;}
async function noSymlink(root,name){let current=root;for(const part of relative(name).split('/')){current=path.join(current,part);try{if((await lstat(current)).isSymbolicLink())throw Error('Link simbólico no destino: '+name);}catch(error){if(error.code!=='ENOENT')throw error;}}return current;}
async function stopInstalled(root){await stopInstalledGame(root,{onStop:(kind,pid)=>console.log('Encerrando '+kind+' confirmado desta instalação (PID '+pid+')…')});}
export async function applyCampaignUpdate(payload,root,{stop=true}={}){
 root=await realpath(root);payload=await realpath(payload);const manifest=JSON.parse(await readFile(path.join(payload,'manifest.json'),'utf8')),pkg=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
 if(pkg.name!=='linel-live-city'||!['45.0.0','46.0.0'].includes(pkg.version)||manifest.version!==BUILD_ID||manifest.kind!=='campaign-update')throw Error('Esta atualização visual requer o Ben V45 ou V46 já instalado.');
 if(!Array.isArray(manifest.files)||manifest.files.length<1||manifest.files.length>ALLOWED.size)throw Error('Manifesto inválido');const names=new Set(),before=[];
 for(const entry of manifest.files){relative(entry.name);if(!ALLOWED.has(entry.name))throw Error('Arquivo fora da atualização visual: '+entry.name);await noSymlink(payload,entry.name);if(names.has(entry.name))throw Error('Arquivo duplicado');names.add(entry.name);await noSymlink(root,entry.name);const file=await realpath(path.join(payload,entry.name));if(!file.startsWith(payload+path.sep))throw Error('Arquivo fora do pacote');const bytes=await readFile(file);if(digest(bytes)!==entry.sha256)throw Error('SHA-256 incorreto: '+entry.name);if(entry.name.endsWith('.js'))execFileSync(process.execPath,['--check',file],{stdio:'inherit'});else if(entry.name.endsWith('.json'))JSON.parse(bytes);else if(entry.name.endsWith('.sh'))execFileSync('bash',['-n',file],{stdio:'inherit'});let old=null;try{old=await readFile(path.join(root,entry.name));}catch(error){if(error.code!=='ENOENT')throw error;}before.push({name:entry.name,existed:old!==null,sha256:old===null?null:digest(old)});}
 if(!names.has('package.json')||!names.has('public/release.js'))throw Error('Pacote visual incompleto: identificação da versão ausente');
 const nextPackage=JSON.parse(await readFile(path.join(payload,'package.json'),'utf8')),nextRelease=await readFile(path.join(payload,'public/release.js'),'utf8');
 if(nextPackage.name!=='linel-live-city'||nextPackage.version!==BUILD_ID||!new RegExp("BUILD_ID\\s*=\\s*['\"]"+BUILD_ID.replaceAll('.','\\.')+"['\"]").test(nextRelease))throw Error('Versões diferentes no pacote visual');
 for(const dir of ['data','data/backups']){try{if((await lstat(path.join(root,dir))).isSymbolicLink())throw Error('O backup precisa ficar no armazenamento privado da instalação.');}catch(error){if(error.code!=='ENOENT')throw error;}}
 const backup=path.join(root,'data/backups','before-v46-'+Date.now()+'-'+process.pid);await mkdir(backup,{recursive:true,mode:0o700});
 if(stop)await stopInstalled(root);
 await writeFile(path.join(backup,'rollback.json'),JSON.stringify({kind:'ben46-campaign-backup',root,from:pkg.version,to:manifest.version,files:before},null,2),{mode:0o600});
 await installStaged(payload,root,{version:manifest.version,files:manifest.files.map(f=>f.name)},path.join(backup,'code'));
 const guide='cd '+shellQuote(root)+'\nnode scripts/campaign-update.js --rollback '+shellQuote(backup)+'\n';await writeFile(path.join(backup,'COMO_REVERTER.txt'),guide);
 return {version:manifest.version,files:manifest.files.length,backup,preserved:['data/','.env','modelos locais','voz selecionada','referência local']};
}
export async function rollbackCampaignUpdate(backup,root,{stop=true}={}){
 root=await realpath(root);backup=await realpath(backup);if(!backup.startsWith(path.join(root,'data/backups')+path.sep))throw Error('Backup fora da instalação');const metadata=JSON.parse(await readFile(path.join(backup,'rollback.json'),'utf8'));if(metadata.kind!=='ben46-campaign-backup'||metadata.root!==root)throw Error('Backup de outra instalação');
 if(!Array.isArray(metadata.files)||metadata.files.length>ALLOWED.size)throw Error('Metadados do backup inválidos');const names=new Set();
 for(const entry of metadata.files){if(!ALLOWED.has(entry.name)||names.has(entry.name))throw Error('Arquivo inválido no backup');names.add(entry.name);await noSymlink(root,entry.name);if(entry.existed){const file=await realpath(path.join(backup,'code',relative(entry.name)));if(!file.startsWith(backup+path.sep)||digest(await readFile(file))!==entry.sha256)throw Error('Backup corrompido: '+entry.name);}}
 if(stop)await stopInstalled(root);
 for(const entry of [...metadata.files].reverse()){const destination=path.join(root,entry.name);if(entry.existed){await mkdir(path.dirname(destination),{recursive:true});await writeFile(destination,await readFile(path.join(backup,'code',entry.name)));}else await rm(destination,{force:true});}
 return {version:metadata.from,restoredFiles:metadata.files.length,preserved:'Dados, modelos e chaves atuais mantidos.'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 try{const [action,source,target]=process.argv.slice(2);let result;if(action==='--apply'&&source&&target)result=await applyCampaignUpdate(path.resolve(source),path.resolve(target));else if(action==='--rollback'&&source)result=await rollbackCampaignUpdate(path.resolve(source),process.cwd());else throw Error('Use --apply PASTA_PACOTE PASTA_JOGO ou --rollback PASTA_BACKUP');console.log(JSON.stringify(result,null,2));}
 catch(error){console.error('Atualização visual interrompida: '+error.message);process.exitCode=1;}
}
