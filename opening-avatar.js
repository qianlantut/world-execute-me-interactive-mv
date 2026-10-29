// Opening actor: a fragmented frame becomes data, then the original illustration.
// Call update after applyIntroFlourish and lyricObjects.update; this module borrows
// the actor only before 29.56 s and never changes its geometry or material.
function buildOpeningAvatar(){
 const root=new T.Group();root.name='opening-data-avatar';root.visible=false;scene.add(root);
 const source=character,map=source.material.uniforms.uMap.value,COLS=22,ROWS=44,BW=2.78,BH=4.16;
 const sample=document.createElement('canvas');sample.width=COLS*4;sample.height=ROWS*4;const sx=sample.getContext('2d',{willReadFrequently:true});sx.drawImage(map.image,0,0,sample.width,sample.height);const pixels=sx.getImageData(0,0,sample.width,sample.height).data;
 const cells=[];
 for(let row=0;row<ROWS;row++)for(let col=0;col<COLS;col++){
  let a=0;for(let yy=0;yy<4;yy++)for(let xx=0;xx<4;xx++)a=Math.max(a,pixels[(((ROWS-1-row)*4+yy)*sample.width+col*4+xx)*4+3]);
  if(a>6)cells.push({u:(col+.5)/COLS,v:(row+.5)/ROWS,col,row,seed:hash(col*119+row*17+71)});
 }
 const N=cells.length,BOX_COLS=16,BOX_ROWS=Math.ceil(N/BOX_COLS),tile=new T.PlaneGeometry(1,1),geo=new T.InstancedBufferGeometry();geo.index=tile.index;geo.attributes.position=tile.attributes.position;geo.attributes.uv=tile.attributes.uv;geo.instanceCount=N;
 const boxes=[],targets=[],orders=[],seeds=[],ranks=[];
 const ordered=cells.map((c,i)=>({i,rank:1-c.v+.10*Math.sin(c.u*7)+c.seed*.08})).sort((a,b)=>a.rank-b.rank),rankById=[];ordered.forEach((v,i)=>rankById[v.i]=(i+.5)/N);
 cells.forEach((c,i)=>{const column=i%BOX_COLS,row=Math.floor(i/BOX_COLS);boxes.push(((column+.5)/BOX_COLS-.5)*BW,((row+.5)/BOX_ROWS-.5)*BH);targets.push(c.u,c.v);orders.push((i+.5)/N);seeds.push(c.seed);ranks.push(rankById[i]);});
 for(const [name,data,size] of [['aBox',boxes,2],['aTarget',targets,2],['aOrder',orders,1],['aSeed',seeds,1],['aRank',ranks,1]])geo.setAttribute(name,new T.InstancedBufferAttribute(new Float32Array(data),size));
 // The texture is only the word; it never contains a portrait or a filled panel.
 const ink=document.createElement('canvas');ink.width=192;ink.height=80;const ix=ink.getContext('2d');ix.font='600 68px Space, monospace';ix.textAlign='center';ix.textBaseline='middle';ix.fillStyle='#ffffff';ix.fillText('data',96,42);const textMap=new T.CanvasTexture(ink);textMap.minFilter=T.LinearFilter;textMap.magFilter=T.LinearFilter;
 const uniforms={uMap:{value:map},uData:{value:textMap},uTime:{value:0},uFill:{value:0},uMorph:{value:0},uReveal:{value:0},uAlpha:{value:1},uCount:{value:N},uBoxSize:{value:new T.Vector2(BW/BOX_COLS,BH/BOX_ROWS)},uTargetSize:{value:new T.Vector2(3.7/COLS,5.55/ROWS)},uGrid:{value:new T.Vector2(COLS,ROWS)}};
 const material=new T.ShaderMaterial({transparent:true,side:T.DoubleSide,depthTest:false,depthWrite:false,uniforms,
  vertexShader:`
   attribute vec2 aBox,aTarget;attribute float aOrder,aSeed,aRank;
   uniform float uTime,uFill,uMorph,uCount;uniform vec2 uBoxSize,uTargetSize,uGrid;
   varying vec2 vUv,vMap;varying float vLive,vSeed,vRank;
   void main(){
    vUv=uv;vMap=aTarget+(uv-.5)/uGrid;vSeed=aSeed;vRank=aRank;
    vLive=smoothstep(aOrder-.5/uCount,aOrder+.5/uCount,uFill);
    float arrival=smoothstep(0.,2.8/uCount,max(0.,uFill-aOrder));
    vec2 box=aBox+(uv-.5)*uBoxSize;
    box+=vec2(-.23,.11)*(1.-arrival)*(1.-uMorph);
    vec2 target=(vMap-.5)*vec2(3.7,5.55);
    float stagger=clamp(uMorph*1.18-aSeed*.18,0.,1.);
    float morph=stagger*stagger*(3.-2.*stagger);
    vec3 p=vec3(mix(box,target,morph),0.);
    p.x+=sin(morph*3.141593)*(aSeed-.5)*.58;
    p.y+=sin(morph*3.141593)*(.12+.18*aSeed);
    p.z+=sin(morph*3.141593)*sin(aSeed*6.283185)*.32;
    // The source illustration's hair, sleeves and breathing continue in data.
    float edge=smoothstep(.1,.42,abs(vMap.x-.5)),tip=pow(1.-vMap.y,1.6);
    float arm=smoothstep(.18,.34,abs(vMap.x-.5))*smoothstep(.49,.58,vMap.y)*(1.-smoothstep(.73,.8,vMap.y));
    float side=sign(vMap.x-.5),a=side*sin(uTime*.85)*.07*arm*morph;vec2 pivot=vec2(side*.75,1.18),q=p.xy-pivot;
    p.xy=pivot+mat2(cos(a),-sin(a),sin(a),cos(a))*q;
    p.x+=(sin(uTime*1.8+vMap.y*5.)*.085*edge+sin(uTime*.9)*.016*tip)*morph;
    p.z+=sin(vMap.y*6.+uTime*1.4)*.08*edge*morph;
    p.y+=sin(uTime*2.1)*.012*sin(vMap.y*3.14159)*morph;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
   }`,
  fragmentShader:`
   uniform sampler2D uMap,uData;uniform float uTime,uFill,uMorph,uReveal,uAlpha;
   varying vec2 vUv,vMap;varying float vLive,vSeed,vRank;
   void main(){
    vec4 c=texture2D(uMap,vMap);float mask=smoothstep(.025,.18,c.a);
    float ink=texture2D(uData,vec2(vUv.x,clamp((vUv.y-.16)/.68,0.,1.))).a;
    ink*=step(.16,vUv.y)*step(vUv.y,.84);
    float isColor=smoothstep(vRank-.013,vRank+.013,uReveal)*smoothstep(.62,.98,uMorph);
    if(uReveal<.00001)isColor=0.;if(uReveal>.999)isColor=1.;
    vec3 dataColor=mix(vec3(.48,.65,.65),vec3(.77,.83,.72),vSeed);
    dataColor*=.85+.15*sin(uTime*1.5+vSeed*6.28);
    float dataAlpha=ink*mix(1.,mask,smoothstep(.58,1.,uMorph));
    float alpha=mix(dataAlpha,c.a,isColor)*vLive*uAlpha;
    float edge=(1.-smoothstep(.0,.018,abs(vRank-uReveal)))*step(.001,uReveal)*step(uReveal,.995);
    vec3 color=mix(dataColor,c.rgb*vec3(.88,.91,1.),isColor)+vec3(.12,.24,.22)*edge*.32;
    if(alpha<.008)discard;gl_FragColor=vec4(color,alpha);
   }`});
 const data=new T.Mesh(geo,material);data.name='data-alpha-silhouette';data.frustumCulled=false;data.renderOrder=source.renderOrder+1;root.add(data);
 const framePositions=new Float32Array(12*8*3),frameColors=new Float32Array(12*8*3),fg=new T.BufferGeometry();fg.setAttribute('position',new T.BufferAttribute(framePositions,3));fg.setAttribute('color',new T.BufferAttribute(frameColors,3));
 const fm=new T.ShaderMaterial({vertexColors:true,transparent:true,depthTest:false,depthWrite:false,uniforms:{uOpacity:{value:1}},vertexShader:'varying vec3 vColor;void main(){vColor=color;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 vColor;uniform float uOpacity;void main(){float a=max(vColor.r,max(vColor.g,vColor.b));if(a<.001)discard;gl_FragColor=vec4(vec3(.64,.83,.80),a*uOpacity);}'});const frame=new T.LineSegments(fg,fm);frame.frustumCulled=false;frame.renderOrder=data.renderOrder+1;root.add(frame);
 let lastTime=null,startAt=null,borrowed=false,savedVisibility=false,savedAlpha=1,current={visible:false,fill:0,reveal:0,framephase:'off'};
 const helper=new T.Vector3();
 function drawFrame(t,assembly,morph){
  const weld=smooth((t-6.45)/.86),opacity=(1-smooth(morph/.72))*.85;fm.uniforms.uOpacity.value=opacity;frame.visible=opacity>.001;
  let n=0;for(let row=0;row<4;row++)for(let col=0;col<3;col++){
   const id=row*3+col,cx=((col+.5)/3-.5)*BW,cy=((row+.5)/4-.5)*BH;
   const rest=1-assembly,ang=(hash(id+16)-.5)*1.35*rest+Math.sin(t*.58+id)*.045*rest;
   const ox=(col-1)*.16*rest+(hash(id+40)-.5)*.38*rest,oy=(row-1.5)*.13*rest+Math.sin(t*.63+id*.72)*.10*rest;
   const halfW=BW/6-.018*(1-weld),halfH=BH/8-.018*(1-weld),corners=[[-halfW,-halfH],[halfW,-halfH],[halfW,halfH],[-halfW,halfH]];
   for(let edge=0;edge<4;edge++)for(let end=0;end<2;end++){
    const [px,py]=corners[(edge+end)%4],outer=(edge===0&&row===0)||(edge===1&&col===2)||(edge===2&&row===3)||(edge===3&&col===0),light=outer?.88:.60*(1-weld);
    framePositions.set([cx+ox+px*Math.cos(ang)-py*Math.sin(ang),cy+oy+px*Math.sin(ang)+py*Math.cos(ang),(hash(id+87)-.5)*.50*rest+.025],n*3);
    frameColors.set([light*.64,light*.83,light*.80],n*3);n++;
   }
  }fg.attributes.position.needsUpdate=true;fg.attributes.color.needsUpdate=true;
 }
 function reset(){root.visible=false;if(borrowed){source.visible=savedVisibility;source.material.uniforms.uAlpha.value=savedAlpha;}borrowed=false;lastTime=null;startAt=null;current={visible:false,fill:0,reveal:0,framephase:'off'};}
 function update(t){
  if(t<0||t>=29.56){root.visible=false;borrowed=false;current={...current,visible:false,fill:t>=29.56?1:0,reveal:t>=29.56?1:0,coloredTiles:t>=29.56?N:0,framephase:'off'};lastTime=t;return;}
  if(lastTime!==null&&t<lastTime-.05){startAt=null;}lastTime=t;
  const play=lyricObjects?.play??{value:(k,v)=>v},clicked=play.value('worldStartAt',null);
  if(clicked!==null&&clicked>=13.82&&clicked<=t)startAt=startAt===null?clicked:Math.min(startAt,clicked);
  const begin=startAt??15,morph=smooth((t-begin)/1.18),assembly=smooth((t-3.66)/3.34);
  let fill=0;if(t>=11.05)fill=worldLoadState(play,t).percent/100;else if(t>=7.31){const natural=.35*smooth((t-7.31)/3.74),count=lyricObjects?.semantic?.state?.().bodies?.length??0;fill=Math.min(.35,Math.max(natural,count/90));}
  if(t>=13.82)fill=1;
  const progress=typeof rhythmGame?.preludeProgress==='function'?rhythmGame.preludeProgress(t):smooth((t-15.25)/13.2),reveal=t<15?0:clamp(progress);
  savedVisibility=source.visible;savedAlpha=source.material.uniforms.uAlpha.value;borrowed=true;
  root.position.copy(source.position);root.quaternion.copy(source.quaternion);root.scale.copy(source.scale);
  helper.set((camera.aspect<.9?0:.90)*(1-morph),0,0).applyQuaternion(source.quaternion);root.position.add(helper);
  root.visible=(started||preview!==null);pointMat.uniforms.uOpacity.value*=mix(.15,1,reveal);source.visible=false;source.material.uniforms.uAlpha.value=0;
  uniforms.uTime.value=t;uniforms.uFill.value=fill;uniforms.uMorph.value=morph;uniforms.uReveal.value=reveal;uniforms.uAlpha.value=1-smooth((t-29.32)/.24);
  drawFrame(t,assembly,morph);
  current={visible:root.visible,fill,reveal,assembly,shapeMorph:morph,startAt:begin,framephase:t<3.66?'broken':t<7.31?'assembling':t<11.05?'filling':t<13.82?'initializing':t<begin?'ready':morph<1?'reassembling':reveal<.999?'restoring':'complete',tiles:N,filledTiles:Math.round(N*fill),coloredTiles:Math.round(N*reveal),sourceAlpha:savedAlpha,opacity:uniforms.uAlpha.value,position:root.position.toArray(),quaternion:root.quaternion.toArray(),scale:root.scale.toArray(),frameOpacity:fm.uniforms.uOpacity.value};
 }
 return {update,reset,state:()=>({...current})};
}
