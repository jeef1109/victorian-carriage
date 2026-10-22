import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createCarriage } from './carriage.js';
import { createRoad } from './road.js';

const paths={road:'M3 12h18M8 3 5 21M16 3l3 18M12 3v4m0 4v3m0 4v3',door:'M6 21V3h12v18M6 3l8 3v15H6m5-9v2',window:'M5 21V7a7 7 0 0 1 14 0v14ZM12 2v19M5 10h14',rotate:'M4 9a8 8 0 1 1 0 7M4 9V3m0 6h6',cube:'m12 2 9 5v10l-9 5-9-5V7Zm-9 5 9 5 9-5M12 12v10m-4-18 9 5',lamp:'M8 7h8l2 11H6ZM12 2v3M8 5h8M12 18v4M9 22h6M9 9v7m6-7v7',explode:'m12 2 6 3-6 3-6-3Zm-7 9 4 2v5l-4 2-4-2v-5Zm14 0 4 2v5l-4 2-4-2v-5ZM12 8v4M9 15l3-2 3 2',side:'M4 6h15v10H4ZM7 6v10m8-10v10M4 9h15M3 19a2 2 0 1 0 4 0 2 2 0 1 0-4 0m13 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0M3 3h17',front:'M6 5h12l1 12H5ZM9 7v6h6V7ZM4 17v5m16-5v5M3 18h18M6 3h12'};
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[el.dataset.icon]||paths.cube}"/></svg>`);
const state={doors:false,windows:false,rotate:false,wireframe:false,lights:false,explode:false,drive:false,view:'iso'};
const palettes={body:{label:'车身漆面',colors:['#15251f','#171b1a','#4d1824','#223d3b','#e2d9c2'],names:['皇家墨绿','曜石黑','勃艮第红','深海青','象牙白']},wheels:{label:'轮毂木饰',colors:['#e3bf6b','#3c2429','#312b22','#826445','#bfc0b5'],names:['皇家金','酒红木','乌木','胡桃木','银灰']},metal:{label:'金属雕花',colors:['#c49a43','#d4c9b0','#8a6b3e','#53554f','#b47a4c'],names:['鎏金','古银','古铜','黑铁','玫瑰铜']},interior:{label:'座椅软皮',colors:['#f2eee5','#5c2631','#315249','#8d7660','#282b28'],names:['暖白软皮','深红软皮','森林绿皮','暖褐软皮','炭黑软皮']}};
let toastTimer;
function toast(text){const e=document.querySelector('#toast');e.textContent=text;e.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove('visible'),2400);}
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas:document.querySelector('#scene'),antialias:true,alpha:true,powerPreference:'high-performance'});}catch(e){document.querySelector('#fallback').hidden=false;document.querySelector('#loading').classList.add('loaded');throw e;}
renderer.localClippingEnabled=true;renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.03;renderer.setClearColor(0x000000,0);
const scene=new THREE.Scene();
const camera=new THREE.OrthographicCamera(-5,5,4,-4,.1,100);camera.position.set(-8,5.8,10);
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(-.3,2.48,0);controls.enableDamping=true;controls.dampingFactor=.07;controls.enablePan=false;controls.minZoom=.7;controls.maxZoom=2.4;controls.minPolarAngle=.22;controls.maxPolarAngle=Math.PI*.51;controls.autoRotateSpeed=.65;controls.update();
const pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();const environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;scene.environmentIntensity=.85;room.dispose();pmrem.dispose();
const ambient=new THREE.HemisphereLight(0xfff7e5,0x8b846e,1.65);scene.add(ambient);
const key=new THREE.DirectionalLight(0xfff4d9,3.1);key.position.set(-3,8,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:.5,far:20});key.shadow.bias=-.0004;key.shadow.normalBias=.025;key.shadow.radius=5;scene.add(key);
const rim=new THREE.DirectionalLight(0xffffff,1.8);rim.position.set(4,5,-4);scene.add(rim,key.target,rim.target);
const model=createCarriage();scene.add(model);const parts=model.userData;
const road=createRoad(renderer);scene.add(road.mesh);
const shadowPlane=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({color:0x5e4f30,opacity:.23}));shadowPlane.rotation.x=-Math.PI/2;shadowPlane.position.y=-.01;shadowPlane.receiveShadow=true;scene.add(shadowPlane);
const shadowCanvas=document.createElement('canvas');shadowCanvas.width=256;shadowCanvas.height=256;const sc=shadowCanvas.getContext('2d');let grd=sc.createRadialGradient(128,128,16,128,128,123);grd.addColorStop(0,'rgba(70,58,31,0.19)');grd.addColorStop(.6,'rgba(70,58,31,0.09)');grd.addColorStop(1,'rgba(70,58,31,0)');sc.fillStyle=grd;sc.fillRect(0,0,256,256);const contact=new THREE.Mesh(new THREE.PlaneGeometry(10,5),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));contact.rotation.x=-Math.PI/2;contact.position.y=.002;scene.add(contact);
// Faint drafting grid under the exhibit, fading at its perimeter.
const gridPositions=[];for(let i=-7;i<=7;i++){const d=i*.55;const half=Math.sqrt(Math.max(0,20-d*d));gridPositions.push(-half,.006,d,half,.006,d,d,.006,-half,d,.006,half);}let gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(gridPositions,3));let grid=new THREE.LineSegments(gg,new THREE.LineBasicMaterial({color:0x9c8e71,transparent:true,opacity:.13}));scene.add(grid);
let stage=document.querySelector('#stage');function resize(){let w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);let aspect=w/h,span=Math.max(6.7,9.6/aspect);camera.left=-span*aspect/2;camera.right=span*aspect/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(stage);resize();
// Render the same geometry in orthographic technical elevations.
const drawingFrames={day:{},night:{}};
function makeDrawings(){
 const tr=new THREE.WebGLRenderer({antialias:true,alpha:true});tr.setSize(600,350);tr.setPixelRatio(1);tr.setClearColor(0,0);
 const ts=new THREE.Scene();const clone=model.clone(true);const ink=new THREE.LineBasicMaterial({color:0x766b55,transparent:true,opacity:.43});const paper=new THREE.MeshBasicMaterial({color:0xe7dfce});
 clone.traverse(o=>{if(o.isLight)o.visible=false;if(o.isMesh){if(o.material.transparent){o.visible=false;return;}o.material=paper;let eg=new THREE.EdgesGeometry(o.geometry,28);let edge=new THREE.LineSegments(eg,ink);o.add(edge);}});ts.add(clone);
 const tc=new THREE.OrthographicCamera(-4.7,4.7,2.74,-2.74,.1,100);
 for(const [name,pos] of Object.entries({side:[0,2.7,15],front:[-15,2.7,0],rear:[15,2.7,0]})){
  tc.position.set(...pos);tc.lookAt(-.4,2.65,0);if(name!=='side'){tc.left=-4.3;tc.right=4.3;tc.top=2.51;tc.bottom=-2.51;}tc.updateProjectionMatrix();
  for(const theme of ['day','night']){
   ink.color.set(theme==='night'?0xf2dba3:0x766b55);ink.opacity=theme==='night'?1:.43;
   paper.color.set(theme==='night'?0x20252b:0xe7dfce);
   tr.render(ts,tc);
   const frame=document.createElement('canvas');frame.width=600;frame.height=350;
   frame.getContext('2d').drawImage(tr.domElement,0,0);drawingFrames[theme][name]=frame;
  }
 }
 clone.traverse(o=>{if(o.isLineSegments)o.geometry.dispose();});paper.dispose();ink.dispose();tr.dispose();
}
makeDrawings();
function updateDrawings(){
 for(const [name,frame] of Object.entries(drawingFrames[state.lights?'night':'day'])){
  const canvas=document.querySelector('#drawing-'+name),context=canvas.getContext('2d');
  context.clearRect(0,0,canvas.width,canvas.height);context.drawImage(frame,0,0);
 }
}
const viewPositions={iso:new THREE.Vector3(-8,5.8,10),side:new THREE.Vector3(-.3,3.05,13),front:new THREE.Vector3(-13,3.12,0),rear:new THREE.Vector3(13,3.12,0)};
let cameraTween=null,followX=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function setView(v,notify=true){state.view=v;state.rotate=false;controls.autoRotate=false;updateActionButton('rotate');document.querySelectorAll('[data-view]').forEach(e=>e.classList.toggle('selected',e.dataset.view===v));cameraTween={from:camera.position.clone(),to:viewPositions[v].clone().add(new THREE.Vector3(followX,0,0)),zoom:camera.zoom,time:performance.now(),duration:reduced?0:1000};if(notify)toast({iso:'等轴测视角',side:'侧视图',front:'正视图',rear:'后视图'}[v]);}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
document.querySelector('#reset-view').onclick=()=>{controls.target.set(followX-.3,2.48,0);setView('iso');};
controls.addEventListener('start',()=>{cameraTween=null;state.view='custom';document.querySelectorAll('.views button').forEach(b=>b.classList.remove('selected'));});
const labels={doors:['开启车门','关闭车门'],windows:['降下车窗','升起车窗'],rotate:['自动旋转','停止旋转'],wireframe:['线框视图','实体视图'],lights:['点亮车灯','熄灭车灯'],explode:['拆解结构','还原结构'],drive:['启程 · DRIVE THE CARRIAGE','行进中 · STOP THE CARRIAGE']};
function updateActionButton(action){let b=document.querySelector(`[data-action="${action}"]`);b.setAttribute('aria-pressed',String(state[action]));b.classList.toggle('active',state[action]);b.querySelector('span:last-child').textContent=labels[action][state[action]?1:0];}
function action(name){
 state[name]=!state[name];
 if(name==='wireframe'){parts.allMaterials.forEach(m=>{m.wireframe=state.wireframe;});}
 if(name==='rotate')controls.autoRotate=state.rotate;
 if(name==='lights')syncLightingTheme();
 if(name==='drive'&&state.drive&&state.explode){state.explode=false;updateActionButton('explode');cameraTween={from:camera.position.clone(),to:camera.position.clone(),zoom:camera.zoom,targetZoom:1,time:performance.now(),duration:800};}
 if(name==='explode'){if(state.explode){state.drive=false;updateActionButton('drive');}cameraTween={from:camera.position.clone(),to:camera.position.clone(),zoom:camera.zoom,targetZoom:state.explode?.78:1,time:performance.now(),duration:reduced?0:800};}
 updateActionButton(name);document.querySelector('#status-label').textContent=state.explode?'结构分解':state.drive?'行进展示':state.wireframe?'几何结构':'自由探索';
 const msgs={doors:state.doors?'车门已开启 · 拖动可查看内饰':'车门已关闭',windows:state.windows?'车窗已降下':'车窗已升起',rotate:state.rotate?'自动环绕已开启':'自动环绕已停止',wireframe:state.wireframe?'线框模式 · 查看三维结构':'已恢复实体材质',lights:state.lights?'夜幕降临 · 宫廷灯已点亮':'宫廷灯已熄灭 · 恢复日间展厅',explode:state.explode?'分离车顶、座舱与轮组':'各部件正在归位',drive:state.drive?'向前行驶 · 镜头跟随马车':'马车已停下'};toast(msgs[name]);
}
function syncLightingTheme(){
 updateDrawings();
 document.documentElement.dataset.theme=state.lights?'night':'day';
 document.querySelector('meta[name="theme-color"]').content=state.lights?'#151a20':'#e8e2d2';
}
syncLightingTheme();
parts.lights.forEach(light=>light.intensity=0);parts.lampMat.emissiveIntensity=0;
document.querySelectorAll('[data-action]').forEach(b=>{b.addEventListener('click',()=>action(b.dataset.action));updateActionButton(b.dataset.action);});
function setColor(key,index,notify=true){parts.materials[key].color.set(palettes[key].colors[index]);if(key==='body')parts.roofMat.color.set(palettes[key].colors[index]).multiplyScalar(.85);document.querySelectorAll(`[data-palette="${key}"]`).forEach(b=>{b.classList.toggle('selected',Number(b.dataset.index)===index);b.setAttribute('aria-pressed',String(Number(b.dataset.index)===index));});if(notify)toast(palettes[key].label+' · '+palettes[key].names[index]);}
for(const [key,pal]of Object.entries(palettes)){
 const row=document.createElement('div');row.className='swatch-row';row.innerHTML=`<label>${pal.label}</label><div class="swatch-set">${pal.colors.map((c,i)=>`<button class="swatch ${i===0?'selected':''}" data-palette="${key}" data-index="${i}" style="--color:${c}" title="${pal.label} · ${pal.names[i]}" aria-label="${pal.label}：${pal.names[i]}" aria-pressed="${i===0}"></button>`).join('')}</div>`;document.querySelector('#swatches').append(row);
}
document.querySelectorAll('.swatch').forEach(b=>b.addEventListener('click',()=>setColor(b.dataset.palette,Number(b.dataset.index))));document.querySelector('#reset-finish').onclick=()=>{Object.keys(palettes).forEach(k=>setColor(k,0,false));toast('已恢复皇家黑金配色');};
const details={roof:{en:'A crown above the ordinary.',cn:'鎏金冠饰与顶冠',body:'弧形车顶由连续卷草纹围饰，四角饰以金色尖顶。中央顶冠以八道拱肋收拢于宝珠和十字顶饰；转到俯视角度，可以观察金属装饰的立体结构。',action:'explode',cta:'拆解车顶，细看结构'},cabin:{en:'An intimate royal interior.',cn:'皇家座舱与车门',body:'墨绿色漆面、细金线窗框与徽章构成车厢外观。两侧车门都具有独立铰链，门后是相对而坐的暖白软皮座席，圆角高背与软包扶手包覆座舱；后壁为不透明的金黄色菱格拉扣皮革软包。打开车门与车窗，再拖动视角，看看里面的细节。',action:'doors',cta:'开合皇家车门'},lamp:{en:'A little light, a grand entrance.',cn:'宫廷灯笼',body:'四盏灯笼装在车厢转角的弧形金属托架上。灯体包含独立玻璃、四角立柱、锥形灯帽与顶饰，开关车灯可切换玻璃内部的暖色光。',action:'lights',cta:'切换宫廷灯'},wheel:{en:'Grace, set in motion.',cn:'辐条车轮与悬挂',body:'前小后大的四只车轮分别由十二根金色辐条、轮箍与车轴组成。长弧形底架与 C 形弹簧托起座舱；行进展示会按车轮半径分别计算转速。',action:'drive',cta:'开启行进展示'}};
const dialog=document.querySelector('#detail-dialog');function showDetail(key){let d=details[key];document.querySelector('#detail-content').innerHTML=`<div class="detail-kicker">THE ROYAL ATELIER / A CLOSER LOOK</div><h3 class="detail-title">${d.en}</h3><div class="detail-cn">${d.cn}</div><p class="detail-body">${d.body}</p><button class="detail-action" data-trigger="${d.action}">${d.cta} ↗</button>`;dialog.showModal();dialog.querySelector('[data-trigger]').onclick=()=>{dialog.close();action(d.action);};}
document.querySelectorAll('[data-detail]').forEach(b=>b.onclick=()=>showDetail(b.dataset.detail));document.querySelector('.close-dialog').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){let r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
document.querySelector('#reference-button').onclick=()=>{document.querySelector('#detail-content').innerHTML='<div class="detail-kicker">SOURCE REFERENCE / PROVIDED PHOTOGRAPH</div><h3 class="detail-title">The inspiration.</h3><div class="detail-cn">你提供的皇家马车参考</div><img class="detail-image" src="'+import.meta.env.BASE_URL+'carriage-reference.png" alt="黑漆鎏金皇家马车原始参考照片"/><p class="detail-body">本展示依据照片重建三维结构与黑金材质。雕花为程序化艺术化重构，技术图尺寸为展示示意。</p>';dialog.showModal();};
document.querySelectorAll('[data-material]').forEach(b=>b.onclick=()=>{let key=b.dataset.material;let row=document.querySelector(`[data-palette="${key}"]`).closest('.swatch-row');row.animate([{background:'#c8b48a99'},{background:'transparent'}],{duration:1200});row.scrollIntoView({block:'nearest',behavior:reduced?'instant':'smooth'});toast('在左侧色板中更换'+palettes[key].label);});
// Annotation endpoints remain attached to the moving model.
const anchorVectors=[new THREE.Vector3(0,4.9,0),new THREE.Vector3(1.15,1.15,.075),new THREE.Vector3(-1.94,3.4,1.26),new THREE.Vector3(1.82,1.1,1.45)];
const annotations=[...document.querySelectorAll('.annotation')],linePaths=[...document.querySelectorAll('#annotation-lines path')],dots=[...document.querySelectorAll('#annotation-lines circle')];
let annotationDoorSide=1;
function updateAnnotations(){let w=stage.clientWidth,h=stage.clientHeight;
 const localCamera=model.worldToLocal(camera.position.clone());
 if(Math.abs(localCamera.z)>.15)annotationDoorSide=Math.sign(localCamera.z);
 const visibleDoor=parts.doors.find(door=>door.userData.side===annotationDoorSide);
 anchorVectors.forEach((a,i)=>{let world=a.clone();
 if(i===1){
  // Attach to the visible door's upper frame, including its hinge rotation and cabin motion.
  world.z*=annotationDoorSide;visibleDoor.localToWorld(world);
 }else{
  if(i===0)world.y+=parts.roof.position.y;
  if(i===2)world.y+=parts.cabin.position.y;
  if(i===3)world.z+=explodeValue*.9;
  world.applyMatrix4(model.matrixWorld);
 }
 world.project(camera);let x=(world.x*.5+.5)*w,y=(-world.y*.5+.5)*h;let el=annotations[i];let sx=el.offsetLeft+(i===0||i===2?el.offsetWidth:0),sy=el.offsetTop+8;let elbow=sx+(i===0||i===2?18:-18);linePaths[i].setAttribute('d',`M${sx},${sy} H${elbow} L${x.toFixed(1)},${y.toFixed(1)}`);dots[i].setAttribute('cx',x);dots[i].setAttribute('cy',y);});document.querySelector('#annotations').style.opacity=camera.zoom>1.5?'0':'.9';}
let previous=performance.now(),explodeValue=0,doorValue=0,windowValue=0,driveSpeed=0,nightValue=0;const baseWheelPositions=parts.wheels.map(w=>w.position.clone());let frame=0;
function animate(now){requestAnimationFrame(animate);let dt=Math.min((now-previous)/1000,.15);previous=now;let k=reduced?1:1-Math.exp(-dt*5);explodeValue=THREE.MathUtils.lerp(explodeValue,state.explode?1:0,k);doorValue=THREE.MathUtils.lerp(doorValue,state.doors?1:0,k);windowValue=THREE.MathUtils.lerp(windowValue,state.windows?1:0,k);driveSpeed=THREE.MathUtils.lerp(driveSpeed,state.drive?1:0,k);if(!state.drive&&driveSpeed<.0001)driveSpeed=0;
 nightValue=THREE.MathUtils.lerp(nightValue,state.lights?1:0,reduced?1:1-Math.exp(-dt*4));
 ambient.intensity=THREE.MathUtils.lerp(1.65,.45,nightValue);
 key.intensity=THREE.MathUtils.lerp(3.1,.85,nightValue);
 rim.intensity=THREE.MathUtils.lerp(1.8,.8,nightValue);
 scene.environmentIntensity=THREE.MathUtils.lerp(.85,.24,nightValue);
 parts.lights.forEach(light=>light.intensity=nightValue*3.8);
 parts.lampMat.emissiveIntensity=nightValue*2.6;
 const travel=driveSpeed*dt*2.6;
 // Travel is a real world-space translation. The camera deliberately trails the coach,
 // so it visibly moves across the frame on departure rather than running in place.
 model.position.x-=travel;
 const nextFollow=THREE.MathUtils.lerp(followX,model.position.x,1-Math.exp(-dt*(state.drive?1.55:4)));
 const followDelta=nextFollow-followX;followX=nextFollow;
 camera.position.x+=followDelta;controls.target.x+=followDelta;
 if(cameraTween){cameraTween.from.x+=followDelta;cameraTween.to.x+=followDelta;}
 road.update(travel,driveSpeed,explodeValue,followX);
 contact.position.x=model.position.x;shadowPlane.position.x=model.position.x;grid.position.x=model.position.x;
 key.position.x=model.position.x-3;key.target.position.x=model.position.x;
 rim.position.x=model.position.x+4;rim.target.position.x=model.position.x;
 grid.material.opacity=.13*(1-driveSpeed);
 if(frame%15===0){
  renderer.domElement.setAttribute('aria-label',`可拖动旋转的三维马车，已向前行驶 ${road.getDistance().toFixed(1)} 米`);
  if(state.drive)document.querySelector('#status-label').textContent=`向前行驶 · ${road.getDistance().toFixed(1)} m`;
 }
 const suspension=reduced?0:(Math.sin(road.getDistance()*8)*.016+Math.sin(road.getDistance()*13)*.006)*driveSpeed;
 parts.roof.position.y=explodeValue*1.8+suspension;parts.cabin.position.y=explodeValue*.65+suspension;parts.doors.forEach(d=>d.rotation.y=-d.userData.side*doorValue*1.5);parts.glass.clippingPlanes[0].constant=-2.83-parts.cabin.position.y;parts.windows.forEach(w=>{w.position.y=w.userData.baseY-windowValue*1.2;});parts.wheels.forEach((w,i)=>{w.position.z=baseWheelPositions[i].z+Math.sign(baseWheelPositions[i].z)*explodeValue*.95;w.rotation.z+=travel/w.userData.radius;});
 if(cameraTween){let t=cameraTween.duration?Math.min((now-cameraTween.time)/cameraTween.duration,1):1;let eased=t*t*(3-2*t);camera.position.lerpVectors(cameraTween.from,cameraTween.to,eased);camera.zoom=THREE.MathUtils.lerp(cameraTween.zoom,cameraTween.targetZoom??1,eased);camera.updateProjectionMatrix();if(t===1)cameraTween=null;}
 controls.update();renderer.render(scene,camera);if(frame++%2===0)updateAnnotations();
}
requestAnimationFrame(animate);setTimeout(()=>document.querySelector('#loading').classList.add('loaded'),300);
window.__carriage={state,model,parts,road,camera,renderer,controls,setView,action,getStats:()=>({calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries})};
