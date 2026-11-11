const cleanName=value=>String(value||'Visitante').replace(/[<>\x00-\x1f]/g,'').slice(0,40).trim()||'Visitante';

export function liveEventPresentation(event){
 const user=cleanName(event.user),points=Math.max(0,Number(event.points)||0);
 const source=event.source==='demo'?' · DEMO':'';
 if(event.type==='join')return {type:'join',icon:'👋',label:'NOVO VISITANTE'+source,title:'Bem-vindo, @'+user+'!',detail:'Bem-vindo ao acampamento do Ben!',voiceText:'Seja bem-vindo, '+user+'! Que bom ter você aqui.'};
 if(event.type==='follow')return {type:'follow',icon:'💚',label:'NOVO SEGUIDOR'+source,title:'Valeu por seguir, @'+user+'!',detail:'Ben ganhou mais um aliado. Obrigado pelo apoio!',voiceText:'Obrigado por seguir, '+user+'! Você já faz parte da equipe.'};
 if(event.type==='gift'&&event.battleTeam==='villain'){const n=Math.max(1,Math.min(1000,Number(event.count)||1));return {type:'gift',icon:'⚔',label:'REFORÇO DOS VILÕES'+source,title:'@'+user+' enviou '+n+' elite'+(n>1?'s':''),detail:String(event.gift||'Presente')+' · inimigos maiores entram na próxima onda.',voiceText:''};}
 if(event.type==='gift'){
  const gift=String(event.gift||'presente').replace(/[<>\x00-\x1f]/g,'').slice(0,60);
  const quantity=Math.max(1,Math.min(1000,Number(event.count)||1));
  const action=event.reaction?.text?String(event.reaction.text).replace(/[<>\x00-\x1f]/g,'').slice(0,100):'Seu presente ajudou a aventura.';
  const powerLevel=event.power?Math.max(1,Math.min(5,Number(event.powerLevel)||1)):0;
  return {type:'gift',icon:'🎁',label:'PRESENTE RECEBIDO'+source,title:'Obrigado, @'+user+'!'+(quantity>1?' ×'+quantity:''),detail:gift+' · +'+points+' pontos · '+action+(powerLevel>1?' · poder nível '+powerLevel:''),voiceText:'Obrigado pelo presente, '+user+'! '+(quantity>1?'Você enviou '+quantity+' presentes. ':'')+'Vamos continuar a aventura!'};
 }
 if(event.type==='share')return {type:'share',icon:'📣',label:'LIVE COMPARTILHADA'+source,title:'Valeu por compartilhar, @'+user+'!',detail:'Mais gente pode chegar para participar. +'+points+(points===1?' ponto.':' pontos.'),voiceText:'Obrigado por compartilhar a LIVE, '+user+'!'};
 if(event.type==='like'&&event.battleTeam==='villain'){const n=Math.max(1,Number(event.count)||1);return {type:'like',icon:'⚔',label:'INIMIGOS A CAMINHO'+source,title:'@'+user+' criou '+n.toLocaleString('pt-BR')+' inimigo'+(n===1?'':'s')+'!',detail:'Entram em ondas, com a foto de quem os enviou.',voiceText:''};}
 if(event.type==='like'){
  const count=Math.max(1,Number(event.count)||1);
  return {type:'like',icon:'✨',label:'CURTIDAS'+source,title:'@'+user+' deixou '+count.toLocaleString('pt-BR')+' curtida'+(count===1?'':'s')+'!',detail:'Energia recebida no Omnitrix · +'+points+' pontos.',voiceText:''};
 }
 if(event.type==='comment')return {type:'comment',icon:'💬',label:'MENSAGEM'+source,title:'@'+user+' entrou na conversa',detail:String(event.text||'Mandou uma mensagem para o Ben.').replace(/[<>\x00-\x1f]/g,'').slice(0,160),voiceText:''};
 return {type:'event',icon:'⭐',label:'EVENTO'+source,title:'@'+user+' participou da LIVE',detail:'+'+points+' pontos.',voiceText:''};
}

export function rankPresentation(points){
 const levels=[
  {name:'Novato',minimum:0},
  {name:'Fã',minimum:25},
  {name:'Apoiador',minimum:100},
  {name:'Guardião',minimum:300},
  {name:'Lenda',minimum:750},
  {name:'Mítico',minimum:2000}
 ];
 const score=Math.max(0,Number(points)||0);
 let index=0;
 for(let i=1;i<levels.length;i++)if(score>=levels[i].minimum)index=i;
 const current=levels[index],next=levels[index+1];
 const progress=next?Math.round(Math.min(1,(score-current.minimum)/(next.minimum-current.minimum))*100):100;
 return {rankName:current.name,rankLevel:index+1,nextRank:next?.name||null,nextRankAt:next?.minimum||null,rankProgress:progress};
}
