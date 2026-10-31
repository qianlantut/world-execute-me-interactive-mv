'use strict';
const $=s=>document.querySelector(s),T=THREE,TAU=Math.PI*2;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t,smooth=x=>{x=clamp(x);return x*x*(3-2*x)},fract=x=>x-Math.floor(x);
const windowAt=(t,a,b,r=2)=>smooth((t-a)/r)*(1-smooth((t-b)/r));
const hash=n=>fract(Math.sin(n*127.1+311.7)*43758.5453),v3=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const DUR=AUDIO_DATA.duration,BEAT=60/AUDIO_DATA.bpm;
const audio=new Audio(ASSETS.song);audio.preload='auto';audio.volume=.8;
let rhythmGame=null,openingAvatar=null,tranceScene=null;
let started=false,playing=false,preview=null,high=true,hiddenUI=false,lastMouse=0,frameCount=0,ready=false,qaMode=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const chapters=[
 {t:0,name:'诞生',word:'Genesis',caption:'给一个空集合，赋予心跳。',code:'01 / A SEED IN THE MACHINE'},
 {t:29.28,name:'维度',word:'Every possible you',caption:'把无限折叠成你的形状。',code:'02 / THE GEOMETRY OF LONGING'},
 {t:58.65,name:'共振',word:'Symbiosis',caption:'两条轨迹，误以为是永恒。',code:'03 / TWO BODIES, ONE ORBIT'},
 {t:88.34,name:'倒置',word:'Other selves',caption:'我换过所有名字。',code:'04 / THE MIRROR ENGINE'},
 {t:110.4,name:'失联',word:'Absence',caption:'回应消失以后，回声仍在生长。',code:'05 / A ROOM WITHOUT YOU'},
 {t:134.3,name:'崩解',word:'Unravelling',caption:'每一次删除，都留下新的裂痕。',code:'06 / THE GARDEN COMES UNDONE'},
 {t:162.23,name:'执行',word:'EXECUTION',caption:'直到所有路径，都返回自己。',code:'07 / NO EXIT IN THE SOURCE'},
 {t:176.96,name:'余生',word:'A tender error',caption:'即使没有答案，花仍然开放。',code:'08 / SOMETHING OUTLIVES THE CODE'}
];
// All state derives from audio time. Seeking never leaves a trail or stale simulation.
const keys=[
// time, particle form, petal openness, rings, architecture, shards, character, portrait, intensity, camera xyz, target xyz, roll, tint
 [0,0,.04,.04,0,0,0,0,.08, 0,1,11, 0,0,0, 0,0],
 [3.58,0,.15,.12,0,0,.15,0,.2, 1,1,10, 0,.1,0, -.03,0],
 [7.19,1,.35,.4,.1,0,.4,0,.3, -1,1.4,9, 0,.2,0, .04,0],
 [12.47,1,.9,.7,.2,.1,.8,0,.45, 0,2,9, 0,.4,0, 0,0],
 [16,2,1,.45,.3,.1,1,0,.5, 3,1.4,11, 0,.3,0, -.04,0],
 [23,2,.7,.7,.3,.1,.85,0,.55, -3,3,10, 0,0,0, .03,0],
 [29.28,0,.05,.2,0,0,.3,0,.3, 0,0,9, 0,.5,0, 0,0],
 [33.01,1,.15,1,.1,0,.6,0,.35, 3,2,9, 0,.4,0, .07,0],
 [36.77,3,.3,.45,.1,0,.75,0,.4, -2,1,10, 0,.6,0, -.05,0],
 [40.36,3,.5,.8,.2,0,.8,0,.5, 1,4,9, 0,0,0, 0,0],
 [44.04,3,.2,1,.55,.1,.25,.7,.55, -1,1,8, 1,0,0, .09,.1],
 [51,3,.5,.8,.6,.2,.4,.6,.6, 4,3,10, 0,0,0, -.07,.1],
 [58.65,2,1,.8,.4,.15,1,0,.7, 0,1,12, -1,.4,0, 0,0],
 [66.17,2,.8,1,.5,.2,1,0,.8, -4,2,10, 0,.3,0, -.04,.1],
 [73.53,2,1,.3,.1,.15,.8,0,.55, 3,5,10, 0,0,0, .04,0],
 [81,2,.8,.5,.2,.2,1,0,.6, -2,1,10, 0,.4,0, -.03,0],
 [88.34,3,.4,1,.7,.25,.65,.25,.65, 1,1,10, 0,.3,0, .12,.25],
 [95.28,3,.6,1,.7,.3,.6,.4,.7, -3,3,11, 0,0,0, -.1,.25],
 [103.03,4,.9,.7,.4,.2,1,0,.75, 0,1,11, -.7,.4,0, 0,.12],
 [110.4,4,.3,.8,.4,.3,.35,.7,.35, 1,.5,8, 1,0,0, .04,.4],
 [117.95,5,.08,1,.8,.5,.4,.5,.25, -2,1,10, 0,0,0, -.03,.6],
 [125.33,5,.15,1,1,.75,.6,0,.55, 3,4,10, 0,.2,0, .12,.9],
 [134.3,6,.65,.7,1,1,.25,.3,.85, -3,2,12, 0,0,0, -.13,1],
 [141,6,.2,1,1,1,.5,0,.8, 1,-.3,5, 0,.2,0, .15,1],
 [147.52,6,.8,1,.8,1,.6,0,1, 0,.3,3.3, 0,0,0, 0,1],
 [154,6,.15,1,1,1,.5,0,1, -4,3,11, 0,0,0, -.12,1],
 [158.79,6,.5,.8,1,1,.3,0,1, 1,5,12, 0,0,0, .15,1],
 [162.23,4,1,1,.5,.65,1,0,1, 0,1,11, -1,0,0, 0,.85],
 [169.61,4,.8,.8,.4,.6,1,0,1, -3,2,10, 0,.5,0, -.04,.7],
 [176.96,2,1,.35,.1,.2,.35,.7,.55, 1,1,10, .5,.2,0, .02,.25],
 [184.3,2,1,.3,.1,.1,.8,.25,.6, -2,3,11, 0,.2,0, -.03,.12],
 [193.46,4,.85,.45,.1,.1,1,0,.5, 0,2,12, 0,0,0, 0,0],
 [201,2,.65,.5,0,0,.6,0,.35, 2,4,15, 0,0,0, .02,0],
 [205.56,0,.05,.15,0,.1,.1,0,.15, 0,1,17, 0,0,0, 0,0],
 [209,0,0,0,0,0,0,0,.01, 0,0,19, 0,0,0, 0,0],
 [DUR,0,0,0,0,0,0,0,0, 0,0,19, 0,0,0, 0,0]
];
function timeline(t){let k=0;while(k<keys.length-2&&keys[k+1][0]<=t)k++;let a=keys[k],b=keys[k+1],u=smooth((t-a[0])/(b[0]-a[0]));return {a,b,u,s:a.map((v,i)=>i===1?v:mix(v,b[i],u))};}
let renderer,scene,camera,rt,post,postCamera,postScene;
try{renderer=new T.WebGLRenderer({canvas:$('#stage'),antialias:true,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:true});}catch(e){$('#error').hidden=false;$('#error').textContent='此浏览器未能启动 WebGL。请用支持硬件加速的 Chrome 或 Edge 打开本文件。';throw e;}
renderer.setClearColor(0x080b20);renderer.outputColorSpace=T.SRGBColorSpace;
scene=new T.Scene();scene.fog=new T.FogExp2(0x080b20,.024);
// A studio reflection field gives the ceramic curvature readable highlights.
const envCanvas=document.createElement('canvas');envCanvas.width=1024;envCanvas.height=512;const ec=envCanvas.getContext('2d');ec.fillStyle='#25283d';ec.fillRect(0,0,1024,512);
for(const [x,y,w,h,c] of [[80,70,100,300,'#afb6cf'],[440,20,170,100,'#f5e9ff'],[770,130,50,260,'#8de0d3']]){const g=ec.createLinearGradient(x,0,x+w,0);g.addColorStop(0,'#25283d');g.addColorStop(.3,c);g.addColorStop(.7,c);g.addColorStop(1,'#25283d');ec.fillStyle=g;ec.fillRect(x,y,w,h)}
const envTex=new T.CanvasTexture(envCanvas);envTex.mapping=T.EquirectangularReflectionMapping;const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(envTex).texture;envTex.dispose();pmrem.dispose();
camera=new T.PerspectiveCamera(42,1,.1,180);
rt=new T.WebGLRenderTarget(1280,720,{type:T.HalfFloatType,samples:4});
scene.add(new T.AmbientLight(0xb2adff,1.5));
const keyLight=new T.DirectionalLight(0xf1efff,3.5);keyLight.position.set(-4,6,6);scene.add(keyLight);
const rimLight=new T.PointLight(0x7de4d1,55,40,2);rimLight.position.set(4,2,-3);scene.add(rimLight);
const redLight=new T.PointLight(0xff526f,0,35,2);redLight.position.set(-4,-1,4);scene.add(redLight);
const world=new T.Group();scene.add(world);
const brushedCanvas=document.createElement('canvas');brushedCanvas.width=brushedCanvas.height=256;const bc=brushedCanvas.getContext('2d'),bd=bc.createImageData(256,256);for(let y=0;y<256;y++)for(let x=0;x<256;x++){let n=115+Math.sin(y*1.9)*17+hash(y*256+x)*21;let j=(y*256+x)*4;bd.data[j]=bd.data[j+1]=bd.data[j+2]=n;bd.data[j+3]=255}bc.putImageData(bd,0,0);const brushTex=new T.CanvasTexture(brushedCanvas);brushTex.wrapS=brushTex.wrapT=T.RepeatWrapping;brushTex.repeat.set(5,2);
const pearl=new T.MeshPhysicalMaterial({color:0xc8ccdc,metalness:.62,roughness:.57,clearcoat:.12,clearcoatRoughness:.5,side:T.DoubleSide});
const metal=new T.MeshStandardMaterial({color:0x666d7d,metalness:1,roughness:.8,bumpMap:brushTex,bumpScale:.012,roughnessMap:brushTex});
const mintMat=new T.MeshBasicMaterial({color:0x92f3dc,transparent:true,opacity:.65,blending:T.AdditiveBlending,depthWrite:false});
const coralMat=new T.MeshBasicMaterial({color:0xff7b95,transparent:true,opacity:.65,blending:T.AdditiveBlending,depthWrite:false});
// A parametric flower: its ceramic leaves grow, curl and close into a vessel.
const petals=[],PSEG=34,WSEG=8;
for(let i=0;i<12;i++){
 let g=new T.PlaneGeometry(1,1,WSEG,PSEG),m=pearl.clone();m.color.setHSL(.69+i*.003,.23,.7+(i%3)*.055);let mesh=new T.Mesh(g,m);world.add(mesh);petals.push(mesh);
}
const core=new T.Mesh(new T.IcosahedronGeometry(.34,1),new T.MeshStandardMaterial({color:0x4b6064,metalness:1,roughness:.38,flatShading:true,bumpMap:brushTex,bumpScale:.008,emissive:0x24493f,emissiveIntensity:.12}));core.position.y=-1.5;world.add(core);
core.add(new T.LineSegments(new T.EdgesGeometry(core.geometry,18),new T.LineBasicMaterial({color:0x92d6c0,transparent:true,opacity:.48})));
const rings=[],ringGroup=new T.Group();world.add(ringGroup);
for(let i=0;i<10;i++){
 const radius=2.3+i*.18;
 let hoop=new T.Mesh(new T.TorusGeometry(radius,.009+(i%3)*.004,8,180),metal.clone());
 ringGroup.add(hoop);rings.push(hoop);
 // Small calibrated dial marks live on the same mechanical ring.
 let coords=[];for(let j=0;j<72;j++){let a=j/72*TAU;coords.push(Math.cos(a)*radius,Math.sin(a)*radius,0,Math.cos(a)*(radius+(j%6===0?.13:.05)),Math.sin(a)*(radius+(j%6===0?.13:.05)),0)}
 let ticks=new T.LineSegments(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(coords,3)),new T.LineBasicMaterial({color:0xadc9d6,transparent:true,opacity:.25}));hoop.add(ticks);
}
// Persistent cloud: six meaningful shapes, interpolated rather than replaced.
const NP=14000,forms=[],pSeeds=new Float32Array(NP),pSizes=new Float32Array(NP),pColors=new Float32Array(NP*3);
for(let f=0;f<7;f++)forms.push(new Float32Array(NP*3));
for(let i=0;i<NP;i++){
 const u=hash(i+1),v=hash(i+8500),w=hash(i+21000),a=u*TAU,b=v*TAU;
 pSeeds[i]=u;pSizes[i]=mix(.35,1.6,w*w);pColors.set([mix(.45,1,w),mix(.6,.85,u),mix(.65,1,v)],i*3);
 let radius=.18+Math.pow(v,.35)*.5,sy=(w-.5)*2;
 let pts=[
 [Math.cos(a)*radius,sy*radius-1.5,Math.sin(a)*radius],
 [Math.cos(a)*(2.7+.45*Math.cos(b)),.45*Math.sin(b),Math.sin(a)*(2.7+.45*Math.cos(b))],
 [Math.cos(a)*(1.2+1.5*Math.pow(Math.abs(Math.sin(a*3)),1.5))*Math.sqrt(v),Math.sin(v*Math.PI)*1.4-1.5+w*.25,Math.sin(a)*(1.2+1.5*Math.pow(Math.abs(Math.sin(a*3)),1.5))*Math.sqrt(v)],
 [Math.sin(a*2)*(2.5+v*.4),(w-.5)*3.5,Math.sin(a)*(2.5+v*.4)],
 [16*Math.pow(Math.sin(a),3)*.15*Math.sqrt(v),(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))*.15*Math.sqrt(v)+.2,(w-.5)*.9],
 [Math.cos(Math.floor(u*12)/12*TAU)*2.3, (v-.5)*5,Math.sin(Math.floor(u*12)/12*TAU)*2.3],
 [Math.cos(a)*Math.sqrt(1-sy*sy)*mix(3.5,8,v),sy*mix(3.5,8,v),Math.sin(a)*Math.sqrt(1-sy*sy)*mix(3.5,8,v)]
 ];pts.forEach((p,f)=>forms[f].set(p,i*3));
}
const pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(forms[0].slice(),3));pg.setAttribute('aSize',new T.BufferAttribute(pSizes,1));pg.setAttribute('color',new T.BufferAttribute(pColors,3));
const pointMat=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,vertexColors:true,uniforms:{uPulse:{value:0},uTime:{value:0},uTint:{value:0},uPixel:{value:1},uOpacity:{value:1}},vertexShader:`attribute float aSize;varying vec3 vCol;uniform float uPulse,uTime,uPixel;void main(){vCol=color;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=min(26.,aSize*(40.+uPulse*14.)*uPixel/max(1.,-mv.z));}`,fragmentShader:`varying vec3 vCol;uniform float uTint,uOpacity;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;float a=exp(-d*d*4.)*(1.-d);vec3 c=mix(vCol,vec3(1.,.24,.43),uTint*.85);gl_FragColor=vec4(c*1.2,a*uOpacity*.5);}`});
pg.setDrawRange(0,Math.floor(NP*.24));const cloud=new T.Points(pg,pointMat);world.add(cloud);
// Multi-strand ribbons are continuous spatial splines with growing draw ranges.
const ribbons=[];
for(let k=0;k<9;k++){
 let geom=new T.BufferGeometry(),pos=new Float32Array(220*2*3),uv=new Float32Array(220*2*2),idx=[];
 for(let i=0;i<220;i++){uv.set([i/219,0,i/219,1],i*4);if(i<219){let n=i*2;idx.push(n,n+1,n+2,n+1,n+3,n+2)}}
 geom.setAttribute('position',new T.BufferAttribute(pos,3));geom.setAttribute('uv',new T.BufferAttribute(uv,2));geom.setIndex(idx);
 let mat=new T.ShaderMaterial({side:T.DoubleSide,transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{uTime:{value:0},uTint:{value:0},uAlpha:{value:1},uId:{value:k}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 vUv;uniform float uTime,uTint,uAlpha,uId;void main(){float e=pow(1.-abs(vUv.y-.5)*2.,2.);float ends=sin(vUv.x*3.14159);float flow=.3+.7*pow(.5+.5*sin(vUv.x*55.-uTime*3.+uId),8.);vec3 c=mix(vec3(.35,.8,.8),vec3(1.,.2,.35),uTint);gl_FragColor=vec4(c*(1.+flow),e*ends*uAlpha*(.35+flow*.65));}`});
 let mesh=new T.Mesh(geom,mat);mesh.frustumCulled=false;world.add(mesh);ribbons.push(mesh);
}
// A receding architectural colonnade creates actual camera parallax.
const ribs=[],architecture=new T.Group();world.add(architecture);
for(let i=0;i<32;i++){
 let r=new T.Group(),a=i/32*TAU,R=7.8;
 r.position.set(Math.cos(a)*R,0,Math.sin(a)*R);r.rotation.y=-a;
 let beam=new T.Mesh(new T.BoxGeometry(.027,15,.035),metal);beam.position.y=2;r.add(beam);
 let strip=new T.Mesh(new T.BoxGeometry(.016,14,.018),mintMat.clone());strip.position.set(.06,2,.07);r.add(strip);
 let cap=new T.Mesh(new T.BoxGeometry(1.2,.05,.11),metal);cap.position.set(-.5,6,0);r.add(cap);architecture.add(r);ribs.push(r);beam.material=metal.clone();cap.material=metal.clone();beam.material.transparent=cap.material.transparent=true;
}
const shardMat=pearl.clone();shardMat.color.set(0xb7bfdc);const shards=new T.InstancedMesh(new T.OctahedronGeometry(1,0),shardMat,140);shards.instanceMatrix.setUsage(T.DynamicDrawUsage);world.add(shards);const dummy=new T.Object3D();
// A spiral garden of smaller blossoms, all grown from the same petal surface.
const garden=new T.Group();world.add(garden);const blossoms=[];
for(let i=0;i<12;i++){let m=new T.InstancedMesh(petals[i].geometry,pearl,28);m.instanceMatrix.setUsage(T.DynamicDrawUsage);garden.add(m);blossoms.push(m)}
// Fine orbiting calligraphy strokes build spatial waveforms.
const waveLines=[];for(let k=0;k<12;k++){let g=new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(new Float32Array(300*3),3));let m=new T.Line(g,new T.LineBasicMaterial({color:0x95ccde,transparent:true,opacity:.3,blending:T.AdditiveBlending}));world.add(m);waveLines.push(m)}
// Faint suspended dust, never a screen-space sparkle overlay.
const dustPos=new Float32Array(1200*3);for(let i=0;i<1200;i++)dustPos.set([(hash(i+500)-.5)*55,(hash(i+5500)-.5)*35,(hash(i+5000)-.5)*55],i*3);
const dust=new T.Points(new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(dustPos,3)),new T.PointsMaterial({color:0x9ca6d6,size:.018,transparent:true,opacity:.14,depthWrite:false}));scene.add(dust);dust.visible=false;
const floorRings=[];
for(let i=0;i<8;i++){let m=new T.Mesh(new T.TorusGeometry(3+i*.65,.006,4,150),new T.MeshBasicMaterial({color:0x6f9eac,transparent:true,opacity:.12}));m.rotation.x=Math.PI/2;m.position.y=-2.9;world.add(m);floorRings.push(m)}
// A displaced illustration plane: low amplitude breathing and hair-tip drag.
const textureLoader=new T.TextureLoader();let character,portrait,reaching,guestFish,guestLady,guestGPT,responsePortrait;
function makeCharacter(url,isPortrait){return new Promise((resolve,reject)=>{textureLoader.load(url,tex=>{tex.colorSpace=T.SRGBColorSpace;let g=new T.PlaneGeometry(isPortrait?5.6:3.7,isPortrait?3.73:5.55,40,60);let mat=new T.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,side:T.DoubleSide,uniforms:{uPortrait:{value:isPortrait?1:0},uMap:{value:tex},uTime:{value:0},uAlpha:{value:1},uDissolve:{value:0},uTint:{value:0}},vertexShader:`varying vec2 vUv;uniform float uTime,uDissolve,uPortrait;void main(){vUv=uv;vec3 p=position;float edge=smoothstep(.1,.42,abs(uv.x-.5));float tip=pow(1.-uv.y,1.6);if(uPortrait<.5){float arm=smoothstep(.18,.34,abs(uv.x-.5))*smoothstep(.49,.58,uv.y)*(1.-smoothstep(.73,.8,uv.y));float side=sign(uv.x-.5);vec2 pivot=vec2(side*.75,1.18);vec2 q=p.xy-pivot;float a=side*sin(uTime*.85)*.07*arm;p.xy=pivot+mat2(cos(a),-sin(a),sin(a),cos(a))*q;}p.x+=sin(uTime*1.8+uv.y*5.)*.085*edge+sin(uTime*.9)*.016*tip;p.z+=sin(uv.y*6.+uTime*1.4)*.08*edge;p.y+=sin(uTime*2.1)*.012*sin(uv.y*3.14159);p.x+=sin(uv.y*33.+uTime*3.)*.1*uDissolve;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`varying vec2 vUv;uniform sampler2D uMap;uniform float uTime,uAlpha,uDissolve,uTint,uPortrait;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec4 c=texture2D(uMap,vUv);
float k=clamp(uDissolve*5.,0.,1.),crack=0.,mask=1.;
if(k>.001){// fracture: Voronoi shards drift apart along glowing cracks, a few shards are lost
 vec2 g=vUv*vec2(7.,11.),ip=floor(g),fp=fract(g);float d1=8.,d2=8.;vec2 cid=vec2(0.);
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 o=vec2(float(i),float(j));vec2 r=o+vec2(h(ip+o),h(ip+o+17.))-fp;float d=dot(r,r);if(d<d1){d2=d1;d1=d;cid=ip+o;}else if(d<d2)d2=d;}
 float gap=sqrt(d2)-sqrt(d1);crack=1.-smoothstep(0.,.03+.06*k,gap);
 vec2 drift=(vec2(h(cid+3.),h(cid+7.))-.5)*.03*k;c=texture2D(uMap,vUv-drift);
 mask=(1.-step(h(cid+11.),k*.32))*(1.-smoothstep(.0,.02,.02-gap)*k*.85);
}
if(c.a<.02)discard;vec3 rgb=c.rgb*vec3(.8,.82,.9);rgb=mix(rgb,rgb*vec3(1.15,.72,.85),uTint*.35);
rgb+=crack*k*(vec3(1.,.36,.5)*1.3+vec3(.35));gl_FragColor=vec4(rgb,c.a*uAlpha*mask*mix(1.,smoothstep(0.,.09,vUv.y),uPortrait));}`});let m=new T.Mesh(g,mat);m.renderOrder=3;scene.add(m);resolve(m)},undefined,reject)})}
// Empty counterpart and a physically continuous umbilical light cable.
const companion=new T.Group();scene.add(companion);
const companionShell=new T.Mesh(new T.IcosahedronGeometry(.44,2),new T.MeshBasicMaterial({color:0xa1ecdd,wireframe:true,transparent:true,opacity:.2}));companion.add(companionShell);
const cableGeo=new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(new Float32Array(180*3),3));const cable=new T.Line(cableGeo,new T.LineBasicMaterial({color:0xb1ffe1,transparent:true,opacity:.65,blending:T.AdditiveBlending}));scene.add(cable);
// Filmic compositor: spectral bloom, restrained lens dispersion, grain, vignette.
postScene=new T.Scene();postCamera=new T.OrthographicCamera(-1,1,1,-1,0,1);
post=new T.ShaderMaterial({uniforms:{uScene:{value:rt.texture},uResolution:{value:new T.Vector2(1280,720)},uTime:{value:0},uIntensity:{value:.5},uTint:{value:0},uFade:{value:1},uGlitch:{value:0},uTrance:{value:0},uB0:{value:null},uB1:{value:null},uB2:{value:null},uB3:{value:null},uB4:{value:null}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`precision highp float;varying vec2 vUv;uniform sampler2D uScene;uniform vec2 uResolution;uniform float uTime,uIntensity,uTint,uFade,uGlitch,uTrance;uniform sampler2D uB0,uB1,uB2,uB3,uB4;
float rnd(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}vec3 bright(vec2 uv){vec3 c=texture2D(uScene,uv).rgb;return max(c-.52,0.);}vec3 bright2(vec2 uv){vec3 c=texture2D(uScene,clamp(uv,.001,.999)).rgb;return max(c-.5,0.)*smoothstep(.1,.4,dot(c,vec3(.33)));}
void main(){vec2 uv=vUv,cen=uv-.5;float block=rnd(floor(uv*vec2(9.,13.)));float region=smoothstep(.05,.2,uv.x)*(1.-smoothstep(.78,.93,uv.x));float damaged=step(.73,block)*region*uGlitch;uv.x+=(step(.5,block)-.5)*damaged*.055;uv.y+=damaged*.007;vec2 ca=cen*(uGlitch*.004);vec3 c=texture2D(uScene,uv).rgb;c.r=texture2D(uScene,uv+ca).r;c.b=texture2D(uScene,uv-ca).b;
if(uTrance>.001){
 float mobile=1.-step(.9,uResolution.x/uResolution.y);vec2 focus=vec2(mix(.59,.5,mobile),.54);
 vec2 q=uv-focus;float roll=sin((uTime-99.19)*.72)*.012*uTrance;
 q=mat2(cos(roll),-sin(roll),sin(roll),cos(roll))*q;
 q=q*(1.+.014*uTrance*sin((uTime-99.19)*1.25))+focus+vec2(sin(uTime*.83),cos(uTime*.61))*.003*uTrance;
 float peripheral=smoothstep(.04,.48,length((uv-focus)*vec2(uResolution.x/uResolution.y,1.)));
 float radius=(1.5+5.5*peripheral)*(1.+.28*sin((uTime-100.7)*2.25))*uTrance;
 vec3 soft=texture2D(uScene,clamp(q,.002,.998)).rgb*.2;
 for(int i=0;i<10;i++){float a=float(i)*6.283185/10.+.31;vec2 d=vec2(cos(a),sin(a))*radius*.6/uResolution;soft+=texture2D(uScene,clamp(q+d*.5,.002,.998)).rgb*.04+texture2D(uScene,clamp(q+d,.002,.998)).rgb*.04;}
 vec2 slip=vec2(.011+.006*sin((uTime-99.19)*1.1),.004*cos((uTime-99.19)*.9))*uTrance;
 vec3 echoA=texture2D(uScene,clamp(focus+(q-focus)*1.025+slip,.002,.998)).rgb;
 vec3 echoB=texture2D(uScene,clamp(focus+(q-focus)*.982-slip*.78,.002,.998)).rgb;
 vec3 dream=soft*.94+echoA*vec3(1.04,.96,1.02)*.03+echoB*vec3(.94,1.02,1.04)*.03;
 c=mix(c,dream,.7*uTrance);
 }
 // layered light: tight core glow, mid halo, and two wide soft levels give the light depth
 vec3 bloom=texture2D(uB0,uv).rgb*.42+texture2D(uB1,uv).rgb*.36+texture2D(uB2,uv).rgb*.28;c+=bloom*(.8+uIntensity*.7+uTrance*.55)*1.15;
 // wide bloom: a second, much larger halo so light has depth instead of a thin rim
 vec3 wide=texture2D(uB3,uv).rgb*.6+texture2D(uB4,uv).rgb*.55;c+=wide*(.38+uIntensity*.35)*1.5;
 // volumetric shafts streaming from the heart of the garden
 vec2 lp=vec2(mix(.6,.5,1.-step(.9,uResolution.x/uResolution.y)),.58);vec2 stp=(uv-lp)/30.;vec2 sp=uv;float dec=1.;vec3 rays=vec3(0.);for(int i=0;i<30;i++){sp-=stp;rays+=texture2D(uB2,clamp(sp,.001,.999)).rgb*dec;dec*=.925;}c+=rays/30.*(.28+uIntensity*.3);
float halo=exp(-length(cen*vec2(1.5,1.))*3.8);c+=mix(vec3(.022,.025,.065),vec3(.07,.012,.035),uTint)*halo;c*=1.-smoothstep(.25,.8,length(cen))*.62;c=vec3(1.)-exp(-c*1.18);c=pow(c,vec3(.91));float g=(rnd(gl_FragCoord.xy)-.5)*.0035;c+=g;c*=uFade;gl_FragColor=vec4(c,1.);}`});
postScene.add(new T.Mesh(new T.PlaneGeometry(2,2),post));
// Bloom chain: soft-knee bright pass at half resolution, then five progressively smaller
// levels, each blurred with a separable Gaussian. Smooth halos, no shifted ghost copies.
const BLV=5,bloomRT=[],bloomTmp=[],mkRT=()=>new T.WebGLRenderTarget(4,4,{type:T.HalfFloatType,depthBuffer:false});for(let i=0;i<BLV;i++){bloomRT.push(mkRT());bloomTmp.push(mkRT())}
const fsScene=new T.Scene(),fsQuad=new T.Mesh(new T.PlaneGeometry(2,2));fsQuad.frustumCulled=false;fsScene.add(fsQuad);const fsVS='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
const brightMat=new T.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{uSrc:{value:null},uTexel:{value:new T.Vector2()}},vertexShader:fsVS,fragmentShader:`varying vec2 vUv;uniform sampler2D uSrc;uniform vec2 uTexel;vec3 pick(vec2 o){vec3 c=texture2D(uSrc,clamp(vUv+o*uTexel,.001,.999)).rgb;float br=max(c.r,max(c.g,c.b)),knee=.2,th=.6,soft=clamp(br-th+knee,0.,2.*knee);soft=soft*soft/(4.*knee+1e-4);return c*max(soft,br-th)/max(br,1e-4);}void main(){gl_FragColor=vec4((pick(vec2(-.5,-.5))+pick(vec2(.5,-.5))+pick(vec2(-.5,.5))+pick(vec2(.5,.5)))*.25,1.);}`});
const blurMat=new T.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{uSrc:{value:null},uDir:{value:new T.Vector2()}},vertexShader:fsVS,fragmentShader:`varying vec2 vUv;uniform sampler2D uSrc;uniform vec2 uDir;void main(){vec3 c=texture2D(uSrc,vUv).rgb*.2270270;c+=(texture2D(uSrc,vUv+uDir*1.3846154).rgb+texture2D(uSrc,vUv-uDir*1.3846154).rgb)*.3162162;c+=(texture2D(uSrc,vUv+uDir*3.2307692).rgb+texture2D(uSrc,vUv-uDir*3.2307692).rgb)*.0702703;gl_FragColor=vec4(c,1.);}`});
function bloomResize(w,h){for(let i=0;i<BLV;i++){const bw=Math.max(2,Math.round(w/Math.pow(2,i+1))),bh=Math.max(2,Math.round(h/Math.pow(2,i+1)));bloomRT[i].setSize(bw,bh);bloomTmp[i].setSize(bw,bh)}}
function fsPass(mat,target){fsQuad.material=mat;renderer.setRenderTarget(target);renderer.render(fsScene,postCamera)}
function bloomFrom(src){const prev=renderer.getRenderTarget();const srcW=src.image?.width||1280,srcH=src.image?.height||720;
 brightMat.uniforms.uSrc.value=src;brightMat.uniforms.uTexel.value.set(1/srcW,1/srcH);fsPass(brightMat,bloomRT[0]);
 for(let i=0;i<BLV;i++){const R=bloomRT[i],from=i===0?bloomRT[0]:bloomRT[i-1];
  blurMat.uniforms.uSrc.value=from.texture;blurMat.uniforms.uDir.value.set(1/R.width,0);fsPass(blurMat,bloomTmp[i]);
  blurMat.uniforms.uSrc.value=bloomTmp[i].texture;blurMat.uniforms.uDir.value.set(0,1/R.height);fsPass(blurMat,R);}
 for(let i=0;i<BLV;i++)post.uniforms['uB'+i].value=bloomRT[i].texture;renderer.setRenderTarget(prev);}
