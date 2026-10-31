// Lyric-local wave catching. No event listeners, sound, or playback control.
// Input coordinates use the existing 1024×640 lyric-object canvas.
function buildVibrationCatch({ctx:x,play}){
 const beat=60/130,flight=1.10,catchY=462,halfMouth=84,hitRadius=76,minX=160,maxX=864;
 const positions=[340,600,730,480,290,570,710,430];
 const clampV=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const easeV=v=>{v=clampV(v);return v*v*(3-2*v)};
 const mixV=(a,b,u)=>a+(b-a)*u;
 let active=false,epoch=null,start=104.33,end=110.07,lastTime=null,notes=[],effects=[],basket={x:512,y:catchY,vx:0,manualWeight:0},hits=0,misses=0,manualHits=0,visiblePackets=[];
 function reset(){active=false;epoch=null;lastTime=null;notes=[];effects=[];visiblePackets=[];hits=misses=manualHits=0;basket={x:512,y:catchY,vx:0,manualWeight:0};}
 function begin(q,t){reset();active=true;epoch=q.i??q.start??'vibrations';start=Number.isFinite(q.start)?q.start:t-(q.local??0);end=Number.isFinite(q.end)?q.end:start+3.94;
  for(let i=0;i<20;i++){const contact=start+flight+i*beat;if(contact>end-.45)break;notes.push({id:i,birth:contact-flight,contact,x:positions[i%positions.length],status:'falling',hitAt:null,manual:false,basketAtContact:null})}lastTime=start;basket.x=512;
 }
 function autoX(t){if(!notes.length)return 512;const first=notes[0];if(t<=first.contact)return mixV(512,first.x,easeV((t-start)/flight));for(let i=1;i<notes.length;i++){const a=notes[i-1],b=notes[i];if(t<=b.contact)return mixV(a.x,b.x,easeV((t-a.contact)/(b.contact-a.contact)))}const tail=notes[notes.length-1];return mixV(tail.x,512,easeV((t-tail.contact)/Math.max(.4,end-tail.contact)));}
 function controlledBasket(t){const supplied=play.value('basketX',null),at=play.value('basketAt',null),dragging=!!play.value('basketDragging',false),valid=Number.isFinite(supplied)&&Number.isFinite(at)&&at>=start-.01&&at<=t+.001;
  const weight=valid?(dragging?1:1-easeV((t-at-.12)/.53)):0;
  return{x:mixV(autoX(t),clampV(valid?supplied:512,minX,maxX),weight),weight};
 }
 function packetPosition(note,t){const p=(t-note.birth)/flight,travel=clampV(p,0,1.45),sway=Math.sin(travel*Math.PI*2+note.id*.7)*22*(1-clampV(travel));return{x:note.x+sway,y:88+(catchY-88)*Math.pow(travel,1.18),progress:p};}
 function update(q,t,visible){const eligible=visible&&q?.kind==='resonance'&&t>100;if(!eligible){if(active||notes.length)reset();return}const nextEpoch=q.i??q.start??'vibrations';if(!active||epoch!==nextEpoch||t<(lastTime??t)-.025)begin(q,t);
  const previousTime=lastTime,previousBasket=basket.x,dt=Math.max(0,t-previousTime),current=controlledBasket(t),v=dt>.00001&&dt<.25?(current.x-previousBasket)/dt:0;
  basket={x:current.x,y:catchY,vx:mixV(basket.vx,v,1-Math.exp(-Math.min(.1,dt)*22)),manualWeight:current.weight};
  for(const note of notes){if(note.status!=='falling'||note.contact>t)continue;
   // Resolve the crossing rather than testing one sampled frame's y position.
   // Normal playback interpolates the actual basket motion across the contact.
   const exact=controlledBasket(note.contact),fraction=dt>0?clampV((note.contact-previousTime)/dt):1,contactX=dt<=.20?mixV(previousBasket,current.x,fraction):exact.x,manual=dt<=.20?Math.max(basket.manualWeight,exact.weight)>.15:exact.weight>.15;
   note.basketAtContact=contactX;note.manual=manual;
   if(Math.abs(note.x-contactX)<=hitRadius){note.status='caught';note.hitAt=note.contact;hits++;if(manual)manualHits++;effects.push({id:note.id,t:note.contact,x:note.x,basketX:contactX,manual})}else{note.status='missed';misses++}
  }
  effects=effects.filter(e=>t-e.t<.74);lastTime=t;
  visiblePackets=notes.filter(n=>t>=n.birth&&n.status!=='caught'&&t<n.contact+.29).map(n=>({...packetPosition(n,t),id:n.id,status:n.status,birth:n.birth,contact:n.contact}));
 }
 function wave(cx,cy,width,amplitude,phase,color,opacity,lineWidth=2.2){x.strokeStyle=color;x.globalAlpha=opacity;x.lineWidth=lineWidth;x.beginPath();for(let j=0;j<=64;j++){const u=j/64,envelope=Math.sin(u*Math.PI)**1.2,xx=cx+(u-.5)*width,yy=cy+Math.sin(u*Math.PI*4+phase)*amplitude*envelope;j?x.lineTo(xx,yy):x.moveTo(xx,yy)}x.stroke()}
 function draw(kind,t,local,alpha=1){if(kind!=='resonance'||t<=100)return false;if(!active)return true;
  const entry=easeV(local/.22),exit=1-easeV((t-(end-.20))/.20),a=clampV(alpha)*entry*exit,mint='#d2f4e7',pink='#e7c9e1';x.save();x.lineCap='round';x.lineJoin='round';
  // Three packets at most occupy the flight corridor; each is a single wave.
  for(const packet of visiblePackets){const p=packet.progress,appear=easeV((t-packet.birth)/.14),gone=1-easeV((t-packet.contact)/.29),strength=a*appear*gone,color=packet.id%2?pink:mint;
   x.globalAlpha=strength*.22;x.strokeStyle=color;x.lineWidth=1;x.setLineDash([3,8]);x.beginPath();x.moveTo(packet.x,packet.y-38);x.lineTo(packet.x,packet.y-15);x.stroke();x.setLineDash([]);
   wave(packet.x,packet.y,108,15+Math.sin(p*6)*2,t*5+packet.id*.6,color,strength,5.2);
   x.globalAlpha=strength*.7;x.fillStyle='#e2f0e7';x.beginPath();x.arc(packet.x,packet.y,3.2,0,Math.PI*2);x.fill();
   // A tiny top gate closes behind the emitted packet, then disappears.
   const birthAge=t-packet.birth;if(birthAge<.32){const gate=easeV(birthAge/.10)*(1-easeV((birthAge-.12)/.20));x.globalAlpha=a*gate*.5;x.strokeStyle=color;x.lineWidth=1;x.beginPath();x.moveTo(packet.x-29,64);x.lineTo(packet.x-15,64);x.moveTo(packet.x+15,64);x.lineTo(packet.x+29,64);x.stroke()}
  }
  let compression=0,rebound=0;for(const e of effects){const age=t-e.t;compression+=Math.exp(-age*11)*Math.sin(Math.min(Math.PI,age*26));rebound+=Math.sin(age*23)*Math.exp(-age*8)}compression=clampV(compression,0,1.3);
  const lean=clampV(basket.vx/10000,-.085,.085),basketY=catchY+compression*4-rebound*2;
  x.save();x.translate(basket.x,basketY);x.rotate(lean);x.scale(1+compression*.055,1-compression*.18);
  // A shallow wire basket has an open mouth and a springy curved base.
  x.globalAlpha=a*.92;x.strokeStyle=mint;x.lineWidth=4;x.beginPath();x.moveTo(-halfMouth,-3);x.lineTo(-66,37);x.quadraticCurveTo(-61,48,-46,49);x.lineTo(46,49);x.quadraticCurveTo(61,48,66,37);x.lineTo(halfMouth,-3);x.stroke();
  x.globalAlpha=a*.47;x.lineWidth=2.2;for(const u of [-.65,-.32,0,.32,.65]){x.beginPath();x.moveTo(u*halfMouth,4);x.lineTo(u*59,45);x.stroke()}x.beginPath();x.moveTo(-75,18);x.quadraticCurveTo(0,31,75,18);x.moveTo(-69,33);x.quadraticCurveTo(0,45,69,33);x.stroke();
  x.globalAlpha=a;x.strokeStyle=basket.manualWeight>.15?pink:'#d0e9df';x.lineWidth=5;x.beginPath();x.moveTo(-halfMouth,0);x.quadraticCurveTo(0,7,halfMouth,0);x.stroke();
  for(const side of [-1,1]){x.globalAlpha=a*.7;x.strokeStyle=pink;x.lineWidth=1.2;x.beginPath();x.moveTo(side*(halfMouth+6),-7);x.lineTo(side*(halfMouth+12),-7);x.lineTo(side*(halfMouth+12),7);x.stroke()}
  x.restore();
  // A catch folds the packet into the basket, then spreads it along the rim.
  // The flash stays local: no fullscreen tint and no concentric ripple stack.
  for(const e of effects){const age=t-e.t,p=clampV(age/.68),settle=easeV(age/.12),origin=basket.x+(e.x-e.basketX)*(1-settle),spread=48+140*easeV(p),amp=(18*Math.sin(Math.min(1,p*3)*Math.PI*.5))*Math.exp(-p*3.4),op=a*(1-easeV(p));
   x.shadowColor=e.id%2?pink:mint;x.shadowBlur=age<.12?10:3;wave(origin,basketY+4+Math.sin(age*18)*3,spread,amp,age*24,e.id%2?pink:'#e0f5e9',op,4.5);x.shadowBlur=0;
   x.globalAlpha=op*.7;x.strokeStyle=e.id%2?pink:mint;x.lineWidth=1.3;
   for(let j=0;j<4;j++){const side=j%2?1:-1,travel=age*(45+j*13),px=origin+side*(19+travel),py=basketY-5-age*(62+j*7)+age*age*68;x.beginPath();x.moveTo(px,py);x.lineTo(px+side*5,py-4);x.stroke()}
  }
  x.restore();return true;
 }
 function state(){return{active,start,end,epoch,flight,beat,catchY,hits,misses,manualHits,basket:{...basket,hitRadius,halfMouth,minX,maxX,automatic:basket.manualWeight<=.15,autoX:active?autoX(lastTime??start):512,mode:basket.manualWeight>.15?'manual':'automatic'},notes:notes.map(n=>{const p=n.status==='caught'?{x:n.x,y:catchY}:packetPosition(n,lastTime??start);return{...n,landingX:n.x,x:p.x,y:p.y,visible:(lastTime??start)>=n.birth&&n.status!=='caught'&&(lastTime??start)<n.contact+.29,phase:(lastTime??start)<n.birth?'queued':n.status}}),packets:visiblePackets.map(p=>({...p})),effects:effects.map(e=>({...e})),hitBounds:{left:basket.x-hitRadius,right:basket.x+hitRadius,y:catchY},inputBounds:{left:150,right:874,top:400,bottom:590},returnToAutoAfter:.65};}
 return{update,draw,reset,state};
}
