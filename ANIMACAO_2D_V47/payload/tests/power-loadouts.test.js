import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FORM_IDS,POWER_LOADOUTS,powerAbility} from '../public/transformations.js';

test('cada forma mantém os três poderes e acrescenta um especial nomeados e selecionáveis',()=>{
 assert.deepEqual(Object.keys(POWER_LOADOUTS),FORM_IDS);
 for(const form of FORM_IDS){
  const choices=POWER_LOADOUTS[form];
  assert.equal(choices.length,4,form);
  assert.equal(new Set(choices.map(choice=>choice.id)).size,4,form);
  assert.equal(new Set(choices.map(choice=>choice.name)).size,4,form);
  for(let variant=0;variant<4;variant++)assert.equal(powerAbility(form,variant).id,choices[variant].id);
 }
 assert.equal(powerAbility('blaze',0).id,'fire-breath');
 assert.equal(powerAbility('blaze',1).id,'fireball');
 assert.equal(powerAbility('blaze',2).id,'flame-burst');
});
