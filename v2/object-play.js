function currentDefault(t){return clamp(1-smooth((t-45.73)/.27)+smooth((t-46.55)/.28));}
// Approach throughout the phrase, then close on the calibrated LIMITATIONS cue.
function infinityBoundaryDefault(t){return 820-100*smooth((t-40.56)/2.6)-120*smooth((t-43.13)/.47);}
// Held night/day states, with short solar half-turns on the AM and PM words.
function dayNightDefault(t){return Math.PI*(smooth((t-93.88)/.18)+smooth((t-94.73)/.18));}
function dayNightState(play,t){const manual=play.value('angle',null),angle=manual??dayNightDefault(t);return {angle,light:clamp(.5-.65*Math.cos(angle)),manual:manual!==null};}
function spinVisualState(play,t){const start=49.51,end=51.21,active=t>=start&&t<end,held=play?.value('spinHeld',false)??false,at=play?.value('spinAt',t)??t,age=Math.max(0,t-at),velocity=play?.value('spinVelocity',0)??0,offset=(play?.value('spin',0)??0)+(held?0:velocity*.42*(1-Math.exp(-age/.42)));return {active,held,offset,rotation:(t-start)*.65+offset,velocity:held?velocity:velocity*Math.exp(-age/.42)};}
// Direct manipulation belongs to one lyric object and expires with that object.
function buildObjectPlay({group,diagram,getState,ctx:x}){
 const stage=$('#stage'),ray=new T.Raycaster(),plane=new T.Plane();let epoch=-1,kind='',visible=false,values={},erased=new Set(),drag=null,hover=false,lastLocal=-1,hotspots=[];
 const supported=new Set(['spin','deity','world','points','circle','sine','current','infinity','clock','union','iris','eggplant','tomato','fragments','power','pieces','parameters','identity','roles','cat','heart','love','resonance','absence','meter','error']);
 function reset(){if(drag&&stage.hasPointerCapture(drag.id))stage.releasePointerCapture(drag.id);drag=null;values={};erased.clear();hotspots=[];stage.style.cursor='';hover=false;}
 function update(q,on){if(q.i!==epoch||!on||q.local<lastLocal-.05)reset();epoch=q.i;kind=q.kind;visible=on;lastLocal=q.local;hotspots=[];if(kind==='absence'&&q.start+q.local>=117.5){values.pressure=0;values.pressureAt=q.start+q.local;}}
 function value(name,fallback){return values[name]??fallback}
 function point(px,py){group.updateWorldMatrix(true,true);ray.setFromCamera(new T.Vector2(px/innerWidth*2-1,1-py/innerHeight*2),camera);plane.setFromNormalAndCoplanarPoint(v3(0,0,1).applyQuaternion(diagram.getWorldQuaternion(new T.Quaternion())),diagram.getWorldPosition(v3()));const p=ray.ray.intersectPlane(plane,v3());if(!p)return null;diagram.worldToLocal(p);return {x:(p.x/4.5+.5)*1024,y:(.5-p.y/2.8125)*640};}
 function screen(px,py){group.updateWorldMatrix(true,true);const p=v3((px/1024-.5)*4.5,(.5-py/640)*2.8125,0);diagram.localToWorld(p);p.project(camera);return {x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2};}
 function handle(px,py,color='#d5e8d5'){x.save();x.strokeStyle=color;x.lineWidth=3;x.beginPath();x.arc(px,py,drag?17:14,0,TAU);x.stroke();x.fillStyle='#09141f';x.beginPath();x.arc(px,py,9,0,TAU);x.fill();x.fillStyle=color;x.beginPath();x.arc(px,py,4,0,TAU);x.fill();x.restore();}
 function text(s,px,py,size=27,color='#93b6b5'){x.font=`${size}px GardenText`;x.textAlign='center';x.fillStyle=color;x.fillText(s,px,py)}
 const SHOW_HINTS=false;function hint(s){if(SHOW_HINTS)text(s,512,596,27,drag?'#effff6':'#c3d8d4')}
 function controls(t){if(!visible||!supported.has(kind))return;const q=getState(),local=q.local;
  if(kind==='current'){const v=value('dc',currentDefault(t)),xx=210+v*600;x.strokeStyle='#526f7a';x.lineWidth=3;x.beginPath();x.moveTo(210,520);x.lineTo(810,520);x.stroke();for(let j=0;j<=10;j++){let xx=210+j*60;x.beginPath();x.moveTo(xx,512);x.lineTo(xx,528);x.stroke()}handle(xx,520);text('AC',145,530,34);text('DC',875,530,34);hint('拖动电流 · 在交变与恒定之间');}
  if(kind==='spin'){const a=spinVisualState({value},t).rotation;handle(512+Math.cos(a)*192,320+Math.sin(a)*45);hint('左右拖动 · 绕立体线条转动');}
  if(kind==='circle')hint('拖动端点 · 将圆周铺成等长直线');
  if(kind==='sine'){const u=value('tangent',.5+.22*Math.sin(local*.7)),a=u*TAU*2-t*.8;handle(120+u*800,320+Math.sin(a)*100,'#e4bcd2');hint('拖着切点 · 让斜率随你变化');}
  if(kind==='clock'){if(t>=59){const a=dayNightState({value},t).angle;handle(512+Math.cos(a)*125,320+Math.sin(a)*125);}hint(t<59?'滚动或上下拨动 · −2026 至 2026':'拨动指针 · 从晨光到夜色');}
  if(kind==='union')hint(t>=57.01?'上下拖动光点 · 继续深入':'拖动右侧光点 · 交织为同一个入口');
  if(kind==='points')hint('拖动点阵 · 从另一面看维度');
  if(kind==='infinity'){const boundary=value('limit',infinityBoundaryDefault(t));handle(boundary,320);hint('移动边界 · 给无穷划一道界限');}
  if(kind==='iris'){handle(512+35+value('aperture',1-smooth(local/2))*80,320);hint('拖开眼帘 · 让光重新进来');}
  if(['eggplant','tomato','cat','deity'].includes(kind))hint('划过它 · 一刀切开');
  if(kind==='world'&&t<15&&value('worldStartAt',null)===null)hint(t<13.82?'点击 · +1%':'点击 START');if(kind==='power')hint('拖动插头 · 接通电源');if(kind==='pieces')hint('拖动碎片 · 拼合一个对象');if(kind==='parameters')hint('点击机器 · 把 data 喂给它');if(kind==='identity')hint('轻点或滑动开关 · 切换形象');if(kind==='roles')hint('轻点或滑动开关 · 交换姿态');if(kind==='error')hint('点击 · 顶住每一次驳回');if(kind==='meter')hint('点击 · 把满足度填满');if(kind==='heart'||kind==='love')hint('点击爱心 · 把回应送上去');if(kind==='resonance')hint(t>100?'左右拖动篮子 · 接住振动':'触碰光弦 · 波与波叠加');
  if(kind==='fragments')hint('按住擦去错误 · 连接仍在重试');
 }
 function accepts(p){if(!p||!visible||!supported.has(kind)||p.x<35||p.x>989||p.y<(kind==='clock'?20:60)||p.y>630)return false;
  if(kind==='resonance'&&(preview??audio.currentTime)>100)return p.x>150&&p.x<874&&p.y>400&&p.y<590;
  if(kind==='spin')return Math.hypot(p.x-512,p.y-320)<285;
  if(kind==='identity'||kind==='roles')return p.x>340&&p.x<685&&p.y>440&&p.y<595;
  if(['eggplant','tomato','cat','deity'].includes(kind))return p.x>100&&p.x<925&&p.y<610;
  if(kind==='fragments')return p.x>110&&p.x<925&&p.y>90&&p.y<575;
  if(['error','meter','heart','love','absence','resonance','parameters','cat','power','pieces'].includes(kind))return p.x>130&&p.x<900&&p.y>85&&p.y<590;
  if(kind==='world')return value('worldStartAt',null)===null&&(preview??audio.currentTime)<15&&p.x>180&&p.x<845&&p.y>200&&p.y<485;
  if(kind==='current')return p.x>140&&p.x<890&&Math.abs(p.y-520)<82;
  if(kind==='circle'){const tip=circumferenceGeometry(value('unwrap',circumferenceDefault(preview??audio.currentTime))).right;return Math.hypot(p.x-tip.x,p.y-tip.y)<100;}
  if(kind==='sine')return p.x>=100&&p.x<=940&&p.y>145&&p.y<490;
  if(kind==='infinity')return Math.abs(p.x-value('limit',infinityBoundaryDefault(preview??audio.currentTime)))<90;
  if(kind==='clock')return (preview??audio.currentTime)<59?(p.x>150&&p.x<900):Math.hypot(p.x-512,p.y-320)<210;
  if(kind==='union'){const t=preview??audio.currentTime,deep=smooth((t-56.83)/.68),d=value('distance',110*(1-smooth(getState().local/3))),depth=clamp(value('depth',smooth((t-57.01)/1.3))),xx=mix(512+d,512,deep),yy=320+deep*depth*130;return t>=57.01?Math.abs(p.x-xx)<110&&p.y>250&&p.y<540:Math.hypot(p.x-xx,p.y-yy)<140;}
  if(kind==='iris')return Math.hypot(p.x-512,p.y-320)<210;
  return p.x>190&&p.x<850&&p.y<540;
 }
 function change(p){if(!drag||!p)return;const dx=p.x-drag.x,t=preview??audio.currentTime,dt=Math.max(.001,t-(drag.lastT??t)),last=drag.last??p;
  if(kind==='resonance'&&t>100){values.basketX=clamp(p.x+(drag.basketOffsetX??0),160,864);values.basketAt=t;}
  if(kind==='spin'){const delta=(p.x-last.x)*.009;values.spin=value('spin',0)+delta;values.spinVelocity=clamp(delta/dt,-5,5);values.spinAt=t;}
  if(kind==='current')values.dc=clamp((p.x-210)/600);
  if(kind==='circle')values.unwrap=circumferenceProgressFromX(p.x);
  if(kind==='sine')values.tangent=clamp((p.x-120)/800,.03,.97);
  if(kind==='clock'){if(t<59){values.year=Math.round(clamp(drag.initialYear+(drag.y-p.y)*18,-2026,2026));values.angle=values.year/2026*Math.PI;}else values.angle=Math.atan2(p.y-320,p.x-512);}
  if(kind==='union'){if(t>=57.01){const automatic=smooth((t-57.01)/1.3);values.depth=Math.min(12,Math.max(automatic,value('depth',automatic))+Math.abs(p.y-last.y)/180);}else values.distance=clamp((p.x-512)/Math.max(.1,1-smooth((t-56.83)/.68)),0,200);}
  if(kind==='points')values.rotation=drag.initial+dx*.009;
  if(kind==='infinity')values.limit=clamp(p.x+(drag.limitOffset??0),390,880);
  if(kind==='iris')values.aperture=clamp((Math.hypot(p.x-512,p.y-320)-35)/80);
  if(kind==='power')values.plug=clamp((p.x-240)/350);if(kind==='pieces')values.assembly=clamp(Math.max(smooth(getState().local/2),value('assembly',0))+Math.hypot(p.x-last.x,p.y-last.y)/500);if((kind==='identity'||kind==='roles')&&Math.hypot(p.x-drag.x,p.y-drag.y)>8){values[kind==='identity'?'gender':'role']=clamp((p.x-462)/100);values.switchAt=-100;drag.moved=true;}
  
  if(['eggplant','tomato','cat','deity'].includes(kind)){const vx=p.x-last.x,vy=p.y-last.y,d2=vx*vx+vy*vy,u=clamp(((512-last.x)*vx+(320-last.y)*vy)/(d2||1)),distance=Math.hypot(last.x+u*vx-512,last.y+u*vy-320);values.trail=(values.trail??[]).filter(q=>t-q.t<.22).concat([{x:p.x,y:p.y,t}]).slice(-22);if(d2>35&&distance<155&&(values.cutAt===undefined||t-values.cutAt>1.25)){values.cutAt=t;values.cutAngle=Math.atan2(vy,vx);values.slices=(values.slices??0)+1;}}
  drag.last=p;drag.lastT=t;
  if(kind==='fragments')values.eraseTrail=(values.eraseTrail??[]).filter(q=>t-q.t<1.4).concat([{x:p.x,y:p.y,t}]).slice(-160);
 }
 stage.addEventListener('pointerdown',e=>{if(e.mvObjectHandled)return;const p=point(e.clientX,e.clientY);if(!accepts(p)||e.button!==0)return;e.mvObjectHandled=true;e.preventDefault();if(['eggplant','tomato','cat','deity'].includes(kind))e.stopPropagation();drag={id:e.pointerId,x:p.x,y:p.y,initial:value('rotation',kind==='points'?getState().local*.35:(preview??audio.currentTime)*.6)};stage.setPointerCapture(e.pointerId);stage.style.cursor='grabbing';const t=preview??audio.currentTime;
  if(kind==='spin'){values.spin=spinVisualState({value},t).offset;values.spinHeld=true;values.spinAt=t;values.spinVelocity=0;}
  if(kind==='identity'||kind==='roles')drag.switchInitial=identityValue({value},kind,t);
  if(kind==='clock'&&t<59)drag.initialYear=value('year',yearDefault(t));
  if(kind==='infinity')drag.limitOffset=value('limit',infinityBoundaryDefault(t))-p.x;
  if(kind==='error'){values.errTaps=(values.errTaps??[]).filter(q=>q.t<=t).concat([{t,x:p.x,y:p.y,local:getState().local}]).slice(-40);}
  if(kind==='meter'){values.meterTaps=(values.meterTaps??[]).filter(q=>q.t<=t).concat([{t,x:p.x,y:p.y}]).slice(-40);}
  if(kind==='cat'){values.sleepCount=(values.sleepCount??0)+1;values.sleepMarks=(values.sleepMarks??[]).filter(q=>t-q.t<2.8).concat([{t,id:values.sleepCount}]).slice(-12);}
  if(kind==='world'){if(t<13.82){values.worldClicks=(values.worldClicks??0)+1;values.worldClickTimes=(values.worldClickTimes??[]).filter(q=>t-q<1.2).concat([t]).slice(-10);values.worldPressAt=t;}else{values.worldStartAt=t;values.worldPressAt=t;}}
  
  if(kind==='parameters'){values.emits=(values.emits??0)+1;values.emitAt=t;}
  if(kind==='resonance'&&t>100){const basket=lyricObjects?.semantic?.state().vibration?.basket;drag.basketOffsetX=basket&&Math.abs(p.x-basket.x)<110?basket.x-p.x:0;values.basketDragging=true;}
  if(kind==='resonance'&&t<100)values.impulses=(values.impulses??[]).filter(q=>t-q.t<2.5).concat([{x:(p.x/1024-.5)*3.5,y:(.5-p.y/640)*2.3,t}]).slice(-12);
  if(kind==='heart'||kind==='love'){values.likes=(values.likes??0)+1;values.heartBirths=(values.heartBirths??[]).filter(q=>t-q.t<3).concat([{t,id:values.likes}]).slice(-40);}
  if(kind==='absence'&&t<117.5){const old=Math.max(0,(values.pressure??.04)-(t-(values.pressureAt??t))*.11);values.pressure=Math.min(.96,old+(1-old)*.19+.012);values.pressureAt=t;}
  change(p);});
 stage.addEventListener('pointermove',e=>{if(drag){e.mvObjectHandled=true;if(['eggplant','tomato','cat','deity'].includes(kind))e.stopPropagation();if(!visible||getState().i!==epoch){reset();return}change(point(e.clientX,e.clientY));return}hover=accepts(point(e.clientX,e.clientY));stage.style.cursor=hover?'grab':'';});
 function release(e){if(drag?.id!==e.pointerId)return;if(kind==='spin'){values.spinHeld=false;values.spinAt=preview??audio.currentTime;}if(kind==='resonance'&&(preview??audio.currentTime)>100){values.basketDragging=false;values.basketAt=preview??audio.currentTime;}if(['eggplant','tomato','cat','deity'].includes(kind)){e.mvObjectHandled=true;e.stopPropagation();}if(kind==='deity'){values.stampDown=false;if(e.type==='pointerup'&&value('stampY',0)>=230){values.sealAt=preview??audio.currentTime;values.sealX=clamp(value('stampX',570),300,715);values.sealY=clamp(value('stampY',390),300,465);values.stampX=values.sealX;values.stampY=values.sealY;}}if(kind==='identity'||kind==='roles'){const t=preview??audio.currentTime,key=kind==='identity'?'gender':'role',from=identityValue({value},kind,t);values[key]=drag.moved?(value(key,0)>.5?1:0):(drag.switchInitial<.5?1:0);values.switchFrom=from;values.switchAt=t;}if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);drag=null;stage.style.cursor=hover?'grab':'';}
 stage.addEventListener('click',e=>{if(visible&&(['eggplant','tomato','cat','deity'].includes(kind))){e.preventDefault();e.stopImmediatePropagation();}},true);
 stage.addEventListener('wheel',e=>{const t=preview??audio.currentTime;if(kind!=='clock'||t>=59||!accepts(point(e.clientX,e.clientY)))return;e.preventDefault();const initial=value('year',yearDefault(t));values.year=Math.round(clamp(initial-e.deltaY*3,-2026,2026));},{passive:false});
 stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',()=>{if(kind==='resonance')values.basketDragging=false;if(kind==='spin')values.spinHeld=false;drag=null;stage.style.cursor=''});
 return {update,value,controls,reset,point,screen,cursorAt(px,py){return {kind,visible:visible&&supported.has(kind),active:!!drag||accepts(point(px,py))}},set:(k,v)=>values[k]=v,erased:id=>erased.has(id),fragment(id,xx,yy){hotspots.push({id,x:xx,y:yy})},state:()=>({kind,epoch,visible,dragging:!!drag,values:{...values},erased:[...erased],supported:supported.has(kind)})};
}
