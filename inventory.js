import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import {makePuzzle,canPlace,complete,bounds,turn} from './inventory-puzzle.js';
const $=id=>document.getElementById(id);
const mat=(color,metalness=.3)=>new THREE.MeshStandardMaterial({color,metalness,roughness:.65,flatShading:true});
function mesh(g,geo,m,x=0,y=0,z=0){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);g.add(o);return o;}
function box(g,m,w,h,d,x=0,y=0,z=0){return mesh(g,new THREE.BoxGeometry(w,h,d),m,x,y,z);}
function model(kind,tint){const g=new THREE.Group(),steel=mat('#9da8ab',.75),edge=mat('#d7d4bc',.8),gold=mat('#a98643',.7),leather=mat('#54342b'),dark=mat('#353d40',.65),gem=mat(tint,.4);
 if(kind==='sword'||kind==='dagger'){const s=kind==='dagger'?.7:1;box(g,steel,.19,1.65*s,.12,0,.28);const tip=mesh(g,new THREE.ConeGeometry(.14,.38,4),edge,0,1.3*s);tip.rotation.y=Math.PI/4;box(g,gold,.82,.12,.2,0,-.55*s);box(g,leather,.15,.5,.17,0,-.85*s);mesh(g,new THREE.OctahedronGeometry(.15),gem,0,-1.12*s);box(g,edge,.035,1.3*s,.02,0,.3,.075);g.rotation.z=-.18;}
 if(kind==='shield'){const o=mesh(g,new THREE.CylinderGeometry(.85,.65,.18,6),gold);o.rotation.x=Math.PI/2;const p=mesh(g,new THREE.CylinderGeometry(.72,.53,.2,6),dark,0,0,.06);p.rotation.x=Math.PI/2;box(g,steel,.12,1.2,.12,0,0,.22);box(g,steel,1.03,.12,.12,0,.1,.22);mesh(g,new THREE.OctahedronGeometry(.25),gem,0,.08,.35);}
 if(kind==='armor'){box(g,dark,1.05,1.25,.45);box(g,steel,.45,.92,.15,-.26,.05,.28).rotation.z=-.1;box(g,steel,.45,.92,.15,.26,.05,.28).rotation.z=.1;for(const s of [-1,1]){mesh(g,new THREE.IcosahedronGeometry(.4,0),steel,s*.72,.47);box(g,gold,.13,1.05,.09,s*.45,0,.38);box(g,dark,.4,.45,.4,s*.3,-.8).rotation.z=s*.15;}mesh(g,new THREE.OctahedronGeometry(.18),gem,0,.36,.43);box(g,gold,1.05,.13,.51,0,-.46);}
 if(kind==='potion'){mesh(g,new THREE.DodecahedronGeometry(.55,0),mat('#7f2026',.1),0,-.15);mesh(g,new THREE.DodecahedronGeometry(.3,0),mat('#d74848',.1),-.12,-.04,.35);mesh(g,new THREE.CylinderGeometry(.19,.22,.48,6),gold,0,.43);box(g,leather,.43,.19,.35,0,.72);}
 if(kind==='axe'){box(g,leather,.13,2.4,.14,0,-.05);box(g,gold,.24,.17,.23,0,.75);for(const s of [-1,1]){const a=mesh(g,new THREE.CylinderGeometry(.6,.37,.17,3),steel,s*.4,.65);a.rotation.x=Math.PI/2;a.rotation.z=s*Math.PI/2;}mesh(g,new THREE.OctahedronGeometry(.17),gem,0,.77,.17);g.rotation.z=-.14;}
 if(kind==='helm'){const h=mesh(g,new THREE.SphereGeometry(.73,6,4,0,Math.PI*2,0,Math.PI*.6),dark);h.rotation.x=.05;box(g,steel,.14,.9,.2,0,-.05,.65);for(const s of [-1,1]){box(g,gold,.5,.12,.16,s*.32,.08,.58);box(g,steel,.18,.62,.35,s*.56,-.27,.26);const horn=mesh(g,new THREE.ConeGeometry(.17,.7,4),gold,s*.7,.65);horn.rotation.z=-s*.5;}mesh(g,new THREE.OctahedronGeometry(.16),gem,0,.5,.58);}
 if(kind==='boot'){box(g,leather,.64,1.1,.65,0,.25);box(g,dark,.7,.45,1.05,0,-.48,.2);box(g,gold,.73,.17,.7,0,.5);box(g,gold,.73,.13,.7,0,-.1);box(g,steel,.73,.25,.48,0,-.45,.65);}
 if(kind==='staff'){box(g,leather,.13,2.3,.15,0,-.2);const ring=mesh(g,new THREE.TorusGeometry(.34,.09,4,6),gold,0,.96);mesh(g,new THREE.OctahedronGeometry(.26),gem,0,.96,.02);box(g,gold,.24,.13,.23,0,-1.18);g.rotation.z=.14;}
 if(kind==='rune'){mesh(g,new THREE.DodecahedronGeometry(.64,0),mat('#65635a'));box(g,gem,.07,.64,.05,0,0,.6);box(g,gem,.4,.07,.05,.13,.15,.59).rotation.z=.5;box(g,gem,.35,.07,.05,-.1,-.1,.59).rotation.z=.6;}
 g.rotation.y=-.25;g.rotation.x=.12;return g;}

