import {ABILITY_CATALOG} from '../public/ability-catalog.js';
export const LIVE_EVENT_TYPES=['like','comment','follow','gift','share','join'];
export function normalizeLiveRules(value={}){if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Regras LIVE inválidas');const result={};for(const type of LIVE_EVENT_TYPES){const v=value[type]||{};if(typeof v!=='object'||Array.isArray(v))throw Error('Regra LIVE inválida');for(const key of ['gameplay','social'])if(v[key]!==undefined&&typeof v[key]!=='boolean')throw Error('Estado LIVE inválido');result[type]={gameplay:v.gameplay!==false,social:v.social!==false,ability:v.ability||null,minimumCount:v.minimumCount??1,cooldownMs:v.cooldownMs??0};if(result[type].ability&&!Object.hasOwn(ABILITY_CATALOG,result[type].ability))throw Error('Habilidade LIVE desconhecida');if(!Number.isInteger(result[type].minimumCount)||result[type].minimumCount<1||result[type].minimumCount>1e6||!Number.isInteger(result[type].cooldownMs)||result[type].cooldownMs<0||result[type].cooldownMs>300000)throw Error('Limite LIVE inválido');}return result;}
export class LiveActionRouter {
 constructor({adventure,giftActions,audience,settings={},onNotice=()=>{},now=Date.now}){Object.assign(this,{adventure,giftActions,audience,onNotice,now});this.last=new Map();this.configure(settings);}
 configure(settings){this.settings=normalizeLiveRules(settings);}
 social(event){return this.settings[event.type]?.social!==false;}
 execute(event){const rule=this.settings[event.type];if(!rule?.gameplay){if(event.control)this.onNotice({text:'As ações deste evento estão desativadas nas regras da LIVE.'});return false;}const now=this.now(),key=event.type+':'+event.user;if((event.count||1)<rule.minimumCount||now-(this.last.get(key)??-Infinity)<rule.cooldownMs)return false;
  const a=this.adventure,c=event.control;try{
   if(event.type==='gift'){a.cancelCombo?.();if(event.action||event.power||event.movement)this.giftActions.enqueue(event);return true;}
   if(event.type==='join'&&!event.partyMode)a.welcome(now);
   if(rule.ability){const ability=ABILITY_CATALOG[rule.ability];if(ability.form!==a.form)throw Error('A habilidade da regra precisa da forma '+ability.form);a.requestPower(a.form,now,ability.variant);this.last.set(key,now);return true;}
   if(c||event.action||event.power||event.movement||event.gesture)this.audience.cancel(now);
   if(c?.kind==='transform')a.requestTransform(c.form,event.source,now);
   else if(c?.kind==='select')a.select(c.form,now);
   else if(c?.kind==='confirm')a.confirm(now);
   else if(c?.kind==='revert')a.revert(now);
   else if(c?.kind==='stop')a.stop(now);
   else if(c?.kind==='combo')a.requestCombo(now);
   else if(c?.kind==='defense')a.requestDefense(now);
   else if(c?.kind==='move')a.requestMovement(c.mode,now,c.direction);
   else if(c?.kind==='gesture')a.requestGesture(c.gesture,now);
   else if(c?.kind==='power'){if(c.requiresForm&&c.requiresForm!==a.form)throw Error('Este poder precisa da forma '+c.requiresForm);a.requestPower(a.form,now,c.variant);}
   else if(event.action)a.requestTransform(event.action,event.source,now);
   else if(event.movement)a.requestMovement(event.movement,now,event.direction);
   else if(event.gesture)a.requestGesture(event.gesture,now);
   else if(event.power)a.requestPower(a.form,now);
   else return false;
   this.last.set(key,now);while(this.last.size>5000)this.last.delete(this.last.keys().next().value);return true;
  }catch(error){this.onNotice({text:error.message});return false;}
 }
}
