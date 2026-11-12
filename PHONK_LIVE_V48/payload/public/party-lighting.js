const colors=['#bbff56','#a78bfa','#65e6ff','#ff7db8'];
export class PartyLighting{
 constructor(world){this.world=world;}
 draw(c,h){const w=this.world,d=w.danceFrame,s=w.partyConfig;if(!s?.enabled||!d?.musicActive)return;const intensity=s.lightStrength??.55;if(!intensity)return;const width=w.paperFX.width,height=w.paperFX.height,quiet=w.reducedMotion,pulse=quiet?.08:d.pulse,color=colors[Math.floor(d.beat/8)%colors.length];
  c.save();c.globalCompositeOperation='screen';
  const beams=w.quality==='economy'?1:2;
  for(let i=0;i<beams;i++){const origin=width*(i?.86:.14),sway=quiet?0:Math.sin(d.position*.25+i*2)*width*.15,target=width*(i?.62:.38)+sway;const gradient=c.createLinearGradient(origin,0,target,height*.82);gradient.addColorStop(0,color);gradient.addColorStop(1,'transparent');c.fillStyle=gradient;c.globalAlpha=intensity*(.04+pulse*.16);c.beginPath();c.moveTo(origin-12,0);c.lineTo(origin+12,0);c.lineTo(target+width*.24,height*.86);c.lineTo(target-width*.24,height*.86);c.closePath();c.fill();}
  c.globalAlpha=intensity*(.16+pulse*.3);c.strokeStyle=color;c.lineWidth=2+pulse*2;c.beginPath();c.ellipse(h.x,h.y+8,h.unit*(.65+pulse*.4),h.unit*.16,0,0,Math.PI*2);c.stroke();
  if(!quiet&&pulse>.45){c.globalAlpha=(pulse-.45)*intensity*.35;c.lineWidth=2;for(let i=0;i<6;i++){const x=(i%2?width:0),y=height*(.3+i*.08);c.beginPath();c.moveTo(x,y);c.lineTo(x+(i%2?-1:1)*width*.065,y-12);c.stroke();}}
  const duet=w.audienceView.state.duet,actor=duet&&w.audienceView.actors.get(duet.viewerId);if(actor){const p=w.paperFX.point(actor.actor.root.position);c.strokeStyle='#ff85bf';c.globalAlpha=.45*intensity+pulse*.2;c.lineWidth=3;c.beginPath();c.ellipse(p.x,p.y+5,h.unit*(.5+pulse*.2),h.unit*.13,0,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(h.x,h.y);c.quadraticCurveTo((h.x+p.x)/2,h.y-h.unit*.5,p.x,p.y);c.stroke();if(!quiet){c.font=Math.round(h.unit*.26)+'px sans-serif';c.fillStyle='#ff95ce';for(let i=0;i<3;i++)c.fillText('✿',(h.x+p.x)/2+Math.sin(d.position+i*2)*h.unit*.5,h.y-h.unit*(.5+i*.35)-pulse*8);}}
  c.restore();
 }
}
