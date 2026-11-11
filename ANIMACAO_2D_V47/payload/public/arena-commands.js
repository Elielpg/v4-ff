import {isConversation} from './chat-intent.js';
import {clean,namedTransformation,POWER_LOADOUTS} from './transformations.js';
export const ARENA_RADIUS=17;
export const FLYING_FORMS=['blaze','shade','nova'];
export const DIRECTIONS={frente:[0,1],tras:[0,-1],esquerda:[-1,0],direita:[1,0],norte:[0,1],sul:[0,-1],oeste:[-1,0],leste:[1,0]};
export function parseArenaCommand(text){const s=clean(text);if(isConversation(text))return null;if(!s||String(text).includes('?')||/\b(nao|como|qual|quem|porque)\b/.test(s))return null;
 const form=namedTransformation(text);if(form)return {kind:'transform',form};
 if(/^(ben )?(parar|pare|parado|stop)$/.test(s))return {kind:'stop'};
 if(/^(ben )?(voltar|humano|destransformar|destransforme)$/.test(s))return {kind:'revert'};
 if(/^(transformar|transforme|confirmar|ativar)$/.test(s))return {kind:'confirm'};
 if(/^(selecionar|selecione) /.test(s)){const f=namedTransformation(s.replace(/^(selecionar|selecione) /,''));if(f)return {kind:'select',form:f};}
 if(/^(?:ben )?(?:defender|defesa|bloquear|guarda)$/.test(s))return {kind:'defense'};
 if(/^(?:ben )?(?:combo|combinar poderes)$/.test(s))return {kind:'combo'};
 if(s==='treinar')return {kind:'power',variant:null};
 if(['especial','poder especial','ataque especial'].includes(s))return {kind:'power',variant:3};
 const power=s.match(/^(?:ben )?(?:poder|habilidade|ataque)(?: ([1234]))?$/);if(power)return {kind:'power',variant:power[1]?Number(power[1])-1:null};
 for(const [id,abilities] of Object.entries(POWER_LOADOUTS))for(const [variant,a] of abilities.entries())if(clean(a.name)===s||clean(a.id)===s)return {kind:'power',variant,requiresForm:id};
 if(/^(rolar|role|rola)$/.test(s))return {kind:'move',mode:'roll'};
 if(/^(pular|pula|pule|saltar|salta|salte)$/.test(s))return {kind:'move',mode:'jump'};
 if(/^(girar|gira|gire|rodar|rodopiar)$/.test(s))return {kind:'move',mode:'spin'};
 if(/^(acenar|acene|tchau)$/.test(s))return {kind:'gesture',gesture:'wave'};
 if(/^(?:ben )?(pose|pose de heroi|pose de super heroi)$/.test(s))return {kind:'gesture',gesture:'hero'};
 if(/^(?:ben )?(vitoria|soco pro alto|soco para o alto)$/.test(s))return {kind:'gesture',gesture:'fistpump'};
 if(/^(?:ben )?(sentar|senta|sente|descansar)$/.test(s))return {kind:'gesture',gesture:'sit'};
 if(/^(?:ben )?(levantar|levanta|levante|ficar de pe)$/.test(s))return {kind:'gesture',gesture:'stand'};
 if(/^(?:ben )?(sorrir|sorria|sorri)$/.test(s))return {kind:'gesture',gesture:'smile'};
 if(/^(?:ben )?(concordar|confirme com a cabeca)$/.test(s))return {kind:'gesture',gesture:'nod'};
 if(/^(comemorar|comemore|celebrar)$/.test(s))return {kind:'gesture',gesture:'cheer'};
 if(/^(pousar|pouse|descer|desca)$/.test(s))return {kind:'move',mode:'land'};
 const words=s.split(' '),direction=Object.keys(DIRECTIONS).find(d=>words.includes(d));let mode=/\b(dash|super rapido|super velocidade|superrapido|acelerar)\b/.test(s)?'dash':/\b(voar|voa|voe|subir|suba)\b/.test(s)?'fly':/\b(correr|corre|corra)\b/.test(s)?'run':/\b(andar|anda|ande|caminhar|caminhe)\b/.test(s)?'walk':direction?'walk':null;
 if(mode)return {kind:'move',mode,direction:direction?DIRECTIONS[direction]:null};return null;
}
export function constrainArena(x,z,radius=ARENA_RADIUS){const d=Math.hypot(x,z);return d>radius?[x/d*radius,z/d*radius]:[x,z];}
