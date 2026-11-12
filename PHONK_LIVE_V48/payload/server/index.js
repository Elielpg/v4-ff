import {PartyDirector,migratePartyConfig} from './party-director.js';
import {partySettings,isRoseGift} from '../public/party-settings.js';
import {applyPartySpeech,partySpeechWanted} from './party-speech.js';
import {RhythmBridge} from './rhythm-bridge.js';
import {LiveBattle} from './live-battle.js';
import {renderDiagnostic,RenderLog} from './client-diagnostics.js';
import {GiftCatalog} from './gift-catalog.js';
import {EngagementState} from './engagement-state.js';
import {LiveActionRouter,normalizeLiveRules} from './live-action-router.js';
import {ABILITY_CATALOG,normalizeAbilitySettings} from '../public/ability-catalog.js';
import {AudienceMemory} from './audience-memory.js';
import os from 'node:os';
import {SpeechState} from './speech-state.js';
import {MusicQueue} from './music.js';
import {musicCommand} from '../public/music-catalog.js';
import {LocalVoice,localSettings,localHealth} from './local-ai.js';
import {AIVoice} from './ai-voice.js';
import {LiveAudience} from './live-audience.js';
import {LiveHost} from './live-host.js';
import {AvatarProxy} from './avatar-proxy.js';
import {WorldClock,worldClockSettings} from './world-clock.js';
import {AlienUnlocks} from './alien-unlocks.js';
import {normalizeUnlockSettings} from '../public/alien-unlock-catalog.js';
import {AISession} from './ai-session.js';
import {ChatGoals} from './chat-goals.js';
import {normalizeGoalSettings} from '../public/chat-goal-catalog.js';
import {BUILD_ID,BUILD_LABEL} from '../public/release.js';

