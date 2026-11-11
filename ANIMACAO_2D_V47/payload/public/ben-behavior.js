const clean=text=>String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export const GESTURES=['wave','cheer','explain','nod','shrug','fistpump','hero','greet','dance'];
export const EXPRESSIONS=['neutral','happy','curious','surprised','confident'];
export function replyReaction(text,prompt=''){
 const s=clean(text),q=clean(prompt);if(/\b(oi|ola|cheguei|salve|e ai|tchau)\b/.test(q))return {gesture:'wave',expression:'happy'};
 if(/\b(valeu|obrigad|mandou bem|incrivel|demais)/.test(s))return {gesture:'cheer',expression:'happy'};
 if(/\b(nao sei|talvez|duvida|nao entendi)/.test(s))return {gesture:'shrug',expression:'curious'};
 if(/\b(sim|pode deixar|combinado|claro)\b/.test(s))return {gesture:'nod',expression:'confident'};
 return {gesture:'explain',expression:q.includes('?')?'curious':'confident'};
}
