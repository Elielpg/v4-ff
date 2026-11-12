import {partySettings} from './party-settings.js';
const el=(t,s)=>{const n=document.createElement(t);if(s)n.textContent=s;return n;};
const button=(text,fn)=>{const b=el('button',text);b.type='button';b.onclick=fn;return b;};
export class PartyControls{
 constructor(media){this.media=media;this.settings=partySettings();const root=el('details'),summary=el('summary','PHONK · câmera, luzes e aliens');root.id='party-controls';root.open=true;root.append(summary);this.inputs={};
  for(const [key,label] of [['enabled','Modo festa'],['quietSpeech','Falar só com quem perguntar ou chamar o Ben'],['autoTransform','Trocar aliens automaticamente'],['beatCamera','Câmera na batida'],['arrivalCamera','Destacar visitantes e duplas']]){const l=el('label',' '+label),i=el('input');i.type='checkbox';i.id='party-'+key;i.onchange=()=>this.save({[key]:i.checked});l.prepend(i);root.append(l);this.inputs[key]=i;}
  const l=el('label','Trocar alien a cada'),select=el('select');select.id='party-transform-beats';for(const n of [16,32,64]){const o=el('option',n+' batidas');o.value=n;select.append(o);}select.onchange=()=>this.save({transformBeats:Number(select.value)});l.append(select);root.append(l);this.inputs.transformBeats=select;
  const light=el('label','Intensidade das luzes'),range=el('input');range.type='range';range.id='party-light';range.min=0;range.max=1;range.step=.05;range.onchange=()=>this.save({lightStrength:Number(range.value)});light.append(range);root.append(light);this.inputs.lightStrength=range;
  root.append(el('p','Rosa = dançar ao lado do Ben. Os dez aliens disponíveis estão livres; perguntas e comandos continuam tendo prioridade. O Omnitrix mantém o tempo e a recarga.'));media.root.append(root);this.root=root;
  const capture=el('details');capture.id='external-capture-controls';capture.open=true;capture.append(el('summary','Captar música de outro app · fone/Bluetooth'));
  const download=el('a','Baixar captador Android');download.href='/downloads/BATIDA_OMNITRIX_V48.apk';download.download='BATIDA_OMNITRIX_V48.apk';capture.append(download);
  capture.append(el('p','Instale o captador, gere o código aqui e digite nele. No captador, use primeiro o modo padrão sem nova captura de tela. Permita o áudio, toque a música e volte ao jogo. Só os níveis da batida chegam ao Termux.'));
  this.code=el('output');this.code.id='rhythm-pair-code';capture.append(button('Gerar código de conexão',async()=>{try{const r=await media.request('rhythm/code',{});this.code.textContent=r.code+' · vale por 2 minutos';media.input.useAndroid();}catch(e){media.notify(e.message);}}),this.code);
  capture.append(button('Desconectar captador',async()=>{try{await media.request('rhythm/revoke',{});media.input.stop();this.code.textContent='Desconectado';}catch(e){media.notify(e.message);}}));
  if(navigator.mediaDevices?.getDisplayMedia)capture.append(button('Compartilhar áudio pelo navegador',()=>media.input.start('screen').catch(e=>media.notify(e.message))));
  capture.append(button('Ouvir caixa/alto-falante pelo microfone',()=>media.input.start('microphone').catch(e=>media.notify(e.message))),button('Parar escuta do navegador',()=>media.input.stop()));
  capture.append(el('p','O microfone serve para caixa de som ou alto-falante, com sua permissão. Ele não ouve música dentro de um fone. A saída de áudio precisa estar disponível ao captador; alguns aparelhos/Bluetooth não a oferecem. A captura compartilhada avançada pode disputar a captura de tela da LIVE. Silêncio não conta como batida detectada.'));
  media.root.insertBefore(capture,media.root.children[1]);this.capture=capture;
 }
 sync(config){this.settings=partySettings(config.party||{});this.media.world.partyConfig=this.settings;for(const [k,i] of Object.entries(this.inputs))if(document.activeElement!==i){if(i.type==='checkbox')i.checked=this.settings[k];else i.value=this.settings[k];}}
 async save(patch){try{this.sync(await this.media.request('config',{party:{...this.settings,...patch}}));}catch(e){this.media.notify(e.message);this.sync({party:this.settings});}}
}
