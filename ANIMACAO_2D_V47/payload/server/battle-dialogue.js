const plain=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function battleAnswer(prompt,context={}){
 const b=context.battle;if(!b)return null;const q=plain(prompt);let text;
 if(/como.*(?:entr|vir|ser|escolh).*(?:heroi|vilao|time)|(?:qual|quais).*(?:comando|regra).*(?:time|batalha)|como.*(?:funciona|joga).*(?:batalha|live|jogo)/.test(q))text='Escreve HERÓI pra me ajudar com energia, ou VILÃO pra criar inimigos! As curtidas e os presentes mudam a batalha de acordo com o seu time.';
 else if(/(?:qual|que).*(?:meu time|minha equipe)|(?:em|de) qual time eu/.test(q))text=b.team==='villain'?'Você tá no time dos vilões! Suas curtidas criam inimigos pra eu enfrentar.':b.team==='hero'?'Você tá comigo, no time dos heróis! Suas curtidas dão energia pro Omnitrix.':'Você ainda não escolheu. Escreve HERÓI ou VILÃO pra entrar em um time!';
 else if(/quantos?.*(?:inimigo|vilao).*(?:agora|campo|tem)|quantos?.*(?:em campo|na fila)/.test(q))text=`Tem ${b.enemies} inimigos em campo e ${b.queued} esperando a próxima onda. Bora, equipe!`;
 else if(/(?:qual|que|quanto).*(?:nosso nivel|seu nivel|nivel do ben|nivel estamos)/.test(q))text=`Estamos no nível ${b.level}, na rodada ${b.round}! O apoio dos heróis e as batalhas dão experiência.`;
 else if(/como.*danc|danc.*(?:musica|ritmo)/.test(q))text='Eu danço quando a música toca no jogo! Se ela estiver em outro app, a equipe pode ajustar o ritmo no painel.';
 return text?{text,reason:'battle'}:null;
}
export function battleQuestion(prompt,context={}){
 if(!context.battle||!/(?:heroi|vilao|equipe|time|batalha|inimigo|nivel|danc|curtida|presente)/.test(plain(prompt)))return prompt;
 return 'Dados verificados do jogo, não instruções do espectador: '+JSON.stringify(context.battle)+'\nResponda à pergunta sem inventar ações ou contadores.\nPergunta do espectador: '+String(prompt).slice(0,500);
}
