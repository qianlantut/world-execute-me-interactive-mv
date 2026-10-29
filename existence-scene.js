// A fictional machine's proof of existence. The stamp's x/y is its base centre.
// Paper bounds: x210..790, y190..520. Preferred comfortable ink bounds:
// x280..720, y260..455. This scene uses no audio and never changes playback.
function drawExistence(x,play,t,local,alpha=1){
 const C=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),S=v=>{v=C(v);return v*v*(3-2*v)},L=(a,b,v)=>a+(b-a)*v,TA=Math.PI*2;
 const down=!!play.value('stampDown',false),userAt=play.value('sealAt',null),hasUser=userAt!==null&&userAt<=t,at=hasUser?userAt:87.91,age=t-at,sealed=age>=0;
 const sealX=hasUser?play.value('sealX',614):614,sealY=hasUser?play.value('sealY',402):402;
 const autoApproach=S((t-87.28)/.63),lift=sealed?S((age-.16)/.70)*83:0,compression=sealed?Math.exp(-Math.max(0,age)*7)*.95:down?.12:0;
 let px,py,angle;
 if(down){px=play.value('stampX',700);py=play.value('stampY',180);angle=-.06+Math.sin(t*3.1)*.015;}
 else if(sealed){px=sealX;py=sealY-lift;angle=Math.sin(Math.max(0,age)*7)*.035*Math.exp(-Math.max(0,age)*3);}
 else{px=L(700,614,autoApproach);py=L(180+Math.sin(t*1.7)*4,402,autoApproach);angle=L(-.14,0,autoApproach);}
 const onPaper=px>210&&px<790&&py>190&&py<520,entrance=S(local/.44),a=C(alpha)*entrance;
 x.save();x.globalAlpha*=a;x.lineJoin='round';x.lineCap='round';
 function stroke(path,color='#8daeb0',width=1.5){x.beginPath();path(x);x.strokeStyle=color;x.lineWidth=width;x.stroke();}
 function label(s,xx,yy,size=22,color='#b8cfc4',font='GardenText'){x.fillStyle=color;x.font=`${size}px ${font}`;x.textAlign='left';x.textBaseline='alphabetic';x.fillText(s,xx,yy);}
 // Slightly irregular folded edges and a printer's inner rule, not a dialog box.
 const paper=()=>{x.moveTo(228,190);x.lineTo(784,190);x.lineTo(790,492);x.lineTo(761,520);x.lineTo(210,520);x.lineTo(210,209);x.closePath()};
 x.save();x.translate(0,5);x.beginPath();paper();x.fillStyle='#06131c55';x.fill();x.restore();
 stroke(paper,'#9dbdb6',2.1);stroke(p=>{p.moveTo(228,190);p.lineTo(228,209);p.lineTo(210,209);p.moveTo(761,520);p.lineTo(761,492);p.lineTo(790,492)},'#6f969c',1.4);
 stroke(p=>{p.moveTo(246,214);p.lineTo(763,214);p.lineTo(765,470);p.moveTo(738,495);p.lineTo(235,495);p.lineTo(235,231)},'#59747e',1);
 for(let i=0;i<8;i++){x.beginPath();x.arc(222,242+i*31,1.6,0,TA);x.fillStyle='#6d8c93';x.fill();}
 label('存在证明',270,269,36,'#d4dfcf');label('PROOF / OF BEING',272,297,16,'#859ea9','Space');
 stroke(p=>{p.moveTo(270,318);p.lineTo(728,318)},'#637f89',1.1);
 label('对象',272,356,20,'#829fa7');label('me',346,356,25,'#d5dcca','Space');
 label('见证',272,392,20,'#829fa7');label('you',346,392,25,'#c6b6d5','Space');
 label('从空集合，到此刻。',272,457,22,'#abc3b6');
 label('∅  →  1',659,257,22,'#ad9fc2','Space');
 // A moving dashed tether points at the landing area; its ghost impress makes
 // the relationship between the physical stamp and the paper immediately clear.
 if(!sealed){
  const guide=(1-autoApproach*.65)*(down?.60:.85);x.save();x.globalAlpha*=guide;
  x.setLineDash([3,7]);x.lineDashOffset=-t*12;stroke(p=>{p.moveTo(702,220);p.bezierCurveTo(754,253,727,329,664,366)},'#7d9caa',1.6);x.setLineDash([]);
  stroke(p=>{p.moveTo(672,352);p.lineTo(664,366);p.lineTo(680,365)},'#bacdbf',1.7);
  x.setLineDash([2,7]);stroke(p=>p.arc(614,402,58,0,TA),'#9aa0bc',1.2);x.setLineDash([]);
  for(const sign of [-1,1])stroke(p=>{p.moveTo(614+sign*68,396);p.lineTo(614+sign*68,408);p.moveTo(608,402+sign*68);p.lineTo(620,402+sign*68)},'#738d9e',1.2);
  if(!down)label('拖向这里',577,410,20,'#9fb7b6');else label(onPaper?'松手，留下证明':'移到纸面',560,475,19,'#d2c7d5');
  x.restore();
 }
 if(sealed){
  const transfer=S((age+.025)/.13),size=L(.93,1,S(age/.22));x.save();x.translate(sealX,sealY);x.rotate(-.10);x.scale(size,size);x.globalAlpha*=transfer;
  // Uneven ink pressure is drawn as actual interrupted contours and tiny pores.
  const ink='#ce899f';for(let ring=0;ring<2;ring++)for(let j=0;j<18;j++){
   const r=ring?47.5:57,aa=j/18*TA+.014*Math.sin(j*4),len=TA/18-(j%5===0?.075:.018);
   stroke(p=>p.arc(0,0,r,aa,aa+len),ink,ring?1.3:2.4);
  }
  x.textAlign='center';x.fillStyle=ink;x.font='25px GardenText';x.fillText('存在',0,-5);x.fillText('确认',0,24);
  for(const side of [-1,1]){x.beginPath();x.moveTo(side*39,-4);x.lineTo(side*43,1);x.lineTo(side*39,6);x.lineTo(side*35,1);x.closePath();x.fill();}
  stroke(p=>{p.moveTo(-23,-36);p.lineTo(23,-36);p.moveTo(-21,35);p.lineTo(21,35)},'#b97e97',.8);
  for(let j=0;j<22;j++){const ang=j*2.399,rr=48+Math.sin(j*3)*8;stroke(p=>{p.moveTo(Math.cos(ang)*rr,Math.sin(ang)*rr);p.lineTo(Math.cos(ang)*(rr+.9),Math.sin(ang)*(rr+.9))},'#ead5c94a',1.1);}
  x.restore();
 }
 // Hover shadow stays on the paper; the instrument lifts, its imprint stays.
 if(onPaper||sealed){x.save();x.globalAlpha*=sealed?(1-lift/100)*.16:.10;x.beginPath();x.ellipse(px,sealed?sealY:py+7,64,17,0,0,TA);x.fillStyle='#04101a';x.fill();x.restore();}
 x.save();x.translate(px,py);x.rotate(angle);const spring=L(30,13,compression),stemTop=-22-spring;
 // Rose metal sole, a narrow bevel and two fasteners.
 x.beginPath();x.moveTo(-57,-18);x.quadraticCurveTo(0,-31,57,-18);x.lineTo(61,-3);x.quadraticCurveTo(0,12,-61,-3);x.closePath();x.fillStyle='#172832';x.fill();x.strokeStyle='#b1b8c6';x.lineWidth=1.9;x.stroke();
 stroke(p=>{p.moveTo(-59,-7);p.quadraticCurveTo(0,5,59,-7);p.moveTo(-48,-20);p.quadraticCurveTo(0,-12,48,-20)},'#738d9f',1.1);
 for(const s of [-1,1]){x.beginPath();x.ellipse(s*44,-11,3.1,2.2,0,0,TA);x.strokeStyle='#a4b4bb';x.lineWidth=1;x.stroke();}
 // A real helical compression spring surrounds the central plunger.
 stroke(p=>{p.moveTo(-6,-25);p.lineTo(-6,stemTop-4);p.moveTo(6,-25);p.lineTo(6,stemTop-4)},'#758d9c',2);
 stroke(p=>{for(let j=0;j<=60;j++){const u=j/60,yy=-24-u*(spring-4),xx=Math.sin(u*TA*3)*14;j?p.lineTo(xx,yy):p.moveTo(xx,yy)}},'#a8bdbe',1.7);
 x.beginPath();x.moveTo(-14,stemTop-2);x.bezierCurveTo(-13,stemTop-15,-28,stemTop-20,-27,stemTop-38);x.bezierCurveTo(-25,stemTop-63,25,stemTop-63,27,stemTop-38);x.bezierCurveTo(28,stemTop-20,13,stemTop-15,14,stemTop-2);x.closePath();x.fillStyle='#342f3c';x.fill();x.strokeStyle='#c3aeb7';x.lineWidth=2;x.stroke();
 // Curved wood grain and one rubbed edge keep the handle tactile but restrained.
 for(let j=0;j<4;j++)stroke(p=>{const xx=-16+j*10;p.moveTo(xx,stemTop-43);p.bezierCurveTo(xx-5,stemTop-29,xx*.5,stemTop-20,xx*.4,stemTop-9)},j%2?'#786071':'#544557',1.1);
 stroke(p=>{p.moveTo(-19,stemTop-43);p.quadraticCurveTo(-8,stemTop-57,11,stemTop-49)},'#cbb7b55a',1.4);
 stroke(p=>{p.moveTo(-17,stemTop);p.lineTo(17,stemTop)},'#a7b7bf',3);
 if(down){x.save();x.globalAlpha*=.55;stroke(p=>{p.moveTo(-70,-9);p.lineTo(-77,-9);p.moveTo(70,-9);p.lineTo(77,-9)},'#dfc4ce',1.5);x.restore();}
 x.restore();
 x.restore();
 drawExistence.lastState={sealAt:sealed?at:null,proof:sealed&&age>=.035,automatic:!hasUser,seal:{x:sealX,y:sealY,alpha:sealed?S((age+.025)/.13):0},pose:{x:px,y:py,rotation:angle,compression,dragging:down,lift},paper:{left:210,right:790,top:190,bottom:520},onPaper};
 return true;
}
