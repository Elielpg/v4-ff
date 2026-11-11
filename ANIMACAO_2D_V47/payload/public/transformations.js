import {isConversation} from './chat-intent.js';
export const FORM_IDS=['base','blaze','volt','rock','shade','tide','nova','beast','fourarms','cannon','wildvine'];
export const clean=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const aliases={base:['ben 10','ben dez','humano','ben','base'],blaze:['chama','heatblast'],volt:['xlr8','xrl8','acelerado','x l r 8'],rock:['diamante','diamondhead'],shade:['fantasmatico','ghostfreak'],tide:['aquatico','ripjaws'],nova:['alien x','alienx'],beast:['besta','wildmutt'],fourarms:['quatro bracos','four arms','fourarms'],cannon:['bola de canhao','cannonbolt'],wildvine:['cipo selvagem','wildvine']};
export function namedTransformation(text){
 const normalized=clean(text),input=' '+normalized+' ';if(isConversation(text))return null;if(/\b(nao|evite)\b/.test(input))return null;
 const explicit=/\b(transform\w*|vir[ae]|mude?|troque?|ativ[ae]|escolh[ao]|quero ser)\b/.test(normalized),matches=[];
 if(!explicit&&(/\?|\b(quem|qual|quais|como|por que|porque|onde|quando|quanto|me conte|me fala|conhece|o que)\b/.test(String(text).toLowerCase())||/\b(quem|qual|quais|como|por que|porque|onde|quando|quanto|me conte|me fala|conhece|o que)\b/.test(normalized)))return null;
 for(const [form,names] of Object.entries(aliases))for(const name of names)if(input.includes(' '+name+' ')&&(explicit||normalized===name||/\b(usa|use|solta|solte|poder|habilidade|dash|corre|correr|voa|voar)\b/.test(normalized)))matches.push({form,length:name.length,index:input.lastIndexOf(' '+name+' ')});
 return matches.sort((a,b)=>b.index-a.index||b.length-a.length)[0]?.form||null;
}
export const asksPower=text=>!isConversation(text)&&!(/\b(nao|evite|quem|qual|quais|como|por que|porque|onde|quando|o que)\b/.test(clean(text))||String(text).includes('?'))&&/\b(poder|poderes|habilidade|habilidades)\b/.test(clean(text));
export const POWERS={base:{name:'Scanner do relógio',color:[.5,1,.2]},blaze:{name:'Pulso de calor',color:[1,.35,.05]},volt:{name:'Arrancada veloz',color:[.1,.75,1]},rock:{name:'Cristais de sustentação',color:[.2,1,.85]},shade:{name:'Fase espectral',color:[.7,.65,1]},tide:{name:'Jato de água',color:[.1,.45,1]},nova:{name:'Campo estelar',color:[.7,.6,1]},beast:{name:'Rastreamento',color:[1,.65,.2]},fourarms:{name:'Superforça',color:[1,.2,.1]},cannon:{name:'Rolamento de impacto',color:[.85,.85,.5]},wildvine:{name:'Crescimento de cipós',color:[.3,1,.2]}};
export const POWER_LOADOUTS={
 base:[{id:'omnitrix-scan',name:'Varredura Omnitrix'},{id:'omnitrix-shield',name:'Escudo Omnitrix'},{id:'energy-pulse',name:'Pulso de energia'}],
 blaze:[{id:'fire-breath',name:'Sopro de fogo'},{id:'fireball',name:'Bola de fogo'},{id:'flame-burst',name:'Explosão de chamas'}],
 volt:[{id:'sonic-dash',name:'Arrancada supersônica'},{id:'speed-vortex',name:'Tornado de velocidade'},{id:'afterimage',name:'Rastro de velocidade'}],
 rock:[{id:'crystal-wall',name:'Muralha de cristais'},{id:'shard-volley',name:'Rajada de cristais'},{id:'crystal-shield',name:'Escudo de diamante'}],
 shade:[{id:'spectral-phase',name:'Fase espectral'},{id:'phantom-rush',name:'Investida fantasma'},{id:'shadow-tendrils',name:'Tentáculos sombrios'}],
 tide:[{id:'water-jet',name:'Jato de água'},{id:'tidal-wave',name:'Onda aquática'},{id:'water-shield',name:'Redemoinho protetor'}],
 nova:[{id:'cosmic-pulse',name:'Pulso cósmico'},{id:'starlight-orbit',name:'Órbita estelar'},{id:'gravity-well',name:'Campo gravitacional'}],
 beast:[{id:'scent-scan',name:'Rastreamento aguçado'},{id:'predator-pounce',name:'Salto predador'},{id:'sonic-roar',name:'Rugido sônico'}],
 fourarms:[{id:'ground-slam',name:'Impacto sísmico'},{id:'double-punch',name:'Soco duplo'},{id:'thunder-clap',name:'Palma trovejante'}],
 cannon:[{id:'cannon-roll',name:'Rolamento de impacto'},{id:'armored-charge',name:'Investida blindada'},{id:'rebound-burst',name:'Ricochete explosivo'}],
 wildvine:[{id:'vine-grab',name:'Laço de cipó'},{id:'seed-burst',name:'Rajada de sementes'},{id:'thorn-lash',name:'Chicote de espinhos'}]
};
export const SPECIAL_POWERS={base:{id:'omnitrix-overdrive',name:'Sobrecarga Omnitrix'},blaze:{id:'solar-ring',name:'Anel solar'},volt:{id:'lightning-circuit',name:'Circuito relâmpago'},rock:{id:'crystal-prison',name:'Prisão de cristal'},shade:{id:'ectoplasm-wave',name:'Onda de ectoplasma'},tide:{id:'pressure-burst',name:'Explosão de pressão'},nova:{id:'star-collapse',name:'Colapso estelar'},beast:{id:'claw-storm',name:'Tempestade de garras'},fourarms:{id:'seismic-combo',name:'Combo sísmico'},cannon:{id:'ricochet-storm',name:'Tempestade de ricochetes'},wildvine:{id:'root-prison',name:'Prisão de raízes'}};
for(const form of FORM_IDS)POWER_LOADOUTS[form].push(SPECIAL_POWERS[form]);
export function powerAbility(form,variant=0){const options=POWER_LOADOUTS[form]||POWER_LOADOUTS.base,index=Math.abs(Math.floor(Number(variant)||0))%options.length;return options[index];}

