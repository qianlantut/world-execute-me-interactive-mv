// The two guests occupy separate entrance and exit tracks. Fixed draw strata
// avoid transparent-plane depth ties while the camera moves through the garden.
// Call after film.render has placed guestFish / guestLady, before the choice layer.
function applyGuestHandoff(t){
 if(!guestFish||!guestLady)return;
 const guests=[guestFish,guestLady];
 guests.forEach((g,i)=>{g.renderOrder=8+i;g.material.depthTest=false;g.material.depthWrite=false;});
 if(t<136||t>=148){applyGuestHandoff.last=null;return;}
 const mobile=camera.aspect<.9,dsIn=smooth((t-136)/1.05),dsOut=smooth((t-140.15)/1.80),clIn=smooth((t-140.55)/1.10),clOut=smooth((t-146.25)/1.15);
 const phase=[{enter:dsIn,leave:dsOut,alpha:dsIn*(1-dsOut)},{enter:clIn,leave:clOut,alpha:clIn*(1-clOut)}],tracks=[];
 guests.forEach((g,i)=>{
  const p=phase[i],arrival=1-p.enter,exit=p.leave;
  // Outgoing DeepSeek recedes down-left; incoming Claude approaches from the
  // upper right. Their faces remain on separate tracks even on a narrow screen.
  const xx=mobile?(i?1.20*arrival+1.02*exit:-.78*arrival-1.70*exit):(i?1.4+1.8*arrival+2.5*exit:-1.4-1.65*arrival-2.5*exit);
  const yy=.35+(i?.29:-.06)*arrival-(i?.14:.38)*exit+.025*Math.sin((t-136)*1.05+i)*p.enter*(1-exit);
  const depth=8.2+1.35*arrival+1.65*exit,scale=(mobile?.83:1.15)*(1-.19*arrival-.24*exit);
  g.position.copy(v3(xx,yy,-depth).applyQuaternion(camera.quaternion).add(camera.position));g.quaternion.copy(camera.quaternion);
  g.rotateZ((i?-.035:.028)*arrival+(i?.04:-.045)*exit);g.rotateY((i?-.07:.06)*arrival);
  g.scale.setScalar(scale);g.material.uniforms.uAlpha.value=p.alpha;g.material.uniforms.uDissolve.value=0;g.visible=p.alpha>.001;
  tracks.push({name:i?'Claude':'DeepSeek',x:xx,y:yy,depth,scale,alpha:p.alpha,renderOrder:g.renderOrder});
 });
 applyGuestHandoff.last={time:t,mobile,tracks};
}
