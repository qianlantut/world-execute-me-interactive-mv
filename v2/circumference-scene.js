// Fixed arc length: the curvature goes from 1/r to zero, never the radius.
function circumferenceDefault(t){const q=Math.max(0,Math.min(1,(t-35.1)/1.3));return q*q*(3-2*q)}
function circumferenceGeometry(progress){
 const u=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0)),r=136,length=2*Math.PI*r,k=(1-u)/r,theta=Math.PI*(1-u);
 const sinc=v=>Math.abs(v)<1e-4?1-v*v/6+v**4/120:Math.sin(v)/v;
 const meanY=k<1e-10?0:(Math.abs(theta)<1e-3?(theta*theta/6-theta**4/120+theta**6/5040)/k:(1-sinc(theta))/k);
 const point=s=>{const a=k*s;return{x:512+s*sinc(a),y:320-meanY+(k<1e-10?0:2*Math.sin(a/2)**2/k),tx:Math.cos(a),ty:Math.sin(a),s}};
 return{u,r,length,k,meanY,point,left:point(-length/2),right:point(length/2)};
}
// Optional gesture helper: the endpoint follows a sinc curve, so linear x→u
// mapping would make a partially opened handle jump on pointer-down.
function circumferenceProgressFromX(x){
 const target=Math.max(512,Math.min(512+Math.PI*136,x));let lo=0,hi=1;
 for(let i=0;i<30;i++){const mid=(lo+hi)/2;if(circumferenceGeometry(mid).right.x<target)lo=mid;else hi=mid}
 return target<=512?0:target>=512+Math.PI*136?1:(lo+hi)/2;
}
function drawCircumference(ctx,play,t,local,alpha=1){
 if(!Number.isFinite(t)||!Number.isFinite(local))return true;
 const g=circumferenceGeometry(play.value('unwrap',circumferenceDefault(t))),a=Math.max(0,Math.min(1,alpha)),points=[],ticks=[],flow=((t-33.18)*.28%1+1)%1;
 const mint='#bcd8cc',purple='#b7a8c9';
 for(let i=0;i<=256;i++)points.push(g.point((i/256-.5)*g.length));
 ctx.save();ctx.globalAlpha=a;ctx.lineCap='round';ctx.lineJoin='round';
 // A single measured contour. Equal spacing in s remains equal arc length.
 ctx.strokeStyle=mint;ctx.lineWidth=2.5;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
 for(let i=1;i<32;i++){const p=g.point((i/32-.5)*g.length),nx=-p.ty,ny=p.tx,h=i%4===0?6:3.7;ticks.push({x:p.x,y:p.y,s:p.s});ctx.globalAlpha=a*(i%4===0?.84:.43);ctx.strokeStyle=i%4===0?purple:mint;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(p.x-nx*h,p.y-ny*h);ctx.lineTo(p.x+nx*h,p.y+ny*h);ctx.stroke()}
 // Three small pulses travel along the same material coordinate; speed and
 // spacing are unchanged by the unfolding, making the conserved length visible.
 const pulses=[];
 for(let i=0;i<3;i++){const f=(flow+i/3)%1,p=g.point((f-.5)*g.length),tail=[];pulses.push({x:p.x,y:p.y,s:p.s});for(let j=0;j<=12;j++){const q=f-.028+j/12*.028;if(q>=0)tail.push(g.point((q-.5)*g.length))}ctx.globalAlpha=a*.65;ctx.strokeStyle=i===1?purple:mint;ctx.lineWidth=3.4;ctx.beginPath();tail.forEach((q,j)=>j?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.stroke();ctx.shadowColor=i===1?purple:mint;ctx.shadowBlur=10;ctx.globalAlpha=a*.9;ctx.fillStyle=i===1?'#d2c1dc':'#d5eee1';ctx.beginPath();ctx.arc(p.x,p.y,2.1,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0}
 // The seam has two endpoint marks. It opens into an anchor and drag handle.
 const left=g.left,right=g.right;
 ctx.globalAlpha=a;ctx.strokeStyle=purple;ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(left.x,left.y,5.8,0,Math.PI*2);ctx.stroke();ctx.fillStyle=purple;ctx.beginPath();ctx.arc(left.x,left.y,1.8,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle=mint;ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(right.x,right.y,12,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#d7eee0';ctx.beginPath();ctx.arc(right.x,right.y,3.6,0,Math.PI*2);ctx.fill();
 ctx.globalAlpha=a*.48;ctx.strokeStyle=mint;ctx.lineWidth=1;ctx.beginPath();ctx.arc(right.x,right.y,17,-.6,.6);ctx.stroke();
 ctx.globalAlpha=a*.88;ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.font='32px Space';ctx.fillStyle=mint;ctx.fillText('C = 2πr',512,560);ctx.restore();
 let sampledLength=0;for(let i=1;i<points.length;i++)sampledLength+=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);
 drawCircumference.lastState={active:a>0,progress:g.u,radius:g.r,length:g.length,curvature:g.k,sampledLength,centroid:{x:512,y:320},endpoints:{left,right},handle:{x:right.x,y:right.y,radius:17},points,ticks,pulses,label:{text:'C = 2πr',x:512,y:560}};
 return true;
}
