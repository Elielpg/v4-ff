export const ENEMY_TYPES=Object.freeze([
 {id:'drone',name:'Drone Sombrio',hp:22,damage:5,height:1.2},
 {id:'mutant',name:'Mutante Tóxico',hp:38,damage:8,height:1.8},
 {id:'mage',name:'Mago Tecno',hp:30,damage:7,height:1.9},
 {id:'titan',name:'Titã de Ferro',hp:90,damage:14,height:2.3}
]);
export const TEAM_LABELS={hero:'Heróis',villain:'Vilões',neutral:'Visitante'};
const plain=text=>String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
export function battleCommand(text){
 const s=plain(text).replace(/^!\s*/,''),parts=s.split(/\s+/);
 if(['heroi','herois','hero'].includes(s))return {kind:'team',team:'hero'};
 if(['vilao','viloes','villain'].includes(parts[0])&&parts.length<=2){const aliases={drone:'drone',mutante:'mutant',mago:'mage',tita:'titan',titan:'titan'};return {kind:'team',team:'villain',enemy:aliases[parts[1]]||'drone'};}
 if(['dancar','danca','dance'].includes(s))return {kind:'dance',enabled:true};
 if(['parar danca','parar de dancar'].includes(s))return {kind:'dance',enabled:false};
 return null;
}
export function battleLevel(xp){xp=Math.max(0,Number(xp)||0);const level=1+Math.floor(Math.sqrt(xp/100));const floor=(level-1)**2*100,next=level**2*100;return {level,xp,current:xp-floor,required:next-floor,percent:Math.min(100,(xp-floor)/(next-floor)*100)};}
export function battleLine(kind,name='equipe',index=0,data={}){
 const lines={
  hero:[`${name}, você tá com os heróis! Esse Omnitrix acabou de ganhar reforço.`,`${name}, boa escolha! Seu TAP TAP dá energia pra gente enfrentar os vilões.`],
  villain:[`${name}, então você escolheu os vilões? Beleza! Espero que esses robôs saibam perder.`,`${name}, pode mandar seu exército. Eu tenho umas transformações pra testar!`],
  villainGift:[`${name}, recebi seu reforço dos vilões! Esse aí veio com cara de chefão.`,`${name}, valeu por participar da batalha! Agora deixa eu cuidar desses grandalhões.`],
  join:[`${name}, chegou na hora! Escreve HERÓI pra me ajudar ou VILÃO pra criar inimigos.`,`${name}, qual vai ser? Equipe dos heróis ou time dos vilões? Escolhe no chat!`],
  win:['Essa foi da equipe dos heróis! Vocês e o Omnitrix formam uma dupla e tanto.','Boa, equipe! Limpamos a clareira. Qual alien a gente testa na próxima?'],
  loss:['Tá bom, os vilões levaram essa. Mas a revanche já vai começar!','Meu plano tinha só um probleminha: esses vilões todos! Bora tentar de novo, equipe?'],
  level:[`Nível ${data.level}! O vô Max vai dizer que foi trabalho em equipe. E foi mesmo!`,`Nível ${data.level} na conta! Agora sim esse relógio vai trabalhar.`],
  ambient:['Heróis dão energia. Vilões criam inimigos. Quem vai mudar essa batalha?','Tem um monte de DNA no Omnitrix esperando pra ser liberado. Dá uma olhada nas silhuetas!','Quer entrar na minha equipe? Escreve HERÓI. Ou tenta a sorte com os vilões!','Pergunta qualquer coisa! Só não pede a receita do lanche do vô Max.']
 };const pool=lines[kind]||lines.ambient;return pool[index%pool.length];
}
