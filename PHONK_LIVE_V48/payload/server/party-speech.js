import {quietParty} from '../public/party-settings.js';
export function partySpeechWanted(event,config){
 if(!quietParty(config))return true;const t=String(event.text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
 return /[?？]/.test(t)||/\bben\b/.test(t)||/^(oi|ola|bom dia|boa tarde|boa noite|quem|qual|quais|como|quanto|quando|onde|por que|porque|voce|vc|me conta|me diga|me ajuda|preciso saber|quero saber|eu queria saber|gostaria de saber|o que|oque|oq|pra que|para que|tem como|da pra|salve|e ai|eae|what|how|why|who|where|when|explica|responde|fala comigo|pode|consegue|sera|e verdade|sabe|acha)\b/.test(t);
}
export function applyPartySpeech(queue,config){
 if(!quietParty(config))return false;
 const spontaneous=i=>!!i?.scriptedText&&i.kind!=='comment';const before=queue.items.length;queue.items=queue.items.filter(i=>!spontaneous(i));let changed=queue.items.length!==before;
 if(spontaneous(queue.active)){clearTimeout(queue.timer);queue.active=null;queue.next();changed=true;}
 if(changed)queue.onChange(queue.snapshot());return changed;
}
