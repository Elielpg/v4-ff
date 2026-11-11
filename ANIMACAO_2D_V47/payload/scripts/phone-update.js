import {mkdtemp,readFile,writeFile,mkdir,readdir,lstat,realpath,copyFile,rm,stat} from 'node:fs/promises';
import {spawn,spawnSync} from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const DOWNLOAD_URL=process.env.BEN10_UPDATE_URL||'';
const APP_ID='LINEL_LIVE_CITY_V25';
const SCRIPT_ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function command(program,args,options={}){return new Promise((resolve,reject)=>{const child=spawn(program,args,{stdio:'inherit',...options});child.on('error',reject);child.on('exit',(code,signal)=>code===0?resolve():reject(Error(program+' terminou '+(signal||'com código '+code))));});}
function python(){for(const program of ['python3','python'])if(spawnSync(program,['--version'],{stdio:'ignore'}).status===0)return program;throw Error('Python não está instalado. Execute: pkg install python');}
const UNPACK=String.raw`
import sys,zipfile,pathlib,json,re,stat
archive,out=sys.argv[1:]
root=pathlib.Path(out)
with zipfile.ZipFile(archive) as z:
 infos=z.infolist()
 if len(infos)>5000:raise ValueError('Arquivos demais no ZIP')
 if sum(i.file_size for i in infos)>512*1024*1024:raise ValueError('ZIP grande demais')
 seen=set()
 for i in infos:
  name=i.filename
  p=pathlib.PurePosixPath(name)
  if chr(92) in name or name.startswith('/') or any(x in ('..','.','') for x in name.rstrip('/').split('/')) or not name.startswith('game/'):raise ValueError('Caminho inválido no ZIP: '+name)
  rel=p.parts[1:]
  if any(x in ('data','node_modules','.git','.agents','.codex') for x in rel):raise ValueError('ZIP inclui dados privados ou diretório reservado')
  if any(x.startswith('.env') and x!='.env.example' for x in rel):raise ValueError('ZIP inclui arquivo privado .env')
  if stat.S_ISLNK(i.external_attr>>16):raise ValueError('ZIP inclui link simbólico')
  if i.file_size>64*1024*1024:raise ValueError('Arquivo grande demais')
  if name in seen:raise ValueError('Caminho duplicado no ZIP')
  seen.add(name)
  if i.is_dir():continue
  dest=root.joinpath(*rel)
  dest.parent.mkdir(parents=True,exist_ok=True)
  with z.open(i) as source,dest.open('wb') as target:
   while True:
    block=source.read(1024*1024)
    if not block:break
    target.write(block)
 if z.testzip():raise ValueError('ZIP danificado')
package=json.loads((root/'package.json').read_text())
release=(root/'public/release.js').read_text()
match=re.search(r"BUILD_ID\s*=\s*['\"]([^'\"]+)",release)
if not match or match.group(1)!=package.get('version'):raise ValueError('Versões diferentes no pacote')
version=package['version']
if not re.fullmatch(r'[0-9]+\.[0-9]+\.[0-9]+',version) or int(version.split('.')[0])<27:raise ValueError('O ZIP não é a atualização27 ou posterior')
for item in ['server/index.js','start.sh','install.sh','public/app.js','scripts/phone-update.js']:
 if not (root/item).is_file():raise ValueError('Pacote incompleto: '+item)
print(json.dumps({'version':version,'files':[str(p.relative_to(root)) for p in root.rglob('*') if p.is_file()]}))
`;
export async function stageArchive(archive,destination){await mkdir(destination,{recursive:true});return new Promise((resolve,reject)=>{const child=spawn(python(),['-c',UNPACK,archive,destination],{stdio:['ignore','pipe','pipe']});let output='',errors='';child.stdout.on('data',b=>output+=b);child.stderr.on('data',b=>errors+=b);child.on('error',reject);child.on('exit',code=>{if(code!==0)return reject(Error('Pacote recusado: '+errors.trim().split('\n').at(-1)));try{resolve(JSON.parse(output));}catch{reject(Error('Não foi possível validar a versão do ZIP'));}});});}
export function nodeServerEntry(argv,cwd){
 if(!['node','nodejs'].includes(path.basename(argv[0]||'')))return null;
 let index=1;for(;index<argv.length&&argv[index].startsWith('-');index++){if(!/^(--env-file(?:-if-exists)?=.+|--enable-source-maps|--no-warnings|--trace-warnings)$/.test(argv[index]))return null;}
 return argv[index]?path.resolve(cwd,argv[index]):null;
}
export async function verifiedServer(pid,target,{procRoot='/proc',uid=process.getuid?.()}={}){
 if(!Number.isInteger(pid)||pid<2||pid===process.pid)return false;
 try{const proc=path.join(procRoot,String(pid)),owner=await stat(proc),cwd=await realpath(path.join(proc,'cwd')),expected=await realpath(target),argv=(await readFile(path.join(proc,'cmdline'))).toString().split('\0').filter(Boolean);if(uid!==undefined&&owner.uid!==uid)return false;return cwd===expected&&nodeServerEntry(argv,cwd)===path.join(expected,'server/index.js');}catch{return false;}
}
export async function ownServers(target){let names=[];try{names=await readdir('/proc');}catch{return [];}const matches=[];for(const name of names)if(/^\d+$/.test(name)){const pid=Number(name);if(await verifiedServer(pid,target))matches.push(pid);}return matches;}
export async function stopOwnServer(pid,target,{timeoutMs=20000}={}){
 if(!await verifiedServer(pid,target))throw Error('Não foi possível confirmar a pasta e o comando do processo. Nenhum processo foi encerrado.');
 process.kill(pid,'SIGTERM');const until=Date.now()+timeoutMs;
 while(Date.now()<until){if(!await verifiedServer(pid,target))return;await pause(100);}
 throw Error('O servidor não encerrou a tempo. Use Ctrl+C na sessão original e repita. Não foi usado encerramento forçado.');
}
async function safeDestination(target,relative){if(relative.split(path.sep).some(part=>['data','node_modules','.git','.agents','.codex'].includes(part)||(part.startsWith('.env')&&part!=='.env.example')))throw Error('Destino privado ou reservado');const resolved=path.resolve(target,relative);if(!resolved.startsWith(target+path.sep))throw Error('Destino fora da instalação');let current=target;for(const piece of relative.split(path.sep)){current=path.join(current,piece);try{if((await lstat(current)).isSymbolicLink())throw Error('Destino contém link simbólico: '+relative);}catch(error){if(error.code!=='ENOENT')throw error;}}return resolved;}
export async function installStaged(staged,target,metadata,backup){
 target=await realpath(target);const records=[];
 // Validate the whole write set before changing any installed file.
 for(const relative of metadata.files)await safeDestination(target,relative);
 await mkdir(backup,{recursive:true});
 try{for(const relative of metadata.files){const destination=await safeDestination(target,relative),source=path.join(staged,relative);let exists=false;try{const info=await lstat(destination);if(!info.isFile())throw Error('O destino não é arquivo: '+relative);exists=true;}catch(error){if(error.code!=='ENOENT')throw error;}if(exists){const saved=path.join(backup,relative);await mkdir(path.dirname(saved),{recursive:true});await copyFile(destination,saved);}records.push({relative,exists});await mkdir(path.dirname(destination),{recursive:true});await copyFile(source,destination);}}
 catch(error){for(const {relative,exists} of records.reverse()){const destination=path.join(target,relative);if(exists)await copyFile(path.join(backup,relative),destination);else await rm(destination,{force:true});}throw error;}
 return {version:metadata.version,files:records.length};
}
async function health(port){try{const response=await fetch('http://127.0.0.1:'+port+'/api/health',{signal:AbortSignal.timeout(1500)});return response.ok?await response.json():null;}catch{return null;}}
function portNumber(){const value=Number(process.env.PORT||3000);if(!Number.isInteger(value)||value<1||value>65535)throw Error('PORT inválida');return value;}
export async function main(args=process.argv.slice(2)){
 let archive=null,start=false;for(let i=0;i<args.length;i++){if(args[i]==='--archive'&&args[i+1])archive=path.resolve(args[++i]);else if(args[i]==='--start')start=true;else if(args[i]==='--help'){console.log('bash update.sh [--archive caminho.zip] [--start]\nPasse o ZIP baixado com --archive. --start inicia o jogo após instalar.');return;}else throw Error('Argumento desconhecido: '+args[i]);}
  const target=await realpath(SCRIPT_ROOT),port=portNumber(),temporary=await mkdtemp(path.join(os.tmpdir(),'ben32-update-'));
 try{
  if(!archive){if(!DOWNLOAD_URL)throw Error('Esta versão não tem download remoto publicado. Baixe o ZIP BEN10_LIVE_V44_TERMUX.zip e use: bash update.sh --archive caminho/para/BEN10_LIVE_V44_TERMUX.zip --start');if(spawnSync('curl',['--version'],{stdio:'ignore'}).status!==0)throw Error('Instale curl: pkg install curl');archive=path.join(temporary,'update.zip');console.log('Baixando Ben 10 pela fonte configurada…');await command('curl',['--fail','--location','--retry','2',DOWNLOAD_URL,'-o',archive]);}
  const stage=path.join(temporary,'stage'),metadata=await stageArchive(archive,stage);console.log('Pacote verificado: v'+metadata.version+'. Pasta: '+target);
  const active=await health(port),pids=await ownServers(target);
  if(active?.application===APP_ID&&active.runtime?.pid&&!pids.includes(active.runtime.pid)&&await verifiedServer(active.runtime.pid,target))pids.push(active.runtime.pid);
  if(active?.application===APP_ID&&!pids.length)throw Error('Há um jogo rodando na porta '+port+', mas sua pasta/processo não pôde ser confirmado. Pare-o com Ctrl+C na sessão original e repita bash update.sh --start.');
  for(const pid of pids){console.log('Encerrando apenas o servidor desta instalação…');await stopOwnServer(pid,target);}
  const installed=await installStaged(stage,target,metadata,path.join(temporary,'backup'));console.log('Arquivos atualizados para v'+installed.version+'. data/ e .env foram preservados. Preparando dependências…');
  await command('bash',['install.sh'],{cwd:target});
  console.log('Atualização pronta. Abra http://127.0.0.1:'+port+'/?v='+encodeURIComponent(installed.version)+' e confira v'+installed.version+' no topo.');
  await rm(temporary,{recursive:true,force:true});
  if(start)await command('bash',['start.sh'],{cwd:target});else console.log('Para executar agora: bash start.sh');
 }finally{await rm(temporary,{recursive:true,force:true});}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main().catch(error=>{console.error('Atualização interrompida: '+error.message);process.exitCode=1;});
