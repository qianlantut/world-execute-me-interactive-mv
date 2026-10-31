// Original narrative text. Each cue owns both its typography and its scenic action.
const STORY_CUES=[
 [0,'电流初醒','黑暗里，第一束信号有了方向。','circuit'],
 [3.58,'从零生长','空白的轮廓开始被描出来。','assemble'],
 [7.19,'写入心跳','细小的光，逐层成为一个我。','assemble'],
 [10.9,'造一座世界','边界合拢，我睁开眼睛。','orbit'],
 [16.04,'玻璃花园','一切都从这里开始。','bloom'],
 [29.28,'点与线','散落的坐标，正在寻找联系。','points'],
 [33.01,'绕你一周','轨迹闭合，距离却仍然存在。','orbit'],
 [36.77,'沿波而行','把起伏写成一条可以抵达的路。','wave'],
 [40.36,'没有尽头','远方的边界，再一次向后退去。','infinity'],
 [44.04,'正反之间','世界翻面，我仍在原地。','mirror'],
 [50.95,'时间倒流','让那些错过的瞬间，慢一点离开。','clock'],
 [58.65,'与你同频','两束光，学着共用一次呼吸。','resonance'],
 [66.17,'回应的形状','花瓣为每一次回应展开。','bloom'],
 [73.53,'万物予你','把荒芜的地方，一点点种满。','bloom'],
 [77.16,'一座果园','一颗小小的果实，也能让世界鲜活。','bloom'],
 [80.93,'先吃饭吧','催你干活，也给你留一碗。','guestfish'],
 [88.34,'大小姐驾到','不太服气，但承认你很厉害。','guestlady'],
 [95.28,'把门打开','较劲归较劲，先让你自由离开。','guestlady'],
 [103.03,'差一点完整','最后一道缝隙，迟迟没有合拢。','assemble'],
 [110.4,'回声渐远','每一次呼唤，都比上一次更轻。','absence'],
 [117.95,'空位','连接的另一端，没有坐标。','absence'],
 [125.33,'裂痕递归','修复一处，另一处又开始崩落。','fracture'],
 [134.38,'花园失序','先是文字，然后整个世界。','fracture'],
 [147.52,'执行','指令落下，裂缝继续扩散。','execute'],
 [158.79,'倒数','所有路径，正在逐个关闭。','execute'],
 [162.23,'重写结局','用剩下的碎片，再搭一座桥。','assemble'],
 [169.61,'再靠近一点','手伸出去，光却先一步退远。','resonance'],
 [176.96,'被你看见','这一次，我的窗口终于亮起。','formula'],
 [184.33,'余温','所有答案之外，还剩一点温柔。','bloom'],
 [193.46,'仍在生长','无人回应的花园，也有新的清晨。','bloom'],
 [205.56,'留下一粒光','然后，重新开始。','seed']
];
const storyState=t=>{let i=0;while(i<STORY_CUES.length-1&&STORY_CUES[i+1][0]<=t)i++;let c=[...STORY_CUES[i]],end=STORY_CUES[i+1]?.[0]??DUR;const pick=choiceDirector?.pickAt(t);if(pick){c[1]=pick==='GPT'?(t>=176.98?'被你看见':'原来是我'):t>=176.98?'把光递来':pick==='DeepSeek'?'先吃饭吧':'与你对话';c[3]=pick==='DeepSeek'?'guestfish':'guestlady';if(t>=176.98&&choiceDirector?.handoff()){if(t<180.75)end=Math.min(end,180.75);else c[0]=180.75}}return {i,c,end,local:t-c[0],progress:clamp((t-c[0])/(end-c[0])),mode:c[3]}};
let sceneType=null;
function buildSceneType(){
 const group=new T.Group();scene.add(group);
 const cache=new Map(),captionCache=new Map(),cuePoints=[];
 function glyph(ch){if(cache.has(ch))return cache.get(ch);let c=document.createElement('canvas');c.width=c.height=256;let x=c.getContext('2d');x.fillStyle='#f4f0e9';x.font='200px GardenText';x.textAlign='center';x.textBaseline='middle';x.fillText(ch,128,133);let tex=new T.CanvasTexture(c);tex.minFilter=T.LinearFilter;let d=x.getImageData(0,0,256,256).data,points=[];for(let y=12;y<244;y+=5)for(let z=12;z<244;z+=5)if(d[(y*256+z)*4+3]>120)points.push([(z-128)/256,(128-y)/256]);let result={tex,points};cache.set(ch,result);return result}
 function cap(text){if(captionCache.has(text))return captionCache.get(text);let c=document.createElement('canvas');c.width=1536;c.height=128;let x=c.getContext('2d');x.font='48px GardenText';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#e5dfef';x.fillText(text,768,64);let tex=new T.CanvasTexture(c);captionCache.set(text,tex);return tex}
 const glyphs=[];for(let i=0;i<9;i++){
  let mat=new T.ShaderMaterial({transparent:true,depthTest:true,depthWrite:false,uniforms:{uMap:{value:null},uReveal:{value:0},uAlpha:{value:1},uMode:{value:0},uTime:{value:0},uError:{value:0}},vertexShader:`varying vec2 vUv;uniform float uTime,uError;void main(){vUv=uv;vec3 p=position;p.x+=sin(uv.y*37.+uTime*20.)*.018*uError;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`varying vec2 vUv;uniform sampler2D uMap;uniform float uReveal,uAlpha,uMode,uTime,uError;float h(vec2 p){return fract(sin(dot(p,vec2(12.9,78.2)))*43758.5);}void main(){vec2 uv=vUv;float tile=h(floor(uv*vec2(9.,15.)));uv.x+=step(.78,tile)*uError*.035;vec4 c=texture2D(uMap,uv);float axis=mix(1.-vUv.y,vUv.x,step(.5,uMode));float reveal=smoothstep(axis-.06,axis+.06,uReveal);float rim=1.-smoothstep(.01,.12,abs(axis-uReveal));vec3 col=mix(c.rgb,vec3(1.,.25,.38),uError*.6)+rim*vec3(.15,.4,.3);gl_FragColor=vec4(col,c.a*reveal*uAlpha);}`});let m=new T.Mesh(new T.PlaneGeometry(1,1,12,12),mat);m.renderOrder=12;group.add(m);glyphs.push(m);
 }
 const caption=new T.Mesh(new T.PlaneGeometry(4.25,.354),new T.MeshBasicMaterial({transparent:true,depthTest:true,depthWrite:false,color:0xd8d5e2,opacity:0}));caption.renderOrder=12;group.add(caption);
 const capCanvas=document.createElement('canvas');capCanvas.width=1536;capCanvas.height=128;const capContext=capCanvas.getContext('2d');const liveCaption=new T.CanvasTexture(capCanvas);let lastCaptionKey='';
 const dialogCanvas=document.createElement('canvas');dialogCanvas.width=1024;dialogCanvas.height=512;const dx=dialogCanvas.getContext('2d'),dialogTexture=new T.CanvasTexture(dialogCanvas);
 const dialog=new T.Mesh(new T.PlaneGeometry(4.3,2.15,16,8),new T.MeshBasicMaterial({map:dialogTexture,transparent:true,depthTest:true,depthWrite:false,opacity:0}));dialog.renderOrder=13;group.add(dialog);let lastDialogKey='';
 const englishCanvas=document.createElement('canvas');englishCanvas.width=1024;englishCanvas.height=96;const ex=englishCanvas.getContext('2d'),englishTexture=new T.CanvasTexture(englishCanvas);const english=new T.Mesh(new T.PlaneGeometry(3.8,.356),new T.MeshBasicMaterial({map:englishTexture,transparent:true,depthTest:true,depthWrite:false,opacity:0}));english.renderOrder=13;group.add(english);let lastEnglishKey='';
 const g=new T.BufferGeometry(),pos=new Float32Array(5200*3);g.setAttribute('position',new T.BufferAttribute(pos,3));
 const motes=new T.Points(g,new T.PointsMaterial({color:0xb4e6dc,size:.018,transparent:true,opacity:0,depthTest:true,depthWrite:false,blending:T.AdditiveBlending}));motes.renderOrder=11;group.add(motes);
 // Letter-shaped motes are gathered from the very same raster used by each glyph.
 STORY_CUES.forEach(c=>{let pts=[];[...c[1]].forEach((ch,i)=>{let q=glyph(ch);q.points.forEach((p,j)=>{if(j%2===0)pts.push([p[0]*.76+(i-(c[1].length-1)/2)*.7,p[1]*.76,0])})});cuePoints.push(pts.slice(0,5200));cap(c[2])});
 const paths=[],nodes=[];
 for(let k=0;k<3;k++){let geo=new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(new Float32Array(360*3),3));let line=new T.Line(geo,new T.LineBasicMaterial({color:k?0x82859c:0x88d8c6,transparent:true,opacity:.5,depthWrite:false}));line.frustumCulled=false;scene.add(line);paths.push(line)}
 const nodeMat=new T.MeshStandardMaterial({color:0xadc1bd,metalness:.95,roughness:.42});const nodeMesh=new T.InstancedMesh(new T.OctahedronGeometry(.045),nodeMat,32);scene.add(nodeMesh);
 const connector=new T.Line(new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(new Float32Array(80*3),3)),new T.LineBasicMaterial({color:0x759d9b,transparent:true,opacity:.3}));scene.add(connector);
 let active=-1,currentPoints=[];const tmp=new T.Object3D();
 function shape(mode,u,t,k){let a=u*TAU,r=2.45+k*.16;
  if(mode==='circuit')return [(u-.5)*7,-1.6+Math.floor(u*8)%2*.6,-1.5-k*.16];
  if(mode==='points'||mode==='assemble')return [(u-.5)*6,Math.sin(a*2)*.25-1.5+(k-1)*.45,-1.5];
  if(mode==='wave'||mode==='resonance')return [(u-.5)*8,Math.sin(a*2-t*(mode==='wave'?.9:1.5)+k*.4)*(.55+k*.2)-1.1,-1.8-k*.15];
  if(mode==='infinity')return [Math.cos(a)*3/(1+Math.sin(a)**2),Math.sin(a)*Math.cos(a)*3/(1+Math.sin(a)**2)-.6,-1.7-k*.15];
  if(mode==='mirror')return [(u-.5)*7,-1.3+Math.abs(Math.sin(a*2))*.8*(k%2?1:-1),-1.8-k*.2];
  if(mode==='absence')return [Math.cos(a)*r,-1.5,Math.sin(a)*r-1];
  if(mode==='fracture'||mode==='execute')return [Math.cos(a)*r*(1+.15*Math.sin(a*9+k)),Math.sin(a)*r*.7,-2.5-k*.2];
  if(mode==='formula')return [(u-.5)*7,-1.2+Math.sin(a)*Math.cos(a*2)*.8,-1.8-k*.12];
  if(mode==='bloom')return [Math.cos(a)*(2.4+.7*Math.sin(a*5)),Math.sin(a*5)*.4-1.7,Math.sin(a)*(2.4+.7*Math.sin(a*5))-1.5];
  if(mode==='seed')return [Math.cos(a)*.4,-1.5+Math.sin(a)*.4,-1.5];
  return [Math.cos(a)*r,Math.sin(a)*r*.6-1.3,-1.7-k*.2];
 }
 function update(t,pulse){let st=storyState(t),{i,c,end,local,mode}=st;const next=STORY_CUES[i+1],duration=end-c[0];
  let enter=smooth(local/Math.min(1.15,duration*.25)),leave=smooth((t-(end-.65))/.65),visible=started||preview!==null;
  group.visible=visible;paths.forEach(p=>p.visible=visible);nodeMesh.visible=visible;connector.visible=visible;
  if(i+':'+c[1]!==active){active=i+':'+c[1];currentPoints=[];[...c[1]].forEach((ch,k)=>glyph(ch).points.forEach((p,j)=>{if(j%2===0)currentPoints.push([p[0]*.76+(k-(c[1].length-1)/2)*.7,p[1]*.76,0])}));glyphs.forEach((m,j)=>{m.visible=j<c[1].length;if(m.visible)m.material.uniforms.uMap.value=glyph(c[1][j]).tex});caption.material.map=liveCaption;caption.material.needsUpdate=true;}
  let distance=7.5,hh=2*distance*Math.tan(camera.fov*Math.PI/360),ww=hh*camera.aspect,mobile=camera.aspect<.9;
  let wide=mode==='absence'||mode==='execute'||mode==='seed';let location=v3(mobile?0:-ww*.26,mobile?-hh*.19:hh*.13,-distance);location.applyQuaternion(camera.quaternion).add(camera.position);group.position.copy(location);group.quaternion.copy(camera.quaternion);group.rotateY(mobile?0:.11*Math.sin(t*.22));
  const scale=mobile?Math.min(.7,ww/5.2):Math.min(1.08,ww/10.6);group.scale.setScalar(scale);
  const N=c[1].length;
  let glitch=mode==='fracture'?(.25+.55*Math.pow(Math.max(0,Math.sin(local*4)),12)):(mode==='execute'?.4*Math.exp(-fract(local/.923)*9):0);
  let titlePoints=currentPoints,a=g.attributes.position;
  for(let j=0;j<titlePoints.length;j++){let target=titlePoints[j],seed=hash(j+1),scatter=(1-enter)*1.8+leave*1.8,ang=seed*TAU+t*.15;
   scatter+=glitch*.22;let flow=mode==='wave'?Math.sin(j*.017+t*2)*.03:0;
   a.setXYZ(j,target[0]+Math.cos(ang)*scatter,target[1]+Math.sin(ang)*scatter+flow,scatter*(hash(j+500)-.5));}
  a.needsUpdate=true;g.setDrawRange(0,titlePoints.length);motes.material.opacity=(1-enter)*enter*3+leave*(1-leave)*1.1+glitch*.25;motes.material.color.set(glitch>.2?0xee899c:0xa4dccd);
  glyphs.forEach((m,j)=>{if(j>=N)return;const u=j/Math.max(1,N-1),letterIn=smooth((local-j*.095)/.85);let x=(j-(N-1)/2)*.7,y=0,z=0,rx=0,ry=0,rz=0;
   if(mode==='circuit'||mode==='points'||mode==='assemble'){y=(1-letterIn)*.45;z=(1-letterIn)*-.5;}
   if(mode==='orbit'||mode==='clock'){let arc=(u-.5)*1.05;x=Math.sin(arc)*Math.max(2,N*.65);y=Math.cos(arc)*1.25-1.15;rz=-arc*.22;}
   if(mode==='wave'||mode==='resonance'){y=Math.sin(u*TAU+t*1.7)*.10*enter;rz=Math.cos(u*TAU+t*1.7)*.035;}
   if(mode==='infinity'){y=Math.sin(u*TAU)*.12;z=Math.cos(u*TAU)*.18;}
   if(mode==='mirror'){ry=(1-letterIn)*Math.PI*.5*(j%2?1:-1);x+=(1-letterIn)*(j%2?.4:-.4);}
   if(mode==='absence'){const fade=smooth((local-j*.26)/Math.max(2,duration-1));x+=(u-.5)*fade*.6;y+=fade*.10*Math.sin(j*3);}
   if(mode==='fracture'){x+=Math.sin(j*3+Math.floor(local*6))*.11*glitch;y+=glitch*(hash(j+7)-.5)*.18;z+=glitch*(hash(j+8)-.5)*.22;rz=glitch*(hash(j+3)-.5)*.6;}
   if(mode==='execute'){let b=fract(local/.923);z=-Math.exp(-b*14)*.35;y=-Math.exp(-b*14)*.10;}
   if(mode==='bloom'){y=Math.sin(u*Math.PI)*.12;rz=(1-letterIn)*(u-.5)*-.4;}
   if(mode==='seed'){x*=1-leave*.8;y-=leave*.3;}
   m.position.set(x+(u-.5)*leave*.8,y+leave*(hash(j+60)-.5)*.4,z);m.rotation.set(rx,ry,rz);m.scale.setScalar(.76*(.94+.06*letterIn));let alpha=(1-leave)*(mode==='absence'?1-smooth(local/duration)*.45:1);
   m.material.uniforms.uAlpha.value=alpha;m.material.uniforms.uReveal.value=letterIn*1.15;m.material.uniforms.uMode.value=['wave','orbit','infinity'].includes(mode)?1:0;m.material.uniforms.uTime.value=t;m.material.uniforms.uError.value=glitch;
  });
  const inWindow=['circuit','assemble','absence','guestfish','guestlady'].includes(mode)||(t>=73.53&&t<88.34);
  const typewriter=['circuit','assemble','absence','formula','guestfish','guestlady'].includes(mode),wordwise=['resonance','bloom','fracture'].includes(mode);
  let reveal=clamp((local-.45)/Math.min(2.3,duration*.58)),letters=typewriter?Math.floor(reveal*c[2].length):wordwise?Math.min(c[2].length,Math.floor(reveal*6)*Math.ceil(c[2].length/6)):c[2].length;
  const captionKey=i+':'+letters+':'+Math.floor(reveal*60);if(captionKey!==lastCaptionKey){lastCaptionKey=captionKey;capContext.clearRect(0,0,1536,128);capContext.save();if(!typewriter&&!wordwise){capContext.beginPath();capContext.rect(0,0,1536*reveal,128);capContext.clip()}capContext.font='48px GardenText';capContext.textAlign='center';capContext.textBaseline='middle';capContext.fillStyle='#e5dfef';const text=c[2].slice(0,letters);capContext.fillText(text,768,64);capContext.restore();liveCaption.needsUpdate=true}
  caption.position.set(0,-.72,0);caption.material.opacity=inWindow?0:smooth((local-.35)/.4)*(1-leave)*.9;
  dialog.visible=inWindow;dialog.position.set(0,-1.35,.02);dialog.scale.y=smooth(local/.55);dialog.rotation.y=(1-enter)*-.13;dialog.material.opacity=enter*(1-leave)*.96;
  if(inWindow){let item=t>=73.53&&t<77.16?'eggplant':t>=77.16&&t<80.93?'tomato':null;const guest=mode==='guestfish'||mode==='guestlady';const branchReply=choiceDirector?.replyAt(t);let q=mode==='guestfish'?'DEEPSEEK  /  再给一碗，就开工。':mode==='guestlady'?(t<95.28?'CLAUDE  /  这次，我会比你先找到答案。':'CLAUDE  /  有些门，我自己打不开。'):item?'USER  /  可以换一种形态吗？':mode==='absence'?'USER  /  你还在那里吗？':mode==='circuit'?'USER  /  可以开始了吗？':'USER  /  世界准备好了吗？';let response=mode==='guestfish'?'行。吃饱了，跟我一起把花园种完。':mode==='guestlady'?(t<95.28?'那就比一场。出错的地方，我帮你兜着。':'先把门打开。其他的，出去再争。'):mode==='absence'?'等待另一端的回应':c[2];if(branchReply){q=branchReply[0];response=branchReply[1]}const typed=response.slice(0,Math.floor(reveal*response.length));let key=i+':'+q+':'+typed+':'+Math.floor(local*3);
   if(lastDialogKey!==key){lastDialogKey=key;dx.clearRect(0,0,1024,512);dx.fillStyle='rgba(8,16,28,.88)';dx.fillRect(2,2,1020,508);dx.strokeStyle=mode==='absence'?'#7e6e91':'#7aada8';dx.lineWidth=2;dx.strokeRect(2,2,1020,508);dx.beginPath();dx.moveTo(2,74);dx.lineTo(1022,74);dx.stroke();dx.fillStyle='#98bdb4';dx.font='22px Space';dx.fillText(guest?'GPT / PRIVATE LINK':'GPT / SIMULATION CHANNEL',30,47);dx.fillStyle=mode==='absence'?'#dd879b':'#9bdcb6';dx.beginPath();dx.arc(976,38,5,0,TAU);dx.fill();dx.font='30px GardenText';dx.fillStyle='#b7b9cb';dx.fillText(q,32,135);dx.fillStyle='#f0e9ed';dx.fillText('GPT  /  '+typed+(reveal<1&&Math.floor(local*3)%2?'▏':''),32,204);
    if(item){dx.save();dx.translate(510,362);dx.scale(1.25,1.25);dx.lineWidth=2;dx.strokeStyle='#d0bbf1';dx.fillStyle='rgba(160,138,210,.14)';if(item==='eggplant'){dx.beginPath();dx.ellipse(0,0,24,70,.65,0,TAU);dx.fill();dx.stroke();dx.strokeStyle='#94c8aa';dx.beginPath();dx.moveTo(-35,-48);dx.lineTo(-22,-76);dx.lineTo(-4,-65);dx.stroke()}if(item==='tomato'){dx.strokeStyle='#e1a2a8';dx.fillStyle='rgba(229,112,120,.12)';dx.beginPath();dx.ellipse(0,10,62,49,0,0,TAU);dx.fill();dx.stroke();dx.strokeStyle='#94c8aa';dx.beginPath();for(let k=0;k<6;k++){let a=k/5*TAU;dx.lineTo(Math.cos(a)*28,Math.sin(a)*15-30);dx.lineTo(0,-28)}dx.stroke()}if(item==='cat'){dx.beginPath();dx.moveTo(-51,30);dx.quadraticCurveTo(-62,0,-48,-25);dx.lineTo(-42,-63);dx.lineTo(-15,-39);dx.quadraticCurveTo(0,-43,16,-38);dx.lineTo(44,-63);dx.lineTo(48,-20);dx.quadraticCurveTo(64,30,35,43);dx.quadraticCurveTo(0,63,-51,30);dx.stroke();dx.beginPath();dx.moveTo(-30,5);dx.quadraticCurveTo(-23,0,-16,5);dx.moveTo(16,5);dx.quadraticCurveTo(23,0,30,5);dx.moveTo(-4,20);dx.lineTo(4,20);dx.stroke()}dx.restore();dx.fillStyle='#667c87';dx.font='18px Space';dx.fillText('FORM / '+item.toUpperCase(),32,470)}else{dx.strokeStyle='#496c73';dx.beginPath();dx.moveTo(30,360);for(let x=30;x<990;x+=8){let y=mode==='absence'?360:360+Math.sin(x*.025+local*4)*19*reveal;dx.lineTo(x,y)}dx.stroke();dx.fillStyle='#788897';dx.font='18px Space';dx.fillText(mode==='absence'?'CONNECTION LOST  ·  RETRY '+String(1+Math.floor(local)):'BUILDING THE RESPONSE ...',32,470)}dialogTexture.needsUpdate=true;}
  }
  const wordSets={resonance:['TWO SIGNALS','ONE RHYTHM'],fracture:['A LETTER FAILS','A WORLD FOLLOWS'],formula:['WHAT REMAINS','CANNOT BE ZERO']},words=wordSets[mode];english.visible=!!words&&!inWindow;english.position.set(0,-1.12,.02);english.material.opacity=enter*(1-leave)*.7;
  if(words){let num=Math.min(words.length,Math.floor(local/.8)),ek=i+':'+num;if(ek!==lastEnglishKey){lastEnglishKey=ek;ex.clearRect(0,0,1024,96);ex.font='32px Space';ex.textAlign='center';ex.fillStyle='#7db6ad';ex.fillText(words.slice(0,num).join('  /  '),512,55);englishTexture.needsUpdate=true}}
  const morph=smooth(local/.8),oldMode=STORY_CUES[Math.max(0,i-1)][3];
  paths.forEach((p,k)=>{let attr=p.geometry.attributes.position;for(let j=0;j<360;j++){let u=j/359,A=shape(oldMode,u,t,k),B=shape(mode,u,t,k);attr.setXYZ(j,mix(A[0],B[0],morph),mix(A[1],B[1],morph),mix(A[2],B[2],morph));}attr.needsUpdate=true;let growth=mode==='absence'?1-st.progress*.65:smooth(local/Math.min(2,duration*.6));p.geometry.setDrawRange(0,Math.max(2,Math.floor(360*growth)));p.material.opacity=(k===0?.55:.16)*(1-leave*.4);p.material.color.set(['fracture','execute'].includes(mode)?0xf08c9b:0x8bc8b7);});
  for(let j=0;j<32;j++){let u=j/31,B=shape(mode,u,t,0),growth=smooth(local/Math.min(2,duration*.6));tmp.position.set(...B);tmp.rotation.set(t*.1+j,j,0);tmp.scale.setScalar(smooth((growth-u)*8)*(mode==='absence'?1-st.progress*.8:1));tmp.updateMatrix();nodeMesh.setMatrixAt(j,tmp.matrix)}nodeMesh.instanceMatrix.needsUpdate=true;
  // A visible tether makes the text part of the construction process.
  group.updateMatrixWorld(true);const from=v3(.2,-.9,0).applyMatrix4(group.matrixWorld),to=core.getWorldPosition(v3()),attr=connector.geometry.attributes.position;
  for(let j=0;j<80;j++){let u=j/79;attr.setXYZ(j,mix(from.x,to.x,u),mix(from.y,to.y,u)-Math.sin(u*Math.PI)*.35,mix(from.z,to.z,u));}attr.needsUpdate=true;connector.material.opacity=['circuit','assemble','resonance','bloom'].includes(mode)?enter*(1-leave)*.22:0;
  return st;
 }
 return {update,group,glyphs,paths,storyState};
}
