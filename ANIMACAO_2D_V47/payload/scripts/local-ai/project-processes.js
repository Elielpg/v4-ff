import {readFile,readdir,realpath,stat} from 'node:fs/promises';
import path from 'node:path';
import {nodeServerEntry} from '../phone-update.js';
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const canonical=async value=>realpath(value).catch(()=>path.resolve(value));

export async function processInfo(pid,{procRoot='/proc'}={}){
 if(!Number.isInteger(pid)||pid<2)return null;
 try{
  const root=path.join(procRoot,String(pid)),owner=await stat(root);
  if(process.getuid&&owner.uid!==process.getuid())return null;
  const raw=await readFile(root+'/stat','utf8'),fields=raw.slice(raw.lastIndexOf(')')+2).trim().split(/\s+/);
  // Android may allow cwd/cmdline/stat for our UID while denying exe.
  // Ownership and the exact command still have to match before any signal.
  const exe=await realpath(root+'/exe').catch(()=>null);
  return {pid,parent:Number(fields[1]),group:Number(fields[2]),start:fields[19],cwd:await realpath(root+'/cwd'),exe,argv:(await readFile(root+'/cmdline')).toString().split('\0').filter(Boolean)};
 }catch{return null;}
}
export async function protectedPids(){
 const protectedSet=new Set();let pid=process.pid;
 for(let i=0;i<80&&pid>1&&!protectedSet.has(pid);i++){protectedSet.add(pid);const info=await processInfo(pid);if(!info)break;pid=info.parent;}
 return protectedSet;
}
export async function projectProcesses(gameRoot,localRoot,{exclude=new Set([process.pid]),textPort=8081,knownPids=[],procRoot='/proc',listPids=()=>readdir(procRoot)}={}){
 gameRoot=await canonical(gameRoot);localRoot=await canonical(localRoot);
 const result=[],names=await listPids().catch(()=>[]),seeds=new Set(knownPids.filter(pid=>Number.isInteger(pid)&&pid>1));
 // Status is a discovery hint, never permission to terminate a PID. Each PID
 // below must independently pass UID, cwd and exact command verification.
 try{const state=JSON.parse(await readFile(path.join(localRoot,'runtime-status.json'),'utf8'));if(typeof state.gameRoot==='string'&&await canonical(state.gameRoot)===gameRoot){for(const pid of [state.pid,...Object.values(state.services||{}).map(s=>s?.pid)])if(Number.isInteger(pid)&&pid>1)seeds.add(pid);}}catch{}
 const pending=[...seeds,...names],visited=new Set(),ancestors=new Map([...seeds].map(pid=>[pid,0]));
 for(let index=0;index<pending.length;index++){const name=String(pending[index]);
  if(!/^\d+$/.test(name)||exclude.has(Number(name)))continue;
  const pid=Number(name);if(visited.has(pid))continue;visited.add(pid);const info=await processInfo(pid,{procRoot});if(!info)continue;
  const hasBind=value=>info.argv.some(arg=>arg===value||arg==='--bind='+value||arg==='-b'+value);
  const boundVoice=hasBind(gameRoot+'/scripts/local-ai:/opt/ben10-worker')&&hasBind(localRoot+':/ben10-data')&&info.argv.some(arg=>['/opt/ben10-worker/plain_voice.py','/opt/ben10-worker/tts_server.py'].includes(arg));
  if(info.cwd!==gameRoot&&!boundVoice)continue;
  let kind=null;
  const entry=nodeServerEntry(info.argv,info.cwd),resolved=entry?await canonical(entry):null;
  if(boundVoice)kind='voz';
  else if(resolved===path.join(gameRoot,'server/index.js'))kind='jogo';
  else if(['scripts/local-ai/run.js','scripts/local-ai/restart.js','scripts/start-game.js'].some(file=>resolved===path.join(gameRoot,file)))kind='inicializador';
  else if(/^python(?:\d+(?:\.\d+)?)?$/.test(path.basename(info.argv[0]||''))&&info.argv[1]&&!info.argv.includes('--preview')){
   const rootIndex=info.argv.indexOf('--root');
   if(['clone_voice.py','openvoice_voice.py'].some(file=>path.resolve(info.cwd,info.argv[1])===path.join(gameRoot,'scripts/local-ai',file))&&rootIndex>=0&&info.argv[rootIndex+1]&&await canonical(info.argv[rootIndex+1])===localRoot)kind='voz';
  }else if(info.exe===await canonical(path.join(localRoot,'llama.cpp/build/bin/llama-server'))||resolved===await canonical(path.join(localRoot,'llama.cpp/build/bin/llama-server'))||await canonical(path.resolve(info.cwd,info.argv[0]||''))===await canonical(path.join(localRoot,'llama.cpp/build/bin/llama-server'))){
   const portIndex=info.argv.indexOf('--port'),hostIndex=info.argv.indexOf('--host');
   if(info.argv[portIndex+1]===String(textPort)&&info.argv[hostIndex+1]==='127.0.0.1')kind='conversa';
  }
  if(kind){result.push({...info,kind,boundVoice});const depth=ancestors.get(pid);if(depth!==undefined&&depth<32&&info.parent>1){ancestors.set(info.parent,depth+1);pending.push(info.parent);}}
 }
 return result;
}
export async function stopProject(gameRoot,localRoot,{textPort=8081,timeoutMs=20000,onStop=()=>{},knownPids=[],getKnownPids=async()=>[],procRoot='/proc',listPids=()=>readdir(procRoot)}={}){
 const exclude=await protectedPids(),stopped=new Set(),until=Date.now()+timeoutMs;
 while(Date.now()<until){
  const discovered=await getKnownPids();const matches=await projectProcesses(gameRoot,localRoot,{exclude,textPort,knownPids:[...knownPids,...discovered],procRoot,listPids});
  if(!matches.length)return [...stopped];
  // Signal the outer launcher once. Signalling it AND its child in one pass
  // delivers SIGTERM twice and can kill Node before detached children are cleaned.
  const initializers=matches.filter(item=>item.kind==='inicializador'),parents=new Set(initializers.map(item=>item.pid));
  const candidates=initializers.length?initializers.filter(item=>!parents.has(item.parent)):matches;
  for(const item of candidates){
   const key=item.pid+':'+item.start;if(stopped.has(key))continue;
   const fresh=await processInfo(item.pid,{procRoot});
   if(!fresh||fresh.start!==item.start||fresh.cwd!==item.cwd||JSON.stringify(fresh.argv)!==JSON.stringify(item.argv))continue;
   try{process.kill(item.boundVoice&&item.group===item.pid?-item.pid:item.pid,'SIGTERM');stopped.add(key);onStop(item.kind,item.pid);}catch(error){if(error.code!=='ESRCH')throw error;}
  }
  await pause(150);
 }
 throw Error('Um processo desta instalação não encerrou. Pare a sessão original com Ctrl+C. Nenhum processo externo foi encerrado.');
}
