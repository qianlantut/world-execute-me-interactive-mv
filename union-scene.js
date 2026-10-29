// Two trajectories unite into the same aperture. The camera then follows their
// braided linework into the aperture; only the current object's drag state matters.
function drawUnionArt(ctx,play,t,local,alpha=1){
 const x=ctx,dist=clamp(play.value('distance',110*(1-smooth(local/3))),0,200),join=1-dist/200;
 const deep=smooth((t-56.83)/.68),rawDepth=Math.max(smooth((t-57.01)/1.3),play.value('depth',0)),depth=clamp(rawDepth);
 const travel=local*.32+deep*(rawDepth*4.8+Math.max(0,t-57.01)*.45),vanishX=512+Math.sin(local*.6)*deep*18,vanishY=304+Math.sin(local*.8)*deep*12;
 const mint='#a5dec9',lilac='#c7b0e9';
 x.save();x.globalAlpha*=clamp(alpha);x.lineCap='round';x.lineJoin='round';
 function stroke(points,color,width,opacity=1,closed=false){x.save();x.globalAlpha*=opacity;x.strokeStyle=color;x.lineWidth=width;x.beginPath();points.forEach((p,i)=>i?x.lineTo(p.x,p.y):x.moveTo(p.x,p.y));if(closed)x.closePath();x.stroke();x.restore()}
 function dot(px,py,r,color,opacity=1){x.save();x.globalAlpha*=opacity;x.strokeStyle=color;x.lineWidth=1.4;x.beginPath();x.arc(px,py,r,0,TAU);x.stroke();x.beginPath();x.arc(px,py,Math.max(.7,r*.26),0,TAU);x.fillStyle=color;x.fill();x.restore()}
 function proj(a,z,side,shift=0){const twist=local*.15+z*.11,angle=a+twist+side*.045;const scallop=1+.065*Math.sin(a*3+z*.4-local*.7),radius=(176+12*Math.sin(z*.6+local*.4))*scallop*(1+deep*depth*.36);const zz=z+Math.sin(a*2+side*Math.PI+local*.25)*.22,scale=3.4/(3.4+zz);
  const split=dist*.48*(1-deep*.94)*(side?1:-1);
  return {x:vanishX+(Math.cos(angle)*radius+split)*scale,y:vanishY+Math.sin(angle)*(radius*.83+shift)*scale,z:zz};
 }
 // A pair of displaced curves becomes one interwoven border. No opaque disc.
 for(let side=0;side<2;side++){
  const centerX=512+(side?1:-1)*dist*1.1,color=side?lilac:mint,pts=[];
  for(let i=0;i<=180;i++){const a=i/180*TAU,wave=Math.sin(a*3+t*.85+side*Math.PI)*(7+join*10),rr=126+wave;
   pts.push({x:centerX+Math.cos(a+side*.09)*rr,y:310+Math.sin(a+side*.09)*rr*(1.02-deep*.15)});
  }
  stroke(pts,color,2.4,(1-deep*.79)*smooth(local/.35),true);
  for(let j=0;j<6;j++){const u=((local*.16+j/6+side*.08)%1+1)%1,p=pts[Math.floor(u*180)];dot(p.x,p.y,j===0?4.5:2,color,(1-deep*.7)*(.3+.7*join));}
 }
 // The receding gates approach the camera and fade before wrapping to the far end.
 // Ring depth is real perspective math; the two colors weave through one another.
 const layers=[];for(let i=0;i<18;i++){const z=((i*.81-travel)%14.58+14.58)%14.58-1.18;layers.push({z,i})}layers.sort((a,b)=>b.z-a.z);
 x.save();x.beginPath();x.rect(60,54,904,515);x.clip();
 const tunnelAlpha=smooth((join-.22)/.7)*(.12+.88*deep);
 for(const {z,i} of layers){const fade=smooth((z+1.18)/.65)*(1-smooth((z-10.8)/2.6)),light=(.16+.5/(1+Math.max(0,z)*.16))*tunnelAlpha*fade;
  for(let side=0;side<2;side++){const pts=[];for(let j=0;j<=120;j++)pts.push(proj(j/120*TAU,z,side,side?3:-3));stroke(pts,side?lilac:mint,z<1?2.1:1.25,light,true);}
 }
 // Longitudinal filaments make the movement legible even while the ring radius changes.
 for(let k=0;k<18;k++){const pts=[];for(let j=0;j<72;j++){const z=13-j/71*13.3,a=k/18*TAU+Math.sin(z*.2+local*.25)*.05;pts.push(proj(a,z,k%2));}stroke(pts,k%2?lilac:mint,.9,tunnelAlpha*.23);}
 // A continuous stream of light travels from the far field toward the viewer.
 for(let j=0;j<52;j++){const side=j%2,z=((hash(j+73)*14.3-travel*(1.15+hash(j)*.23))%14.3+14.3)%14.3-.85,a=hash(j+502)*TAU,p=proj(a,z,side),tail=proj(a,z+.32,side),fade=smooth((z+.85)/.4)*(1-smooth((z-11.8)/1.5));stroke([tail,p],side?lilac:mint,1.1,tunnelAlpha*fade*.8);dot(p.x,p.y,Math.max(1.5,3.5/(1+Math.max(0,z)*.13)),side?lilac:mint,tunnelAlpha*fade*.85);}
 x.restore();
 // A bright hollow point marks the common entrance, then remains reachable as both drag directions advance inward.
 const controlY=320+deep*depth*130,controlX=mix(512+dist,512,deep),r=10+Math.sin(local*2)*1.4;
 if(deep>.05){stroke([{x:512,y:322},{x:512,y:478}],mint,1,deep*.19);for(let j=0;j<2;j++){const yy=354+j*68+Math.sin(t*2-j)*2,dir=j?1:-1;stroke([{x:505,y:yy-dir*4},{x:512,y:yy+dir*3},{x:519,y:yy-dir*4}],mint,1.4,deep*.38);}}
 const diamond=[{x:controlX,y:controlY-r},{x:controlX+r,y:controlY},{x:controlX,y:controlY+r},{x:controlX-r,y:controlY}];stroke(diamond,'#e5e3ee',2,.95,true);dot(controlX,controlY,3.5,mint,.9);
 if(deep<.98){x.save();x.globalAlpha*=1-deep;x.font='30px Space';x.textAlign='center';x.fillStyle='#b7cbd0';x.fillText('A ∩ B',512,555);x.restore();}
 x.restore();drawUnionArt.lastState={rawDepth,depth,travel,controlX,controlY};return true;
}

