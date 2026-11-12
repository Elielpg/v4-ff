import {ALIEN_UNLOCKS} from './alien-unlock-catalog.js';
import {FORM_ICONS} from './classic-live-ui.js';
import {FORM_IDS} from './transformations.js';
const $=id=>document.getElementById(id),num=n=>Number(n).toLocaleString('pt-BR');
export class AlienUnlockUI{
 constructor({source=()=> 'demo'}={}){this.source=source;this.cache={};this.dirty=false;$('unlock-settings').addEventListener('input',()=>this.dirty=true);for(const a of ALIEN_UNLOCKS){const label=document.createElement('label');label.textContent=a.name;const input=document.createElement('input');input.type='number';input.min='1';input.max='10000000';input.required=true;input.value=a.likes;input.id='unlock-target-'+a.form;label.append(input);$('unlock-targets').append(label);}}
 sync(s,{configured=false}={}){if(!s)return;if(configured)this.dirty=false;this.cache[s.source]=s;if(s.source===this.source())this.render();}
 get state(){return this.cache[this.source()];}
 render(){const s=this.state;if(!s)return;const next=s.next;$('dna-icon').textContent=next?FORM_ICONS[FORM_IDS.indexOf(next.form)]:'◈';$('dna-next').textContent=!s.enabled?'MODO LIVRE':next?'LIBERAR '+next.name.toUpperCase():'OMNITRIX COMPLETO';$('dna-remaining').textContent=!s.enabled?'TODAS AS FORMAS':next?'FALTAM '+num(next.remaining)+' CURTIDAS':num(s.totalLikes)+' CURTIDAS';$('dna-meter').value=s.percent;$('dna-collection').dataset.source=s.source;$('dna-source').textContent=s.source==='tiktok'?'ENERGIA DA LIVE':'ENERGIA · DEMO';$('unlock-summary').textContent=(s.source==='tiktok'?'LIVE':'DEMO')+' · '+(!s.enabled?'modo livre · '+s.forms.length+' formas disponíveis · '+num(s.totalLikes)+' curtidas registradas.':num(s.totalLikes)+' curtidas acumuladas · '+s.forms.filter(a=>a.earned).length+'/10 DNAs liberados.');if(!this.dirty)$('unlocks-enabled').checked=s.enabled;
 for(const a of s.forms){const input=$('unlock-target-'+a.form);if(input&&!this.dirty&&document.activeElement!==input)input.value=a.required;}
 for(const button of document.querySelectorAll('#forms [data-form],#classic-forms [data-form]')){const a=s.forms.find(a=>a.form===button.dataset.form);button.disabled=!!a&&!a.unlocked;button.classList.toggle('dna-locked',!!a&&!a.unlocked);button.title=a&&!a.unlocked?a.name+' · faltam '+num(a.remaining)+' curtidas':a?.name||'Ben Tennyson';button.setAttribute('aria-label',button.title);}
 }
 settings(){return {enabled:$('unlocks-enabled').checked,targets:Object.fromEntries(ALIEN_UNLOCKS.map(a=>[a.form,Number($('unlock-target-'+a.form).value)]))};}
}
