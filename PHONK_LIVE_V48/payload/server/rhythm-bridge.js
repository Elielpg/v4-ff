import {randomInt,randomBytes,timingSafeEqual} from 'node:crypto';
const failure=(message,status=400)=>Object.assign(Error(message),{status});
export class RhythmBridge{
 constructor({now=Date.now,onFrame=()=>{}}={}){this.now=now;this.onFrame=onFrame;this.token=null;this.code=null;this.expires=0;this.attempts=0;this.last=null;this.sequence=-1;this.window=0;this.framesInWindow=0;}
 createPairing(){this.code=String(randomInt(100000,1000000));this.expires=this.now()+120000;this.attempts=0;return {code:this.code,expires:this.expires};}
 pair(code){this.attempts++;if(!this.code||this.now()>this.expires||this.attempts>8||String(code)!==this.code)throw failure('Código inválido ou expirado. Gere outro no jogo.',403);this.token=randomBytes(32).toString('hex');this.code=null;this.sequence=-1;this.last=null;return {token:this.token,expiresInSeconds:0};}
 authorized(value){const t=String(value||'').replace(/^Bearer /,'');return !!this.token&&/^[a-f0-9]{64}$/.test(t)&&timingSafeEqual(Buffer.from(t),Buffer.from(this.token));}
 accept(data,authorization){
  if(!this.authorized(authorization))throw failure('Captador não pareado.',401);const now=this.now();
  if(now-this.window>=1000){this.window=now;this.framesInWindow=0;}if(++this.framesInWindow>60)throw failure('Sinal rápido demais.',429);
  if(!data||Object.keys(data).some(k=>!['energy','level','at','seq'].includes(k))||!Number.isFinite(data.energy)||data.energy<0||data.energy>2||!Number.isFinite(data.level)||data.level<0||data.level>2||!Number.isFinite(data.at)||now-data.at>3000||data.at-now>1000||!Number.isSafeInteger(data.seq)||data.seq<=this.sequence||data.seq>1e12)throw failure('Nível de áudio inválido ou atrasado.');
  this.sequence=data.seq;this.last={energy:data.energy,level:data.level,at:data.at,seq:data.seq,receivedAt:now,source:'android'};this.onFrame(this.last);return true;
 }
 status(){const fresh=this.last&&this.now()-this.last.receivedAt<2500;return {connected:!!fresh,signal:!!fresh&&this.last.level>.0005,lastFrameAt:this.last?.receivedAt||0,level:fresh?this.last.level:0,frames:this.sequence+1};}
 revoke(){this.token=null;this.code=null;this.last=null;this.sequence=-1;}
}