const DURATION=60, BEST_KEY='inventory-fit-best';
const names={sword:'기사의 장검',shield:'수호자의 방패',armor:'망자의 판금',potion:'붉은 생명약',axe:'심연의 도끼',helm:'추방자의 투구',boot:'순례자의 장화',staff:'영혼의 마법봉',dagger:'사냥꾼의 단검'};
const colors=['#a8b9ce','#d5ad59','#9e8bdb','#a6bd82','#cc8f5d','#83b7bd'];
let state='ready',puzzle=makePuzzle(),selected=null,drag=null,deadline=0,overAt=0,shake=0,lastSecond=60,layout,finishTimer=null;
let best=0;try{best=Number(localStorage.getItem(BEST_KEY))||0;}catch{}
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.setClearColor(0x211c22);renderer.domElement.setAttribute('aria-hidden','true');document.body.prepend(renderer.domElement);
const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera();camera.position.z=1000;
scene.add(new THREE.HemisphereLight(0xe1d8e3,0x493023,2.2));
const sun=new THREE.DirectionalLight(0xffdeb3,3.5);sun.position.set(-200,350,500);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-650,right:650,top:650,bottom:-650,near:1,far:1600});sun.shadow.bias=-.001;scene.add(sun);
const blue=new THREE.DirectionalLight(0x899bda,1.6);blue.position.set(300,-200,300);scene.add(blue);
const environment=new THREE.Group(),boardGroup=new THREE.Group(),itemGroup=new THREE.Group();scene.add(environment,boardGroup,itemGroup);
const world=(x,y,z=0)=>new THREE.Vector3(x-innerWidth/2,innerHeight/2-y,z);
function dispose(group){group.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});group.clear();}
function shadowTree(g){g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});}
function tile(g,w,h,color,x=0,y=0,z=0,depth=6){const o=box(g,mat(color,.3),w,h,depth,x,y,z);o.castShadow=true;o.receiveShadow=true;return o;}
function createEnvironment(){dispose(environment);const floor=tile(environment,innerWidth+300,innerHeight+300,'#30272b',0,0,-55,10);floor.receiveShadow=true;const stone=mat('#352d32');for(let y=-innerHeight/2;y<innerHeight/2+100;y+=100)for(let x=-innerWidth/2;x<innerWidth/2+100;x+=115){box(environment,stone,110,95,4,x+(Math.round(y/100)%2)*30,y,-47);}for(const s of [-1,1]){const x=s*Math.min(innerWidth*.44,380),y=innerHeight*.08;const torch=new THREE.Group();torch.position.set(x,y,-15);environment.add(torch);tile(torch,9,90,'#4b3630',0,-20,0,9);mesh(torch,new THREE.ConeGeometry(14,42,5),mat('#e7a154'),0,42,4);mesh(torch,new THREE.ConeGeometry(7,26,4),mat('#ffdc8a'),0,39,16);const light=new THREE.PointLight(0xffa74d,15000,400);light.position.set(x,y+45,60);environment.add(light);}}
function setupItems(){dispose(itemGroup);puzzle.items.forEach((i,index)=>{
  i.color=colors[index%colors.length];i.group=new THREE.Group();i.footprint=new THREE.Group();i.art=new THREE.Group();i.group.add(i.footprint,i.art);i.art.add(model(i.kind,i.color));itemGroup.add(i.group);i.drop=0;i.pos=null;
});}
function shapeMeshes(i){dispose(i.footprint);const b=bounds(i.cells),c=layout.cell;
  for(const [x,y] of i.cells){const tileGroup=new THREE.Group();tileGroup.position.set((x+.5-b.w/2)*c,-(y+.5-b.h/2)*c,0);i.footprint.add(tileGroup);tile(tileGroup,c-2,c-2,selected===i?'#f4d69a':i.color,0,0,-1,7);tile(tileGroup,c-6,c-6,selected===i?'#6d5540':'#394047',0,0,3,3);}
  const art=i.art.children[0];i.art.remove(art);art.rotation.z=(b.w>b.h?-Math.PI/2:0)+.07;art.scale.setScalar(1);art.position.set(0,0,0);art.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(art),size=bb.getSize(new THREE.Vector3()),center=bb.getCenter(new THREE.Vector3());
  const scale=Math.min((b.w*c-10)/size.x,(b.h*c-10)/size.y)*.88;art.scale.setScalar(scale);art.position.set(-center.x*scale,-center.y*scale,11);i.art.add(art);shadowTree(i.group);
}
function resize(){renderer.setSize(innerWidth,innerHeight);Object.assign(camera,{left:-innerWidth/2,right:innerWidth/2,top:innerHeight/2,bottom:-innerHeight/2,near:.1,far:2000});camera.updateProjectionMatrix();
  const compact=innerHeight<650,top=compact?115:160,bottom=compact?122:150,cols=Math.ceil(puzzle.items.length/2),rows=2;
  const available=innerHeight-top-bottom;
  const cell=Math.max(18,Math.min(64,(innerWidth-48)/puzzle.w,(available-48)/(puzzle.h+rows*1.55)));
  const width=puzzle.w*cell,height=puzzle.h*cell,slotH=cell*1.55,trayW=Math.min(innerWidth-32,Math.max(width,cols*cell*1.45));
  const total=height+40+slotH*rows,boardTop=top+Math.max(0,(available-total)/2);
  layout={cell,left:(innerWidth-width)/2,top:boardTop,width,height,slotH,trayW,trayTop:boardTop+height+40,cols};
  Object.assign($('board').style,{left:layout.left+'px',top:layout.top+'px',width:width+'px',height:height+'px',gridTemplateColumns:`repeat(${puzzle.w},1fr)`,gridTemplateRows:`repeat(${puzzle.h},1fr)`});
  Object.assign($('tray').style,{left:(innerWidth-trayW)/2+'px',top:layout.trayTop+'px',width:trayW+'px',height:rows*slotH+'px',gridTemplateColumns:`repeat(${cols},1fr)`,gridTemplateRows:`repeat(${rows},1fr)`});
  Object.assign($('tray-label').style,{top:boardTop+height+18+'px',left:'0',right:'0'});$('hint').style.bottom=(compact?101:121)+'px';
  createEnvironment();buildBoard();puzzle.items.forEach(i=>{shapeMeshes(i);i.pos=null;});
}
function buildBoard(){dispose(boardGroup);const c=layout.cell,center=world(layout.left+layout.width/2,layout.top+layout.height/2,-5);boardGroup.position.copy(center);
  tile(boardGroup,layout.width+22,layout.height+22,'#725538',0,0,-9,15);tile(boardGroup,layout.width+11,layout.height+11,'#29252b',0,0,0,8);
  const mask=new Set(puzzle.mask.map(p=>p.join(',')));
  for(let y=0;y<puzzle.h;y++)for(let x=0;x<puzzle.w;x++){const px=(x+.5-puzzle.w/2)*c,py=-(y+.5-puzzle.h/2)*c;
    if(mask.has(`${x},${y}`)){const o=tile(boardGroup,c-2,c-2,'#514b43',px,py,4,3);o.userData.cell=[x,y];tile(boardGroup,c-5,c-5,'#35342f',px,py,5,1);}
    else {tile(boardGroup,c-2,c-2,'#25212a',px,py,7,8);const bolt=mesh(boardGroup,new THREE.CylinderGeometry(2.5,2.5,2,5),mat('#715c43'),px,py,12);bolt.rotation.x=Math.PI/2;}
  }
  for(const x of [-1,1])for(const y of [-1,1]){const rivet=mesh(boardGroup,new THREE.OctahedronGeometry(5),mat('#c1a16a'),x*(layout.width/2+5),y*(layout.height/2+5),4);}
}
function buildControls(){const board=$('board');board.replaceChildren();const mask=new Set(puzzle.mask.map(p=>p.join(',')));
  for(let y=0;y<puzzle.h;y++)for(let x=0;x<puzzle.w;x++){const b=document.createElement('button');b.disabled=!mask.has(`${x},${y}`);b.setAttribute('aria-label',`${y+1}행 ${x+1}열`);b.dataset.x=x;b.dataset.y=y;b.onpointerdown=e=>boardPress(e,x,y);b.onclick=e=>{if(e.detail===0)boardPress(e,x,y);};board.appendChild(b);}
  $('tray').replaceChildren();puzzle.items.forEach(i=>{const b=document.createElement('button');b.dataset.id=i.id;b.setAttribute('aria-label',`${names[i.kind]} ${i.cells.length}칸`);b.innerHTML=`<small>${names[i.kind]} · ${i.cells.length}칸</small>`;b.onpointerdown=e=>{if(state==='playing'&&!i.placed){e.preventDefault();pickup(i,e);}};b.onclick=e=>{if(e.detail===0&&state==='playing'&&!i.placed)choose(i);};$('tray').appendChild(b);i.button=b;});updateHud();}
