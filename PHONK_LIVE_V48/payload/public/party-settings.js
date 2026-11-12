export const PARTY_DEFAULTS=Object.freeze({enabled:true,quietSpeech:true,autoTransform:true,transformBeats:32,beatCamera:true,arrivalCamera:true,lightStrength:.55,danceStyle:'phonk'});
export function partySettings(value={}){
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Configuração da festa inválida');
 const result={...PARTY_DEFAULTS};for(const k of ['enabled','quietSpeech','autoTransform','beatCamera','arrivalCamera'])if(value[k]!==undefined){if(typeof value[k]!=='boolean')throw Error('Opção da festa inválida: '+k);result[k]=value[k];}
 if(value.transformBeats!==undefined){if(![16,32,64].includes(value.transformBeats))throw Error('Use 16, 32 ou 64 batidas para trocar o alien.');result.transformBeats=value.transformBeats;}
 if(value.lightStrength!==undefined){if(!Number.isFinite(value.lightStrength)||value.lightStrength<0||value.lightStrength>1)throw Error('Intensidade de luz inválida');result.lightStrength=value.lightStrength;}
 if(value.danceStyle!==undefined){if(!['phonk','shuffle','groove','hero','robot'].includes(value.danceStyle))throw Error('Dança inválida');result.danceStyle=value.danceStyle;}
 return result;
}
export function isRoseGift(event){return event?.type==='gift'&&['rose','rosa','white rose','rosa branca'].includes(String(event.gift||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase());}
export function quietParty(config){return config?.party?.enabled===true&&config.party.quietSpeech!==false;}
