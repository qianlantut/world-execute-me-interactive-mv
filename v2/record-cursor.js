// A visible, continuous cursor for recordings (URL ?record=1, or press M).
// The real pointer may jump between scripted positions; this one glides there on a
// critically damped spring, leaves a short comet trail, and ripples on every press.
let recordCursor=null;
function buildRecordCursor(){
 const params=new URLSearchParams(location.search);let on=params.has('record');
 const c=document.createElement('canvas');c.id='recordCursor';Object.assign(c.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'40'});$('#film').appendChild(c);const x=c.getContext('2d');
 const target={x:innerWidth/2,y:innerHeight/2},pos={x:innerWidth/2,y:innerHeight/2},vel={x:0,y:0};let down=false,trail=[],ripples=[],last=performance.now(),seen=false;
 addEventListener('pointermove',e=>{target.x=e.clientX;target.y=e.clientY;seen=true},{capture:true});
 addEventListener('pointerdown',e=>{target.x=e.clientX;target.y=e.clientY;down=true;seen=true;ripples.push({x:e.clientX,y:e.clientY,t:window.__recordClock??performance.now()})},{capture:true});
 addEventListener('pointerup',()=>{down=false},{capture:true});
 addEventListener('keydown',e=>{if(e.code==='KeyM'){on=!on}});
 function size(){const d=Math.min(2,devicePixelRatio||1);if(c.width!==Math.round(innerWidth*d)){c.width=Math.round(innerWidth*d);c.height=Math.round(innerHeight*d)}x.setTransform(d,0,0,d,0,0)}
 function draw(now){requestAnimationFrame(draw);const recClock=window.__recordClock;if(recClock!=null)now=recClock;document.body.classList.toggle('recording-cursor',on);if(!on||!seen){c.style.display='none';window.__recordCursorPos=null;return}c.style.display='block';size();
  const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;if(recClock!=null){pos.x=target.x;pos.y=target.y}else{const k=1400,damp=2*Math.sqrt(k);for(const a of ['x','y']){vel[a]+=(k*(target[a]-pos[a])-damp*vel[a])*dt;pos[a]+=vel[a]*dt}}
  window.__recordCursorPos={x:pos.x,y:pos.y};
  x.clearRect(0,0,innerWidth,innerHeight);
  // press ripple (one soft ring per press)
  ripples=ripples.filter(r=>now-r.t<520);x.save();for(const r of ripples){const a=(now-r.t)/520;x.globalAlpha=(1-a)*.8;x.strokeStyle='#ffffff';x.lineWidth=2.2*(1-a)+.6;x.beginPath();x.arc(r.x,r.y,8+a*30,0,Math.PI*2);x.stroke()}x.restore();
  // arrow pointer: white body, dark outline, soft shadow; pressed = slightly smaller, tilted, with a held dot at the tip
  const k=down?.86:1,tilt=down?-.08:0;x.save();x.translate(pos.x,pos.y);x.rotate(tilt);x.scale(k*1.15,k*1.15);
  if(down){x.fillStyle='rgba(255,255,255,.28)';x.beginPath();x.arc(0,0,10,0,Math.PI*2);x.fill()}
  x.shadowColor='rgba(0,0,0,.45)';x.shadowBlur=8;x.shadowOffsetY=2;x.beginPath();x.moveTo(0,0);x.lineTo(0,25);x.lineTo(6.2,19.4);x.lineTo(10.6,29.6);x.lineTo(15,27.6);x.lineTo(10.7,17.8);x.lineTo(18.6,17.8);x.closePath();
  x.fillStyle=down?'#e9ecf2':'#ffffff';x.fill();x.shadowColor='transparent';x.lineJoin='round';x.lineWidth=1.6;x.strokeStyle='#111318';x.stroke();x.restore();
 }
 requestAnimationFrame(draw);
 return {state:()=>({on,pos:{...pos},down})};
}