function choose(i){selected=i;Arcade.sfx.tap();Arcade.vibrate(14);puzzle.items.forEach(shapeMeshes);$('hint').textContent=`${names[i.kind]} · 빈칸에 놓기 / 회전 버튼으로 돌리기`;updateHud();}
function updateHud(){const placed=puzzle.items.filter(i=>i.placed).length,filled=puzzle.items.filter(i=>i.placed).reduce((n,i)=>n+i.cells.length,0);
  $('score').innerHTML=`${placed}<small>/ ${puzzle.items.length}개</small>`;$('progress').textContent=`${filled} / ${puzzle.mask.length}칸`;$('rotate').disabled=state!=='playing'||!selected;$('remove').disabled=state!=='playing'||!selected?.placed;
  puzzle.items.forEach(i=>{if(i.button){i.button.classList.toggle('placed',i.placed);i.button.setAttribute('aria-pressed',String(selected===i));}});
}
function pickup(i,e){choose(i);const p=boardPoint(e),hit=i.placed?i.cells.find(([x,y])=>i.x+x===p.x&&i.y+y===p.y):null;const anchor=hit||i.cells[0];drag={item:i,startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,moved:false,offsetX:anchor[0],offsetY:anchor[1]};}
function boardPoint(e){return {x:Math.floor((e.clientX-layout.left)/layout.cell),y:Math.floor((e.clientY-layout.top)/layout.cell)};}
function atCell(x,y){return puzzle.items.find(i=>i.placed&&i.cells.some(([a,b])=>i.x+a===x&&i.y+b===y));}
function boardPress(e,x,y){if(state!=='playing')return;e.preventDefault();const item=atCell(x,y);if(item){if(e.type==='click')choose(item);else pickup(item,e);return;}if(selected)place(selected,x-selected.cells[0][0],y-selected.cells[0][1]);}
function reject(){Arcade.sfx.miss();Arcade.vibrate([20,25,35]);shake=7;$('hint').textContent='여긴 안 맞아요! 회전하거나 다른 빈칸에 놓아보세요';}
function place(i,x,y){if(state!=='playing')return false;if(performance.now()>=deadline){finish(false);return false;}if(!canPlace(puzzle,i,x,y)){reject();return false;}
  i.x=x;i.y=y;i.placed=true;i.drop=1;selected=null;drag=null;Arcade.sfx.kaching();Arcade.vibrate(i.cells.length>=4?50:30);shake=2.5;puzzle.items.forEach(shapeMeshes);updateHud();$('hint').textContent='착! 다음 장비도 딱 맞게 담아보세요';
  if(complete(puzzle)){state='solved';updateHud();Arcade.sfx.perfect(4);Arcade.vibrate([40,45,70]);shake=9;Arcade.confetti({x:innerWidth/2,y:layout.top+layout.height/2,colors:['#efc570','#e9a065','#b4c6e6']});$('hint').textContent='빈틈없이 딱 맞았다!';const left=Math.max(0,(deadline-performance.now())/1000);finishTimer=setTimeout(()=>finish(true,left),900);}return true;
}
function rotate(){if(state!=='playing'||!selected)return;const i=selected,cells=turn(i.cells);let msg='빙글! 빈칸의 모양과 맞춰보세요';
  if(i.placed&&!canPlace(puzzle,i,i.x,i.y,cells)){
    // a placed item can always be rotated: nudge it to the nearest spot where the new shape fits, otherwise lift it back out (still rotated)
    const tries=[];for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)tries.push([dx,dy]);tries.sort((a,b)=>Math.abs(a[0])+Math.abs(a[1])-Math.abs(b[0])-Math.abs(b[1]));
    const spot=tries.find(([dx,dy])=>canPlace(puzzle,i,i.x+dx,i.y+dy,cells));
    if(spot){i.x+=spot[0];i.y+=spot[1];msg='빙글! 옆으로 살짝 옮겨서 돌렸어요';}
    else{i.placed=false;i.x=null;i.y=null;msg='빙글! 그 자리엔 안 맞아서 꺼냈어요. 다른 곳에 놓아보세요';}
  }
  i.cells=cells;i.drop=.5;puzzle.items.forEach(shapeMeshes);updateHud();Arcade.sfx.whoosh(true);Arcade.vibrate(18);$('hint').textContent=msg;}
