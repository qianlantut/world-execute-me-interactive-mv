// Opening title: a chibi GPT girl hops in, pulling a balloon octopus on a rope; the octopus
// carries a clapperboard. They stop, the board claps, the title pops, the opening lines
// appear and a start button waits. Vector shapes, squash-and-stretch, dot eyes.
// Interactive on the cover; window.openingTitle.renderAt(t) gives deterministic frames for recording.
let openingTitle=null;
function buildOpeningTitle(){
 const cover=$('#cover');if(!cover)return null;
 const c=document.createElement('canvas');c.id='openingTitle';Object.assign(c.style,{position:'absolute',inset:'0',width:'100%',height:'100%',zIndex:'1'});cover.prepend(c);
 cover.classList.add('opening-title');const x=c.getContext('2d');
 const params=new URLSearchParams(location.search),bili=params.has('bili');
 const t0=performance.now();let fixedT=null,pointer={x:-999,y:-999},octoPoke=-9,girlPoke=-9,leaving=-1,hoverStart=false;
 const now=()=>fixedT??(window.__introClock!=null?window.__introClock:(performance.now()-t0)/1000);
 const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),sm=v=>{v=cl(v);return v*v*(3-2*v)},lerp=(a,b,u)=>a+(b-a)*u;
 const back=u=>{u=cl(u);const k=1.9;return 1+(k+1)*Math.pow(u-1,3)+k*Math.pow(u-1,2)};
 const elastic=u=>{u=cl(u);return u===0||u===1?u:Math.pow(2,-10*u)*Math.sin((u*10-.75)*2.0944)+1};
 // layout in a 1920×1080 frame, letterboxed into the window
 let S=1,OX=0,OY=0;function size(){const d=Math.min(2,devicePixelRatio||1),w=innerWidth,h=innerHeight;if(c.width!==Math.round(w*d)||c.height!==Math.round(h*d)){c.width=Math.round(w*d);c.height=Math.round(h*d)}S=Math.min(w/1920,h/1080);OX=(w-1920*S)/2;OY=(h-1080*S)/2;x.setTransform(d*S,0,0,d*S,d*OX,d*OY)}
 const toFrame=(px,py)=>({x:(px-OX)/S,y:(py-OY)/S}),CS=1.45,CX=520,CY=742,toChar=p=>({x:(p.x-CX)/CS+CX,y:(p.y-CY)/CS+CY});
 // ---- the octopus follows the girl's hand on a damped spring, sampled deterministically from t
 function walkX(t){return lerp(-300,600,sm((t-.3)/2.4))+(t>2.7?Math.sin((t-2.7)*1.7)*4:0)}
 function hop(t){if(t<.3||t>2.75)return 0;const ph=(t-.3)*4.2;return Math.abs(Math.sin(ph*Math.PI))}
 function octoAt(t){// critically damped follow of a moving anchor, integrated from 0 → t in fixed steps
  let px=-520,py=540,vx=0,vy=0;const dt=1/120,n=Math.floor(Math.max(0,t)/dt);for(let i=0;i<=n;i++){const tt=i*dt,ax=walkX(tt)-250,ay=500+Math.sin(tt*2.1)*14,k=38,c=2*Math.sqrt(k)*.62;vx+=(k*(ax-px)-c*vx)*dt;vy+=(k*(ay-py)-c*vy)*dt;px+=vx*dt;py+=vy*dt}
  return {x:px,y:py,vx,vy}}
 // ---- drawing helpers
 function eyes(ex,ey,gap,look,blink,r=6.5){const bx=cl(look.x,-1,1)*4,by=cl(look.y,-1,1)*3;x.fillStyle='#2e2547';for(const s of [-1,1]){x.beginPath();x.ellipse(ex+s*gap+bx,ey+by,r*.8,r*(1-blink*.88),0,0,TAU);x.fill()}x.fillStyle='#ffffff';for(const s of [-1,1]){if(blink<.5){x.beginPath();x.arc(ex+s*gap+bx-1.5,ey+by-2.5,1.8,0,TAU);x.fill()}}}
 function blush(bx,by,gap){x.fillStyle='rgba(255,140,170,.45)';for(const s of [-1,1]){x.beginPath();x.ellipse(bx+s*gap,by,11,6,0,0,TAU);x.fill()}}
 function girl(t,gx,gy,squash,lean,look,blink,wave,pullAngle){
  x.save();x.translate(gx,gy);x.rotate(lean);x.scale(1+squash*.2,1-squash*.22);
  // back hair
  const hg=x.createLinearGradient(0,-260,0,-40);hg.addColorStop(0,'#d9cdf7');hg.addColorStop(1,'#a996e3');x.fillStyle=hg;
  const sway=Math.sin(t*3.2)*6;x.beginPath();x.moveTo(-70,-215);x.bezierCurveTo(-118,-150,-104+sway,-70,-86+sway,-34);x.quadraticCurveTo(-40,-56,0,-60);x.quadraticCurveTo(40,-56,86+sway,-34);x.bezierCurveTo(104+sway,-70,118,-150,70,-215);x.closePath();x.fill();
  // dress
  const dg=x.createLinearGradient(0,-120,0,0);dg.addColorStop(0,'#ffffff');dg.addColorStop(1,'#e7e0fa');x.fillStyle=dg;x.beginPath();x.moveTo(-26,-118);x.lineTo(26,-118);x.quadraticCurveTo(56,-40,62,-8);x.quadraticCurveTo(0,6,-62,-8);x.quadraticCurveTo(-56,-40,-26,-118);x.fill();
  x.strokeStyle='#b7a6ea';x.lineWidth=4;x.beginPath();x.moveTo(-60,-12);x.quadraticCurveTo(0,1,60,-12);x.stroke();
  x.fillStyle='#8f7fd0';x.beginPath();x.moveTo(0,-112);x.lineTo(7,-98);x.lineTo(0,-84);x.lineTo(-7,-98);x.closePath();x.fill();
  // legs
  x.strokeStyle='#f6f0ff';x.lineWidth=11;x.lineCap='round';const st=Math.sin(t*8.4)*hop(t)*10;x.beginPath();x.moveTo(-14,-6);x.lineTo(-16-st,8);x.moveTo(14,-6);x.lineTo(16+st,8);x.stroke();
  // arms: the front arm holds the rope, the other waves
  x.strokeStyle='#fff3ee';x.lineWidth=10;x.beginPath();x.moveTo(-24,-104);const hx=-24+Math.cos(pullAngle)*52,hy=-104+Math.sin(pullAngle)*52;x.lineTo(hx,hy);x.stroke();
  x.strokeStyle='#3b3550';x.lineWidth=11;x.beginPath();x.moveTo(lerp(-24,hx,.55),lerp(-104,hy,.55));x.lineTo(hx,hy);x.stroke();
  const wa=-1.1-wave*.9+Math.sin(t*9)*wave*.35;x.strokeStyle='#fff3ee';x.lineWidth=10;x.beginPath();x.moveTo(24,-104);x.lineTo(24+Math.cos(wa)*48,-104+Math.sin(wa)*48);x.stroke();
  // head
  x.fillStyle='#fff0ea';x.beginPath();x.ellipse(0,-176,64,60,0,0,TAU);x.fill();
  // horns
  x.fillStyle='#efe9fb';x.strokeStyle='#b9a9e6';x.lineWidth=3;for(const s of [-1,1]){x.beginPath();x.moveTo(s*34,-222);x.bezierCurveTo(s*44,-262,s*80,-270,s*78,-240);x.bezierCurveTo(s*70,-252,s*54,-246,s*50,-220);x.closePath();x.fill();x.stroke()}
  // fringe
  x.fillStyle=hg;x.beginPath();x.moveTo(-68,-178);x.bezierCurveTo(-70,-246,70,-246,68,-178);x.quadraticCurveTo(52,-196,36,-188);x.quadraticCurveTo(18,-206,4,-190);x.quadraticCurveTo(-14,-206,-30,-188);x.quadraticCurveTo(-50,-200,-68,-178);x.fill();
  // hair knot ornament
  x.strokeStyle='#ffffff';x.lineWidth=4;x.beginPath();x.arc(44,-214,9,0,TAU);x.stroke();
  eyes(0,-166,22,look,blink);blush(0,-150,34);x.strokeStyle='#7a5a7a';x.lineWidth=2.4;x.beginPath();x.arc(0,-151,5,.25,Math.PI-.25);x.stroke();
  x.restore();return {hx:gx+(hx)*(1+squash*.2),hy:gy+(hy)*(1-squash*.22)};
 }
 function octopus(t,o,look,blink,poke,clap){
  const sp=Math.hypot(o.vx,o.vy),dir=Math.atan2(o.vy,o.vx),stretch=Math.min(.32,sp/1100),pk=Math.exp(-(t-poke)*5)*Math.sin((t-poke)*22)*(t>poke?1:0);
  x.save();x.translate(o.x,o.y);
  // tentacles (drawn first, wobbling behind the motion)
  x.strokeStyle='#f0a07f';x.lineCap='round';for(let i=0;i<5;i++){const bx=-36+i*18,w=Math.sin(t*5+i*1.3);x.lineWidth=12-Math.abs(i-2)*1.2;x.beginPath();x.moveTo(bx,30);x.quadraticCurveTo(bx+w*16-o.vx*.05,64,bx+w*26-o.vx*.09,90-Math.abs(i-2)*4+Math.abs(o.vy)*.02);x.stroke()}
  // the clapperboard held by two tentacles
  x.save();x.translate(46,40);x.rotate(-.18+Math.sin(t*2.3)*.05);x.fillStyle='#232036';x.beginPath();x.roundRect(-4,0,92,58,6);x.fill();x.fillStyle='#f6f2ff';x.font='700 11px Space';x.fillText('world.execute',4,30);x.fillText('(me);',4,46);
  const open=clap<0?.42:clap<.08?lerp(.42,0,clap/.08):0;x.save();x.translate(-4,0);x.rotate(-open);x.fillStyle='#232036';x.fillRect(0,-14,92,14);x.fillStyle='#ffffff';for(let k=0;k<5;k++){x.beginPath();x.moveTo(6+k*18,-14);x.lineTo(16+k*18,-14);x.lineTo(10+k*18,0);x.lineTo(0+k*18,0);x.closePath();x.fill()}x.restore();x.restore();
  // body: stretched along velocity, squashed by pokes
  x.save();x.rotate(dir);x.scale(1+stretch-pk*.12,1-stretch*.8+pk*.14);x.rotate(-dir);
  const bg=x.createRadialGradient(-18,-22,6,0,0,66);bg.addColorStop(0,'#ffd9c4');bg.addColorStop(.6,'#f5a985');bg.addColorStop(1,'#e48a68');x.fillStyle=bg;x.beginPath();x.ellipse(0,0,60,56,0,0,TAU);x.fill();
  x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.ellipse(-22,-26,14,8,-.6,0,TAU);x.fill();
  eyes(0,-2,18,look,blink,7);blush(0,14,30);x.strokeStyle='#8a4f40';x.lineWidth=2.4;x.beginPath();x.arc(0,12,4,.3,Math.PI-.3);x.stroke();x.restore();
  x.restore();
 }
 function rope(ax,ay,bx,by,t){const mx=(ax+bx)/2,my=Math.max(ay,by)+38+Math.sin(t*3)*5;x.strokeStyle='#ffe2a8';x.lineWidth=3;x.shadowColor='#ffd27a';x.shadowBlur=10;x.beginPath();x.moveTo(ax,ay);x.quadraticCurveTo(mx,my,bx,by);x.stroke();x.shadowBlur=0}
 const lines=()=>bili?['🎧  建议佩戴耳机，全屏观看','这是一支可以玩的 MV —— 点击、拖动、划过，歌词会回应你','B 站播放器内不能操作 · 交互版下载见简介里的 GitHub']:['🎧  建议佩戴耳机，全屏观看','这是一支可以玩的 MV —— 点击、拖动、划过，歌词会回应你','所有互动都不会暂停音乐 · 准备好了就开始'];
 let btn={x:1180,y:820,w:300,h:76};
 function frame(t){
  size();const W=1920,H=1080;x.clearRect(-OX/S,-OY/S,innerWidth/S,innerHeight/S);
  // background: deep night, soft bokeh, a ground of light
  const bg=x.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#090b1d');bg.addColorStop(1,'#141030');x.fillStyle=bg;x.fillRect(-OX/S,-OY/S,innerWidth/S,innerHeight/S);
  for(let i=0;i<26;i++){const bx=hash(i+1)*W,by=hash(i+9)*H*.75,r=6+hash(i+20)*22,a=.05+.06*Math.sin(t*.8+i);const g=x.createRadialGradient(bx,by,0,bx,by,r);g.addColorStop(0,`rgba(190,170,255,${a})`);g.addColorStop(1,'rgba(190,170,255,0)');x.fillStyle=g;x.fillRect(bx-r,by-r,r*2,r*2)}
  const gl=x.createLinearGradient(0,0,W,0);gl.addColorStop(0,'rgba(159,245,218,0)');gl.addColorStop(.4,'rgba(159,245,218,.5)');gl.addColorStop(1,'rgba(255,184,217,0)');x.strokeStyle=gl;x.lineWidth=2;x.beginPath();x.moveTo(0,742);x.lineTo(W*sm(t/1.2),742);x.stroke();
  const leave=leaving>=0?sm((t-leaving)/1.1):0;
  // girl
  const gxw=walkX(t)+leave*900,hp=hop(t),land=t>2.6&&t<3.1?Math.sin((t-2.6)/.5*Math.PI)*.55:0,bounceG=Math.exp(-(t-girlPoke)*6)*Math.sin((t-girlPoke)*18)*(t>girlPoke?1:0);
  const gy=740-hp*46-Math.max(0,bounceG)*40,squash=(t>.3&&t<2.75?(hp<.18?.75*(1-hp/.18):-.45*hp):0)+land*.8-bounceG*.5+Math.sin(t*2.4)*.035;
  const o=octoAt(t);o.x+=leave*900;o.y-=leave*120;
  const cp=toChar(pointer);const lookAt=(px,py)=>pointer.x>-900?{x:(cp.x-px)/200,y:(cp.y-py)/200}:{x:.6,y:.1};
  const blinkA=((t*.47)%1)>.965?1:0,blinkB=((t*.39+.3)%1)>.97?1:0;
  const pull=Math.atan2(o.y-(gy-104),o.x-(gxw-24));
  const clapT=t-3.1,wave=t>3.4?sm((t-3.4)/.4):0;
  x.save();x.translate(CX,CY);x.scale(CS,CS);x.translate(-CX,-CY);
  const hand=girl(t,gxw,gy,squash,(t<2.75?-.06:0)+Math.sin(t*1.7)*.015,lookAt(gxw,gy-166),blinkA,wave,pull);
  rope(hand.hx,hand.hy,o.x-8,o.y+38,t);
  octopus(t,o,lookAt(o.x,o.y),blinkB,octoPoke,clapT);
  // the clap: impact lines and a burst
  if(clapT>0&&clapT<.6){const k=clapT/.6,cx=o.x+90,cy=o.y+30;x.strokeStyle=`rgba(255,240,200,${1-k})`;x.lineWidth=4;for(let i=0;i<7;i++){const an=-1.9+i*.36,r1=40+k*40,r2=r1+22*(1-k);x.beginPath();x.moveTo(cx+Math.cos(an)*r1,cy+Math.sin(an)*r1);x.lineTo(cx+Math.cos(an)*r2,cy+Math.sin(an)*r2);x.stroke()}}
  x.restore();
  // title pops on the clap
  const tk=elastic((t-3.15)/.9),ta=sm((t-3.12)/.15)*(1-leave);if(ta>0){x.save();x.globalAlpha=ta;x.translate(1330,330);x.scale(.6+.4*tk,.6+.4*tk);x.textAlign='center';x.textBaseline='middle';x.font='700 96px Space';const tg=x.createLinearGradient(-380,0,380,0);tg.addColorStop(0,'#f4f1ff');tg.addColorStop(.6,'#ffffff');tg.addColorStop(1,'#c8b8ff');x.fillStyle=tg;x.shadowColor='rgba(180,160,255,.6)';x.shadowBlur=26;x.fillText('world.execute(me);',0,0);x.shadowBlur=0;x.font='500 30px Space, "Microsoft YaHei","Noto Sans CJK SC",sans-serif';x.fillStyle='#bfb3e6';x.fillText('制作：Astra  ×  Claude   ·   一支可以玩的 MV',0,78);x.restore()}
  // opening lines, staggered
  lines().forEach((s,i)=>{const k=sm((t-3.9-i*.42)/.45)*(1-leave);if(k<=0)return;x.save();x.globalAlpha=k;x.textAlign='left';x.font=`${i===0?'600 36px':'400 31px'} "Microsoft YaHei","PingFang SC","Noto Sans CJK SC","Noto Sans SC",sans-serif`;x.fillStyle=i===0?'#effff6':'#cfc8e8';x.fillText(s,1000+(1-k)*30,520+i*62);x.restore()});
  // start button
  const bk=back((t-5.3)/.5)*(1-leave);if(bk>0){const pulse=.5+.5*Math.sin(t*3.4),hov=hoverStart?1:0,ready=!$('#start')?.disabled;x.save();x.translate(btn.x+btn.w/2,btn.y+btn.h/2);x.scale(bk*(1+hov*.05),bk*(1+hov*.05));x.globalAlpha=Math.min(1,bk);
   x.shadowColor='#9ff5da';x.shadowBlur=18+pulse*16;x.fillStyle=ready?'rgba(20,48,52,.92)':'rgba(30,30,48,.9)';x.beginPath();x.roundRect(-btn.w/2,-btn.h/2,btn.w,btn.h,btn.h/2);x.fill();x.shadowBlur=0;x.strokeStyle=ready?'#bff7df':'#8a86a8';x.lineWidth=2.5;x.stroke();
   x.fillStyle='#ffffff';x.font='700 30px "Microsoft YaHei","PingFang SC","Noto Sans CJK SC",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(ready?'点击开始  ▸':'正在唤醒花园…',0,2);x.restore()}
 }
 function draw(){requestAnimationFrame(draw);if(cover.classList.contains('gone')&&!(leaving>=0&&now()-leaving<1.2)){c.style.display='none';return}c.style.display='block';frame(now())}
 // interaction on the cover
 cover.addEventListener('pointermove',e=>{const p=toFrame(e.clientX,e.clientY);pointer=p;hoverStart=p.x>btn.x&&p.x<btn.x+btn.w&&p.y>btn.y&&p.y<btn.y+btn.h;cover.style.cursor=hoverStart?'pointer':'default'});
 cover.addEventListener('pointerdown',e=>{const t=now(),p=toFrame(e.clientX,e.clientY),q=toChar(p),o=octoAt(t),gx=walkX(t);
  if(p.x>btn.x&&p.x<btn.x+btn.w&&p.y>btn.y&&p.y<btn.y+btn.h&&t>5.2){if(window.__introRecording){leaving=t;girlPoke=t;octoPoke=t;return}const s=$('#start');if(s&&!s.disabled){leaving=t;girlPoke=t;octoPoke=t;s.click()}return}
  if(Math.hypot(q.x-o.x,q.y-o.y)<80){octoPoke=t;return}if(Math.abs(q.x-gx)<80&&q.y>480&&q.y<760){girlPoke=t}});
 requestAnimationFrame(draw);
 return {renderAt(t){fixedT=t;frame(t)},release(){fixedT=null},button:()=>({...btn}),toScreen:(fx,fy)=>({x:OX+fx*S,y:OY+fy*S}),poke(which,t){if(which==='octo')octoPoke=t;else girlPoke=t},leave(t){leaving=t}};
}
