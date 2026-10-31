// Finale: after the last note is judged, the flower's own vein tips and her body release
// a few points of light that drift into one seed; the title settles in quietly.
let cinemaLayer=null;
function buildCinema(){
 const c=document.createElement('canvas');c.id='cinema';Object.assign(c.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'4'});
 $('#film').insertBefore(c,$('#cinemaText'));const x=c.getContext('2d');
 const now=()=>preview??audio.currentTime,T0=206.9;let sources=null,capturedAt=null;
 function size(){const d=Math.min(2,devicePixelRatio||1);if(c.width!==Math.round(innerWidth*d)){c.width=Math.round(innerWidth*d);c.height=Math.round(innerHeight*d)}x.setTransform(d,0,0,d,0,0)}
 function soft(px,py,r,rgb,a){const g=x.createRadialGradient(px,py,0,px,py,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);x.fillStyle=g;x.fillRect(px-r,py-r,r*2,r*2)}
 function capture(W,H){// starting points: the flower's vein tips and her silhouette, where they actually are
  const st=typeof screenCurtain!=='undefined'?screenCurtain?.state().movie:null,pts=[];
  (st?.tips||[]).forEach(p=>{if(Number.isFinite(p[0]))pts.push([(p[0]*.5+.5)*W,(.5-p[1]*.5)*H])});
  const ac=st?.actorCenter;const ax=ac&&Number.isFinite(ac[0])?(ac[0]*.5+.5)*W:W*.55,ay=ac&&Number.isFinite(ac[1])?(.5-ac[1]*.5)*H:H*.45;
  for(let i=0;i<22;i++){const a=hash(i+40)*Math.PI*2,r=Math.min(W,H)*(.05+hash(i+70)*.16);pts.push([ax+Math.cos(a)*r*1.6,ay+Math.sin(a)*r])}
  return pts;}
 function finale(t,W,H){const a=t-T0,m=Math.min(W,H),cx=W*.5,cy=H*.44;
  if(!sources||t<capturedAt-.05){sources=capture(W,H);capturedAt=t}
  x.fillStyle=`rgba(5,7,18,${.9*smooth(a/1.1)})`;x.fillRect(0,0,W,H);
  x.save();x.globalCompositeOperation='lighter';
  sources.forEach(([sx,sy],i)=>{const u=smooth((a-.1-hash(i+5)*.6)/1.9);if(u>=1)return;const bend=(hash(i+9)-.5)*m*.25,mx=(sx+cx)/2+bend,my=(sy+cy)/2-m*.08,px=(1-u)*(1-u)*sx+2*(1-u)*u*mx+u*u*cx,py=(1-u)*(1-u)*sy+2*(1-u)*u*my+u*u*cy;
   for(let k=1;k<6;k++){const v=Math.max(0,u-k*.025),qx=(1-v)*(1-v)*sx+2*(1-v)*v*mx+v*v*cx,qy=(1-v)*(1-v)*sy+2*(1-v)*v*my+v*v*cy;soft(qx,qy,5-k*.6,'205,195,255',.18*(1-k/6))}
   soft(px,py,7,'235,230,255',.75*(1-u*.3))});
  const seed=smooth((a-1.2)/1.2),beat=.5+.5*Math.sin(a*Math.PI*2*130/120);
  soft(cx,cy,m*.13,'170,155,255',.18*seed);soft(cx,cy,m*(.025+.006*beat),'255,250,255',.85*seed);
  const ring=a-1.6;if(ring>0&&ring<2.4){const k=ring/2.4;x.globalAlpha=(1-k)*.35;x.strokeStyle='#d9d0ff';x.lineWidth=1;x.beginPath();x.arc(cx,cy,m*(.04+k*.32),0,Math.PI*2);x.stroke()}
  x.restore();
  // quiet typography
  const word='EXECUTION',sz=Math.round(m*.052);x.save();x.textAlign='center';x.textBaseline='middle';x.font=`300 ${sz}px Space`;const track=sz*.55,widths=[...word].map(ch=>x.measureText(ch).width),total=widths.reduce((q,w)=>q+w,0)+track*(word.length-1);let run=cx-total/2;const ty=cy+m*.2;
  [...word].forEach((ch,i)=>{const px=run+widths[i]/2;run+=widths[i]+track;const k=smooth((a-1.6-i*.07)/.7);if(k<=0)return;x.globalAlpha=k*.95;x.shadowColor='rgba(200,185,255,.6)';x.shadowBlur=10;x.fillStyle='#f4f1ff';x.fillText(ch,px,ty+(1-k)*8)});
  x.shadowBlur=0;const ln=smooth((a-2.3)/1);x.globalAlpha=ln*.6;x.fillStyle='#bfb3e6';x.fillRect(cx-total/2*ln,ty+sz*.8,total*ln,1);
  x.globalAlpha=smooth((a-2.6)/.8)*.85;x.font=`400 ${Math.round(m*.02)}px Space`;x.fillStyle='#cfd6e6';x.fillText('world.execute(me);',cx,ty+sz*1.35);
  x.globalAlpha=smooth((a-3.2)/.9)*.7;x.font=`400 ${Math.round(m*.0145)}px GardenText`;x.fillStyle='#9aa3b8';x.fillText('音乐 Mili  ·  形象设计参考 ZipZipPipe  ·  鲸鱼娘早期形象 上善无形  ·  Astra × Claude',cx,ty+sz*1.95);
  x.restore();
  const out=smooth((t-211.7)/.6);if(out>0){x.fillStyle=`rgba(5,7,18,${out})`;x.fillRect(0,0,W,H)}
 }
 function draw(){requestAnimationFrame(draw);const t=now();const on=(started||preview!==null)&&t>=T0;if(!on){c.style.display='none';sources=null;return}c.style.display='block';size();const W=innerWidth,H=innerHeight;x.clearRect(0,0,W,H);finale(t,W,H)}
 requestAnimationFrame(draw);
 return {active:()=>now()>=T0};
}
