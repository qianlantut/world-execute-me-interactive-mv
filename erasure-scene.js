// Fictional system faults inside the music film. Deleting a line only hides
// that attempt; the failed connection keeps reporting new errors.
function buildErasureArt({ctx:x,play}){
 const width=1024,height=640,layer=document.createElement('canvas');layer.width=width;layer.height=height;const ink=layer.getContext('2d');
 const alternatives=[
  ['错误：连接已断开','错误：响应超时','错误：连接被重置'],
  ['重新连接 1 / 5','重新连接 2 / 5','重新连接 1 / 5'],
  ['参数越界：请求无效','错误：找不到对象','错误：状态无法恢复']
 ];
 const ys=[216,324,432],size=41,left=220;
 let rows=[],trail=[],seen=new Set(),lastT=null,lastLocal=null,replenished=0,metrics={};
 const bound=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=v=>{v=bound(v);return v*v*(3-2*v)};
 function reset(){rows=ys.map((y,i)=>({y,index:i,revision:0,pendingAt:null,regrowAt:null,initial:i*.13-.08,lastErase:-100}));trail=[];seen.clear();lastT=lastLocal=null;replenished=0;metrics={active:false,rows:[],replenished:0};}
 reset();
 function dist(px,py,a,b){const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,u=bound(((px-a.x)*dx+(py-a.y)*dy)/(l||1));return Math.hypot(px-a.x-u*dx,py-a.y-u*dy)}
 function opacityAt(px,py,t){let opacity=1;for(let i=0;i<trail.length;i++){const a=trail[i],prev=trail[i-1],b=prev&&a.t-prev.t<.15?prev:a,age=t-a.t;if(age<0||age>1.12)continue;const strength=1-ease((age-.48)/.62),d=dist(px,py,a,b);opacity*=1-strength*(1-ease((d-26)/24));}return opacity;}
 function ingest(t){const input=play.value('eraseTrail',[]);for(const p of Array.isArray(input)?input:[]){if(!Number.isFinite(p.x)||!Number.isFinite(p.y)||!Number.isFinite(p.t)||p.t>t+.001||t-p.t>1.13)continue;const id=p.t+':'+p.x.toFixed(2)+':'+p.y.toFixed(2);if(seen.has(id))continue;seen.add(id);trail.push({x:p.x,y:p.y,t:p.t});for(const row of rows){if(p.x>left-35&&p.x<860&&Math.abs(p.y-(row.y-13))<70){row.lastErase=p.t;if(row.pendingAt===null&&p.t-(row.regrowAt??-100)>.38)row.pendingAt=p.t+.72;}}}
  trail=trail.filter(p=>t-p.t<1.14).slice(-180);if(seen.size>1200)seen=new Set(trail.map(p=>p.t+':'+p.x.toFixed(2)+':'+p.y.toFixed(2)));
  for(const row of rows)if(row.pendingAt!==null&&t>=row.pendingAt){row.revision++;row.regrowAt=row.pendingAt;row.pendingAt=null;replenished++;}
 }
 function chrome(t,local,alpha){x.save();x.globalAlpha=alpha;const rise=1-ease(local/.22);x.translate(0,rise*15);x.fillStyle='rgba(7,19,27,.32)';x.fillRect(157,114,714,432);x.strokeStyle='#729592';x.lineWidth=1.4;x.strokeRect(157.5,114.5,714,432);x.strokeStyle='#596576';x.globalAlpha=alpha*.42;x.beginPath();x.moveTo(179,101);x.lineTo(889,101);x.lineTo(889,529);x.stroke();x.globalAlpha=alpha;x.strokeStyle='#9dc5b9';x.lineWidth=2;x.beginPath();x.moveTo(157,146);x.lineTo(157,114);x.lineTo(200,114);x.moveTo(829,546);x.lineTo(871,546);x.lineTo(871,514);x.stroke();x.font='19px Space';x.textBaseline='alphabetic';x.textAlign='left';x.fillStyle='#9cafbd';x.fillText('ERROR  /  RECONNECT',181,145);x.textAlign='right';x.fillStyle='#7b929b';x.fillText(String(replenished+1).padStart(3,'0'),848,145);x.strokeStyle='#6e89954d';x.lineWidth=1;x.beginPath();x.moveTo(180,160);x.lineTo(848,160);x.stroke();x.restore();}
 function draw(t,local,alpha=1){if(!Number.isFinite(t)||!Number.isFinite(local))return true;if(lastT!==null&&(t<lastT-.03||local<lastLocal-.1))reset();lastT=t;lastLocal=local;ingest(t);alpha=bound(alpha);chrome(t,local,alpha);ink.clearRect(0,0,width,height);ink.textBaseline='alphabetic';ink.textAlign='left';const rowMetrics=[];let visibleCount=0,totalCount=0;
  for(const row of rows){const auto=row.index===2&&row.revision===0?Math.floor(Math.max(0,local-1.25)/1.4):0,phrase=alternatives[row.index][(row.revision+auto)%alternatives[row.index].length],age=row.regrowAt===null?local-row.initial:t-row.regrowAt,automaticAge=auto?((local-1.25)%1.4):age,typingAge=row.regrowAt===null&&auto?automaticAge:age,count=Math.min(phrase.length,Math.max(0,Math.floor(typingAge*37)+1)),text=phrase.slice(0,count);ink.font=size+'px GardenText';ink.fillStyle=row.index===1?'#d3c7dd':'#bcd7cf';const chars=[];let xx=left;
   for(let j=0;j<text.length;j++){const ch=text[j],w=ink.measureText(ch).width,o=opacityAt(xx+w/2,row.y-15,t);chars.push({char:ch,x:xx,y:row.y,width:w,opacity:o});visibleCount+=o>.2?1:0;totalCount++;ink.fillText(ch,xx,row.y);xx+=w+1.3;}
   ink.strokeStyle='#6c8b8f';ink.lineWidth=1.5;ink.beginPath();ink.moveTo(187,row.y-20);ink.lineTo(199,row.y-14);ink.lineTo(187,row.y-8);ink.stroke();ink.globalAlpha=.22;ink.strokeStyle='#89a6aa';ink.beginPath();ink.moveTo(left,row.y+28);ink.lineTo(832,row.y+28);ink.stroke();ink.globalAlpha=1;rowMetrics.push({text,fullText:phrase,y:row.y,revision:row.revision,regrowing:row.regrowAt!==null&&age<.45,pendingAt:row.pendingAt,chars,cursorX:xx});
  }
  // The brush removes only ink; the window and incoming-reply cursor stay anchored.
  ink.save();ink.globalCompositeOperation='destination-out';ink.lineCap='round';ink.lineJoin='round';
  for(let i=0;i<trail.length;i++){const a=trail[i],prev=trail[i-1],b=prev&&a.t-prev.t<.15?prev:a,age=t-a.t,strength=1-ease((age-.48)/.62);if(age<0||strength<=0)continue;for(let edge=0;edge<3;edge++){ink.globalAlpha=strength*(edge===0?.9:.23);ink.lineWidth=66+edge*12;ink.beginPath();ink.moveTo(b.x,b.y);ink.lineTo(a.x+.001,a.y);ink.stroke();}}
  ink.restore();x.save();x.globalAlpha=alpha;x.drawImage(layer,0,0);
  // A fresh error is already being typed while the erased report is rebuilt.
  // It alternates its anchor, so a real mouse cannot empty the entire stream at once.
  const last=trail[trail.length-1],tailRight=last?last.x<512:Math.floor(local/1.1)%2===0,tailText=['正在重新连接…','重试失败，等待重连…'][Math.floor(local/1.1)%2],phase=local%1.1,tailCount=Math.max(2,Math.min(tailText.length,Math.floor(phase*24)+2)),tailX=tailRight?525:220;
  x.font='25px GardenText';x.fillStyle='#99afa9';x.textAlign='left';x.fillText(tailText.slice(0,tailCount),tailX,519);const tailWidth=x.measureText(tailText.slice(0,tailCount)).width,cursorAlpha=.5+.5*Math.sin(t*8);x.fillStyle='#c5ded0';x.globalAlpha=alpha*(.45+.55*cursorAlpha);x.fillRect(tailX+tailWidth+7,499,2,23);
  // Subtle fragments detach along the actual wipe path; they are letter strokes, not debris polygons.
  if(last&&t-last.t<.55){x.globalAlpha=alpha*(1-(t-last.t)/.55);x.strokeStyle='#c2b5d2';x.lineWidth=1.3;for(let j=0;j<8;j++){const a=j*2.399,r=12+(t-last.t)*55,jx=last.x+Math.cos(a)*r,jy=last.y+Math.sin(a)*r*.45;x.beginPath();x.moveTo(jx,jy);x.lineTo(jx+Math.cos(a)*9,jy+Math.sin(a)*4);x.stroke();}x.globalAlpha=alpha*.45;x.strokeStyle='#a7c2b9';x.beginPath();x.arc(last.x,last.y,40,0,Math.PI*2);x.stroke();}
  x.restore();metrics={active:alpha>0,rows:rowMetrics,trailCount:trail.length,visibleCharacters:visibleCount+tailCount,mainVisibleCharacters:visibleCount,totalMainCharacters:totalCount,incomingText:tailText.slice(0,tailCount),incomingPosition:{x:tailX,y:519},cursor:{x:tailX+tailWidth+7,y:499},replenished,neverEmpty:visibleCount+tailCount>0};return true;
 }
 return {draw,reset,state:()=>metrics};
}
