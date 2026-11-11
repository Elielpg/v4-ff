// Stop only independently verified processes of the installation being updated.
import {readFile,realpath} from 'node:fs/promises';
import {parseEnv} from 'node:util';import path from 'node:path';import os from 'node:os';
import http from 'node:http';import {createConnection} from 'node:net';
import {projectProcesses,stopProject} from './local-ai/project-processes.js';
const APP_ID='LINEL_LIVE_CITY_V25',pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export function updateHealth(port){return new Promise(resolve=>{
 let finished=false,timer;const done=value=>{if(finished)return;finished=true;clearTimeout(timer);resolve(value);};
 const request=http.get({hostname:'127.0.0.1',port,path:'/api/health',agent:false},response=>{let body='';response.on('data',chunk=>{body+=chunk;if(body.length>1024*1024){done(null);request.destroy();}});response.on('end',()=>{try{done(response.statusCode===200?JSON.parse(body):null);}catch{done(null);}});response.on('error',()=>done(null));response.on('aborted',()=>done(null));});
 timer=setTimeout(()=>{done(null);request.destroy();},1000);request.on('error',()=>done(null));
 });}
export function updatePortOpen(port){return new Promise(resolve=>{const socket=createConnection({host:'127.0.0.1',port});let done=false;const finish=value=>{if(done)return;done=true;socket.destroy();resolve(value);};socket.setTimeout(600,()=>finish(false));socket.once('connect',()=>finish(true));socket.once('error',()=>finish(false));});}
export async function stopInstalledGame(root,{port,localRoot,timeoutMs=30000,quietMs=1200,onStop=()=>{},listPids,getHealth=updateHealth,portOpen=updatePortOpen}={}){
 root=await realpath(root);let env={},config={};try{env=parseEnv(await readFile(path.join(root,'.env'),'utf8'));}catch{}try{config=JSON.parse(await readFile(path.join(root,'data/config.json'),'utf8'));}catch{}
 port=Number(port??process.env.PORT??env.PORT??3000);if(!Number.isInteger(port)||port<1024||port>65535)throw Error('PORT inválida para atualizar.');
 localRoot=path.resolve(root,localRoot||process.env.BEN10_LOCAL_ROOT||env.BEN10_LOCAL_ROOT||path.join(os.homedir(),'.local/share/ben10-local-ai'));
 const textPort=Number(config.localAi?.textPort||8081),deadline=Date.now()+timeoutMs,seeds=new Set();
 const confirmedHealth=async()=>{const h=await getHealth(port);if(!h)return null;const reported=typeof h.runtime?.root==='string'?await realpath(h.runtime.root).catch(()=>null):null;if(h.application!==APP_ID||reported!==root)throw Error('A porta '+port+' responde por outro programa ou instalação. Nenhum processo externo foi encerrado.');if(Number.isInteger(h.runtime?.pid)&&h.runtime.pid>1)seeds.add(h.runtime.pid);return h;};
 await confirmedHealth();
 const stopped=await stopProject(root,localRoot,{textPort,timeoutMs:Math.max(1,deadline-Date.now()),knownPids:[...seeds],getKnownPids:async()=>{await confirmedHealth();return [...seeds];},onStop,...(listPids?{listPids}:{})});
 // A disappearing PID or one failed HTTP request is not sufficient. Confirm
 // that the listener stays closed, and that a supervisor has not reopened it.
 while(Date.now()<deadline){
  if(!await portOpen(port)){
   await pause(quietMs);
   if(!await portOpen(port))return {stopped,port};
   const h=await confirmedHealth();
   throw Error(h?'O inicializador reabriu o jogo. Na aba original do Termux, pressione Ctrl+C e repita. Nenhum arquivo foi atualizado.':'A porta foi reaberta por um serviço não confirmado. Nenhum arquivo foi atualizado.');
  }
  const active=await confirmedHealth(),matches=await projectProcesses(root,localRoot,{knownPids:[...seeds],textPort,...(listPids?{listPids}:{})});
  if(!matches.length)throw Error('O jogo ainda responde'+(active?.runtime?.pid?' no PID '+active.runtime.pid:'')+', mas o Android não permitiu confirmar seu processo. Na aba original, pressione Ctrl+C até aparecer o prompt e repita. Nenhum arquivo foi atualizado.');
  await pause(150);
 }
 throw Error('O servidor não encerrou em '+Math.round(timeoutMs/1000)+' segundos. Pare a aba original com Ctrl+C e repita; nenhum arquivo foi atualizado.');
}
