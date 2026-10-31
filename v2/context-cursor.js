// A visual affordance only: it never consumes input or changes the music clock.
let contextCursor=null;
function buildContextCursor(){
 const stage=$('#stage'),root=document.createElement('div');root.id='mvCursor';root.hidden=true;root.setAttribute('aria-hidden','true');root.innerHTML='<svg viewBox="-24 -24 48 48"><g class="cursor-art"></g></svg><span></span>';document.body.append(root);
 const art=root.querySelector('g'),caption=root.querySelector('span');
 const paths={
  horizontal:'<path class="cursor-left" d="M-9 0H-20m5-5-5 5 5 5"/><path class="cursor-right" d="M9 0H20m-5-5 5 5-5 5"/><path d="m0-4 4 4-4 4-4-4Z"/>',
  vertical:'<path class="cursor-up" d="M0-9V-20m-5 5 5-5 5 5"/><path class="cursor-down" d="M0 9V20m-5-5 5 5 5-5"/><path d="m0-4 4 4-4 4-4-4Z"/>',
  drag:'<path d="M-20 0H20m-5-5 5 5-5 5m-30-10-5 5 5 5M0-20V20m-5-5 5 5 5-5m-10-30 5-5 5 5"/><circle r="4" fill="#0a1720"/>',
  orbit:'<ellipse rx="19" ry="8"/><path d="m12-12 7 4-7 4M0-15v30"/><circle r="4" fill="#0a1720"/>',
  wheel:'<rect x="-9" y="-15" width="18" height="30" rx="8"/><path class="cursor-wheel" d="M0-8v7"/><path d="m14-9 4-4 4 4m-8 18 4 4 4-4"/>',
  tap:'<path d="M-5 12-11 3q-2-5 2-4l5 5V-12q0-5 5-3v12q1-4 4-2l1 3q2-3 5-1l2 10q0 7-7 10H0Z"/><path class="cursor-pulse" d="m-10-12-4-3M-5-21v-3m9 4 3-3"/>',
  eraser:'<path d="m-16 7 19-24q2-2 4 0l11 10q2 2 0 4L-1 17h-7Z" fill="#172934"/><path d="m-9-2 15 13M-8 17h24"/><path class="cursor-crumbs" d="m-14 18-3 1m10 3-2 1m21-2 3 1"/>',
  blade:'<path d="m-15 17 10-10 6 6-10 10Z" fill="#263b43"/><path d="m-5 7 24-26Q23-2 1 13ZM-1 10 16-11"/>',
  toggle:'<rect x="-21" y="-11" width="42" height="22" rx="11"/><circle class="cursor-switch" cx="-10" r="7" fill="#bce6d5" stroke="none"/>',
  stamp:'<path d="M-7-6v-8a7 7 0 0 1 14 0v8l9 11v6h-32V5ZM-16 15h32M-8-6H8"/><path class="cursor-down" d="M-11 21h22"/>',
  heart:'<path d="M0 12C-29-5-9-24 0-10 9-24 29-5 0 12Z"/><path class="cursor-pulse" d="M14 12v9m-4-4h8"/>'
 };
 let px=0,py=0,seen=false,pressed=false,mode='',label='',hot=false,lastT=0,labelUntil=0,active=false;
 function hide(){active=false;root.hidden=true;document.body.classList.remove('mv-custom-cursor');}
 function objectMode(kind,t){
  if(kind==='world'&&t>=15)return null;
  if(['current','infinity','circle','power'].includes(kind))return ['horizontal',kind==='infinity'?'移动边界':'左右拖动'];
  if(['spin','points'].includes(kind))return ['orbit','拖动旋转'];
  if(kind==='clock')return t<59?['wheel','滚动 / 拨动']:['orbit','转动指针'];
  if(kind==='union')return t>=57.01?['vertical','上下深入']:['horizontal','拖动交织'];
  if(kind==='resonance')return t>100?['horizontal','左右接取']:['tap','触碰光弦'];
  if(kind==='fragments')return ['eraser','按住擦除'];
  if(['eggplant','tomato','cat','deity'].includes(kind))return ['blade','按住划切'];
  if(kind==='identity'||kind==='roles')return ['toggle','点击 / 拨动'];
  if(kind==='deity')return ['stamp','拖动盖章'];
  if(kind==='heart'||kind==='love')return ['heart','点击回应'];
  if(['pieces','sine','iris'].includes(kind))return ['drag','按住拖动'];
  if(['parameters','world','cat','absence'].includes(kind))return ['tap',kind==='absence'?'连续点击':'轻点'];
  return null;
 }
 function update(t){lastT=t;if(!seen||document.hidden||(!started&&preview===null)){hide();return;}
  const under=document.elementFromPoint(px,py);if(!under){hide();return;}const choice=under.closest('.choice-hit');let spec=null,isHot=false;
  if(choice&&!choice.disabled){spec=['tap','轻触形象'];isHot=true;}
  else if(under.closest('button,input,a,#controls,#cover,#chapters,#end,#lyricStatus')){hide();return;}
  else if(under===stage){
   if(rhythmGame?.mesh.visible){spec=['tap','落线时轻点'];isHot=rhythmGame.screenTargets(t).some(p=>Math.hypot(px-p.x,py-p.y)<=p.radius*1.2);}
   else {const target=lyricObjects?.play.cursorAt(px,py);if(target?.visible){spec=objectMode(target.kind,t);isHot=target.active;}}
  }
  if(!spec){hide();return;}const changed=spec[0]!==mode||spec[1]!==label;
  if(changed){mode=spec[0];label=spec[1];art.innerHTML=paths[mode];caption.textContent=label;root.dataset.mode=mode;labelUntil=performance.now()+1400;}
  if(isHot&&!hot)labelUntil=performance.now()+950;hot=isHot;active=true;root.hidden=false;{const rp=window.__recordCursorPos;const qx=rp?rp.x:px,qy=rp?rp.y:py;root.style.transform=`translate3d(${qx-24}px,${qy-24}px,0)`;}root.classList.toggle('is-hot',hot);root.classList.toggle('is-pressed',pressed&&hot);root.classList.toggle('show-label',performance.now()<labelUntil);document.body.classList.add('mv-custom-cursor');
 }
 function move(e){if(e.pointerType==='touch'){seen=false;hide();return;}seen=true;px=e.clientX;py=e.clientY;update(preview??audio.currentTime);}
 document.addEventListener('pointermove',move,{capture:true,passive:true});
 document.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){seen=false;hide();return;}pressed=e.button===0;move(e);},{capture:true,passive:true});
 document.addEventListener('pointerup',e=>{pressed=false;move(e);},{capture:true,passive:true});
 function leave(){seen=false;pressed=false;hide();}
 document.addEventListener('pointercancel',leave,{capture:true,passive:true});document.documentElement.addEventListener('pointerleave',leave);window.addEventListener('blur',leave);document.addEventListener('visibilitychange',()=>{if(document.hidden)leave();});
 return {update,hide,state:()=>({visible:active,mode:active?mode:null,label:active?label:null,hot:active&&hot,pressed:active&&pressed,x:px,y:py,t:lastT})};
}
