// Additive interlude choreography. Call after the main flower/actor update and
// before sceneType/local lyrics, so their projection follows this camera too.
// Every changed value is rewritten by film.render first: seeks cannot accumulate.
function applyIntroFlourish(t){
 const begin=15,end=29.56,w=smooth((t-begin)/1.05)*(1-smooth((t-27.85)/(end-27.85)));if(w<=0||!character)return;
 const u=t-begin,bloom=smooth((t-18.15)/4.5),gather=1-smooth(u/3.2),release=smooth((t-25.5)/2.7),quiet=reduced?.45:1;
 // A short inward arc becomes a slow orbit, then returns to the existing shot.
 const s=timeline(t).s,arc=Math.sin(u*.39),sweep=v3(.42*arc,.20*Math.sin(u*.48),-.48*Math.sin(u*.24)).multiplyScalar(w*quiet);
 camera.position.add(sweep);camera.lookAt(s[12],s[13],s[14]);camera.rotateZ(s[15]*quiet+w*Math.sin(u*.33)*.022*quiet);camera.updateMatrixWorld();
 character.scale.setScalar(mix(1,.91,w));
 character.position.x+=w*(.22*Math.sin(u*.46)+.08*bloom)*quiet;
 character.position.y+=w*(.19*Math.sin(u*.47)+.20*bloom-.10*release)*quiet;
 character.position.z+=w*.13*Math.sin(u*.36)*quiet;
 character.quaternion.copy(camera.quaternion);character.rotateY(w*.20*Math.sin(u*.38-.3)*quiet);character.rotateZ(Math.sin(t*.37)*.015+w*.035*Math.sin(u*.51)*quiet);
 character.material.uniforms.uAlpha.value=mix(character.material.uniforms.uAlpha.value,1,w);character.visible=character.material.uniforms.uAlpha.value>.005;
 // Petal roots remain attached to the same corolla; the wave travels from root
 // to tip, with each succeeding petal unfurling a little later around the stem.
 for(let i=0;i<petals.length;i++){
  const mesh=petals[i],pos=mesh.geometry.attributes.position,layer=i%2,localBloom=smooth((t-18.15-i*.085)/4.0),open=mix(.20,.94,localBloom)*(1-release*.30),length=3.2+layer*.65,angle=i/12*TAU+t*.045+w*(.30*bloom+.12*Math.sin(u*.35))*quiet;
  for(let row=0;row<=PSEG;row++)for(let col=0;col<=WSEG;col++){
   const a=row/PSEG,v=col/WSEG*2-1,idx=row*(WSEG+1)+col,progress=smooth((t-15.4-i*.07)/3.1),growth=.79+.21*progress;
   const unfold=.16+open*(.74+a*.60),bend=a*unfold,rad=.17+Math.sin(bend)*length*growth;
   const twist=(Math.sin(u*.68-i*.38-a*4.2)*.14+.16*bloom*Math.sin(i*.61))*a*a*quiet;
   const width=Math.pow(Math.sin(a*Math.PI),.8)*(.32+open*.24)*(1+layer*.25)*(.75+.25*progress),side=v*width,theta=angle+twist;
   const curl=Math.sin(a*Math.PI)*v*v*.22+Math.sin(a*Math.PI*2-u*.55+i*.5)*a*a*.075*quiet;
   const yy=-2.75-(1-open)*1.6+Math.cos(bend)*a*length*(1-open*.36)-a*a*open*.85+curl;
   const xx=Math.cos(theta)*rad-Math.sin(theta)*side,zz=Math.sin(theta)*rad+Math.cos(theta)*side;
   pos.setXYZ(idx,mix(pos.getX(idx),xx,w),mix(pos.getY(idx),yy,w),mix(pos.getZ(idx),zz,w));
  }
  pos.needsUpdate=true;mesh.geometry.computeVertexNormals();mesh.geometry.computeBoundingSphere();
  // The existing dissolve into dimension points still controls the final exit.
  const openingScale=.90+.10*localBloom;mesh.scale.multiplyScalar(mix(1,openingScale,w));
 }
 // The light filaments orbit the unfolding rim, rather than drifting through
 // the character's face. Their phase carries through the petals' growth wave.
 for(let k=0;k<ribbons.length;k++){
  const mesh=ribbons[k],p=mesh.geometry.attributes.position;
  for(let j=0;j<220;j++){
   const a=j/219,ang=a*TAU*1.18+k*TAU/9+t*.15+u*.18*quiet,r=(2.20+.56*bloom+.12*Math.sin(a*TAU-u*.4))*(.92+.08*Math.sin(a*Math.PI)),yy=-2.66+Math.sin(ang+u*.25)*.33+(a-.5)*.45,wide=.025*Math.sin(a*Math.PI);
   for(let side=0;side<2;side++){const idx=j*2+side,nx=Math.cos(ang)*(r+side*wide),ny=yy+(side?wide:-wide),nz=Math.sin(ang)*(r+side*wide);p.setXYZ(idx,mix(p.getX(idx),nx,w*.72),mix(p.getY(idx),ny,w*.72),mix(p.getZ(idx),nz,w*.72));}
  }
  p.needsUpdate=true;mesh.material.uniforms.uAlpha.value*=1+w*(.32+.25*bloom);mesh.scale.y=mix(mesh.scale.y,.72,w*.6);
 }
 world.rotation.y+=w*.17*Math.sin(u*.34)*quiet;world.rotation.z+=w*.016*Math.sin(u*.51)*quiet;
 rings.forEach((m,i)=>{m.rotation.x+=w*.07*Math.sin(u*.5-i*.25)*quiet;m.rotation.y+=w*.11*Math.sin(u*.3+i*.19)*quiet;m.position.y-=w*.10*gather;});
 core.scale.multiplyScalar(1+w*.06*Math.sin(u*.7));
}
