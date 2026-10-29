// A short optical reverie, driven by song time. No history buffer survives seeks.
function tranceState(t){
 const envelope=smooth((t-99.19)/.85)*(1-smooth((t-103.05)/1.28));
 const weight=envelope*(.45+.55*smooth((t-99.19)/2.15));
 return {weight,breath:.5+.5*Math.sin((t-100.7)*2.25),active:weight>.001,start:99.19,end:104.33};
}
function buildTranceScene(){
 const overlay=new T.Scene(),ringMaterials=[];
 ringGroup.traverse(o=>{if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])ringMaterials.push({m,opacity:m.opacity,transparent:m.transparent});});
 let saved=null,current=tranceState(0),overlayPasses=0;
 function scenery(t){current=tranceState(t);const w=current.weight;
  // Mechanical outlines dissolve while the familiar flower keeps breathing.
  for(const r of ringMaterials){r.m.opacity=r.opacity*(1-w*.97);const transparent=r.transparent||w>.001;if(r.m.transparent!==transparent){r.m.transparent=transparent;r.m.needsUpdate=true;}}
  for(const m of ribbons)m.material.uniforms.uAlpha.value*=1-w*.93;
  for(const m of waveLines)m.material.opacity*=1-w*.95;
  for(const m of floorRings)m.material.opacity*=1-w*.94;
  for(const r of ribs)for(const child of r.children)if(child.material)child.material.opacity*=1-w*.96;
  companionShell.material.opacity*=1-w*.96;cable.material.opacity*=1-w*.96;
  world.rotation.z+=Math.sin((t-99.19)*.85)*.018*w;
  for(let i=0;i<petals.length;i++)petals[i].position.y=Math.sin((t-99.19)*1.15+i*.23)*.045*w;
  pointMat.uniforms.uOpacity.value*=1-w*.38;
 }
 function beforeScene(t){current=tranceState(t);saved=null;const mesh=localLyrics?.mesh;if(!current.active||!mesh?.visible)return; saved={mesh,parent:mesh.parent,visible:mesh.visible};mesh.visible=false;}
 function afterScene(){if(!saved)return;const {mesh,parent,visible}=saved;mesh.visible=visible;overlay.add(mesh);const autoClear=renderer.autoClear;renderer.autoClear=false;renderer.clearDepth();renderer.render(overlay,camera);renderer.autoClear=autoClear;parent?.add(mesh);saved=null;overlayPasses++;}
 return {scenery,beforeScene,afterScene,state:()=>({...current,overlayPasses,lyricOverlayPending:saved!==null,mechanicalOpacity:1-current.weight*.97})};
}