// Questions about a movement stay in the conversation lane.
export function asksMovement(text){const value=clean(text);if(isConversation(text))return null;if(/\b(nao|evite|quem|qual|quais|como|porque|onde|quando|o que)\b/.test(value)||String(text).includes('?'))return null;if(/\b(dash|arrancada|super velocidade)\b/.test(value))return 'dash';if(/\b(voa|voe|voar|voando|voo|decolar|decola)\b/.test(value))return 'fly';if(/\b(corre|corra|correr|corrida)\b/.test(value))return 'run';return null;}
export function asksGesture(text){const value=clean(text);if(isConversation(text))return null;if(/\b(nao|evite|quem|qual|quais|como|porque|onde|quando|o que)\b/.test(value)||String(text).includes('?'))return null;if(/\b(acena|acene|acenar|tchau|wave)\b/.test(value))return 'wave';if(/\b(comemora|comemore|comemorar|celebra|celebre|celebrar|festeja|festeje)\b/.test(value))return 'cheer';if(/\b(pula|pule|pular|salta|salte|saltar)\b/.test(value))return 'jump';return null;}

const missionAliases={resgate:'rescue',rescue:'rescue',escolta:'escort',escort:'escort',entrega:'delivery',delivery:'delivery',corrida:'race',race:'race',reparo:'repair',conserto:'repair',repair:'repair',incendio:'fire',fogo:'fire',fire:'fire',defesa:'defense',defender:'defense',defense:'defense',busca:'search',investigacao:'search',procurar:'search',search:'search'};
export function missionRequest(text){const value=clean(text);if(isConversation(text))return null;if(String(text).includes('?')||/\b(nao|evite|qual|quais|como|quem|porque|onde|quando)\b/.test(value))return null;const match=value.match(/^(?:ben(?: 10)? )?(?:(?:quero|nova|uma|pedir|iniciar) )?missao(?: (.*))?$/);if(!match)return null;const words=(match[1]||'').split(' ');const kind=words.map(word=>missionAliases[word]).find(Boolean)||null;return {kind};}