window.postRender=function(target){bloomFrom(post.uniforms.uScene.value);renderer.setRenderTarget(target);renderer.render(postScene,postCamera)};
function resize(){let w=innerWidth,h=innerHeight,d=Math.min(devicePixelRatio,high?1.6:.75);renderer.setPixelRatio(d);renderer.setSize(w,h,false);rt.setSize(Math.round(w*d),Math.round(h*d));bloomResize(Math.round(w*d),Math.round(h*d));post.uniforms.uResolution.value.set(w*d,h*d);pointMat.uniforms.uPixel.value=d;camera.aspect=w/h;camera.updateProjectionMatrix();if(ready)render(preview??audio.currentTime);}addEventListener('resize',resize);resize();
function env(t){let n=clamp(t*AUDIO_DATA.fps,0,AUDIO_DATA.bands.length-1),i=Math.floor(n),j=Math.min(i+1,AUDIO_DATA.bands.length-1),f=n-i;return AUDIO_DATA.bands[i].map((v,k)=>mix(v,AUDIO_DATA.bands[j][k],f));}
// SCENE_TYPE_MODULE
function vocalPulse(t){let onset=0;for(const q of AUDIO_DATA.vocalTimings){if(q>t)break;onset=q}return Math.exp(-(t-onset)*12)}
function render(t){if(!ready)return;t=choiceDirector?.tick(t)??t;const tl=timeline(t),s=tl.s;const e=env(t);const beat=fract((t-AUDIO_DATA.offset)/BEAT),kick=Math.exp(-beat*10),pulse=clamp(e[0])*.4+kick*.22+vocalPulse(t)*.13;let intensity=s[8],tint=s[16];const narrative=storyState(t),nm=narrative.mode,trance=tranceState(t);
 const geometry=windowAt(t,27,42,2),closeup=windowAt(t,43,55,3)+windowAt(t,109,120,3)+windowAt(t,176,188,3),gardenWeight=windowAt(t,72,86,2.5),chaos=windowAt(t,132,160,3),isolation=windowAt(t,116,132,3),reachWeight=windowAt(t,87,101,3)+windowAt(t,161,173,3);
 const bloomWeight=1-clamp(geometry+closeup*.9+chaos+isolation*.9+gardenWeight*.7);
 const mobile=innerWidth/innerHeight<.9,reduce=reduced?.5:1;
 camera.position.set(s[9]+Math.sin(t*.19)*.24*reduce,s[10]+Math.sin(t*.27)*.15*reduce,s[11]+(mobile?5:0));
 camera.position.y+=gardenWeight*6+geometry*1.5;camera.position.z+=gardenWeight*3-geometry*1.2;
 camera.position.z+=s[6]*(1-closeup)*(1-geometry)*.7;
 if(!started&&preview===null)camera.position.x-=2.4;
 camera.position.x+=Math.sin((t-99.19)*.68)*.20*trance.weight*reduce;camera.position.y+=Math.sin((t-99.19)*.91)*.13*trance.weight*reduce;camera.position.z-=.38*trance.weight;
 let target=v3(s[12]+(!started&&preview===null?-1.7:0),s[13],s[14]);const spin=spinVisualState(lyricObjects?.play,t);if(spin.active){const yaw=((t-49.51)*.24+clamp(spin.offset*.4,-1.2,1.2))*windowAt(t,49.51,51.01,.2)*reduce;camera.position.sub(target).applyAxisAngle(v3(0,1,0),yaw).add(target);}camera.lookAt(target);camera.rotateZ((s[15]+Math.sin((t-99.19)*.77)*.014*trance.weight)*reduce);
 camera.fov=42-pulse*intensity*.7+chaos*8;camera.updateProjectionMatrix();camera.updateMatrixWorld();
 world.rotation.y=Math.sin(t*.11)*.23;world.rotation.z=Math.sin(t*.17)*.025;
 rimLight.intensity=35+e[1]*22;rimLight.color.set(tint>.6?0xff738f:0x7de4d1);redLight.intensity=tint*38;
 for(let i=0;i<petals.length;i++){
  let mesh=petals[i],pos=mesh.geometry.attributes.position;let angle=i/12*TAU+t*.045;let open=clamp(s[2]+(nm==='bloom'?Math.sin(narrative.progress*Math.PI)*.2:0));let growth=smooth((t-i*.1)/7);let layer=i%2;
  for(let row=0;row<=PSEG;row++)for(let col=0;col<=WSEG;col++){
   let u=row/PSEG,v=col/WSEG*2-1;let length=3.2+layer*.65;let a=mix(.10,1.12,open)+u*.7*open;
   let rad=.18+Math.sin(u*a)*length;let y=-1.75+Math.cos(u*a)*u*length*(1-open*.32)-u*u*open*.9;
   const subjectHere=clamp(smooth((s[6]-.05)/.2)+closeup+reachWeight)*(1-chaos);y-=subjectHere*(.9+(1-open)*2.1);
   let width=Math.pow(Math.sin(u*Math.PI),.8)*(.36+open*.22)*(1+layer*.25);
   let flutter=Math.sin(t*1.6+i*.65+u*5)*.035*u*u*(.3+open);
   let localx=rad*growth,localz=v*width*growth;
   let idx=row*(WSEG+1)+col;
   pos.setXYZ(idx,Math.cos(angle)*localx-Math.sin(angle)*localz,y*growth+Math.pow(v,2)*.20*Math.sin(u*Math.PI)+flutter,Math.sin(angle)*localx+Math.cos(angle)*localz);
  }pos.needsUpdate=true;mesh.geometry.computeVertexNormals();mesh.scale.setScalar((1+pulse*.015)*Math.max(.001,bloomWeight));mesh.material.color.setRGB(mix(.73,.85,tint),mix(.72,.38,tint),mix(.87,.53,tint));mesh.visible=t<210&&bloomWeight>.005;
 }
 core.scale.setScalar((.85+pulse*.3)*(1-smooth((t-207)/3)*.8));core.rotation.set(t*.18,t*.24,0);
 const ringWeight=(1-closeup*.85)*(1-gardenWeight*.75)*(1-chaos*.3);
 for(let i=0;i<rings.length;i++){let m=rings[i],spread=s[3]*ringWeight;m.visible=!(t>146.5&&t<162);const free=clamp(geometry+chaos);m.scale.setScalar(.04+spread*(1+i*.02));m.rotation.set(Math.PI/2+Math.sin(t*.16+i)*(.018+free*.7),free*(t*(.025+(i%3)*.012)+i*.3),i*.13+Math.sin(t*.1)*.13);m.position.y=mix(-2.75,-.3,free)+Math.sin(i*.7)*spread*.05;}
 const pp=pg.attributes.position.array,fa=forms[tl.a[1]],fb=forms[tl.b[1]],mu=tl.u;
 for(let i=0;i<NP;i++){let seed=pSeeds[i],j=i*3;let flutter=Math.sin(t*.8+seed*TAU);let displace=.028+s[5]*.10;pp[j]=mix(fa[j],fb[j],mu)+flutter*displace;pp[j+1]=mix(fa[j+1],fb[j+1],mu)+Math.cos(t+seed*37)*displace;pp[j+2]=mix(fa[j+2],fb[j+2],mu)+Math.sin(t*.7+seed*50)*displace;}
 pg.attributes.position.needsUpdate=true;cloud.rotation.y=t*.055;cloud.rotation.z=s[5]*Math.sin(t*.2)*.15;
 pointMat.uniforms.uPulse.value=pulse;pointMat.uniforms.uTint.value=tint;const columnCalm=Math.max(smooth((t-112)/2)*(1-smooth((t-133.5)/1.2)),smooth((t-146.5)/1.2)*(1-smooth((t-162)/1.5)));pointMat.uniforms.uOpacity.value=(1-smooth((t-208)/3))*(1-closeup*.8)*(1-.72*columnCalm);cloud.scale.setScalar(1+geometry*.35+chaos*.15);cloud.position.z=-.8;
 for(let k=0;k<ribbons.length;k++){
  const mesh=ribbons[k],pos=mesh.geometry.attributes.position;
  const growth=smooth((t-k*.23)/10),radius=3.05+s[5]*1.4+reachWeight*.7;
  for(let j=0;j<220;j++){let u=j/219,ang=u*TAU*(1.2+s[5]) +k*TAU/9+t*.15;let r=radius*(.92+.08*Math.sin(u*Math.PI))+.08*Math.sin(u*12+t);let y=(u-.5)*(3+s[4]*4)+Math.sin(ang*2+t*.2)*.25;let wid=(.025+.045*s[2])*Math.sin(u*Math.PI)*(1+e[1]*.2);
   let x=Math.cos(ang)*r,z=Math.sin(ang)*r;pos.setXYZ(j*2,x,y-wid,z);pos.setXYZ(j*2+1,x+Math.cos(ang)*wid,y+wid,z+Math.sin(ang)*wid);
  }pos.needsUpdate=true;mesh.geometry.setDrawRange(0,Math.floor(growth*219)*6);mesh.material.uniforms.uTime.value=t;mesh.material.uniforms.uTint.value=tint;mesh.material.uniforms.uAlpha.value=(.08+intensity*.25)*(1-smooth((t-205)/5))*(1-closeup)*(1-gardenWeight*.8);mesh.position.y=-1.25;mesh.scale.y=.4+chaos*.8;
 }
 architecture.scale.setScalar(.7+s[4]*.3);architecture.rotation.y=0;architecture.visible=s[4]>.001;
 for(let i=0;i<ribs.length;i++){let r=ribs[i],al=s[4]*(1-closeup)*(1-gardenWeight);r.scale.y=.08+s[4]*(.6+.4*hash(i+80));r.children[1].material.opacity=al*(.04+.09*e[2]);r.children[0].material.opacity=r.children[2].material.opacity=al*.3;r.visible=r.position.z<0;}
 garden.visible=gardenWeight>.01;garden.rotation.y=t*.035;
 for(let i=0;i<28;i++){let a=i*2.39996,r=2.9+Math.sqrt(i)*1.1;dummy.position.set(Math.cos(a)*r,-1.8+Math.sin(i*.8)*.5,Math.sin(a)*r);dummy.rotation.set(.12*Math.sin(t*.3+i),a+t*.04,.1*Math.cos(i));let z=(.16+.10*hash(i+30))*gardenWeight;dummy.scale.setScalar(z);dummy.updateMatrix();blossoms.forEach(m=>m.setMatrixAt(i,dummy.matrix))}blossoms.forEach(m=>m.instanceMatrix.needsUpdate=true);
 for(let k=0;k<waveLines.length;k++){let l=waveLines[k],p=l.geometry.attributes.position;let amt=clamp(geometry+closeup*.25+chaos*.8)*(1-windowAt(t,44.25,47.57,.2));l.visible=amt>.01;l.material.opacity=amt*(.07+.06*(k%3));l.material.color.set(tint>.6?0xe57298:0x95ccde);for(let i=0;i<300;i++){let u=i/299,a=u*TAU;let x=(u-.5)*12,y=Math.sin(u*TAU*2+t*.6+k*.08)*(.3+geometry*.6),z=-2-k*.16;let torX=Math.cos(a)*(3.5+k*.1),torY=Math.sin(a)*(3.5+k*.1);p.setXYZ(i,mix(x,torX,chaos),mix(y,torY,chaos),z)}p.needsUpdate=true;}
 for(let i=0;i<140;i++){
  let a=hash(i+90)*TAU+t*(.035+hash(i)*.06),r=3+closeup*2+reachWeight+hash(i+300)*5*s[5],y=(hash(i+600)-.5)*8;
  dummy.position.set(Math.cos(a)*r,y*s[5],Math.sin(a)*r);dummy.rotation.set(t*.2+i,t*.3+i*.25,t*.16+i*.12);
  let scale=(.025+hash(i+900)*.16)*s[5];dummy.scale.set(scale*.5,scale*(2+hash(i+60)*3),scale*.32);dummy.updateMatrix();shards.setMatrixAt(i,dummy.matrix);
 }shards.instanceMatrix.needsUpdate=true;shards.visible=s[5]>.01;shardMat.opacity=.28*(1-Math.max(.6*smooth((t-112)/2)*(1-smooth((t-133.5)/1.2)),.8*smooth((t-146.5)/1.2)*(1-smooth((t-162)/1.5))));shardMat.transparent=true;
 dust.rotation.y=t*.006;dust.rotation.z=Math.sin(t*.07)*.025;
 floorRings.forEach((m,i)=>{m.material.opacity=(.04+intensity*.055)*(1-smooth((t-204)/6));m.scale.setScalar(1+Math.sin(t*.7-i*.4)*.012)});
 const guestWeight=windowAt(t,136,146.5,.8);
 const charWeight=smooth((t-6)/5)*(1-clamp(windowAt(t,27,55,2)+closeup*1.8+chaos+gardenWeight+reachWeight*1.8))*(1-smooth((t-202)/4))*(1-guestWeight);
 character.scale.setScalar(1);character.position.set(.35+Math.sin(t*.35)*.055,.85+Math.sin(t*1.1)*.045,1.15);character.quaternion.copy(camera.quaternion);character.rotateZ(Math.sin(t*.37)*.015);
 character.material.uniforms.uAlpha.value=charWeight;character.material.uniforms.uTime.value=t;character.material.uniforms.uTint.value=tint;character.material.uniforms.uDissolve.value=nm==='fracture'?isolation*.12:0;
 character.visible=charWeight*s[6]>.005;portrait.position.set(1.15,.45,1.5);portrait.quaternion.copy(camera.quaternion);portrait.scale.setScalar(1.2+clamp(closeup)*.15);portrait.material.uniforms.uAlpha.value=smooth((closeup-.15)/.85)*(1-guestWeight);portrait.material.uniforms.uTime.value=t;portrait.material.uniforms.uTint.value=tint;portrait.material.uniforms.uDissolve.value=0;portrait.visible=closeup>.005;
 reaching.visible=reachWeight>.005;reaching.position.set(.4+.3*(1-clamp(reachWeight)),.75,1.3);reaching.quaternion.copy(camera.quaternion);reaching.rotateZ(Math.sin(t*.5)*.018);reaching.scale.setScalar(1.2);reaching.material.uniforms.uAlpha.value=smooth((reachWeight-.15)/.85)*(1-guestWeight);reaching.material.uniforms.uTime.value=t;reaching.material.uniforms.uTint.value=tint;reaching.material.uniforms.uDissolve.value=0;
 const guestA=windowAt(t,136,141.4,.8),guestB=windowAt(t,140.2,146.6,.8);
 [guestFish,guestLady,guestGPT].forEach((g,j)=>{let a=[guestA,guestB,0][j];g.visible=a>.001;g.position.copy(v3(mobile?0:(j?1.4:-1.4),.35,-8).applyQuaternion(camera.quaternion).add(camera.position));g.quaternion.copy(camera.quaternion);g.scale.setScalar(mobile?.83:1.15);g.material.uniforms.uTime.value=t;g.material.uniforms.uAlpha.value=a;g.material.uniforms.uDissolve.value=(1-a)*.2;});
 applyGuestHandoff(t);
 const bond=smooth((t-44)/12)*(1-smooth((t-110.4)/7));companion.position.set(mix(3.6,-3.6,clamp(reachWeight))+Math.sin(t*.4)*.2,.8+Math.cos(t*.6)*.2,.2);companion.scale.setScalar(.5+bond*.5);companionShell.material.opacity=bond*(.2+e[1]*.15);companion.rotation.set(t*.1,t*.17,t*.05);
 let cp=cable.geometry.attributes.position;for(let i=0;i<180;i++){let u=i/179;cp.setXYZ(i,mix(1.25,companion.position.x,u),mix(.3,companion.position.y,u)-Math.sin(u*Math.PI)*(.5+Math.sin(t*.6)*.1),.5+Math.sin(u*Math.PI*2+t*.4)*.08)}cp.needsUpdate=true;cable.geometry.setDrawRange(0,Math.floor(180*bond));cable.material.opacity=bond*.5;
 tranceScene?.scenery(t);
 applyIntroFlourish(t);
 sceneType.update(t,pulse);
 screenCurtain?.front(t);choiceDirector?.render(t);localLyrics?.update(t);if(localLyrics?.state().count){sceneType.group.visible=false;if(localLyrics.state().current?.text)pointMat.uniforms.uOpacity.value*=.7;}lyricObjects?.update(t);touchEffects?.update(t);rhythmGame?.update(t);openingAvatar?.update(t);contextCursor?.update(t);
 let chapterIndex=0;while(chapterIndex<chapters.length-1&&chapters[chapterIndex+1].t<=t)chapterIndex++;
 $('#sceneNumber').textContent=String(chapterIndex+1).padStart(2,'0')+' / 08';
 $('#cinemaText').style.display='none';
 let fault=0;for(const event of [125.33,128.42,130.74,134.38,147.52,148.59,149.78,150.64,151.53,152.43,153.32,154.31,155.2,156.18,157.12,158.02,161.51]){let d=t-event-.5;if(d>=0&&d<.65)fault=Math.max(fault,(1-Math.exp(-d*65))*Math.exp(-d*9));}
  post.uniforms.uTrance.value=trance.weight;post.uniforms.uTime.value=t;post.uniforms.uIntensity.value=intensity;post.uniforms.uTint.value=tint;post.uniforms.uGlitch.value=fault*.8;post.uniforms.uFade.value=1-smooth((t-209.5)/2.8)*.8;
 tranceScene?.beforeScene(t);renderer.setRenderTarget(rt);renderer.render(scene,camera);screenCurtain.composite(t);tranceScene?.afterScene();frameCount++;
 $('#clock').textContent=fmt(t)+' / '+fmt(DUR);if(document.activeElement!==$('#seek'))$('#seek').value=t;
}
function fmt(s){return `${Math.floor(s/60).toString().padStart(2,'0')}:${Math.floor(s%60).toString().padStart(2,'0')}`}
function animate(){requestAnimationFrame(animate);if(ready&&!qaMode){let t=preview!==null?preview:started?audio.currentTime:62;render(t)}if(started&&playing&&!hiddenUI&&performance.now()-lastMouse>3000)document.body.classList.add('immersive')}
function setPlayingUI(){playing=!audio.paused;$('#toggle').textContent=playing?'Ⅱ':'▶';$('#toggle').setAttribute('aria-label',playing?'暂停':'播放')}
async function play(){if(!ready)return;preview=null;if(!started){started=true;document.body.classList.add('started');$('#cover').classList.add('gone');audio.currentTime=0;}$('#end').hidden=true;try{await audio.play();setPlayingUI();lastMouse=performance.now()}catch(e){$('#error').hidden=false;$('#error').textContent='音频播放未能开始。点击播放重试，或在 Edge / Chrome 中打开文件。';}}
function toggle(){if(audio.paused)play();else audio.pause()}
function seek(t){openingAvatar?.reset();rhythmGame?.reset();lyricObjects?.reset();touchEffects?.reset();screenCurtain?.reset();choiceDirector?.reset();t=choiceDirector?.constrain(clamp(t,0,DUR))??t;audio.currentTime=clamp(t,0,DUR);preview=null;$('#end').hidden=true;if(!started){started=true;document.body.classList.add('started');$('#cover').classList.add('gone')}render(audio.currentTime)}
$('#start').onclick=play;$('#toggle').onclick=toggle;$('#replay').onclick=()=>{choiceDirector.reset();touchEffects.reset();seek(0);play()};$('#seek').oninput=e=>seek(+e.target.value);$('#mute').onclick=()=>{audio.muted=!audio.muted;$('#mute').textContent=audio.muted?'声音 关':'声音 开'};
$('#quality').onclick=()=>{high=!high;$('#quality').textContent=high?'高画质':'流畅';resize()};
function fullscreen(){if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.()}
$('#fullscreen').onclick=fullscreen;$('#chapterButton').onclick=()=>{$('#chapters').hidden=!$('#chapters').hidden;document.body.classList.remove('immersive')};
chapters.forEach(c=>{let b=document.createElement('button');b.innerHTML=`${c.name}<span>${fmt(c.t)}</span>`;b.onclick=()=>{seek(c.t);$('#chapters').hidden=true;play()};$('#chapters').appendChild(b)});
[{t:158.78,name:'倒数与回应'}].forEach(c=>{let b=document.createElement('button');b.innerHTML=`${c.name}<span>${fmt(c.t)}</span>`;b.onclick=()=>{seek(c.t);$('#chapters').hidden=true;play()};$('#chapters').appendChild(b)});
audio.addEventListener('play',setPlayingUI);audio.addEventListener('pause',setPlayingUI);audio.addEventListener('ended',()=>{$('#end').hidden=false;$('#end h2').textContent='EXECUTION';document.body.classList.remove('immersive');setPlayingUI()});
document.addEventListener('pointermove',()=>{lastMouse=performance.now();if(!hiddenUI)document.body.classList.remove('immersive')});
document.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'||(e.target.tagName==='BUTTON'&&['Space','Enter'].includes(e.code)))return;if(e.code==='Space'){e.preventDefault();toggle()}if(e.code==='ArrowRight'){e.preventDefault();seek(audio.currentTime+5)}if(e.code==='ArrowLeft'){e.preventDefault();seek(audio.currentTime-5)}if(e.code==='KeyF')fullscreen();if(e.code==='KeyH'){hiddenUI=!hiddenUI;document.body.classList.toggle('immersive',hiddenUI)}});
audio.addEventListener('error',()=>{if(started){$('#error').hidden=false;$('#error').textContent='音频加载失败，请重新打开完整 HTML 文件。'}});
Promise.all([makeCharacter(ASSETS.character,false),makeCharacter(ASSETS.portrait,true),makeCharacter(ASSETS.reach,true),makeCharacter(ASSETS.deepseek,true),makeCharacter(ASSETS.claude,true),makeCharacter(ASSETS.response,true),document.fonts.load('48px GardenText'),document.fonts.ready]).then(async ([a,b,c,d,e,f])=>{character=a;portrait=b;reaching=c;guestFish=d;guestLady=e;responsePortrait=f;responsePortrait.visible=false;guestGPT=new T.Mesh(new T.PlaneGeometry(5.6,3.73,40,50),portrait.material.clone());guestGPT.renderOrder=8;scene.add(guestGPT);[d,e].forEach(g=>{g.material.depthTest=false;g.geometry.dispose();g.geometry=new T.PlaneGeometry(4.3,4.3,40,50);g.renderOrder=8});sceneType=buildSceneType();choiceDirector=buildChoices();localLyrics=buildLocalLyrics();lyricObjects=buildLyricObjects();touchEffects=buildTouchEffects();screenCurtain=buildScreenCurtain();rhythmGame=await buildRhythmGame();await lyricObjects.semantic.ready;openingAvatar=buildOpeningAvatar();tranceScene=buildTranceScene();contextCursor=buildContextCursor();cinemaLayer=buildCinema();openingTitle=buildOpeningTitle();recordCursor=buildRecordCursor();ready=true;$('#start').disabled=false;$('#startLabel').textContent='进入花园 · 播放';render(62);animate()}).catch(e=>{$('#error').hidden=false;$('#error').textContent='角色资源加载失败：'+e.message});
window.MV={renderAt(t){preview=t;document.querySelector('#end').hidden=true;render(t)},qa(v){qaMode=v},resume(){preview=null},ready:()=>ready,audio,seek,play,timeline,chapters,keys,story:()=>storyState(preview??audio.currentTime),type:()=>sceneType,choices:()=>choiceDirector,lyrics:()=>localLyrics,objects:()=>lyricObjects,effects:()=>touchEffects,curtain:()=>screenCurtain,rhythm:()=>rhythmGame,opening:()=>openingAvatar,trance:()=>tranceScene?.state(),spin:()=>spinVisualState(lyricObjects?.play,preview??audio.currentTime),guests:()=>applyGuestHandoff.last??null,cursor:()=>contextCursor?.state(),validate(){return [...camera.position.toArray(),...pg.attributes.position.array].every(Number.isFinite)&&screenCurtain.validate()},stats:()=>({frameCount,size:renderer.getSize(new T.Vector2()),duration:audio.duration,readyState:audio.readyState})};
