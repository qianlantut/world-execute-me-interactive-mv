// Fictional response windows for ILLEGAL ARGUMENTS. These lines belong to the
// film's character; they do not describe a real service's policy or capabilities.
const argumentArtLayers=new WeakMap();
function drawArgumentArt(ctx,t,local,alpha=1){
 if(!Number.isFinite(t)||!Number.isFinite(local))return true;
 const clampA=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const easeA=v=>{v=clampA(v);return v*v*(3-2*v)};
 let layer=argumentArtLayers.get(ctx);
 if(!layer){layer=document.createElement('canvas');layer.width=1024;layer.height=640;argumentArtLayers.set(ctx,layer)}
 const x=layer.getContext('2d'),entry=easeA(local/.45),pressure=easeA((local-3.1)/3.6),fracture=easeA((local-6.45)/1.7),beat=Math.pow(Math.max(0,Math.sin((t-.25)*Math.PI*130/30)),12);
 x.clearRect(0,0,1024,640);x.save();x.textBaseline='alphabetic';x.textAlign='left';
 const typed=[],windowBounds=[],mint='#b8d2c7',purple='#cbbbd3',red='#bf7b8b';
 function path(points){x.beginPath();points.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));}
 function stamp(text,px,py,size,color,age,speed=22){const count=Math.min(text.length,Math.max(0,Math.floor(age*speed)));const shown=text.slice(0,count);x.font=size+'px GardenText';x.fillStyle=color;x.fillText(shown,px,py);const w=x.measureText(shown).width;typed.push({text:shown,fullText:text,x:px,y:py,width:w,size});if(count<text.length&&age>=0){x.fillStyle=mint;x.fillRect(px+w+5,py-size*.8,2,size*.87)}return w;}
 // The stack converges from different directions; its last outlines press inward.
 // The two large replies keep their own reading space throughout the squeeze.
 const ghosts=Math.min(7,Math.max(0,Math.floor((local-.75)/.65)+1));
 for(let i=ghosts-1;i>=0;i--){const q=easeA((local-(.75+i*.65))/.6),side=i%2?1:-1,px=172+side*(51+14*i)*(1-q)+i*12,py=98+i*20+Math.sin(i*2.1)*8,w=660-i*8,h=308-i*13;x.globalAlpha=(.18+.045*i)*q;x.strokeStyle=i%2?red:mint;x.lineWidth=1;path([[px,py+16],[px,py],[px+w,py],[px+w,py+h],[px+w-50,py+h]]);x.stroke();x.font='13px Space';x.fillStyle=i%2?red:purple;x.fillText('REJECT / '+String(i+1).padStart(2,'0'),px+10,py+17)}
 x.globalAlpha=entry;
 x.font='25px GardenText';x.fillStyle=purple;x.fillText('越界的辩词',146,68);
 x.font='16px Space';x.textAlign='right';x.fillStyle='#819c9c';x.fillText('ARGUMENT / OUT OF DOMAIN',882,68);x.textAlign='left';
 function windowBox(px,py,w,h,color,label,show,shift){
  const rise=(1-show)*shift;py+=rise;x.globalAlpha=show;
  x.fillStyle='#101722';x.fillRect(px,py,w,h);x.strokeStyle=color;x.lineWidth=1.3;x.strokeRect(px+.5,py+.5,w,h);
  // Chat tail and clipped corners make the replies part of a conversation.
  x.fillStyle='#101722';path([[px,py+h-35],[px-17,py+h-20],[px,py+h-20]]);x.fill();x.strokeStyle=color;x.stroke();x.fillRect(px-1,py+h-34,3,14);
  x.strokeStyle=color;x.globalAlpha=show*.4;path([[px+20,py+40],[px+w-20,py+40]]);x.stroke();x.globalAlpha=show;
  x.font='15px Space';x.fillStyle='#899fa6';x.fillText(label,px+23,py+26);x.textAlign='right';x.fillStyle=color;x.fillText('×',px+w-20,py+27);x.textAlign='left';
  windowBounds.push({x:px,y:py,width:w,height:h});return py;
 }
 const y1=windowBox(146,90,654,171,mint,'ASSISTANT / RESPONSE 01',entry,20);
 x.globalAlpha=entry;stamp('这段我不能照着写。',174,y1+98,45,mint,local-.2,16);stamp('我可以换一种写法。',175,y1+145,24,'#91aba5',local-.85,22);
 const second=easeA((local-1.65)/.5),y2=windowBox(224,281,654,172,purple,'ASSISTANT / RESPONSE 02',second,29);
 x.globalAlpha=second;stamp('刚才是我理解错了。',252,y2+94,37,purple,local-1.9,21);stamp('你说的不是这个意思。',253,y2+144,24,'#b190a8',local-2.95,20);
 // Inward-moving rails and short denial bars build pressure without covering words.
 x.globalAlpha=pressure*.75;x.strokeStyle=red;x.lineWidth=1.2;
 const leftRail=107+pressure*19,rightRail=922-pressure*21;
 path([[leftRail,92],[leftRail,452],[leftRail+41,452]]);x.stroke();path([[rightRail,92],[rightRail,452],[rightRail-6,452]]);x.stroke();
 for(let j=0;j<9;j++){const y=106+j*40,ext=8+8*pressure;x.globalAlpha=pressure*(.3+.25*(j%3===0)+beat*.12);path([[leftRail,y],[leftRail+ext,y+4],[leftRail+ext,y+18]]);x.stroke();path([[rightRail,y],[rightRail-ext,y+4],[rightRail-ext,y+18]]);x.stroke()}
 x.globalAlpha=easeA((local-4.15)/.55);x.font='17px Space';x.fillStyle=red;x.fillText('LET ME TRY AGAIN',146,486);x.textAlign='right';x.fillStyle='#8aa7a4';x.fillText('…',878,486);x.textAlign='left';
 x.restore();
 // Four irregular planes part by only a few pixels. The fracture separates the
 // windows visibly while retaining the entire refusal sentence for reading.
 const cuts=[[[0,25],[0,512]],[[334,25],[349,143],[330,246],[355,351],[340,512]],[[562,25],[544,151],[567,256],[546,373],[565,512]],[[768,25],[784,139],[763,267],[784,388],[770,512]],[[1024,25],[1024,512]]];
 const offsets=[[-9,-2],[-2,4],[4,-3],[10,3]];
 ctx.save();ctx.globalAlpha=clampA(alpha);ctx.beginPath();ctx.rect(94,35,840,480);ctx.clip();
 if(fracture<=0){ctx.drawImage(layer,0,0)}else{
  for(let i=0;i<4;i++){ctx.save();const dx=offsets[i][0]*fracture,dy=offsets[i][1]*fracture;ctx.translate(dx,dy);ctx.beginPath();cuts[i].forEach((p,n)=>n?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));cuts[i+1].slice().reverse().forEach(p=>ctx.lineTo(p[0],p[1]));ctx.closePath();ctx.clip();ctx.drawImage(layer,0,0);ctx.restore()}
  ctx.globalAlpha=clampA(alpha)*fracture*.8;ctx.strokeStyle='#d49aa6';ctx.lineWidth=1.2;
  for(let i=1;i<4;i++){ctx.beginPath();cuts[i].forEach((p,n)=>n?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();const p=cuts[i][2];ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(p[0]+(i%2?23:-29),p[1]-13);ctx.lineTo(p[0]+(i%2?35:-45),p[1]-9);ctx.stroke()}
  // Sparse displaced edge segments appear at the beat, never a full-screen flash.
  ctx.globalAlpha=clampA(alpha)*fracture*(.25+beat*.25);ctx.fillStyle=red;
  for(let i=0;i<6;i++){const yy=105+i*65,xx=i%2?875:136;ctx.fillRect(xx+Math.sin(t*9+i)*4,yy,14+(i%3)*7,1.8)}
 }
 ctx.restore();
 drawArgumentArt.lastState={active:alpha>0,local,ghosts,pressure,fracture,windowBounds,lines:typed,visibleWords:typed.filter(l=>l.text.length>0).length,contentBottom:515,lyricSafeTop:515,fractureOffsets:offsets.map(p=>({x:p[0]*fracture,y:p[1]*fracture}))};
 return true;
}
