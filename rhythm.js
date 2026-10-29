// A moving musical score drawn inside the film. Pointer hits only add light;
// neither its misses nor its successes ever change the song or its timeline.
// Logos: Lobe Icons 1.101.0 (MIT); see assets/LOGOS-LICENSE.txt.
async function buildRhythmGame(){
 const PRELUDE=15,PRELUDE_END=29.56,START=135,CHOICE=158.78,RELEASE=161.55,END=207,LOVE_START=177.17,LOVE_END=193.31,WINDOW=.175,APPROACH=1.42;
 const brands=['deepseek','claude','openai'],names=['DeepSeek','Claude','GPT'],colors=['#79b8ff','#edb08c','#bce6d5'];
 // Crossovers follow the outgoing and incoming guest portraits, not note lanes.
 function brandAt(t){return t<135?2:t<141?0:t<147.7?1:2}
 async function logo(name,i){const src=ASSETS.logos?.[name];if(!src)throw new Error('Missing rhythm logo: '+name);let svg=src.includes(';base64,')?atob(src.split(',')[1]):decodeURIComponent(src.slice(src.indexOf(',')+1));svg=svg.replaceAll('currentColor',colors[i]).replaceAll('width="1em"','width="512"').replaceAll('height="1em"','height="512"');return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Could not load rhythm logo: '+name));img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)});}
 const icons=await Promise.all(brands.map(logo)),c=document.createElement('canvas'),x=c.getContext('2d'),tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;
 const mesh=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false}));mesh.renderOrder=36;mesh.frustumCulled=false;mesh.visible=false;scene.add(mesh);
 const notes=[],strongTimes=[161.55,165.23,168.98,172.73,205.85],lanePattern=[-.56,.20,.58,-.22,-.60,.48,.02,.62,-.38,.28,.58,-.58];
 function add(t,force=false){if(t>=END-.25||notes.some(n=>Math.abs(n.t-t)<.10))return;const id=notes.length;notes.push({id,lane:id%4,u:lanePattern[id%lanePattern.length],t,brand:brandAt(t),strong:force,status:'pending',hitAt:null,error:null});}
 for(let t=17;t<29.45;t+=BEAT)add(t);
 let k=Math.ceil((START+.65-AUDIO_DATA.offset)/(BEAT*2));while(AUDIO_DATA.offset+k*BEAT*2<CHOICE-.28)add(AUDIO_DATA.offset+k++*BEAT*2);
 for(let t=RELEASE;t<LOVE_START;t+=BEAT)add(t,strongTimes.some(s=>Math.abs(s-t)<.1));
 // The learning/love verse keeps the execution section's beat grid and density.
 const loveFirst=RELEASE+Math.ceil((LOVE_START-RELEASE)/BEAT)*BEAT;
 for(let t=loveFirst;t<LOVE_END;t+=BEAT)add(t);
 for(let t=193.73;t<205.5;t+=BEAT*4)add(t);
 for(let t=205.85;t<END-.25;t+=BEAT)add(t,t===205.85);
 strongTimes.forEach(t=>add(t,true));notes.sort((a,b)=>a.t-b.t);notes.forEach((n,i)=>n.id=i);
 const segmentDefinitions=[{id:'opening',start:PRELUDE,end:PRELUDE_END},{id:'interlude',start:START,end:CHOICE},{id:'afterworld',start:RELEASE,end:END}];
 const segmentStats={};let scoreLayout=null;
 for(const n of notes)n.segment=n.t<PRELUDE_END?'opening':n.t<CHOICE?'interlude':'afterworld';
 function resetScores(){for(const d of segmentDefinitions)segmentStats[d.id]={...d,total:notes.filter(n=>n.segment===d.id).length,hits:0,misses:0,skipped:0,combo:0,maxCombo:0,fullCombo:false,fullComboAt:null,lastHitAt:null,lastMissAt:null};scoreLayout=null;}
 resetScores();
 function segmentAt(t){return t>=PRELUDE&&t<PRELUDE_END?'opening':t>=START&&t<CHOICE?'interlude':t>=CHOICE&&t<END&&released(t)?'afterworld':null;}
 function recordHit(n,t){const s=segmentStats[n.segment];s.hits++;s.combo++;s.maxCombo=Math.max(s.maxCombo,s.combo);s.lastHitAt=t;
  // No automatic arrivals or seek-skipped notes contribute to a full combo.
  // The complete segment must have received a successful tap on every note.
  if(s.hits===s.total&&s.misses===0&&s.skipped===0&&notes.filter(q=>q.segment===s.id).every(q=>q.status==='hit')){s.fullCombo=true;s.fullComboAt=t;}
 }
 function recordMiss(n,t,skipped){const s=segmentStats[n.segment];if(skipped)s.skipped++;else s.misses++;s.combo=0;s.lastMissAt=t;}
 const preludeNotes=notes.filter(n=>n.t<PRELUDE_END);
 function preludeProgress(t){if(t>=PRELUDE_END)return 1;return preludeNotes.reduce((sum,n)=>sum+smooth((t-n.t)/.12),0)/preludeNotes.length;}
 let lastT=null,lastTap=-100,hits=0,misses=0,active=false,phase='off',gleams=[],nearMiss=null,hover=null,latestHit=null,canvasScale=1;
 function reset(){notes.forEach(n=>{n.status='pending';n.hitAt=null;n.error=null});resetScores();hits=misses=0;gleams=[];nearMiss=null;hover=null;latestHit=null;lastT=null;lastTap=-100;active=false;phase='off';mesh.visible=false;}
 function released(t){const at=typeof screenCurtain!=='undefined'?screenCurtain?.state().revealedAt:null;return t>=RELEASE||(at!=null&&t>=at)}
 function isActive(t){return (t>=PRELUDE&&t<PRELUDE_END)||(t>=START&&t<CHOICE)||(t>=CHOICE&&t<END&&released(t))}
 function layout(){const d=6.35,hh=2*d*Math.tan(camera.fov*Math.PI/360),ww=hh*camera.aspect;const w=Math.min(1600,Math.round(innerWidth*1.25)),h=Math.round(w*innerHeight/innerWidth);if(c.width!==w||c.height!==h){tex.dispose();c.width=w;c.height=h;tex.needsUpdate=true}canvasScale=w/innerWidth;mesh.position.copy(new T.Vector3(0,0,-d).applyQuaternion(camera.quaternion).add(camera.position));mesh.quaternion.copy(camera.quaternion);mesh.scale.set(ww,hh,1);mesh.updateWorldMatrix(true,false);return {mobile:innerWidth/innerHeight<.9,w:innerWidth,h:innerHeight};}
 const lineTurns=[[158.78,0],[161.55,0],[163.5,-.58],[165.23,-1.48],[167.2,-.15],[168.98,.64],[170.8,1.48],[172.73,.24],[175.5,-.42],[178,.12]];
 function lineAt(t){const mobile=innerWidth/innerHeight<.9,w=innerWidth,h=innerHeight,u=t-135,execution=windowAt(t,160.7,176.7,.8),outro=smooth((t-193.3)/8);let angle=(mobile?.20:.24)*Math.sin(u*.59)+.075*Math.sin(u*.21);if(t>=158.78&&t<178){let j=0;while(j<lineTurns.length-2&&t>=lineTurns[j+1][0])j++;const a=lineTurns[j],b=lineTurns[j+1],tilt=mix(a[1],b[1],smooth((t-a[0])/(b[0]-a[0])));angle=mix(angle,tilt,windowAt(t,158.78,177.2,.6));}let cx=w*(.50+.036*Math.sin(u*.41)),cy=h*(mobile?.60:.72)+h*(mobile?.055:.055)*Math.sin(u*.38);cy=mix(cy,h*(mobile?.57:.58)+h*.025*Math.sin((t-RELEASE)*1.3),execution);cx+=w*.012*Math.sin(t*1.8)*execution;cy+=h*outro*.06;const tx=Math.cos(angle),ty=Math.sin(angle),margin=mobile?28:55,len=Math.min(w*.76,2*(Math.min(cx,w-cx)-margin)/Math.max(.01,Math.abs(tx)),2*(Math.min(cy,h-cy)-margin)/Math.max(.01,Math.abs(ty)));return {x:cx,y:cy,length:len,angle,tx,ty,nx:-ty,ny:tx,mobile};}
 function approachTime(t){return t>=PRELUDE&&t<PRELUDE_END?2:APPROACH}
 function pointAt(n,t,fall=false){const l=lineAt(t),delta=fall?Math.max(-.09,n.t-t)/approachTime(t):0,px=l.x+l.tx*n.u*l.length*.5,py=l.y+l.ty*n.u*l.length*.5;let travel=Math.min(innerHeight*.47,innerWidth*.5);if(n.t<PRELUDE_END){const vx=-l.nx,vy=-l.ny,edges=[];if(vx>.001)edges.push((innerWidth+70-px)/vx);if(vx<-.001)edges.push((-70-px)/vx);if(vy>.001)edges.push((innerHeight+70-py)/vy);if(vy<-.001)edges.push((-70-py)/vy);travel=Math.min(...edges.filter(d=>d>0));}return {x:px-l.nx*delta*travel,y:py-l.ny*delta*travel,angle:l.angle};}
 function screenTargets(t=lastT??0){if(!isActive(t))return [];const current=notes.filter(n=>n.status==='pending'&&n.t>=t-WINDOW&&n.t<=t+approachTime(t));return current.map(n=>({id:n.id,lane:n.lane,brand:brands[n.brand],name:names[n.brand],...pointAt(n,t),radius:innerWidth/innerHeight<.9?72:104,time:n.t,canHit:Math.abs(t-n.t)<=WINDOW}));}
 function pulse(t){let strength=0,strong=0;for(const n of notes){const age=t-n.t;if(age<0||age>.52)continue;const p=(1-Math.exp(-age*150))*Math.exp(-age*(n.strong?7:13));strength=Math.max(strength,p);if(n.strong)strong=Math.max(strong,p)}return {strength,strong}}
 function impact(t=lastT??0){const beat=pulse(t),age=latestHit?t-latestHit.t:10;return {strength:age>=0&&age<.5?Math.exp(-age*8):0,beat:beat.strength,strong:beat.strong,brand:latestHit?brands[latestHit.brand]:null,lastHit:latestHit?.t??null};}
 function stroke(x1,y1,x2,y2,color,alpha,width=1){if(alpha<=0)return;x.globalAlpha=alpha;x.strokeStyle=color;x.lineWidth=width;x.beginPath();x.moveTo(x1,y1);x.lineTo(x2,y2);x.stroke();}
 function glow(cx,cy,r,color,alpha){if(alpha<=0)return;const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,color+'60');g.addColorStop(.3,color+'18');g.addColorStop(1,color+'00');x.globalAlpha=alpha;x.fillStyle=g;x.fillRect(cx-r,cy-r,r*2,r*2);}
 function drawScore(t,mobile,w,h){const id=segmentAt(t),s=id?segmentStats[id]:null;if(!s){scoreLayout=null;return}const right=w-(mobile?19:44),top=mobile?Math.max(68,h*.105):Math.max(58,h*.105),color='#d1eadf',age=s.lastHitAt===null?10:t-s.lastHitAt,pop=Math.exp(-Math.max(0,age)*13),endFade=1-smooth((t-(s.end-.09))/.09);
  x.save();x.textAlign='right';x.textBaseline='alphabetic';x.shadowColor='#07111d';x.shadowBlur=8;
  const full=s.fullCombo&&s.fullComboAt!==null,fcAge=full?Math.max(0,t-s.fullComboAt):0;
  if(full){const unfold=.24+.76*smooth(fcAge/.10),size=mobile?25:39;x.font='600 '+size+'px Space';const width=x.measureText('FULL COMBO').width;
   x.save();x.beginPath();x.rect(right-width*unfold-5,top-35,width*unfold+12,78);x.clip();x.globalAlpha=endFade;x.fillStyle='#f2fff3';x.shadowColor='#b7f4d7';x.shadowBlur=mobile?10:17;x.fillText('FULL COMBO',right,top+19);x.restore();
   stroke(right-width*unfold,top+27,right,top+27,'#c4f2db',endFade*(.55+.30*Math.exp(-fcAge*9)),1.6);
   x.font=(mobile?10:12)+'px Space';x.globalAlpha=endFade*.78;x.fillStyle=color;x.fillText(s.hits+' / '+s.total,right,top+47);
   scoreLayout={segment:id,fullCombo:true,x:right-width-5,y:top-27,width:width+10,height:79,visible:mesh.material.opacity*endFade,unfold};
  }else{x.globalAlpha=endFade*.71;x.fillStyle=s.combo?'#b9d7cc':'#8b9fa5';x.font=(mobile?10:12)+'px Space';x.fillText('COMBO',right,top-14);
   x.save();x.translate(right,top+24);x.scale(1+pop*.055,1+pop*.055);x.font='500 '+(mobile?37:52)+'px Space';x.globalAlpha=endFade*(s.combo?.92:.46);x.fillStyle=color;x.fillText(String(s.combo).padStart(2,'0'),0,0);x.restore();
   const width=mobile?79:111;stroke(right-width,top+34,right,top+34,'#9dc5b7',endFade*(.28+pop*.38),1);
   scoreLayout={segment:id,fullCombo:false,x:right-width-3,y:top-29,width:width+6,height:69,visible:mesh.material.opacity*endFade,unfold:1};
  }x.restore();
 }
 function draw(t){const {mobile,w,h}=layout(),l=lineAt(t),col=colors[brandAt(t)],p=pulse(t),execution=t>=RELEASE&&t<176.7;const revealedAt=typeof screenCurtain!=='undefined'?(screenCurtain?.state().revealedAt??RELEASE):RELEASE;let fade=t<PRELUDE_END?smooth((t-PRELUDE)/.3)*(1-smooth((t-29.25)/.31)):t<CHOICE?smooth((t-START)/.35)*(1-smooth((t-158.48)/.30)):smooth((t-Math.min(RELEASE,revealedAt))/.22)*(1-smooth((t-206.70)/.30));const score=segmentStats[segmentAt(t)];if(score?.fullCombo)fade=Math.max(fade,1-smooth((t-(score.end-.09))/.09));mesh.material.opacity=fade;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,c.width,c.height);x.scale(canvasScale,canvasScale);
  // The score rotates and drifts; its notes approach along its normal.
  const alpha=.40+p.strength*.33,half=l.length*.5;glow(l.x,l.y,l.length*.38,col,.10+p.strength*.10);
  for(let j=0;j<3;j++){const dy=(j-1)*2.5;stroke(l.x-l.tx*half+l.nx*dy,l.y-l.ty*half+l.ny*dy,l.x+l.tx*half+l.nx*dy,l.y+l.ty*half+l.ny*dy,j===1?'#e2f2e9':col,alpha*(j===1?1:.18),j===1?1.5+p.strength*1.3:1);}
  for(const s of [-1,1]){const px=l.x+s*l.tx*half,py=l.y+s*l.ty*half;stroke(px-l.nx*5,py-l.ny*5,px+l.nx*5,py+l.ny*5,col,.65,1);}
  const upcoming=notes.filter(n=>n.status==='pending'&&n.t-t<=approachTime(t)&&n.t-t>=-WINDOW);
  for(const n of upcoming){const point=pointAt(n,t,true),target=pointAt(n,t),delta=n.t-t,progress=clamp(1-delta/approachTime(t)),a=smooth(progress/.16),bar=mobile?35:52,near=1-smooth(Math.abs(delta)/.28),nc=colors[n.brand];
   stroke(point.x,point.y,point.x-l.nx*(mobile?33:62),point.y-l.ny*(mobile?33:62),nc,a*.16,bar*.45);glow(point.x,point.y,bar*.90,nc,a*.38);x.save();x.translate(point.x,point.y);x.rotate(point.angle);x.globalAlpha=a;x.shadowColor=nc;x.shadowBlur=8+near*10;x.fillStyle=n.strong?'#fff6ed':'#cfeeea';x.fillRect(-bar/2,-3,bar,6);x.shadowBlur=0;x.strokeStyle=nc;x.lineWidth=1;x.strokeRect(-bar/2-3,-6,bar+6,12);x.restore();
   if(progress>.56){const wa=bar*.62+near*4;stroke(target.x-l.tx*wa,target.y-l.ty*wa,target.x+l.tx*wa,target.y+l.ty*wa,nc,(.22+near*.5)*a,1.8);stroke(target.x-l.nx*5,target.y-l.ny*5,target.x+l.nx*5,target.y+l.ny*5,nc,.18*a,1);}
  }
  // Untouched notes still produce choreographed arrivals. Only successful taps
  // release a brand mark and a stronger light wave along the judgement line.
  for(const n of notes){const age=t-n.t;if(age<0||age>.55||n.status==='hit')continue;const f=age/.55,p0=pointAt(n,n.t),power=(1-f)*(.22+(n.strong?.45:0));for(const side of [-1,1]){const offset=8+f*50;stroke(p0.x+l.tx*side*offset,p0.y+l.ty*side*offset,p0.x+l.tx*side*(offset+22*(1-f)),p0.y+l.ty*side*(offset+22*(1-f)),n.strong?'#f7b6bf':col,power,1.8);}glow(p0.x,p0.y,48+f*25,col,power*.7);}
  for(const hit of gleams){const age=t-hit.t;if(age<0||age>1.42)continue;const life=1-smooth((age-.37)/1.05),spread=1-Math.exp(-age*9),rise=(mobile?54:84)*smooth(age/1.2),col=colors[hit.brand],p0=hit.p,attack=Math.exp(-age*9);x.save();x.globalCompositeOperation='lighter';glow(p0.x,p0.y-rise,110+spread*35,col,life*.95);
   // A crisp white core, a travelling beam and expanding four-corner frame.
   for(const side of [-1,1]){const dist=spread*l.length*.53,tail=Math.max(0,dist-110*(1-age/1.42));stroke(p0.x+l.tx*side*tail,p0.y+l.ty*side*tail,p0.x+l.tx*side*dist,p0.y+l.ty*side*dist,col,life*.96,5.5*(1-age/1.7));stroke(p0.x+l.tx*side*tail,p0.y+l.ty*side*tail,p0.x+l.tx*side*dist,p0.y+l.ty*side*dist,'#f6fff6',life*.95,1.9);}
   const box=(mobile?24:34)+spread*(mobile?57:87);x.save();x.translate(p0.x,p0.y-rise*.4);x.rotate(l.angle+age*.22);for(const sx of [-1,1])for(const sy of [-1,1]){stroke(sx*box,sy*(box-15),sx*box,sy*box,col,life*.9,2.4);stroke(sx*box,sy*box,sx*(box-15),sy*box,'#f4fff4',life*.95,2.4)}x.restore();
   for(let j=0;j<30;j++){const a=j*2.399+hash(hit.id+j)*.4,r=(30+hash(j)*88)*spread,px=p0.x+Math.cos(a)*r,py=p0.y+Math.sin(a)*r-rise*.22;stroke(px,py,px+Math.cos(a)*(7+spread*16),py+Math.sin(a)*(7+spread*16),j%3?col:'#fffced',life*.95,j%3?1.8:3);}
   stroke(p0.x-l.tx*55,p0.y-l.ty*55,p0.x+l.tx*55,p0.y+l.ty*55,'#ffffff',attack,5);stroke(p0.x-l.nx*24,p0.y-l.ny*24,p0.x+l.nx*24,p0.y+l.ny*24,'#ffffff',attack,3);x.restore();
   x.save();x.translate(p0.x,p0.y-rise);x.rotate(Math.sin(age*6)*.08*(1-age/1.42));const size=(mobile?88:122)*(1+Math.sin(Math.min(1,age/.34)*Math.PI)*.28);x.globalAlpha=life;x.shadowColor='#eaffef';x.shadowBlur=28;x.drawImage(icons[hit.brand],-size/2,-size/2,size,size);x.shadowColor=col;x.shadowBlur=10;x.drawImage(icons[hit.brand],-size/2,-size/2,size,size);x.restore();
  }
  if(nearMiss&&t-nearMiss.t<.23){const a=(t-nearMiss.t)/.23;stroke(nearMiss.p.x-16,nearMiss.p.y,nearMiss.p.x+16,nearMiss.p.y,'#a0adb8',(1-a)*.35,1)}
  if(hover){glow(hover.x,hover.y,32,col,.18)}
  const intro=t<PRELUDE_END,hint=intro?(1-smooth((t-18)/1.2))*smooth((t-15)/.5):(1-smooth((t-138)/1.2))*smooth((t-135)/.5);if((intro||t<140)&&hint>0){x.globalAlpha=hint*.62;x.textAlign='center';x.fillStyle='#c7d8d8';x.font=(mobile?12:15)+'px GardenText';x.fillText('音符落在线上时 · 轻触',l.x,l.y+42);}
  // Brief narrow fault bands never turn into full-screen flashes.
  if(execution&&p.strong>.12){const f=p.strong;x.globalAlpha=f*.36;x.fillStyle='#ff475e';x.fillRect(0,l.y-2,w,1+f*3);x.globalAlpha=f*.27;x.fillStyle='#f3e6df';x.fillRect(w*.08,l.y-10,w*.84,1);}
  drawScore(t,mobile,w,h);
  x.globalAlpha=1;tex.needsUpdate=true;
 }
 function update(t){if(lastT!==null&&(t<lastT-.07||t-lastT>3))reset();const first=lastT===null;active=isActive(t);mesh.visible=active;phase=t>=PRELUDE&&t<PRELUDE_END?'prelude':t<START?'off':t<141?'deepseek':t<147.7?'claude':t<CHOICE?'gpt':t<RELEASE?'reveal':t<LOVE_START?'execution':t<LOVE_END?'love':t<END?'outro':'off';for(const n of notes){if(n.status==='pending'&&t>n.t+WINDOW){n.status=first?'skipped':'miss';recordMiss(n,t,first);if(!first)misses++}}lastT=t;gleams=gleams.filter(g=>t-g.t<1.42);if(active)draw(t);else scoreLayout=null;}
 function tap(px,py,t=preview??audio.currentTime){if(!isActive(t)||!mesh.visible)return false;const candidates=screenTargets(t).filter(a=>Math.hypot(px-a.x,py-a.y)<=a.radius*1.2).sort((a,b)=>Math.abs(t-a.time)-Math.abs(t-b.time)),target=candidates[0];if(!target)return false;const note=notes[target.id];lastTap=t;if(note&&note.status==='pending'&&Math.abs(note.t-t)<=WINDOW){note.status='hit';note.hitAt=t;note.error=t-note.t;hits++;recordHit(note,t);latestHit={id:note.id,brand:note.brand,t};gleams.push({id:note.id,brand:note.brand,t,p:pointAt(note,t)});draw(t);return true;}nearMiss={p:pointAt(note,t),t};return false;}
 const stage=$('#stage');stage.addEventListener('pointerdown',e=>{const t=preview??audio.currentTime;if(!active||!isActive(t)||e.button!==0)return;const target=screenTargets(t).find(a=>Math.hypot(e.clientX-a.x,e.clientY-a.y)<a.radius*1.3);if(!target)return;e.mvObjectHandled=true;e.preventDefault();tap(e.clientX,e.clientY,t);},{capture:true});
 stage.addEventListener('pointermove',e=>{if(!active){hover=null;return}hover=screenTargets(preview??audio.currentTime).find(a=>Math.hypot(e.clientX-a.x,e.clientY-a.y)<a.radius*1.1)??null});
 function state(){const segment=segmentAt(lastT??0),score=segment?segmentStats[segment]:null;return {active,visible:mesh.visible,phase,segment,combo:score?.combo??0,maxCombo:score?.maxCombo??0,fullCombo:score?.fullCombo??false,fullComboAt:score?.fullComboAt??null,scoreLayout,segments:Object.fromEntries(Object.entries(segmentStats).map(([id,s])=>[id,{...s}])),range:[PRELUDE,END],preludeReveal:preludeProgress(lastT??0),intervals:[[PRELUDE,PRELUDE_END],[START,CHOICE],[RELEASE,END]],inputEnd:END,lyricRanges:{love:[LOVE_START,LOVE_END],loveStep:BEAT},hitWindow:WINDOW,approach:approachTime(lastT??0),hits,misses,lastTap,brand:brands[brandAt(lastT??START)],line:lineAt(lastT??START),targets:active?screenTargets(lastT):[],flying:active?notes.filter(n=>n.status==='pending'&&n.t-lastT<=approachTime(lastT)&&n.t-lastT>=-WINDOW).map(n=>({id:n.id,time:n.t,...pointAt(n,lastT,true)})):[],notes:notes.map(n=>({id:n.id,segment:n.segment,lane:n.lane,brand:brands[n.brand],name:names[n.brand],time:n.t,strong:n.strong,status:n.status,hitAt:n.hitAt,error:n.error}))};}
 return {update,reset,mesh,screenTargets,tap,impact,state,preludeProgress,validate:()=>screenTargets().every(a=>Number.isFinite(a.x)&&Number.isFinite(a.y)&&a.x>0&&a.x<innerWidth&&a.y>0&&a.y<innerHeight)};
}