function remove(){if(state!=='playing'||!selected?.placed)return;selected.placed=false;selected.x=null;selected.y=null;selected.drop=.5;Arcade.sfx.pop(.8);Arcade.vibrate(22);updateHud();$('hint').textContent='다시 꺼냈어요. 회전해서 다른 곳에 놓아보세요';}
$('rotate').onclick=rotate;$('remove').onclick=remove;
addEventListener('pointermove',e=>{if(!drag||state!=='playing')return;drag.x=e.clientX;drag.y=e.clientY;if(!drag.moved&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>6){drag.moved=true;Arcade.vibrate(10);}if(drag.moved){e.preventDefault();showPreview();}},{passive:false});
function clearPreview(){boardGroup.children.forEach(o=>{if(o.userData.cell)o.material.color.set('#514b43');});}
function showPreview(){clearPreview();const i=drag.item,p=boardPoint({clientX:drag.x,clientY:drag.y}),x=p.x-drag.offsetX,y=p.y-drag.offsetY,valid=canPlace(puzzle,i,x,y);boardGroup.children.forEach(o=>{const c=o.userData.cell;if(c&&i.cells.some(([a,b])=>a+x===c[0]&&b+y===c[1]))o.material.color.set(valid?'#9fcf87':'#ce6659');});}
function cancelDrag(){drag=null;clearPreview();}
addEventListener('pointerup',e=>{if(!drag)return;const d=drag;cancelDrag();if(!d.moved||state!=='playing')return;const p=boardPoint(e);if(p.x>=0&&p.x<puzzle.w&&p.y>=0&&p.y<puzzle.h)place(d.item,p.x-d.offsetX,p.y-d.offsetY);else if(d.item.placed&&e.clientY>=layout.trayTop){selected=d.item;remove();}});
addEventListener('pointercancel',cancelDrag);addEventListener('blur',cancelDrag);
function showIntro(){const html=Arcade.titleScreen({emoji:'⚔️',title:'전리품 가방',how:[['🎒','주어진 장비를 <b>전부</b> 담으면 빈칸 없이 딱!'],['👆','장비를 <b>드래그</b>하거나 선택 후 빈칸 터치'],['🔄','모양이 안 맞으면 <b>회전</b> · 담은 장비도 이동 가능'],['⏳','<b>60초 안에</b> 완성! 빨리 정리할수록 고득점']]});$('center').innerHTML=html.replace('<div class="t-cta">','<button class="t-cta" type="button">').replace('탭해서 시작</div>','탭해서 시작</button>');$('center').style.display='';}
function start(){if(state!=='ready'&&state!=='over')return;clearTimeout(finishTimer);puzzle=makePuzzle();selected=null;cancelDrag();setupItems();resize();state='count';buildControls();$('center').style.display='none';$('time').textContent='⏳ 60초';$('tfill').style.transform='scaleX(1)';$('timer').classList.remove('low');$('hint').textContent='장비 선택 → 빈칸 터치 · 드래그도 가능';lastSecond=60;
  Arcade.countdown({final:'담아!',onTick:n=>n?Arcade.sfx.tick():(Arcade.sfx.go(),Arcade.vibrate(35)),onDone:()=>{state='playing';deadline=performance.now()+DURATION*1000;updateHud();}});
}
function finish(success,remaining=0){if(state==='over')return;clearTimeout(finishTimer);cancelDrag();state='over';overAt=performance.now();selected=null;const packed=puzzle.items.filter(i=>i.placed).length,cells=puzzle.items.filter(i=>i.placed).reduce((n,i)=>n+i.cells.length,0),timeBonus=success?Math.ceil(remaining)*10:0,score=cells*20+timeBonus+(success?500:0),isBest=score>best;
  if(isBest){best=score;try{localStorage.setItem(BEST_KEY,best);}catch{}}
  success?Arcade.sfx.fanfare():Arcade.sfx.fail();Arcade.vibrate(success?[45,45,90]:[70,40,70]);
  $('center').innerHTML=Arcade.resultScreen({emoji:success?'🎒':'⏰',label:success?'빈틈없는 전리품 가방!':'정리한 전리품',score,unit:'점',msg:success?'모든 장비가 딱 맞게 들어갔어요!':'장비는 전부 들어가요. 다음엔 회전해서 맞춰보세요!',rows:[['담은 장비',`${packed} / ${puzzle.items.length}개`],['채운 칸',`${cells} / ${puzzle.mask.length}칸`],['시간 보너스',`+${timeBonus}점`]],isBest,best});$('center').style.display='';const replay=$('center').querySelector('.r-btn');if(replay){replay.addEventListener('pointerdown',e=>e.stopPropagation());replay.addEventListener('click',start);}updateHud();Arcade.gameOver(score);
}
addEventListener('pointerdown',e=>{if(e.target.closest('a,.arcade-btn'))return;if(state==='ready')start();else if(state==='over'&&performance.now()-overAt>900&&!Arcade.inRun())start();});
addEventListener('keydown',e=>{if(e.repeat)return;if(e.code==='Space'||e.code==='Enter'){if(state==='ready'||(state==='over'&&!Arcade.inRun())){e.preventDefault();start();}return;}if(e.key.toLowerCase()==='r'){e.preventDefault();rotate();}if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();remove();}if(e.key==='Escape'){selected=null;cancelDrag();puzzle.items.forEach(shapeMeshes);updateHud();}});
addEventListener('resize',()=>{cancelDrag();resize();});
function targetFor(i){const b=bounds(i.cells);if(drag?.item===i&&drag.moved){return {x:drag.x+(b.w/2-drag.offsetX-.5)*layout.cell,y:drag.y+(b.h/2-drag.offsetY-.5)*layout.cell,scale:1,z:50};}
  if(i.placed)return {x:layout.left+(i.x+b.w/2)*layout.cell,y:layout.top+(i.y+b.h/2)*layout.cell,scale:1,z:selected===i?25:12};
  const r=i.button.getBoundingClientRect(),scale=Math.min((r.width-12)/(b.w*layout.cell),(r.height-20)/(b.h*layout.cell),.85);
  return {x:r.left+r.width/2,y:r.top+(r.height-12)/2,scale:scale*(selected===i?1.08:1),z:selected===i?30:15};
}
let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;
  if(state==='playing'){const left=Math.max(0,(deadline-now)/1000),second=Math.ceil(left);$('time').textContent=`⏳ ${second}초`;$('tfill').style.transform=`scaleX(${left/DURATION})`;$('timer').classList.toggle('low',left<10);if(second<lastSecond&&second<=10&&second>0){Arcade.sfx.tick();Arcade.vibrate(12);}lastSecond=second;if(left<=0)finish(false);}
  puzzle.items.forEach(i=>{const t=targetFor(i),v=world(t.x,t.y,t.z);if(!i.pos)i.pos=v.clone();const blend=1-Math.exp(-dt*22);i.pos.lerp(v,blend);i.drop=Math.max(0,i.drop-dt*4);i.group.position.copy(i.pos);i.group.position.z+=Math.sin(i.drop*Math.PI)*14;i.group.scale.setScalar(t.scale*(1+Math.sin(i.drop*Math.PI*2)*.05));i.group.rotation.z=selected===i?Math.sin(now*.005)*.025:0;i.group.visible=true;});
  camera.position.x=(Math.random()-.5)*shake;camera.position.y=(Math.random()-.5)*shake;shake*=Math.exp(-dt*18);renderer.render(scene,camera);requestAnimationFrame(frame);
}
setupItems();buildControls();resize();showIntro();window.__inv={get puzzle(){return puzzle;},get state(){return state;},choose,place,rotate,get selected(){return selected;}};
requestAnimationFrame(frame);
