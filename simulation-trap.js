// The short, first "strange simulation" becomes a finite room around the scene.
// All geometry is derived from song time, including returns and the exit fold.
function buildSimulationTrap({ctx,play}){
 const START=70.20,LOCK=72.95,END=73.83,root=new T.Group();root.name='simulation-trap';root.visible=false;scene.add(root);
 const faceSpecs=[{axis:2,sign:-1,hinge:0,delay:0},{axis:1,sign:-1,hinge:0,delay:.16},{axis:0,sign:-1,hinge:2,delay:.38},{axis:0,sign:1,hinge:2,delay:.58},{axis:1,sign:1,hinge:0,delay:.83},{axis:2,sign:1,hinge:0,delay:1.08}];
 const colors=[0x96c5c5,0xc3cedd,0x9bcac9,0xc0b4d9,0xb6c2d2,0xe0e5df],faces=[];
 function geometry(n){return new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(new Float32Array(n*3),3));}
 for(let i=0;i<6;i++){
  const g=geometry(6),pane=new T.Mesh(g,new T.MeshBasicMaterial({color:colors[i],transparent:true,opacity:0,side:T.DoubleSide,depthTest:true,depthWrite:false}));pane.renderOrder=1.25+i*.01;pane.frustumCulled=false;root.add(pane);
  const edge=new T.LineSegments(geometry(8),new T.LineBasicMaterial({color:colors[i],transparent:true,opacity:0,depthTest:i!==5,depthWrite:false}));edge.renderOrder=i===5?2.90:1.5+i*.01;edge.frustumCulled=false;root.add(edge);
  const seams=new T.LineSegments(geometry(32),new T.LineBasicMaterial({color:colors[i],transparent:true,opacity:0,depthTest:i!==5,depthWrite:false}));seams.renderOrder=i===5?2.95:1.6+i*.01;seams.frustumCulled=false;root.add(seams);
  faces.push({pane,edge,seams});
 }
 // Only two deliberate attempts: a path touches the boundary and folds back
 // into the exact same origin. They are not a cloud of decorative particles.
 const attempts=[{at:71.03,side:1},{at:71.91,side:-1}],flights=[];
 for(let i=0;i<attempts.length;i++){
  const route=new T.Line(geometry(90),new T.LineBasicMaterial({color:i?0xbbaedb:0x9ddbd3,transparent:true,opacity:0,depthTest:false,depthWrite:false}));route.renderOrder=4.3;route.frustumCulled=false;root.add(route);
  const tg=geometry(60),indices=[];for(let j=0;j<29;j++)indices.push(j*2,j*2+1,j*2+2,j*2+1,j*2+3,j*2+2);tg.setIndex(indices);const tail=new T.Mesh(tg,new T.MeshBasicMaterial({color:0xeef5e9,transparent:true,opacity:0,side:T.DoubleSide,depthTest:false,depthWrite:false}));tail.renderOrder=4.4;tail.frustumCulled=false;root.add(tail);
  const dot=new T.Mesh(new T.OctahedronGeometry(.059,0),new T.MeshBasicMaterial({color:0xf6fff2,transparent:true,opacity:0,depthTest:false,depthWrite:false}));dot.renderOrder=4.5;root.add(dot);
  const impact=new T.LineSegments(geometry(12),new T.LineBasicMaterial({color:0xe2ddf2,transparent:true,opacity:0,depthTest:false,depthWrite:false}));impact.renderOrder=4.4;impact.frustumCulled=false;root.add(impact);flights.push({route,tail,dot,impact});
 }
 const latches=new T.LineSegments(geometry(48),new T.LineBasicMaterial({color:0xe3f3e8,transparent:true,opacity:0,depthTest:false,depthWrite:false}));latches.renderOrder=4.2;latches.frustumCulled=false;root.add(latches);
 const source=new T.Line(new T.BufferGeometry().setFromPoints([v3(-.08,0,0),v3(0,.08,0),v3(.08,0,0),v3(0,-.08,0),v3(-.08,0,0)]),new T.LineBasicMaterial({color:0xe4eee5,transparent:true,opacity:0,depthTest:false,depthWrite:false}));source.renderOrder=4.4;root.add(source);
 let current={active:false,phase:'off',closedFaces:0,returns:0},lastTime=-1;
 function reset(){root.visible=false;lastTime=-1;current={active:false,phase:'off',closedFaces:0,returns:0};}
 function foldPoint(a,spec,opening,hx,hy,hz){
  const p=a.slice(),dims=[hx,hy,hz],hinge=spec.hinge,along=(spec.axis+1)%3,pivot=[0,0,0];pivot[spec.axis]=spec.sign*dims[spec.axis];pivot[hinge]=-dims[hinge];
  // Rotating in the face-normal / hinge coordinate pair keeps one edge attached.
  const A=spec.axis,B=hinge,aa=p[A]-pivot[A],bb=p[B]-pivot[B],ang=opening*(spec.sign||1)*1.04,c=Math.cos(ang),s=Math.sin(ang);p[A]=pivot[A]+aa*c-bb*s;p[B]=pivot[B]+aa*s+bb*c;return p;
 }
 function facePoints(spec,hx,hy,hz,opening){const d=[hx,hy,hz],axes=[0,1,2].filter(a=>a!==spec.axis);return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>{const p=[0,0,0];p[spec.axis]=spec.sign*d[spec.axis];p[axes[0]]=a*d[axes[0]];p[axes[1]]=b*d[axes[1]];return foldPoint(p,spec,opening,hx,hy,hz)});}
 function put(attr,k,p){attr.setXYZ(k,p[0],p[1],p[2]);}
 function routePoint(f,side,hx,hy,hz){const a=clamp(f),out=Math.sin(a*Math.PI);return [side*hx*out,-hy*.28+Math.sin(a*TAU)*hy*.16,hz*.30-Math.sin(a*Math.PI)*hz*.35];}
 function update(q,t,visible){
  lastTime=t;const active=visible&&t>=START&&t<END&&['cage','world'].includes(q.kind);root.visible=active;if(!active){current={active:false,phase:'off',closedFaces:0,returns:0};return;}
  const mobile=camera.aspect<.9,d=mobile?13:9,hh=2*d*Math.tan(camera.fov*Math.PI/360),ww=hh*camera.aspect,hx=ww*(mobile?.465:.315),hy=hh*(mobile?.365:.41),hz=mobile?1.35:1.70,centerY=hh*(mobile?-.065:-.03),u=t-START;
  root.position.copy(v3(0,centerY,-d-hz).applyQuaternion(camera.quaternion).add(camera.position));root.quaternion.copy(camera.quaternion);root.scale.setScalar(1);
  const enter=smooth(u/.20),exit=smooth((t-73.31)/.52),alpha=enter*(1-exit),lock=smooth((t-LOCK)/.11),lockBeat=t>=LOCK?Math.exp(-(t-LOCK)*8):0;let closed=0;
  faces.forEach((f,i)=>{const progress=smooth((u-faceSpecs[i].delay)/.61),opening=(1-progress)*(1-exit)+exit*(1.1+i*.06),corners=facePoints(faceSpecs[i],hx,hy,hz,opening);if(progress>.99)closed++;
   const p=f.pane.geometry.attributes.position,e=f.edge.geometry.attributes.position,s=f.seams.geometry.attributes.position;[0,1,2,0,2,3].forEach((idx,j)=>put(p,j,corners[idx]));for(let j=0;j<4;j++){put(e,j*2,corners[j]);put(e,j*2+1,corners[(j+1)%4]);}
   // Small paired corner stitches identify solid faces without bars over a face.
   let k=0;for(let j=0;j<4;j++){const a=corners[j],b=corners[(j+1)%4],z=corners[(j+3)%4];for(const v of [b,z]){put(s,k++,a.map((n,ax)=>mix(n,v[ax],.035)));put(s,k++,a.map((n,ax)=>mix(n,v[ax],.12)));}}f.seams.geometry.setDrawRange(0,k);p.needsUpdate=e.needsUpdate=s.needsUpdate=true;
   const born=smooth((u-faceSpecs[i].delay+.12)/.28);f.pane.material.opacity=alpha*born*(i===5?.008:.016);f.edge.material.opacity=alpha*born*(i===5?.68:.39)*(1+lockBeat*.35);f.seams.material.opacity=alpha*born*(.38+lock*.30);
  });
  let returns=0;const head=[];flights.forEach((f,i)=>{const spec=attempts[i],age=t-spec.at,duration=1.05,progress=clamp(age/duration),alive=age>=0&&age<duration,show=age>=0?smooth(age/.1)*(1-exit):0,p=f.route.geometry.attributes.position,tp=f.tail.geometry.attributes.position;
   for(let j=0;j<90;j++)put(p,j,routePoint(j/89,spec.side,hx,hy,hz));p.needsUpdate=true;f.route.material.opacity=show*(.13+lock*.13);
   for(let j=0;j<30;j++){const a=routePoint(clamp(progress-(1-j/29)*.16),spec.side,hx,hy,hz),width=.024*(.1+j/29);put(tp,j*2,[a[0],a[1]-width,a[2]]);put(tp,j*2+1,[a[0],a[1]+width,a[2]])}tp.needsUpdate=true;f.tail.material.opacity=alive?alpha*.93:0;
   const pos=routePoint(progress,spec.side,hx,hy,hz);f.dot.position.set(...pos);f.dot.scale.setScalar((mobile?1.2:1.5)*(1+lockBeat*.3));f.dot.material.opacity=alive?alpha:0;if(age>=duration)returns++;head.push({age,progress,position:pos,returned:age>=duration});
   const hitAge=age-duration*.5,impact=hitAge>=0&&hitAge<.32?(1-hitAge/.32):0,ip=f.impact.geometry.attributes.position,wall=routePoint(.5,spec.side,hx,hy,hz);for(let j=0;j<6;j++){const ang=j/6*TAU,r=.06+(1-impact)*.25;put(ip,j*2,[wall[0],wall[1]+Math.cos(ang)*r,wall[2]+Math.sin(ang)*r]);put(ip,j*2+1,[wall[0],wall[1]+Math.cos(ang)*(r+.10),wall[2]+Math.sin(ang)*(r+.10)]);}ip.needsUpdate=true;f.impact.material.opacity=impact*alpha;
  });
  const returnPulse=Math.max(...attempts.map(a=>{const age=t-a.at-1.05;return age>=0&&age<.4?Math.exp(-age*8):0}));source.position.set(0,-hy*.28,hz*.30);source.scale.setScalar(1+returnPulse*1.8);source.material.opacity=alpha*smooth((t-70.85)/.18)*(.28+returnPulse*.72);
  const lp=latches.geometry.attributes.position;let li=0;for(const xx of [-hx,hx])for(const yy of [-hy,hy])for(const zz of [-hz,hz])for(let axis=0;axis<3;axis++){const a=[xx,yy,zz],b=a.slice();b[axis]-=Math.sign(b[axis])*.16;put(lp,li++,a);put(lp,li++,b)}lp.needsUpdate=true;latches.material.opacity=alpha*lock*(.34+lockBeat*.60);
  current={active:true,phase:t<71.90?'closing':t<LOCK?'returning':t<73.31?'locked':'unfolding',closedFaces:closed,returns,alpha,lock,head,room:{halfWidth:hx,halfHeight:hy,halfDepth:hz,center:root.position.toArray()},finite:root.position.toArray().every(Number.isFinite)&&faces.every(f=>f.edge.geometry.attributes.position.array.every(Number.isFinite))};
 }
 // Consume both the live diagram and its half-second outgoing blend. The room
 // itself is in scene space, so the former cage icon/globe are intentionally empty.
 function draw(kind,t,local,alpha){return t>=START&&t<END+.5&&['cage','world'].includes(kind);}
 return {update,draw,reset,state:()=>current};
}
