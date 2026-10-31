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
 const mesh=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false,blending:T.AdditiveBlending}));mesh.renderOrder=36;mesh.frustumCulled=false;mesh.visible=false;scene.add(mesh);
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
 function screenTargets(t=lastT??0){if(!isActive(t))return [];const current=notes.filter(n=>n.status==='pending'&&n.t>=t-WINDOW&&n.t<=t+approachTime(t));return current.map(n=>({id:n.id,lane:n.lane,brand:brands[n.brand],name:names[n.brand],...pointAt(n,t),radius:innerWidth/innerHeight<.9?Math.max(88,innerWidth*.13):Math.max(124,innerHeight*.16),time:n.t,canHit:Math.abs(t-n.t)<=WINDOW}));}
 function pulse(t){let strength=0,strong=0;for(const n of notes){const age=t-n.t;if(age<0||age>.52)continue;const p=(1-Math.exp(-age*150))*Math.exp(-age*(n.strong?7:13));strength=Math.max(strength,p);if(n.strong)strong=Math.max(strong,p)}return {strength,strong}}
 function impact(t=lastT??0){const beat=pulse(t),age=latestHit?t-latestHit.t:10;return {strength:age>=0&&age<.5?Math.exp(-age*8):0,beat:beat.strength,strong:beat.strong,brand:latestHit?brands[latestHit.brand]:null,lastHit:latestHit?.t??null};}
 function stroke(x1,y1,x2,y2,color,alpha,width=1){if(alpha<=0)return;x.globalAlpha=alpha;x.strokeStyle=color;x.lineWidth=width;x.beginPath();x.moveTo(x1,y1);x.lineTo(x2,y2);x.stroke();}
 function glow(cx,cy,r,color,alpha){if(alpha<=0||!(r>0))return;const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,color+'60');g.addColorStop(.3,color+'18');g.addColorStop(1,color+'00');x.globalAlpha=alpha;x.fillStyle=g;x.fillRect(cx-r,cy-r,r*2,r*2);}
 let fcCanvas=null,fcCtx=null,fcShown=false;function fcLayer(){if(!fcCanvas){fcCanvas=document.createElement('canvas');Object.assign(fcCanvas.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'5'});$('#film').appendChild(fcCanvas);fcCtx=fcCanvas.getContext('2d')}const d=Math.min(2,devicePixelRatio||1);if(fcCanvas.width!==Math.round(innerWidth*d)||fcCanvas.height!==Math.round(innerHeight*d)){fcCanvas.width=Math.round(innerWidth*d);fcCanvas.height=Math.round(innerHeight*d)}fcCtx.setTransform(d,0,0,d,0,0);if(!fcShown){fcCtx.clearRect(0,0,innerWidth,innerHeight)}fcCanvas.style.display='block';return fcCtx}
 function fcFrame(){if(fcCanvas){fcCtx.setTransform(1,0,0,1,0,0);fcCtx.clearRect(0,0,fcCanvas.width,fcCanvas.height);fcCanvas.style.display='none'}fcShown=false}
 function drawScore(t,mobile,w,h){const id=segmentAt(t),s=id?segmentStats[id]:null;if(!s){scoreLayout=null;return}const right=w-(mobile?19:44),top=mobile?Math.max(68,h*.105):Math.max(58,h*.105),color='#d1eadf',age=s.lastHitAt===null?10:t-s.lastHitAt,pop=Math.exp(-Math.max(0,age)*13),endFade=1-smooth((t-(s.end-.09))/.09);
  x.save();x.textAlign='right';x.textBaseline='alphabetic';x.shadowColor='#07111d';x.shadowBlur=8;
  const full=s.fullCombo&&s.fullComboAt!==null,fcAge=full?Math.max(0,t-s.fullComboAt):0;
  // FULL COMBO: a big moment over the judgement line first, then it settles into the corner badge
  if(full&&fcAge<2.4){const g=fcLayer();const l=lineAt(t),cx=l.x,cy=l.y-(mobile?90:Math.max(120,h*.17)),pop=smooth(fcAge/.18),out=1-smooth((fcAge-1.9)/.5),sc=(1.35-.35*pop)*(1+.04*Math.exp(-fcAge*6)),size=Math.round((mobile?36:Math.min(86,w*.06)));
   g.save();{const sg=g.createRadialGradient(cx,cy,0,cx,cy,size*5);sg.addColorStop(0,`rgba(4,7,16,${.62*out*pop})`);sg.addColorStop(1,'rgba(4,7,16,0)');g.save();g.translate(cx,cy);g.scale(1,.42);g.translate(-cx,-cy);g.fillStyle=sg;g.fillRect(cx-size*5,cy-size*5,size*10,size*10);g.restore()}g.globalCompositeOperation='lighter';
   // shock rings and a light burst behind the words
   for(let r=0;r<3;r++){const k=Math.min(1,Math.max(0,(fcAge-r*.12)/.9));if(k>0&&k<1){g.globalAlpha=(1-k)*.8*out;g.strokeStyle=r===1?'#ffc3dc':'#bff7e6';g.lineWidth=4*(1-k)+.6;g.beginPath();g.ellipse(cx,cy,40+k*w*.32,18+k*h*.12,0,0,Math.PI*2);g.stroke()}}
   const hg=g.createRadialGradient(cx,cy,0,cx,cy,size*4);hg.addColorStop(0,`rgba(200,255,235,${.35*out})`);hg.addColorStop(1,'rgba(200,255,235,0)');g.globalAlpha=1;g.fillStyle=hg;g.fillRect(cx-size*4,cy-size*4,size*8,size*8);
   for(let i=0;i<22;i++){const an=hash(i+7)*Math.PI*2,sp=(.5+hash(i+19))*w*.22,k=Math.min(1,fcAge/1.2),px=cx+Math.cos(an)*sp*k,py=cy+Math.sin(an)*sp*k*.55+k*k*40;g.globalAlpha=(1-k)*out;g.fillStyle=i%3?'#e9fff6':'#ffc3dc';g.beginPath();g.arc(px,py,2.6*(1-k)+.8,0,Math.PI*2);g.fill()}
   g.restore();
   g.save();g.translate(cx,cy);g.scale(sc,sc);g.textAlign='center';g.textBaseline='middle';g.font='800 '+size+'px Space';const tw=g.measureText('FULL COMBO').width;
   const grad=g.createLinearGradient(-tw/2,0,tw/2,0),sweep=(fcAge*1.4)%1.6-.3;grad.addColorStop(0,'#9ff5da');grad.addColorStop(Math.max(0,Math.min(1,sweep-.08)),'#ffffff');grad.addColorStop(Math.max(0,Math.min(1,sweep)),'#ffffff');grad.addColorStop(Math.max(0,Math.min(1,sweep+.08)),'#ffd6ea');grad.addColorStop(1,'#a9c8ff');
   g.globalAlpha=pop*out;g.shadowColor='#9ff5da';g.shadowBlur=28;g.fillStyle=grad;g.fillText('FULL COMBO',0,0);g.shadowBlur=0;g.lineWidth=1.2;g.strokeStyle='rgba(255,255,255,.7)';g.strokeText('FULL COMBO',0,0);
   g.font='600 '+Math.round(size*.22)+'px Space';g.fillStyle='#e9fff6';g.globalAlpha=pop*out*.9;g.fillText(s.hits+' / '+s.total+'  ·  ALL PERFECT CONNECTION',0,size*.78);g.restore();
   fcShown=true;scoreLayout={segment:id,fullCombo:true,x:cx-tw/2,y:cy-size,width:tw,height:size*2,visible:mesh.material.opacity*out,unfold:1};
  }else if(full){const unfold=.24+.76*smooth((fcAge-2.4)/.10),size=mobile?25:39;x.font='600 '+size+'px Space';const width=x.measureText('FULL COMBO').width;
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
  x.save();x.lineCap='round';{const ax=l.x-l.tx*half,ay=l.y-l.ty*half,bx=l.x+l.tx*half,by=l.y+l.ty*half;for(const [wd,al,cc] of [[30,.08+p.strength*.10,col],[13,.20+p.strength*.18,col],[5,.55+p.strength*.3,'#ffffff'],[2.2,1,'#ffffff']]){x.globalAlpha=al;x.strokeStyle=cc;x.lineWidth=wd;x.beginPath();x.moveTo(ax,ay);x.lineTo(bx,by);x.stroke()}
   for(const [px,py] of [[ax,ay],[bx,by]]){glow(px,py,40,col,.9);x.globalAlpha=1;x.fillStyle='#ffffff';x.beginPath();x.arc(px,py,4,0,TAU);x.fill()}}x.restore();
  const upcoming=notes.filter(n=>n.status==='pending'&&n.t-t<=approachTime(t)&&n.t-t>=-WINDOW);
  for(const n of upcoming){const point=pointAt(n,t,true),target=pointAt(n,t),delta=n.t-t,progress=clamp(1-delta/approachTime(t)),a=smooth(progress/.16),bar=mobile?35:52,near=1-smooth(Math.abs(delta)/.28),nc=colors[n.brand];
   {const tl=mobile?60:110,tx0=point.x-l.nx*tl,ty0=point.y-l.ny*tl,tg=x.createLinearGradient(point.x,point.y,tx0,ty0);tg.addColorStop(0,nc+'aa');tg.addColorStop(1,nc+'00');x.save();x.globalAlpha=a*.8;x.strokeStyle=tg;x.lineCap='round';x.lineWidth=bar*.18;x.beginPath();x.moveTo(point.x,point.y);x.lineTo(tx0,ty0);x.stroke();x.restore()}
   glow(point.x,point.y,bar*1.1,nc,a*.5);x.save();x.translate(point.x,point.y);x.rotate(point.angle);x.globalAlpha=a;x.shadowColor=nc;x.shadowBlur=16+near*18;
   const cap=x.createLinearGradient(0,-7,0,7);cap.addColorStop(0,'#ffffff');cap.addColorStop(.5,n.strong?'#fff1e2':nc);cap.addColorStop(1,'#ffffff');x.fillStyle=cap;x.beginPath();x.roundRect(-bar/2,-5,bar,10,5);x.fill();x.shadowBlur=0;x.globalAlpha=a*.9;x.fillStyle='#ffffff';x.beginPath();x.roundRect(-bar/2+4,-2,bar-8,3,2);x.fill();x.restore();
   if(progress>.3){const hp=smooth((progress-.3)/.7);glow(target.x,target.y,bar*(1.2+near*.8),nc,.35+near*.65);x.save();x.globalAlpha=.4+hp*.6;x.strokeStyle='#ffffff';x.lineWidth=2+near*2;x.beginPath();x.arc(target.x,target.y,bar*.36*(1.5-hp*.5),0,TAU);x.stroke();x.restore()}
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
  // Every successful tap sends its light to the character: a comet of particles that
  // is absorbed where she is being formed, so the player can see cause and effect.
  let tgt={x:w*(mobile?.5:.6),y:h*(mobile?.38:.42)};
  try{const ac=t>=CHOICE&&typeof screenCurtain!=='undefined'?screenCurtain?.state().movie?.actorCenter:null;if(ac&&Number.isFinite(ac[0]))tgt={x:(ac[0]*.5+.5)*w,y:(.5-ac[1]*.5)*h};const m=t<PRELUDE_END?character:t<CHOICE?[guestFish,guestLady,guestGPT][brandAt(t)]:null;if(m&&m.visible){const v=new T.Vector3();m.getWorldPosition(v);v.y+=.3;v.project(camera);if(Math.abs(v.x)<1.1&&Math.abs(v.y)<1.1)tgt={x:(v.x*.5+.5)*w,y:(.5-v.y*.5)*h}}}catch(e){}
  for(const hit of (t<PRELUDE_END?gleams:[])){const age=t-hit.t;if(age<0||age>1.0)continue;const p0=hit.p,col=colors[hit.brand];x.save();x.globalCompositeOperation='lighter';
   const mx=(p0.x+tgt.x)/2+(hash(hit.id)*2-1)*w*.12,my=Math.min(p0.y,tgt.y)-h*.18;
   for(let j=0;j<14;j++){const u=clamp((age-j*.018)/.55);if(u<=0||u>=1)continue;const e=u*u*(3-2*u),bx=(1-e)*(1-e)*p0.x+2*(1-e)*e*mx+e*e*tgt.x,by=(1-e)*(1-e)*p0.y+2*(1-e)*e*my+e*e*tgt.y,r=(j?7:14)*(1-u*.5);glow(bx,by,r*4,col,.9*(1-j/16));x.globalAlpha=(1-j/14)*.95;x.fillStyle=j?col:'#ffffff';x.beginPath();x.arc(bx,by,r*.45,0,TAU);x.fill();}
   const ab=age-.55;if(ab>0&&ab<.45){const k=ab/.45;glow(tgt.x,tgt.y,90+k*160,col,(1-k)*.9);x.globalAlpha=(1-k)*.85;x.strokeStyle='#ffffff';x.lineWidth=3*(1-k)+.5;x.beginPath();x.arc(tgt.x,tgt.y,30+k*150,0,TAU);x.stroke();}
   // judgement word
   const err=Math.abs(notes[hit.id]?.error??0),word=err<.065?'PERFECT':'GREAT',jk=clamp(age/.12),jf=1-smooth((age-.45)/.4);x.globalCompositeOperation='source-over';x.globalAlpha=jk*jf;x.textAlign='center';x.font=`700 ${mobile?18:26}px Space`;x.shadowColor=col;x.shadowBlur=18;x.fillStyle=word==='PERFECT'?'#fffbe9':col;x.fillText(word,p0.x,p0.y-(mobile?38:58)-age*30);x.restore();}
  // A big centred combo counter under the judgement line; milestones burst.
  {const sid=segmentAt(t),sc=sid?segmentStats[sid]:null;if(sc&&sc.combo>=2){const age=sc.lastHitAt===null?9:t-sc.lastHitAt,vis=1-smooth((age-1.6)/.5),pop=Math.exp(-age*10),cx=l.x-l.tx*half*.78-l.nx*(mobile?40:62),cy=l.y-l.ty*half*.78-l.ny*(mobile?40:62);
   x.save();x.globalAlpha=vis*fade;x.textAlign='center';x.textBaseline='middle';x.translate(cx,cy);x.scale(1+pop*.35,1+pop*.35);
   const tier=sc.combo>=50?'#ffd88a':sc.combo>=25?'#ff9ec0':sc.combo>=10?'#b9a8ff':'#d6fff0';x.shadowColor=tier;x.shadowBlur=26+pop*30;x.fillStyle='#ffffff';x.font=`700 ${mobile?44:68}px Space`;x.fillText(String(sc.combo),0,0);
   x.shadowBlur=10;x.fillStyle=tier;x.font=`600 ${mobile?11:14}px Space`;x.fillText('C O M B O',0,mobile?30:44);x.restore();
   if(sc.combo%10===0&&age<.9){const k=age/.9;x.save();x.globalCompositeOperation='lighter';glow(cx,cy,180+k*300,tier,(1-k)*.9);x.globalAlpha=(1-k);x.strokeStyle=tier;x.lineWidth=6*(1-k)+1;x.beginPath();x.arc(cx,cy,40+k*360,0,TAU);x.stroke();x.fillStyle='#fff';x.font=`800 ${mobile?22:34}px Space`;x.textAlign='center';x.shadowColor=tier;x.shadowBlur=24;x.fillText(sc.combo+' COMBO!',cx,cy-(mobile?60:90)-k*30);x.restore();}
  }
  // FULL COMBO: fires on the final hit of a segment, in the combo area, like a bigger milestone, then it is gone
  if(sc&&sc.fullCombo&&sc.fullComboAt!==null){const age=t-sc.fullComboAt;if(age>=0&&age<1.7){const k=age/1.7,cx=l.x-l.tx*half*.78-l.nx*(mobile?40:62),cy=l.y-l.ty*half*.78-l.ny*(mobile?40:62),pop=Math.exp(-age*8),out=1-smooth((age-1.2)/.5),cols=['#9ff5da','#ffd88a','#ff9ec0','#b9a8ff'];
   x.save();x.globalCompositeOperation='lighter';glow(cx,cy,220+k*380,'#ffd88a',(1-k)*.85);
   for(let r=0;r<4;r++){const kk=Math.min(1,Math.max(0,(age-r*.08)/1.1));if(kk<=0||kk>=1)continue;x.globalAlpha=(1-kk)*out;x.strokeStyle=cols[r];x.lineWidth=7*(1-kk)+1;x.beginPath();x.arc(cx,cy,46+kk*(380+r*40),0,TAU);x.stroke()}
   for(let i=0;i<20;i++){const an=i/20*TAU+.3,sp=(120+hash(i+3)*220)*Math.min(1,age/1.1),px=cx+Math.cos(an)*sp,py=cy+Math.sin(an)*sp;x.globalAlpha=(1-k)*out;x.fillStyle=cols[i%4];x.beginPath();x.arc(px,py,3.2*(1-k)+.8,0,TAU);x.fill()}
   x.globalAlpha=out*Math.min(1,age/.08);x.textAlign='center';x.textBaseline='middle';x.translate(cx,cy-(mobile?64:96)-k*24);x.scale(1+pop*.4,1+pop*.4);x.font=`800 ${mobile?24:40}px Space`;x.shadowColor='#ffd88a';x.shadowBlur=30;x.fillStyle='#ffffff';x.fillText('FULL COMBO',0,0);x.restore();}}
  }
  if(nearMiss&&t-nearMiss.t<.23){const a=(t-nearMiss.t)/.23;stroke(nearMiss.p.x-16,nearMiss.p.y,nearMiss.p.x+16,nearMiss.p.y,'#a0adb8',(1-a)*.35,1)}
  if(hover){glow(hover.x,hover.y,32,col,.18)}
  const intro=t<PRELUDE_END,hint=intro?(1-smooth((t-18)/1.2))*smooth((t-15)/.5):(1-smooth((t-138)/1.2))*smooth((t-135)/.5);if((intro||t<140)&&hint>0){x.globalAlpha=hint*.62;x.textAlign='center';x.fillStyle='#c7d8d8';x.font=(mobile?12:15)+'px GardenText';}
  // Brief narrow fault bands never turn into full-screen flashes.
  if(execution&&p.strong>.12){const f=p.strong;x.globalAlpha=f*.36;x.fillStyle='#ff475e';x.fillRect(0,l.y-2,w,1+f*3);x.globalAlpha=f*.27;x.fillStyle='#f3e6df';x.fillRect(w*.08,l.y-10,w*.84,1);}
  fcFrame();scoreLayout=null;
  x.globalAlpha=1;tex.needsUpdate=true;
 }
 function update(t){if(lastT!==null&&(t<lastT-.07||t-lastT>3))reset();const first=lastT===null;active=isActive(t);mesh.visible=active;phase=t>=PRELUDE&&t<PRELUDE_END?'prelude':t<START?'off':t<141?'deepseek':t<147.7?'claude':t<CHOICE?'gpt':t<RELEASE?'reveal':t<LOVE_START?'execution':t<LOVE_END?'love':t<END?'outro':'off';for(const n of notes){if(n.status==='pending'&&t>n.t+WINDOW){n.status=first?'skipped':'miss';recordMiss(n,t,first);if(!first)misses++}}lastT=t;gleams=gleams.filter(g=>t-g.t<1.42);if(active)draw(t);else scoreLayout=null;}
 function tap(px,py,t=preview??audio.currentTime){if(!isActive(t)||!mesh.visible)return false;const candidates=screenTargets(t).filter(a=>Math.hypot(px-a.x,py-a.y)<=a.radius*1.5).sort((a,b)=>Math.abs(t-a.time)-Math.abs(t-b.time)),target=candidates[0];if(!target)return false;const note=notes[target.id];lastTap=t;if(note&&note.status==='pending'&&Math.abs(note.t-t)<=WINDOW){note.status='hit';note.hitAt=t;note.error=t-note.t;hits++;recordHit(note,t);latestHit={id:note.id,brand:note.brand,t};gleams.push({id:note.id,brand:note.brand,t,p:pointAt(note,t)});draw(t);return true;}nearMiss={p:pointAt(note,t),t};return false;}
 const stage=$('#stage');stage.addEventListener('pointerdown',e=>{const t=preview??audio.currentTime;if(!active||!isActive(t)||e.button!==0)return;const target=screenTargets(t).find(a=>Math.hypot(e.clientX-a.x,e.clientY-a.y)<a.radius*1.55);if(!target)return;e.mvObjectHandled=true;e.preventDefault();tap(e.clientX,e.clientY,t);},{capture:true});
 stage.addEventListener('pointermove',e=>{if(!active){hover=null;return}hover=screenTargets(preview??audio.currentTime).find(a=>Math.hypot(e.clientX-a.x,e.clientY-a.y)<a.radius*1.1)??null});
 function state(){const segment=segmentAt(lastT??0),score=segment?segmentStats[segment]:null;return {active,visible:mesh.visible,phase,segment,combo:score?.combo??0,maxCombo:score?.maxCombo??0,fullCombo:score?.fullCombo??false,fullComboAt:score?.fullComboAt??null,scoreLayout,segments:Object.fromEntries(Object.entries(segmentStats).map(([id,s])=>[id,{...s}])),range:[PRELUDE,END],preludeReveal:preludeProgress(lastT??0),intervals:[[PRELUDE,PRELUDE_END],[START,CHOICE],[RELEASE,END]],inputEnd:END,lyricRanges:{love:[LOVE_START,LOVE_END],loveStep:BEAT},hitWindow:WINDOW,approach:approachTime(lastT??0),hits,misses,lastTap,brand:brands[brandAt(lastT??START)],line:lineAt(lastT??START),targets:active?screenTargets(lastT):[],flying:active?notes.filter(n=>n.status==='pending'&&n.t-lastT<=approachTime(lastT)&&n.t-lastT>=-WINDOW).map(n=>({id:n.id,time:n.t,...pointAt(n,lastT,true)})):[],notes:notes.map(n=>({id:n.id,segment:n.segment,lane:n.lane,brand:brands[n.brand],name:names[n.brand],time:n.t,strong:n.strong,status:n.status,hitAt:n.hitAt,error:n.error}))};}
 return {update,reset,mesh,screenTargets,tap,impact,state,preludeProgress,validate:()=>screenTargets().every(a=>Number.isFinite(a.x)&&Number.isFinite(a.y)&&a.x>0&&a.x<innerWidth&&a.y>0&&a.y<innerHeight)};
}

