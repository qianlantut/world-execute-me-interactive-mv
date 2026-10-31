// "And then do whatever": for a few seconds the whole screen is yours.
// Drag to paint ribbons of light, tap to scatter petals and stars. If nobody plays,
// an automatic brush writes a flourish so the moment still reads on video.
let whateverLayer=null;
function buildWhatever(){
 const A=91.95,B=93.8,c=document.createElement('canvas');c.id='whatever';Object.assign(c.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'4'});
 $('#film').insertBefore(c,$('#cinemaText'));const x=c.getContext('2d');let strokes=[],bursts=[],cur=null,lastT=-1,hintShown=false;
 const palette=['#9ff5da','#c8b8ff','#ffb8cf','#ffe3a6','#a6d8ff'];
 function size(){const d=Math.min(2,devicePixelRatio||1);if(c.width!==Math.round(innerWidth*d)){c.width=Math.round(innerWidth*d);c.height=Math.round(innerHeight*d)}x.setTransform(d,0,0,d,0,0)}
 const now=()=>preview??audio.currentTime,inside=t=>t>=A&&t<B;
 function down(e){const t=now();if(!inside(t)||e.button!==0||e.mvObjectHandled)return;cur={pts:[{x:e.clientX,y:e.clientY,t}],col:palette[strokes.length%palette.length]};strokes.push(cur);strokes=strokes.filter(s=>s===cur||t-s.pts[s.pts.length-1].t<2.4);bursts.push({x:e.clientX,y:e.clientY,t,seed:Math.random()*1e3})}
 function move(e){if(!cur)return;const t=now();cur.pts.push({x:e.clientX,y:e.clientY,t});if(cur.pts.length%9===0)bursts.push({x:e.clientX,y:e.clientY,t,seed:Math.random()*1e3,small:true})}
 const up=()=>{cur=null};
 const stage=$('#stage');stage.addEventListener('pointerdown',down);addEventListener('pointermove',move);addEventListener('pointerup',up);
 function autoBrush(t){// a lemniscate signature written across the screen when the viewer is passive
  const pts=[];for(let k=0;k<=60;k++){const u=k/60,tt=A+.3+u*2.8;if(tt>t)break;const a=u*Math.PI*2.2;pts.push({x:innerWidth*(.5+.32*Math.sin(a)/(1+Math.cos(a)**2)),y:innerHeight*(.46+.2*Math.sin(a)*Math.cos(a)/(1+Math.cos(a)**2)),t:tt})}return {pts,col:'#c8b8ff'}}
 function draw(){requestAnimationFrame(draw);const t=now();if(!started&&preview===null){c.style.display='none';return}
  if(t<lastT-.05||!inside(t)&&t>B+1.2){strokes=[];bursts=[]}lastT=t;const fadeAll=1-smooth((t-B)/1.1);
  if(t<A-.2||fadeAll<=0){c.style.display='none';return}c.style.display='block';size();x.clearRect(0,0,innerWidth,innerHeight);
  const live=strokes.filter(s=>s.pts.length>1&&t-s.pts[s.pts.length-1].t<2.4);const list=live.length?live:[autoBrush(t)];
  x.save();x.globalCompositeOperation='screen';x.lineCap='round';x.lineJoin='round';
  for(const s of list){const p=s.pts;if(p.length<2)continue;
   // glow and core are drawn as continuous chunks (no bead artifacts at the joints)
   for(let i0=0;i0<p.length-1;i0+=6){const i1=Math.min(p.length-1,i0+7),age=t-p[i1].t;if(age<0)continue;const life=Math.max(0,1-age/2.4)*fadeAll;if(life<=0)continue;
    x.beginPath();x.moveTo(p[i0].x,p[i0].y);for(let i=i0+1;i<=i1;i++)x.lineTo(p[i].x,p[i].y);
    x.globalAlpha=life*.22;x.strokeStyle=s.col;x.lineWidth=26;x.stroke();x.globalAlpha=life*.45;x.lineWidth=10;x.stroke();x.globalAlpha=life;x.strokeStyle='#ffffff';x.lineWidth=3;x.stroke()}}
  for(const b of bursts){const a=t-b.t;if(a<0||a>1.6)continue;const n=b.small?6:18,life=(1-a/1.6)*fadeAll;for(let k=0;k<n;k++){const r=hash(b.seed+k),ang=k/n*Math.PI*2+r,sp=(b.small?60:160)+r*140,px=b.x+Math.cos(ang)*sp*a,py=b.y+Math.sin(ang)*sp*a+80*a*a,col=palette[(k+Math.floor(b.seed))%5],s=(b.small?3:5)+r*5;
    x.globalAlpha=life;x.fillStyle=col;x.save();x.translate(px,py);x.rotate(a*3+k);if(k%3===0){x.beginPath();for(let q=0;q<5;q++){const aa=q*Math.PI*2/5;x.lineTo(Math.cos(aa)*s*1.6,Math.sin(aa)*s*1.6);x.lineTo(Math.cos(aa+.63)*s*.6,Math.sin(aa+.63)*s*.6)}x.fill()}else{x.beginPath();x.ellipse(0,0,s*1.6,s*.6,0,0,Math.PI*2);x.fill()}x.restore()}}
  x.restore();
  const hk=smooth((t-A)/.3)*(1-smooth((t-(B-.6))/.5));if(hk>0){x.save();x.globalAlpha=hk*.85;x.textAlign='center';x.font='600 22px GardenText';x.fillStyle='#effff6';x.shadowColor='#9ff5da';x.shadowBlur=18;x.fillText('随 心 所 欲 —— 在空白处拖动涂画 · 点击绽放',innerWidth/2,innerHeight*.86);x.restore()}
 }
 requestAnimationFrame(draw);
 return {state:()=>({strokes:strokes.length,bursts:bursts.length})};
}
