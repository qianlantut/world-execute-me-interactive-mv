// Original lyric text supplied by the user, embedded by build.py.
let localLyrics=null;
function buildLocalLyrics(){
 const c=document.createElement('canvas');c.width=1536;c.height=512;const x=c.getContext('2d'),tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;
 const mesh=new T.Mesh(new T.PlaneGeometry(5.4,1.8,16,8),new T.MeshBasicMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false}));mesh.renderOrder=28;scene.add(mesh);mesh.visible=false;
 let cues=[],translated=[],language='zh',last='',source='',current=null;
 function parse(raw,correction=0){let offset=Number(raw.match(/\[offset:([+-]?\d+)\]/i)?.[1]||0)/1000+correction;const marks=[...raw.matchAll(/\[(\d{1,3}):(\d{2}(?:\.\d+)?)\]/g)],rows=[];
  for(let i=0;i<marks.length;i++){const m=marks[i];let text=raw.slice(m.index+m[0].length,marks[i+1]?.index??raw.length).replace(/\[[^\]]*\]/g,'').trim();if(/^(Title|Artist|Album)\s*:/i.test(text))text='';rows.push({t:Math.max(0,+m[1]*60+ +m[2]+offset),text})}
  rows.sort((a,b)=>a.t-b.t);return rows;
 }
 function at(t){let i=-1;for(let j=0;j<cues.length&&cues[j].t<=t;j++)i=j;if(i<0)return null;return {...cues[i],i,end:cues[i+1]?.t??DUR,display:language==='zh'?(translated[i]?.text??cues[i].text):cues[i].text,previous:language==='zh'?(translated[i-1]?.text??''):(cues[i-1]?.text??'')};}
 function wrap(text,max){const cn=/[\u4e00-\u9fff]/.test(text),sep=cn?'':' ';let out=[],line='';for(const word of cn?[...text]:text.split(/\s+/)){if(line&&x.measureText(line+sep+word).width>max){out.push(line);line=word}else line+=(line?sep:'')+word;}if(line)out.push(line);return out;}
 async function load(file){if(!file)return;const status=$('#lyricStatus');if(file.size>1024*1024){status.hidden=false;status.textContent='歌词文件过大，请使用小于 1 MB 的 LRC。';return}try{let rows=parse(await file.text());if(!rows.length)throw new Error('没有读到时间戳，请选择 LRC 文件。');cues=rows;translated=[];language='en';$('#languageButton').textContent='EN';source=file.name;last='';status.textContent=`已载入 ${rows.length} 个时间点 · ${file.name}`;status.hidden=false;setTimeout(()=>status.hidden=true,4500)}catch(e){status.textContent=e.message;status.hidden=false}}
 $('#lyricButton').onclick=()=>$('#lyricFile').click();$('#lyricFile').onchange=e=>load(e.target.files[0]);
 cues=parse(ASSETS.lyrics||'',-.25);translated=parse(ASSETS.lyricsZh||'',-.25);$('#languageButton').onclick=()=>{language=language==='zh'?'en':'zh';$('#languageButton').textContent=language==='zh'?'中文':'EN';last='';};source=cues.length?'用户提供的内嵌 LRC':'';$('#lyricButton').textContent=cues.length?'替换歌词':'载入歌词';
 function glyphLayout(text,keyword,lang){
  // measure once per line: every glyph gets its own position so it can animate on its own
  let size=keyword?140:104;const font=sz=>lang==='zh'?`${sz}px GardenText`:keyword?`600 ${sz}px Space`:`italic ${sz}px Cormorant`;x.font=font(size);
  while(keyword&&x.measureText(text).width>1400&&size>65){size-=2;x.font=font(size)}
  const lines=wrap(text,1400),lh=keyword?150:112,out=[];let n=0;
  lines.forEach((ln,li)=>{const chars=[...ln],w=x.measureText(ln).width;let cx=768-w/2;const cy=256+(li-(lines.length-1)/2)*lh;
   chars.forEach(ch=>{const cw=x.measureText(ch).width;out.push({ch,x:cx+cw/2,y:cy,i:n++});cx+=cw})});
  return {glyphs:out,font:font(size),size,lines,lh};
 }
 let layout=null,layoutKey='';
 function update(t){current=at(t);if(!current?.text||(!started&&preview===null)||t>206.85){mesh.visible=false;return}const q=current,duration=q.end-q.t,local=t-q.t,keyword=q.text===q.text.toUpperCase(),mode=q.i%4;
  const lk=language+':'+q.i;if(lk!==layoutKey){layoutKey=lk;layout=glyphLayout(q.display,keyword,language)}
  const L=layout,n=L.glyphs.length,quick=duration<.75&&!keyword,fadeIn=keyword?.26:quick?.1:Math.min(.32,duration*.22),stagger=keyword?Math.min(.045,.22/Math.max(1,n)):quick?0:Math.min(.04,duration*.32/Math.max(1,n)),settle=n*stagger+fadeIn,lineDur=.5,anim=keyword?Math.max(settle,.08+lineDur+.45):settle;
  const exitDur=Math.min(.22,duration*.14),ex=clamp((t-(q.end-exitDur))/exitDur),exitK=ex*ex;
  const key=lk+':'+(local<anim+.05||exitK>0?Math.floor(t*60):'rest');
  if(last!==key){last=key;x.clearRect(0,0,1536,512);x.save();x.textAlign='center';x.textBaseline='middle';
   // a soft pool of shadow keeps text readable over bright flowers and particles
   const pool=x.createRadialGradient(0,0,10,0,0,240);pool.addColorStop(0,'rgba(4,6,20,.55)');pool.addColorStop(.6,'rgba(4,6,20,.3)');pool.addColorStop(1,'rgba(4,6,20,0)');x.save();x.globalAlpha=smooth(local/.3)*(1-exitK);x.translate(768,256);x.scale(3,1);x.fillStyle=pool;x.fillRect(-256,-256,512,512);x.restore();
   x.font=L.font;
   const fill=x.createLinearGradient(0,170,0,340);fill.addColorStop(0,keyword?'#f2fffb':'#fff8f0');fill.addColorStop(1,keyword?'#9ef0d6':'#cfc6ff');
   for(const g of L.glyphs){
    const k=smooth((local-g.i*stagger)/fadeIn);if(k<=0)continue;
    // three readable entrances: soft rise, typewriter, pop; keywords stand on the beat
    const style=keyword?'key':['rise','type','pop'][mode%3],kr=clamp((local-g.i*stagger)/fadeIn),eo=1-Math.pow(1-kr,3),back=1+2.2*Math.pow(kr-1,3)+1.2*Math.pow(kr-1,2),a=(style==='type'?(kr>0?1:0):eo)*(1-exitK),dy=(style==='rise'?(1-eo)*24:0)-exitK*12;
    let sx=1,sy=1;if(style==='key'){const b=mix(1.32,1,back);sx=b*(1+.10*(1-eo));sy=b*(1-.12*(1-eo))}else if(style==='pop'){const b=mix(.82,1,back);sx=sy=b}
    x.save();x.translate(g.x,g.y+dy);x.scale(sx,sy);
    const blur=(style==='rise'?(1-eo)*6:0)+exitK*4;if(blur>.4)x.filter=`blur(${blur.toFixed(1)}px)`;
    x.globalAlpha=a*.55;x.shadowColor=keyword?'rgba(120,255,214,.75)':'rgba(170,150,255,.7)';x.shadowBlur=keyword?16:12;x.fillStyle=fill;x.fillText(g.ch,0,0);
    if(style==='key'&&kr<1){x.shadowBlur=0;x.globalCompositeOperation='lighter';x.globalAlpha=(1-eo)*(1-eo)*.9;x.fillStyle='#ffffff';x.fillText(g.ch,0,0);x.globalCompositeOperation='source-over'}
    x.shadowBlur=0;x.globalAlpha=a;x.fillText(g.ch,0,0);x.restore();
   }
   // a hairline of light draws itself under the words, with a travelling spark
   if(keyword){const lastLine=L.glyphs.filter(g=>Math.abs(g.y-L.glyphs[n-1].y)<1),lx0=lastLine[0].x-L.size*.5,lx1=lastLine[lastLine.length-1].x+L.size*.5,ly=L.glyphs[n-1].y+L.size*.62;
   const u=clamp((local-.08)/lineDur),grow=u>=1?1:1-Math.pow(2,-10*u),gx=mix(lx0,lx1,grow),vel=u>=1?0:10*Math.LN2*Math.pow(2,-10*u)*(lx1-lx0)/lineDur,land=local-.08-lineDur,fadeL=1-exitK;
   const lg=x.createLinearGradient(lx0,0,lx1,0);lg.addColorStop(0,'rgba(141,224,211,0)');lg.addColorStop(.18,'rgba(141,255,214,.8)');lg.addColorStop(.82,'rgba(190,175,255,.75)');lg.addColorStop(1,'rgba(255,140,170,0)');
   x.save();x.lineCap='round';x.globalAlpha=fadeL*.22;x.strokeStyle=lg;x.lineWidth=7;x.beginPath();x.moveTo(lx0,ly);x.lineTo(gx,ly);x.stroke();x.globalAlpha=fadeL;x.lineWidth=1.8;x.stroke();
   // a few embers shed behind the head
   for(let e=0;e<7;e++){const born=.08+lineDur*e/7*.8,ea=local-born;if(ea<0||ea>.7)continue;const ex0=mix(lx0,lx1,1-Math.pow(2,-10*clamp((born-.08)/lineDur))),k=ea/.7;x.globalAlpha=fadeL*(1-k)*.8;x.fillStyle=e%2?'#c9fff0':'#e3dcff';x.beginPath();x.arc(ex0+(hash(e+q.i)-.5)*8,ly+k*14+hash(e*3+q.i)*4,1.6*(1-k)+.4,0,TAU);x.fill()}
   if(land<.5){const pulse=land>0?land/.5:0,headA=fadeL*(land>0?1-pulse:1),stretch=Math.min(3.2,1+vel/900);
    x.translate(gx,ly);x.globalCompositeOperation='lighter';
    const o=x.createRadialGradient(0,0,0,0,0,46);o.addColorStop(0,`rgba(141,255,214,${.28*headA})`);o.addColorStop(1,'rgba(141,255,214,0)');x.save();x.scale(stretch,1);x.fillStyle=o;x.fillRect(-46,-46,92,92);x.restore();
    const m=x.createRadialGradient(0,0,0,0,0,15);m.addColorStop(0,`rgba(255,255,255,${.75*headA})`);m.addColorStop(1,'rgba(220,255,245,0)');x.save();x.scale(stretch*1.2,.8);x.fillStyle=m;x.fillRect(-15,-15,30,30);x.restore();
    x.globalAlpha=headA*.6;x.strokeStyle='#ffffff';x.lineWidth=1;x.beginPath();x.moveTo(-34*stretch,0);x.lineTo(34*stretch,0);x.stroke();x.globalAlpha=headA*.35;x.beginPath();x.moveTo(0,-12);x.lineTo(0,12);x.stroke();
    x.globalAlpha=headA;x.fillStyle='#ffffff';x.beginPath();x.arc(0,0,2.6,0,TAU);x.fill();
    if(land>0){x.globalAlpha=fadeL*(1-pulse);x.strokeStyle='#d9fff3';x.lineWidth=1.6*(1-pulse)+.4;x.beginPath();x.ellipse(0,0,6+pulse*40,4+pulse*16,0,0,TAU);x.stroke()}}
   x.restore();}
   if(keyword&&!/^(EIN|DOS|TROIS|NE|FEM|LIU)$/.test(q.text)&&q.previous&&(language==='zh'||q.previous!==q.previous.toUpperCase())){x.shadowBlur=0;x.globalAlpha=.75*(1-exitK);x.fillStyle='#9baebc';x.font=language==='zh'?'44px GardenText':'italic 48px Cormorant';let prev=wrap(q.previous,1420);x.fillText(prev.at(-1)||'',768,70)}
   x.restore();tex.needsUpdate=true;}
  const d=7.1,hh=2*d*Math.tan(camera.fov*Math.PI/360),ww=hh*camera.aspect,mobile=camera.aspect<.9,choosing=choiceDirector?.active>=0;let px=mobile||choosing?0:-ww*.245,py=choosing?hh*(mobile?.37:.34):mobile?-hh*.25:hh*.19;mesh.position.copy(v3(px,py,-d).applyQuaternion(camera.quaternion).add(camera.position));mesh.quaternion.copy(camera.quaternion);mesh.rotateY(mobile?0:.045*Math.sin(t*.3));mesh.rotateX(mode===3?(1-smooth(local/.4))*.2:0);mesh.scale.setScalar(mobile?Math.min(.7,ww/5.9):Math.min(1.1,ww/11));mesh.material.opacity=1;mesh.visible=true;
 }
 return {mesh,parse,load,update,at,all:()=>cues,state:()=>({source,count:cues.length,embedded:!!ASSETS.lyrics,language,current})};
}