import {SPEAKERS,speakerId} from '../public/characters.js';
import {elevenlabs,elevenVoices} from './voice.js';
import {ArenaSession} from './arena-session.js';
import {GiftActionQueue} from './gift-actions.js';
import {normalizeGiftRules,normalizeCommandRules,mergeGiftSuggestions} from '../public/audience.js';
import http from 'node:http';
import {readFile,mkdir,writeFile,readdir,rename} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {EventHub,SpeechQueue,gemini,localReply,FORMS,DISTRICTS} from './core.js';
import {KeyStore} from './keys.js';
import {LiveAdapter} from './live.js';
const bundledModels=JSON.parse(await readFile(new URL('../public/bundled-models/manifest.json',import.meta.url),'utf8'));
const root=fileURLToPath(new URL('../',import.meta.url));const hub=new EventHub();const clients=new Set();
function broadcast(type,data){const payload=`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;for(const c of clients){if(c.destroyed){clients.delete(c);continue;}if(c.writableLength>262144){clients.delete(c);c.destroy();continue;}c.write(payload);}}
const engagementState=await new EngagementState(path.join(root,'data/private/engagement-state.json'),{onError:()=>broadcast('gameNotice',{text:'Ranking não pôde ser salvo; confira o armazenamento.'})}).load(hub);
const giftCatalog=await new GiftCatalog(path.join(root,'data/private/gift-catalog.json'),{onChange:s=>broadcast('giftCatalog',s)}).load();
const music=new MusicQueue({onChange:s=>broadcast('music',s)});
const clientLog=new RenderLog(path.join(root,'data/diagnostics'));let lastClientReport=0;
let speechPreparation=null;
let chatGoals=null,goalLane='demo',aiSession=null,alienUnlocks=null,audience=null,host=null,worldClock=null,battle=null;
const speechState=new SpeechState(path.join(root,'data/private/speech-state.json'),{onError:()=>broadcast('gameNotice',{text:'Não foi possível salvar a fila. Confira o armazenamento.'})});let queue;queue=new SpeechQueue({timeout:120000,durable:true,onChange:s=>{void speechState.save(queue);broadcast('queue',s);}});queue.restore(await speechState.load());const live=new LiveAdapter((e,s)=>{if(e.type==='gift')giftCatalog.add(e);return hub.ingest(e,s);},s=>{const previous=goalLane;if(['websocket confirmado','recebendo eventos'].includes(s.status))goalLane='tiktok';else if(s.status==='desconectado')goalLane='demo';broadcast('live',s);if(chatGoals&&previous!==goalLane){music.selectSource(goalLane);if(battle)broadcast('battle',battle.snapshot(goalLane));broadcast('chatGoals',chatGoals.snapshot(goalLane));if(alienUnlocks){broadcast('alienUnlocks',alienUnlocks.snapshot(goalLane));adventure.reconcileAccess(Date.now());}if(audience){audience.cancel();broadcast('audience',audience.snapshot(goalLane));}queue.switchSource(goalLane);}});
let config={localVoiceMode:'plain',plainVoiceStyle:'clear',hostAmbientEnabled:true,hostAmbientSeconds:18,alienUnlocks:normalizeUnlockSettings(),chatGoals:normalizeGoalSettings(),hostSpeech:true,conversationProvider:'gemini',localAi:localSettings(),worldClock:worldClockSettings(),voiceProvider:'gemini',geminiTtsModel:process.env.GEMINI_TTS_MODEL||'auto',geminiVoice:'Puck',benPitch:1.08,benRate:1.08,conversationModel:process.env.GEMINI_MODEL||'auto',elevenVoiceId:'',speakerVoices:{},music:.15,voice:1,sfx:.3,quality:'balanced',giftRules:hub.giftRules,commandRules:hub.commandRules,giftCatalogVersion:0};
try{const saved=JSON.parse(await readFile(path.join(root,'data/config.json'),'utf8'));config={...config,...saved};}catch{}
try{config.localAi=localSettings(config.localAi||{});}catch{config.localAi=localSettings();}
if(config.voiceProvider==='browser')config.voiceProvider='gemini';try{config.worldClock=worldClockSettings(config.worldClock);}catch{config.worldClock=worldClockSettings();}
try{config.alienUnlocks=normalizeUnlockSettings(config.alienUnlocks);}catch{config.alienUnlocks=normalizeUnlockSettings();}
try{config.chatGoals=normalizeGoalSettings(config.chatGoals);}catch{config.chatGoals=normalizeGoalSettings();}
try{config.liveRules=normalizeLiveRules(config.liveRules||{});}catch{config.liveRules=normalizeLiveRules();}
try{config.abilitySettings=normalizeAbilitySettings(config.abilitySettings||{});}catch{config.abilitySettings={};}
try{config.giftRules=normalizeGiftRules(config.giftRules,{upgradeLegacy:config.rulesVersion!==28});}catch{config.giftRules=hub.giftRules;}
if((Number(config.giftCatalogVersion)||0)<4)config.giftRules=mergeGiftSuggestions(config.giftRules);
try{config.commandRules=normalizeCommandRules(config.commandRules);}catch{config.commandRules=hub.commandRules;}
config.giftRules=config.giftRules.map(({mission,missionKind,...rule})=>({...rule,power:rule.power||!!(mission||missionKind)}));config.commandRules=config.commandRules.filter(r=>!r.mission&&!r.missionKind);config.rulesVersion=36;config.giftCatalogVersion=4;hub.giftRules=config.giftRules;hub.commandRules=config.commandRules;

config=migratePartyConfig(config);
let configWrites=Promise.resolve();
function changeConfig(data){const task=configWrites.then(async()=>{
   const next={...config};if(data.party!==undefined)next.party=partySettings(data.party);if(data.plainVoiceStyle!==undefined){if(!['clear','lively'].includes(data.plainVoiceStyle))throw Error('Estilo de voz inválido');next.plainVoiceStyle=data.plainVoiceStyle;}if(data.hostAmbientEnabled!==undefined){if(typeof data.hostAmbientEnabled!=='boolean')throw Error('Falas automáticas inválidas');next.hostAmbientEnabled=data.hostAmbientEnabled;}if(data.hostAmbientSeconds!==undefined){if(!Number.isInteger(data.hostAmbientSeconds)||data.hostAmbientSeconds<12||data.hostAmbientSeconds>90)throw Error('Intervalo de fala inválido');next.hostAmbientSeconds=data.hostAmbientSeconds;}if(data.localAi!==undefined)next.localAi=localSettings(data.localAi);if(data.conversationProvider!==undefined){if(!['gemini','local'].includes(data.conversationProvider))throw Error('Provedor de conversa inválido');next.conversationProvider=data.conversationProvider;}if(data.worldClock!==undefined)next.worldClock=worldClockSettings(data.worldClock);if(typeof data.hostSpeech==='boolean')next.hostSpeech=data.hostSpeech;if(data.runtimeProfile!==undefined){if(!['gt3','quiet'].includes(data.runtimeProfile))throw Error('Perfil de CPU inválido');next.runtimeProfile=data.runtimeProfile;}if(typeof data.adaptiveQuality==='boolean')next.adaptiveQuality=data.adaptiveQuality;if(typeof data.socialMemory==='boolean')next.socialMemory=data.socialMemory;if(data.liveRules!==undefined)next.liveRules=normalizeLiveRules(data.liveRules);if(data.abilitySettings!==undefined)next.abilitySettings=normalizeAbilitySettings(data.abilitySettings);if(data.geminiTtsModel!==undefined){if(typeof data.geminiTtsModel!=='string'||(data.geminiTtsModel!=='auto'&&!/^gemini-[a-zA-Z0-9._-]{1,90}$/.test(data.geminiTtsModel)))throw Error('Modelo de voz inválido');next.geminiTtsModel=data.geminiTtsModel;}if(data.geminiVoice!==undefined){if(!['Puck','Zephyr','Charon','Kore','Fenrir','Aoede','Leda','Orus'].includes(data.geminiVoice))throw Error('Voz Gemini inválida');next.geminiVoice=data.geminiVoice;}if(data.alienUnlocks!==undefined)next.alienUnlocks=normalizeUnlockSettings(data.alienUnlocks);if(data.chatGoals!==undefined)next.chatGoals=normalizeGoalSettings(data.chatGoals);if(data.adventure)next.adventure=data.adventure;
   if(data.voiceProvider!==undefined){if(!['gemini','elevenlabs','local'].includes(data.voiceProvider))throw Error('Provedor de voz inválido');next.voiceProvider=data.voiceProvider;}
   for(const [key,min,max] of [['benPitch',.7,1.5],['benRate',.85,1.25]])if(data[key]!==undefined){if(!Number.isFinite(data[key])||data[key]<min||data[key]>max)throw Error('Tom ou ritmo de voz inválido');next[key]=data[key];}
   if(data.conversationModel!==undefined){if(typeof data.conversationModel!=='string'||(data.conversationModel!=='auto'&&!/^gemini-[a-zA-Z0-9._-]{1,90}$/.test(data.conversationModel)))throw Error('Modelo Gemini inválido');next.conversationModel=data.conversationModel;}
   if(data.elevenVoiceId!==undefined){if(typeof data.elevenVoiceId!=='string'||(data.elevenVoiceId&&!/^[a-zA-Z0-9_-]{5,100}$/.test(data.elevenVoiceId)))throw Error('ID de voz inválido');next.elevenVoiceId=data.elevenVoiceId;}
   if(data.speakerVoices!==undefined){if(!data.speakerVoices||typeof data.speakerVoices!=='object'||Array.isArray(data.speakerVoices)||Object.keys(data.speakerVoices).length>Object.keys(SPEAKERS).length)throw Error('Mapa de vozes inválido');for(const [id,value] of Object.entries(data.speakerVoices))if(!Object.hasOwn(SPEAKERS,id)||typeof value!=='string'||(value&&!/^[a-zA-Z0-9_-]{5,100}$/.test(value)))throw Error('Voz de personagem inválida');next.speakerVoices={...data.speakerVoices};}
   for(const k of ['music','voice','sfx'])if(data[k]!==undefined)next[k]=Math.max(0,Math.min(1,Number(data[k])||0));
   if(['economy','balanced','high'].includes(data.quality))next.quality=data.quality;
   if(data.giftRules!==undefined){next.giftRules=normalizeGiftRules(data.giftRules).map(({mission,missionKind,...rule})=>({...rule,power:rule.power||!!(mission||missionKind)}));}
   if(data.commandRules!==undefined){next.commandRules=normalizeCommandRules(data.commandRules).filter(r=>!r.mission&&!r.missionKind);}
   await mkdir(path.join(root,'data'),{recursive:true});const configFile=path.join(root,'data/config.json'),configTemp=configFile+'.tmp';await writeFile(configTemp,JSON.stringify(next));await rename(configTemp,configFile);const modelChanged=JSON.stringify([next.conversationModel,next.conversationProvider,next.localAi])!==JSON.stringify([config.conversationModel,config.conversationProvider,config.localAi]);config=next;applyPartySpeech(queue,config);liveRouter.configure(config.liveRules||{});adventure.abilities.configure(config.abilitySettings||{});audienceMemory.enabled=config.socialMemory!==false;if(modelChanged)aiSession?.invalidate();hub.giftRules=config.giftRules;hub.commandRules=config.commandRules;chatGoals?.configure(config.chatGoals);alienUnlocks?.configure(config.alienUnlocks);if(alienUnlocks)adventure.reconcileAccess(Date.now());if(worldClock){worldClock.configure(config.worldClock);broadcast('worldClock',worldClock.snapshot());}broadcast('config',config);return config;
 });configWrites=task.catch(()=>{});return task;}
const keys=await new KeyStore(path.join(root,'data/private/gemini-keys.json')).load();
const voiceKeys=await new KeyStore(path.join(root,'data/private/elevenlabs-keys.json'),'ELEVENLABS_API_KEY').load();
const audienceMemory=await new AudienceMemory(path.join(root,'data/private/audience-memory.json'),{onError:()=>broadcast('gameNotice',{text:'Memória local não pôde ser salva.'})}).load();audienceMemory.enabled=config.socialMemory!==false;
aiSession=new AISession({keys,memory:audienceMemory,getConfig:()=>config,onChange:s=>broadcast('ai',s)});
const aiVoice=new AIVoice(),localVoice=new LocalVoice(),avatarProxy=new AvatarProxy();worldClock=new WorldClock(config.worldClock);
const adventure=new ArenaSession({canTransform:form=>alienUnlocks?alienUnlocks.access(form,goalLane):{allowed:true},onChange:s=>broadcast('adventure',s)});
if(config.adventure)adventure.configure(config.adventure);
const party=new PartyDirector({adventure,getSettings:()=>config.party,onChange:s=>broadcast('partyTransform',s)});
const rhythm=new RhythmBridge({onFrame:s=>broadcast('rhythm',s)});applyPartySpeech(queue,config);
alienUnlocks=await new AlienUnlocks({file:path.join(root,'data/alien-progress.json'),settings:config.alienUnlocks,onChange:s=>broadcast('alienUnlocks',s),onUnlock:r=>{broadcast('alienUnlocked',r);host?.reward(r);},onError:()=>broadcast('gameNotice',{text:'O progresso de DNA não pôde ser salvo. Confira o armazenamento do aparelho.'})}).load();
let trainingUntil=0;let localSpeechUntil=0;const adventureBusy=()=>Date.now()<localSpeechUntil||Date.now()<trainingUntil;
const giftActions=new GiftActionQueue({adventure,onChange:s=>broadcast('giftActions',s),onNotice:notice=>broadcast('gameNotice',notice)});
chatGoals=new ChatGoals({settings:config.chatGoals,onChange:s=>broadcast('chatGoals',s),onComplete:r=>{broadcast('goalReward',r);host?.reward(r);if(!adventureBusy())adventure.react({gesture:({like:'fistpump',comment:'hero',share:'cheer',follow:'wave'})[r.type],expression:'happy'},Date.now());}});
host=new LiveHost({queue,getConfig:()=>({...config,hostAmbientReady:config.voiceProvider!=='local'||config.localVoiceMode!=='legacy'||localVoice.ambientReady}),getDna:s=>alienUnlocks.snapshot(s),getForm:()=>adventure.form,getBattle:s=>battle?.snapshot(s)});
battle=await new LiveBattle({file:path.join(root,'data/private/live-battle.json'),onError:text=>{console.error('[battle] '+text);broadcast('gameNotice',{text});},onChange:s=>broadcast('battle',s),onLine:s=>{if(s.source===goalLane)host.script(s.kind==='join'?'join':s.kind==='villainGift'?'gift':['hero','villain'].includes(s.kind)?'command':'goal',s.user,s.text,s.kind==='join'?1:s.kind==='villainGift'?5:2,{source:s.source});}}).load();
audience=new LiveAudience({adventure,getParty:()=>config.party,onChange:s=>broadcast('audience',s),onFocus:s=>broadcast('audienceFocus',s),onGreeting:v=>host.greet(v)});
const liveRouter=new LiveActionRouter({adventure,giftActions,audience,settings:config.liveRules||{},onNotice:notice=>broadcast('gameNotice',notice)});adventure.abilities.configure(config.abilitySettings||{});
let lastClockBroadcast=0;
const adventureTimer=setInterval(()=>{const now=Date.now(),busy=adventureBusy();adventure.comboPaused=!!giftActions.active||giftActions.items.length>0;adventure.tick(now,busy);battle.tick(goalLane,adventure.snapshot(now),now);giftActions.tick(now,busy);chatGoals.tick(now);audience.tick(now,goalLane,!!giftActions.active||now<adventure.nextPower||['selecting','transforming'].includes(adventure.watch.phase)||now<trainingUntil);party.tick(now,busy||!!queue.active||!!giftActions.active||giftActions.items.length>0||!!audience.greeting);host.tick(goalLane);if(now-lastClockBroadcast>5000){broadcast('worldClock',worldClock.snapshot(now));lastClockBroadcast=now;}},50);adventureTimer.unref();
const recent=new Map();let lastSpeech=null;
hub.listeners.add(e=>{e.partyMode=config.party.enabled;e.gameplayEnabled=liveRouter.settings[e.type].gameplay;const battleResult=battle.ingest(e,liveRouter.settings[e.type]);e.battleTeam=battleResult.team||'neutral';e.battleHandled=!!battleResult.handled;if(battleResult.command?.kind==='dance')adventure.react({gesture:battleResult.command.enabled?'dance':'hero',expression:'happy'},Date.now());e.gameplayEnabled=liveRouter.settings[e.type].gameplay;if(e.type==='gift')queue.promote(e.user,6);const profile=audienceMemory.observe(e);if(profile)e.returning=profile.returning;const viewer=audience.ingest(e);if(viewer)e.viewerId=viewer.id;if(config.party.enabled&&e.gameplayEnabled!==false&&isRoseGift(e)){e.partyRose=true;if(viewer)audience.rose(e,viewer);}if(e.type==='comment'&&(e.control||e.action||e.power||e.movement||e.gesture))party.manual();delete e.avatarUrl;if(e.battleTeam!=='villain'||e.type!=='like')alienUnlocks.ingest(e);if(e.battleTeam!=='villain'||!['like','gift'].includes(e.type))chatGoals.ingest(e);const form=e.control?.form||e.action;if(e.type==='comment'&&form&&alienUnlocks.access(form,goalLane).allowed===false){e.controlRejected=true;e.controlWarning='Faltam '+alienUnlocks.access(form,goalLane).remaining+' curtidas para liberar '+alienUnlocks.access(form,goalLane).name+'.';}e.mission=false;e.missionKind=null;if(liveRouter.social(e)&&e.source===goalLane&&!e.battleHandled&&e.type!=='join'&&!(e.battleTeam==='villain'&&['like','gift'].includes(e.type))&&!(e.type==='comment'&&musicCommand(e.text)!==null))host.event(e);broadcast('event',e);broadcast('ranking',hub.leaders());
 if(e.type==='comment'&&musicCommand(e.text)!==null){try{e.musicPriority=hub.ranking.get(e.user)?.giftCredit?5:0;music.ingest(e);broadcast('gameNotice',{text:'Pedido de música recebido: '+(e.displayName||e.user)});}catch(error){broadcast('gameNotice',{text:error.message});}return;}
 if(e.battleHandled)return;
 if(e.battleTeam==='villain'&&(e.type==='gift'||e.control||e.action||e.power||e.movement)){if(e.type==='gift')music.promote(e.displayName||e.user);if(e.type==='comment')broadcast('gameNotice',{text:'Comandos do Ben são do time dos heróis. Digite HERÓI para mudar de lado.'});return;}
 if(!e.partyRose)liveRouter.execute(e);
 if(e.type==='gift'){music.promote(e.displayName||e.user);return;}
 if(liveRouter.social(e)&&partySpeechWanted(e,config)&&e.type==='comment'&&!e.control&&!e.action&&!e.power&&!e.movement&&!e.gesture){const recentKey=e.source+':'+e.user,last=recent.get(recentKey);if(last&&last.text===e.text&&Date.now()-last.at<3000)return;if(queue.items.filter(i=>i.user===e.user&&i.source===e.source&&i.kind==='comment').length>=3){broadcast('gameNotice',{text:'Há três mensagens de '+e.user+' aguardando resposta. Aguarde a vez da conversa.'});return;}recent.set(recentKey,{at:Date.now(),text:e.text});if(recent.size>5000)recent.delete(recent.keys().next().value);const accepted=queue.enqueue({kind:'comment',speaker:e.speaker,user:e.user,displayName:e.displayName,viewerId:viewer?.id,prompt:e.text,source:e.source,priority:hub.ranking.get(e.user)?.giftCredit?4:3});if(!accepted)broadcast('gameNotice',{text:'A fila de fala está cheia; esta mensagem não entrou na leitura.'});const u=hub.ranking.get(e.user);if(u)u.giftCredit=Math.max(0,u.giftCredit-1);}
});
hub.listeners.add(()=>engagementState.schedule());
async function body(req,limit=65536){let bytes=0;const parts=[];for await(const b of req){bytes+=b.length;if(bytes>limit)throw Error('Corpo excede o limite');parts.push(b);}return Buffer.concat(parts);}
function json(res,status,data){res.writeHead(status,{'x-game-build':BUILD_ID,'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(data));}
export const server=http.createServer(async(req,res)=>{try{
 if(!['127.0.0.1:'+port,'localhost:'+port].includes(req.headers.host))return json(res,403,{error:'Host não permitido'});
 const url=new URL(req.url,'http://127.0.0.1');const p=url.pathname;
 // A document opened from another app/site is a valid entry point. API requests remain origin-restricted.
 const entryNavigation=req.method==='GET'&&p==='/'&&req.headers['sec-fetch-mode']==='navigate'&&req.headers['sec-fetch-dest']==='document';
 if(!entryNavigation&&req.headers['sec-fetch-site']==='cross-site')return json(res,403,{error:'Origem não permitida'});
 if(!entryNavigation&&req.headers.origin && !['http://127.0.0.1:'+port,'http://localhost:'+port].includes(req.headers.origin))return json(res,403,{error:'Origem não permitida'});
 if(p==='/events'){
  res.writeHead(200,{'content-type':'text/event-stream','cache-control':'no-cache','connection':'keep-alive'});clients.add(res);res.write(`event: ready\ndata: ${JSON.stringify({build:BUILD_ID,config,battle:battle.snapshot(goalLane),audience:audience.snapshot(goalLane),worldClock:worldClock.snapshot(),ai:aiSession.status(),energy:hub.totalEnergy,music:music.snapshot(),queue:queue.snapshot(),ranking:hub.leaders(),live:live.state,adventure:adventure.snapshot(),alienUnlocks:alienUnlocks.snapshot(goalLane),chatGoals:chatGoals.snapshot(goalLane),giftActions:giftActions.snapshot()})}\n\n`);const heartbeat=setInterval(()=>res.write(': ping\n\n'),15000);req.on('close',()=>{clearInterval(heartbeat);clients.delete(res);});return;
 }
 if(p==='/api/battle'&&req.method==='GET')return json(res,200,battle.snapshot(goalLane));
 if(p.startsWith('/api/battle/avatar/')&&req.method==='GET'){const id=p.slice('/api/battle/avatar/'.length);if(!/^[a-f0-9]{20}$/.test(id))return json(res,404,{error:'Foto não disponível'});try{const photo=await avatarProxy.get(battle.photo(id));res.writeHead(200,{'content-type':photo.mime,'cache-control':'private, max-age=300','x-content-type-options':'nosniff'});res.end(photo.data);return;}catch{return json(res,404,{error:'Foto não disponível'});}}
 if(p==='/api/abilities'&&req.method==='GET')return json(res,200,{catalog:ABILITY_CATALOG,state:adventure.abilities.snapshot(Date.now()),settings:config.abilitySettings||{}});
 if(p==='/api/memory'&&req.method==='GET')return json(res,200,audienceMemory.status());
 if(p==='/api/runtime'&&req.method==='GET'){try{const file=path.join(process.env.BEN10_LOCAL_ROOT||path.join(os.homedir(),'.local/share/ben10-local-ai'),'runtime-status.json');const state=JSON.parse(await readFile(file,'utf8'));return json(res,200,{...state,stale:Date.now()-state.updatedAt>15000});}catch{return json(res,200,{available:false,message:'Inicie com bash local-ai.sh start para ativar supervisão.'});}}
 if(p==='/api/gift-catalog'&&req.method==='GET')return json(res,200,giftCatalog.snapshot());
 if(p.startsWith('/api/gifts/image/')&&req.method==='GET'){const id=p.slice('/api/gifts/image/'.length);if(!/^[a-f0-9]{24}$/.test(id))return json(res,404,{error:'Foto não disponível'});try{const photo=await giftCatalog.image(id);res.writeHead(200,{'content-type':photo.mime,'cache-control':'private, max-age=300','x-content-type-options':'nosniff'});res.end(photo.data);return;}catch{return json(res,404,{error:'Foto não disponível'});}}
 if(p==='/api/health')return json(res,200,{ok:true,application:'LINEL_LIVE_CITY_V25',build:BUILD_ID,buildLabel:BUILD_LABEL,identity:'Ben Tennyson',runtime:{pid:process.pid,root:root.replace(/\/$/,''),port},training:Date.now()<trainingUntil,node:process.version,geminiConfigured:!!keys.key(),ai:aiSession.status(),voiceProvider:config.voiceProvider,voiceConfigured:config.voiceProvider==='local'?true:config.voiceProvider==='elevenlabs'?!!voiceKeys.key():!!keys.key(),live:live.state,adventure:adventure.snapshot(),ranking:hub.leaders(),energy:hub.totalEnergy,music:music.snapshot(),speechPreparation,forms:FORMS,arena:true,landmarks:['Clareira','Lata Velha','Lago','Acampamento'],queue:queue.snapshot(),party:party.snapshot(),rhythm:rhythm.status(),speech:lastSpeech,battle:battle.snapshot(goalLane),audience:audience.snapshot(goalLane),worldClock:worldClock.snapshot(),alienUnlocks:alienUnlocks.snapshot(goalLane),chatGoals:chatGoals.snapshot(goalLane),giftActions:giftActions.snapshot(),uptime:process.uptime()});
 if(p==='/api/models'&&req.method==='GET'){let files=[];try{files=await readdir(path.join(root,'data/models'));}catch{}return json(res,200,FORMS.flatMap(form=>files.includes(form+'.glb')?[{form,url:'/models/'+form+'.glb',custom:true}]:bundledModels.filter(entry=>entry.form===form)));}
 if(p==='/api/rhythm/status'&&req.method==='GET')return json(res,200,rhythm.status());
 if(p==='/api/music'&&req.method==='GET')return json(res,200,music.snapshot());
 if(p==='/api/audience'&&req.method==='GET')return json(res,200,audience.snapshot(goalLane));
 if(p==='/api/world-clock'&&req.method==='GET')return json(res,200,worldClock.snapshot());
 if(p.startsWith('/api/audience/avatar/')&&req.method==='GET'){const id=p.slice('/api/audience/avatar/'.length);if(!/^[a-f0-9]{20}$/.test(id))return json(res,404,{error:'Foto não disponível'});try{const photo=await avatarProxy.get(audience.photo(id));res.writeHead(200,{'content-type':photo.mime,'cache-control':'private, max-age=300','x-content-type-options':'nosniff'});res.end(photo.data);return;}catch{return json(res,404,{error:'Foto não disponível'});}}
 if(p==='/api/local-ai/preview-audio'&&req.method==='GET'){if(config.voiceProvider!=='local')return json(res,409,{error:'Selecione a voz local.'});const preview=await localVoice.preview({settings:config.localAi}),bytes=Buffer.from(preview.audio,'base64');res.writeHead(200,{'content-type':'audio/wav','content-length':bytes.length,'cache-control':'no-store','x-content-type-options':'nosniff'});res.end(bytes);return;}
 if(p.startsWith('/api/tts-jobs/')&&req.method==='GET'){if(config.voiceProvider!=='local')return json(res,409,{error:'A voz local não está selecionada.'});return json(res,200,await localVoice.job(p.slice('/api/tts-jobs/'.length),{settings:config.localAi}));}
 if(p==='/api/local-ai/preview'&&req.method==='GET'){if(config.voiceProvider!=='local')return json(res,409,{error:'Selecione a voz local para ouvir o teste salvo.'});return json(res,200,await localVoice.preview({settings:config.localAi}));}
 if(p==='/api/local-ai/health'&&req.method==='GET')return json(res,200,await localHealth(config.localAi));
 if(p==='/api/speakers'&&req.method==='GET')return json(res,200,SPEAKERS);
 if(p==='/api/voice-library'&&req.method==='GET')return json(res,200,await elevenVoices({key:voiceKeys.key()}));
 if(p==='/api/voice-keys'&&req.method==='GET')return json(res,200,voiceKeys.status());
 if(p==='/api/alien-unlocks'&&req.method==='GET')return json(res,200,alienUnlocks.snapshot(goalLane));
 if(p==='/api/chat-goals'&&req.method==='GET')return json(res,200,chatGoals.snapshot(goalLane));
 if(p==='/api/adventure'&&req.method==='GET')return json(res,200,adventure.snapshot());
 if(p==='/api/ai-status'&&req.method==='GET')return json(res,200,aiSession.status());
 if(p==='/api/gemini-models'&&req.method==='GET')return json(res,200,{models:await aiSession.models()});
 if(p==='/api/keys'&&req.method==='GET')return json(res,200,keys.status());
 if(p==='/api/config'&&req.method==='GET')return json(res,200,config);
 if(req.method==='POST'&&p.startsWith('/api/')){
  if(p==='/api/model'){
   const form=url.searchParams.get('form');if(form&&!FORMS.includes(form))throw Error('Forma inválida');const filename=(form||'avatar')+'.glb';
   const b=await body(req,20*1024*1024);if(b.length<20||b.toString('ascii',0,4)!=='glTF'||b.readUInt32LE(4)!==2||b.readUInt32LE(8)!==b.length)throw Error('GLB 2.0 inválido');
   const jsonLength=b.readUInt32LE(12);if(b.readUInt32LE(16)!==0x4e4f534a||jsonLength%4||jsonLength+20>b.length)throw Error('Chunk JSON GLB inválido');const document=JSON.parse(b.toString('utf8',20,20+jsonLength));if(document.asset?.version!=='2.0')throw Error('Asset GLB 2.0 ausente');if(document.buffers?.some(x=>x.uri)||document.images?.some(x=>x.uri))throw Error('GLB precisa incorporar buffers e texturas');
   await mkdir(path.join(root,'data/models'),{recursive:true});await writeFile(path.join(root,'data/models',filename),b);return json(res,201,{url:'/models/'+filename,bytes:b.length,note:'GLB armazenado; carregamento disponível no painel.'});
  }
  const data=JSON.parse((await body(req,p.startsWith('/api/rhythm/')?2048:65536)).toString()||'{}');
  if(p==='/api/rhythm/code')return json(res,200,rhythm.createPairing());
  if(p==='/api/rhythm/pair')return json(res,200,rhythm.pair(data.code));
  if(p==='/api/rhythm/revoke'){rhythm.revoke();return json(res,200,rhythm.status());}
  if(p==='/api/rhythm/frame'){rhythm.accept(data,req.headers.authorization);return json(res,200,{ok:true});}
  if(p==='/api/party/pulse'){party.music(data);return json(res,200,{ok:true});}
  if(p==='/api/voice-keys'){if(!String(req.headers['content-type']).startsWith('application/json'))throw Error('JSON obrigatório');return json(res,200,await voiceKeys.change(data.action,data));}
  if(p==='/api/keys'){if(!String(req.headers['content-type']).startsWith('application/json'))throw Error('JSON obrigatório');const result=await keys.change(data.action,data);aiSession.invalidate();return json(res,200,{...result,ai:aiSession.status()});}
  if(p==='/api/adventure'){const now=Date.now();if(!['locate','react'].includes(data.action))party.manual(now);if(!['locate','configure','react'].includes(data.action))audience.cancel(now);if(data.action==='combo')adventure.requestCombo(now);else if(data.action==='defense')adventure.requestDefense(now);else if(data.action==='transform')adventure.requestTransform(data.form,'operator',now);else if(data.action==='select')adventure.select(data.form,now);else if(data.action==='confirm')adventure.confirm(now);else if(data.action==='revert')adventure.revert(now);else if(data.action==='stop')adventure.stop(now);else if(data.action==='react')adventure.react({gesture:data.gesture,expression:data.expression},now);else if(data.action==='gesture')adventure.requestGesture(data.kind,now);else if(data.action==='movement')adventure.requestMovement(data.mode,now,data.direction);else if(data.action==='power')adventure.usePower(now,adventureBusy(),data.strength,data.variant);else if(data.action==='locate'){if(data.speaking===true)localSpeechUntil=now+1800;else localSpeechUntil=0;}else if(data.action==='configure'){adventure.configure(data.options,now);await changeConfig({adventure:{...adventure.options}});}else throw Error('Ação da clareira inválida');adventure.tick(now,adventureBusy());return json(res,200,adventure.snapshot(now));}
  if(p==='/api/alien-unlocks'){if(data.action==='configure')await changeConfig({alienUnlocks:data.settings});else if(data.action==='reset'){alienUnlocks.reset(goalLane);adventure.reconcileAccess(Date.now());await alienUnlocks.flush();}else throw Error('Ação de DNA inválida');return json(res,200,alienUnlocks.snapshot(goalLane));}
  if(p==='/api/chat-goals'){if(data.action==='configure')await changeConfig({chatGoals:data.settings});else if(data.action==='reset')chatGoals.reset(goalLane);else throw Error('Ação das metas inválida');return json(res,200,chatGoals.snapshot(goalLane));}
  if(p==='/api/world-clock'){await changeConfig({worldClock:data.settings});return json(res,200,worldClock.snapshot());}
  if(p==='/api/training'){if(typeof data.active!=='boolean')throw Error('Estado de treino inválido');const duration=data.duration??12000;if(!Number.isFinite(duration)||duration<1000||duration>60000)throw Error('Duração de treino inválida');trainingUntil=data.active?Date.now()+duration:0;adventure.tick(Date.now(),adventureBusy());return json(res,200,{active:Date.now()<trainingUntil,until:trainingUntil});}
  if(p==='/api/memory'){if(data.action!=='clear')throw Error('Ação de memória inválida');await audienceMemory.clearAll();return json(res,200,audienceMemory.status());}
  if(p==='/api/event'){const event=hub.ingest(data,'demo');await speechState.flush();await engagementState.flush();await giftCatalog.flush();return json(res,200,{event});}
  if(p==='/api/music'){
   const a=data.action;
   if(a==='request')music.request({query:data.query,user:'Equipe',source:goalLane,owner:true});
   else if(a==='resolve')music.resolve(data.id,data.url);
   else if(a==='start')music.start(data.id);
   else if(a==='pause')music.pause();
   else if(a==='next')music.next();
   else if(a==='ended')music.finish(data.id);
   else if(a==='remove')music.remove(data.id);
   else if(a==='volume')music.setVolume(data.volume);
   else throw Error('Ação de música inválida');
   return json(res,200,music.snapshot());
  }
  if(p==='/api/prepare-speech'){
   if(!queue.active||queue.active.id!==data.after)return json(res,409,{error:'Fala não ativa'});
   if(config.voiceProvider!=='local'||speechPreparation?.state==='preparing')return json(res,202,{prepared:false});
   const item=queue.peek();if(!item)return json(res,202,{prepared:false});
   const token={id:item.id,state:'preparing',at:Date.now()};speechPreparation=token;
   void (async()=>{try{const selection=aiSession.selection().token;const answer=await aiSession.answer(item,{form:adventure.form,arena:true,watch:adventure.watch,party:config.party,chatGoals:chatGoals.snapshot(goalLane),alienUnlocks:alienUnlocks.snapshot(goalLane)});if(queue.active?.id!==item.id&&queue.peek()?.id!==item.id){token.state='superseded';return;}if(selection!==aiSession.selection().token||answer.mode==='local'&&answer.code?.startsWith('local_text_')){token.state='deferred';return;}queue.saveAnswer(item.id,answer,selection);await localVoice.startJob(answer.spokenText||answer.text,{settings:config.localAi});token.state='prepared';}catch(e){token.state='deferred';token.code=e.code||'prepare_failed';}})();
   return json(res,202,{prepared:true,id:item.id});
  }
  if(p==='/api/speech-progress'){if(!queue.active||queue.active.id!==data.id)return json(res,409,{error:'Fala não ativa'});if(!['thinking','voice','ack','retry','paused','playing','played'].includes(data.state))throw Error('Estado de fala inválido');queue.hold(data.id);if(data.state==='played')queue.markPlayed(data.id);await speechState.flush();lastSpeech={id:data.id,user:queue.active.user,source:queue.active.source,state:data.state,at:Date.now()};return json(res,200,{accepted:true});}
  if(p==='/api/ack'){const accepted=queue.ack(data.id)||queue.receipts.has(data.id);await speechState.flush();return json(res,200,{accepted});}
  if(p==='/api/connect'){await live.connect(String(data.username||''),data.provider,{endpoint:data.endpoint||'auto'});return json(res,200,live.state);}
  if(p==='/api/disconnect'){await live.disconnect();return json(res,200,live.state);}
  if(p==='/api/answer'){
   if(!queue.active||queue.active.id!==data.id)return json(res,409,{error:'Fala não ativa'});
   queue.hold(data.id);
   const item=queue.active,selection=aiSession.selection().token;const answer=item.answer&&item.answerSelection===selection&&!(item.answer.mode==='local'&&item.answer.code?.startsWith('local_text_'))?item.answer:await aiSession.answer(item,{form:adventure.form,arena:true,watch:adventure.watch,position:adventure.position,party:config.party,chatGoals:chatGoals.snapshot(goalLane),alienUnlocks:alienUnlocks.snapshot(goalLane),battle:battle.context(goalLane,item.user)});if(aiSession.selection().provider==='local'&&answer.mode==='local'&&answer.code?.startsWith('local_text_'))return json(res,503,{error:answer.warning,code:answer.code});queue.saveAnswer(item.id,answer,selection);await speechState.flush();await audienceMemory.flush();return json(res,200,answer);
  }
  if(p==='/api/diagnostics/client'){const diagnostic=renderDiagnostic(data);if(Date.now()-lastClientReport>1000){clientLog.event('browser-render',diagnostic);lastClientReport=Date.now();}return json(res,200,{saved:true});}
  if(p==='/api/test-gemini'||p==='/api/test-ai'){if(data.prompt!==undefined&&(typeof data.prompt!=='string'||data.prompt.length>300))throw Error('Pergunta de teste inválida');return json(res,200,await aiSession.test(data.prompt||'Qual é o seu nome?',{form:'base',arena:true,watch:adventure.watch,party:config.party,chatGoals:chatGoals.snapshot(goalLane),alienUnlocks:alienUnlocks.snapshot(goalLane)}));}
  if(p==='/api/tts-jobs'){if(config.voiceProvider!=='local')return json(res,409,{error:'A voz local não está selecionada.'});if(typeof data.text!=='string'||!data.text.trim()||data.text.length>1000)throw Error('Texto inválido');return json(res,202,await localVoice.startJob(data.text,{settings:config.localAi}));}
  if(p==='/api/tts'){if(typeof data.text!=='string'||!data.text.trim()||data.text.length>1000)throw Error('Texto inválido');const speaker=speakerId(data.speaker||adventure.form),profile=SPEAKERS.base,voiceId=config.speakerVoices?.base;return json(res,200,{...await (config.voiceProvider==='local'?localVoice.speak(data.text,{settings:config.localAi}):config.voiceProvider==='elevenlabs'?elevenlabs(data.text,{key:voiceKeys.key(),voiceId:voiceId||config.elevenVoiceId}):aiVoice.speak(data.text,{key:keys.key(),speaker:'base',model:config.geminiTtsModel||'auto',voiceName:config.geminiVoice||profile.voice})),speaker,name:profile.name,persona:'base',provider:config.voiceProvider});}
  if(p==='/api/config'){const {adventure:ignoredAdventure,...settings}=data;return json(res,200,await changeConfig(settings));}
  return json(res,404,{error:'Rota inexistente'});
 }
 if(req.method!=='GET')return json(res,405,{error:'Método não permitido'});
 const modelRoute=p.startsWith('/models/')&&['avatar',...FORMS].some(form=>p==='/models/'+form+'.glb');
 if(p.startsWith('/models/')&&!modelRoute)return json(res,404,{error:'Modelo não encontrado'});
 const base=modelRoute?path.join(root,'data/models'):path.join(root,'public');const relative=modelRoute?p.slice('/models'.length):p==='/'?'/index.html':p;const file=path.resolve(base,'.'+decodeURIComponent(relative));if(!file.startsWith(base+path.sep))return json(res,403,{error:'Caminho inválido'});
 const b=await readFile(file);res.writeHead(200,{'cache-control':'no-cache','x-game-build':BUILD_ID,'content-type':({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.wav':'audio/wav','.json':'application/json','.glb':'model/gltf-binary','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.apk':'application/vnd.android.package-archive'})[path.extname(file)]||'application/octet-stream','x-content-type-options':'nosniff'});res.end(b);
 }catch(e){json(res,e.status|| (e.code==='ENOENT'?404:400),{error:e.message,...(e.code?{code:e.code}:{}),...(e.category?{category:e.category}:{})});}});
const port=Number(process.env.PORT||3000);
if(!Number.isInteger(port)||port<1||port>65535){console.error('PORT inválida. Use um número entre 1 e 65535.');process.exit(1);}
server.once('error',async error=>{clearInterval(adventureTimer);queue.close();if(error.code==='EADDRINUSE'){
 let running=false;try{const r=await fetch('http://127.0.0.1:'+port+'/api/health',{signal:AbortSignal.timeout(1200)});const d=await r.json();running=d.application==='LINEL_LIVE_CITY_V25'||(Array.isArray(d.forms)&&d.forms.join(',')===FORMS.join(','));}catch{}
 console.error(running?'O jogo já está em execução nesta porta. Abra http://127.0.0.1:'+port+'/':'A porta '+port+' já está sendo usada por outro programa.');
 console.error('Para carregar uma atualização, pare o servidor anterior com Ctrl+C na sessão original e execute bash start.sh novamente.');
 console.error('Para usar outra porta: PORT='+Math.min(65535,port+1)+' bash start.sh');process.exit(running?0:1);
 }else{console.error('Não foi possível iniciar o servidor: '+error.code);process.exit(1);}});
server.listen(port,'127.0.0.1',()=>console.log(BUILD_LABEL+' iniciado. Abra http://127.0.0.1:'+port+'/'));

for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{clearInterval(adventureTimer);queue.close();live.disconnect();for(const c of clients)c.end();server.close(async()=>{try{await battle?.flush();await alienUnlocks?.flush();await speechState.flush();await audienceMemory.flush();await engagementState.flush();await giftCatalog.flush();}finally{process.exit(0);}});});
