import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function createCarriage(){
 const root=new THREE.Group();
 const gold=new THREE.MeshStandardMaterial({color:0xc49a43,metalness:.84,roughness:.28});
 const goldLight=new THREE.MeshStandardMaterial({color:0xe3bf6b,metalness:.78,roughness:.25});
 const goldDark=new THREE.MeshStandardMaterial({color:0x80612d,metalness:.77,roughness:.32});
 const body=new THREE.MeshStandardMaterial({color:0x101b16,metalness:.24,roughness:.3});
 const roofMat=new THREE.MeshStandardMaterial({color:0x17201b,metalness:.25,roughness:.36});
 const rubber=new THREE.MeshStandardMaterial({color:0x292a24,roughness:.8});
 const interior=new THREE.MeshPhysicalMaterial({color:0xf2eee5,roughness:.52,metalness:0,clearcoat:.16,clearcoatRoughness:.58});
 const wood=new THREE.MeshStandardMaterial({color:0x35281d,roughness:.49});
 const glass=new THREE.MeshPhysicalMaterial({color:0xc4c8b8,metalness:0,roughness:.12,transparent:true,opacity:.16,side:THREE.DoubleSide,depthWrite:false});
 glass.clippingPlanes=[new THREE.Plane(new THREE.Vector3(0,1,0),-2.83)];
 const lampMat=new THREE.MeshStandardMaterial({color:0xf5d99a,emissive:0xffbf4f,emissiveIntensity:.85,transparent:true,opacity:.77,roughness:.25});
 const red=new THREE.MeshStandardMaterial({color:0x66302b,roughness:.55});
 // Fine material variation avoids perfectly uniform, plastic surfaces.
 function surfaceTexture(kind){
  const cv=document.createElement('canvas');cv.width=cv.height=256;const ctx=cv.getContext('2d');const data=ctx.createImageData(256,256);let seed=41;
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){seed=(seed*1664525+1013904223)>>>0;let n=(seed/4294967296-.5);let v=kind==='wood'?128+Math.sin(x*.19+Math.sin(y*.018)*.4)*18+n*13:128+n*45;let k=(y*256+x)*4;data.data[k]=data.data[k+1]=data.data[k+2]=v;data.data[k+3]=255;}ctx.putImageData(data,0,0);let tex=new THREE.CanvasTexture(cv);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(kind==='wood'?3:5,3);return tex;
 }
 body.bumpMap=surfaceTexture('wood');body.bumpScale=.008;gold.bumpMap=surfaceTexture('metal');gold.bumpScale=.005;goldLight.bumpMap=gold.bumpMap;goldLight.bumpScale=.003;interior.bumpMap=surfaceTexture('leather');interior.bumpMap.repeat.set(9,9);interior.bumpScale=.002;
 const wallLeather=interior.clone();wallLeather.color.set(0xc5a15b);wallLeather.roughness=.6;wallLeather.clearcoat=.08;
 const cabin=new THREE.Group(),chassis=new THREE.Group(),roof=new THREE.Group();root.add(cabin,chassis,roof);
 const wheels=[],doors=[],windows=[],lights=[];
 function mesh(geo,mat,parent,pos=[0,0,0],rot=[0,0,0]){let m=new THREE.Mesh(geo,mat);m.position.set(...pos);m.rotation.set(...rot);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function box(p,w,h,d,mat,x=0,y=0,z=0){return mesh(new THREE.BoxGeometry(w,h,d),mat,p,[x,y,z]);}
 function sphere(p,r,mat,x,y,z,s=[1,1,1]){let m=mesh(new THREE.SphereGeometry(r,12,8),mat,p,[x,y,z]);m.scale.set(...s);return m;}
 function cyl(p,rt,rb,h,mat,x,y,z,rot=[0,0,0]){return mesh(new THREE.CylinderGeometry(rt,rb,h,16),mat,p,[x,y,z],rot);}
 function tube(p,pts,r,mat=gold,closed=false){let crv=new THREE.CatmullRomCurve3(pts.map(v=>new THREE.Vector3(...v)),closed,'centripetal');return mesh(new THREE.TubeGeometry(crv,Math.max(12,Math.min(64,pts.length*3)),r,6,closed),mat,p);}
 function bar(p,a,b,r,mat=gold){let A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),m=mesh(new THREE.CylinderGeometry(r,r,A.distanceTo(B),8),mat,p);m.position.copy(A).add(B).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.sub(A).normalize());return m;}
 // Rigid metal trim follows the timber edges without spline overshoot.
 function frameTrim(p,left,bottom,right,top,z,width=.04){
  const depth=.025;
  for(const y of [bottom,top])box(p,right-left+width,width,depth,goldLight,(left+right)/2,y,z);
  for(const x of [left,right])box(p,width,top-bottom-width,depth,goldLight,x,(bottom+top)/2,z);
 }
 function edgeTrim(p,points,r,mat=goldLight){
  for(let i=1;i<points.length;i++)bar(p,points[i-1],points[i],r,mat);
  for(const point of points.slice(1,-1))sphere(p,r,mat,...point);
 }
 function torus(p,r,t,mat,x,y,z,rot=[0,0,0]){return mesh(new THREE.TorusGeometry(r,t,8,48),mat,p,[x,y,z],rot);}
 function panelShape(p,points,depth,mat,z){const s=new THREE.Shape();s.moveTo(...points[0]);for(let i=1;i<points.length;i++)s.lineTo(...points[i]);s.closePath();let g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.035,bevelThickness:.03,bevelSegments:2,steps:1});return mesh(g,mat,p,[0,0,z]);}
 function scroll(p,x,y,z,scale=1,flip=1){let pts=[];for(let i=0;i<=24;i++){let a=i/24*Math.PI*3.2,r=(.23-.19*i/24)*scale;pts.push([x+Math.cos(a)*r*flip,y+Math.sin(a)*r,z]);}tube(p,pts,.013*scale,goldLight);}
 function leaf(p,x,y,z,angle=0,scale=1){let l=sphere(p,.09,goldLight,x,y,z,[.45*scale,1.4*scale,.18*scale]);l.rotation.z=angle;return l;}
 function fleur(p,x,y,z,s=.7){bar(p,[x,y-.1*s,z],[x,y+.2*s,z],.018*s,goldLight);leaf(p,x,y+.19*s,z,0,s);leaf(p,x-.075*s,y+.1*s,z,.75,s*.8);leaf(p,x+.075*s,y+.1*s,z,-.75,s*.8);sphere(p,.033*s,gold,x,y-.06*s,z);}
 function flourish(p,cx,y,z,w=1){for(let f of [-1,1]){scroll(p,cx+f*.18*w,y,z,.72*w,f);scroll(p,cx+f*.39*w,y-.05*w,z,.43*w,-f);leaf(p,cx+f*.36*w,y+.09*w,z,f*.9,.65*w);leaf(p,cx+f*.5*w,y-.04*w,z,f*1.4,.5*w);}fleur(p,cx,y+.03*w,z,.6*w);}
 function finial(p,x,y,z,s=1){cyl(p,.12*s,.17*s,.07*s,gold,x,y,z);sphere(p,.095*s,goldLight,x,y+.1*s,z,[1,.75,1]);cyl(p,.035*s,.09*s,.16*s,gold,x,y+.22*s,z);sphere(p,.065*s,goldLight,x,y+.34*s,z);cyl(p,0,.04*s,.11*s,goldLight,x,y+.42*s,z);}
 function shield(p,x,y,z,s=1){let pts=[[-.22,.2],[.22,.2],[.2,-.05],[0,-.28],[-.2,-.05]].map(([a,b])=>[x+a*s,y+b*s]);panelShape(p,pts,.025,gold,z);panelShape(p,pts.map(([a,b])=>[x+(a-x)*.8,y+(b-y)*.8]),.028,red,z+.026);bar(p,[x,y+.14*s,z+.06],[x,y-.19*s,z+.06],.018*s,goldLight);bar(p,[x-.14*s,y,z+.06],[x+.14*s,y,z+.06],.018*s,goldLight);for(let f of [-1,1]){let ps=[];for(let i=0;i<12;i++){let a=-1.2+i/11*2.4;ps.push([x+f*(.28+.12*Math.cos(a))*s,y+Math.sin(a)*.3*s,z]);}tube(p,ps,.018*s,gold);for(let i=0;i<6;i++)leaf(p,x+f*(.27+.12*Math.sin(i/5*Math.PI))*s,y+(-.23+i*.09)*s,z,f*(.8+i*.1),.65*s);}fleur(p,x,y+.29*s,z,1.1*s);}
 // Curved lower coach body. Each face is built, rather than a photograph on a plane.
 const outline=[[-1.85,2.74],[-1.8,2.22],[-1.55,1.89],[-1.13,1.64],[-.6,1.51],[.6,1.51],[1.13,1.64],[1.55,1.89],[1.8,2.22],[1.85,2.74]];
 for(let side of [-1,1]){
  const z=side*1.02;
  // Split the fixed coachwork at the door jambs: no panel remains behind the open door.
  const jamb=.64,jambY=1.51+(jamb-.6)/(.53)*.13;
  const leftBody=[...outline.slice(0,4),[-jamb,jambY],[-jamb,2.74]];
  const rightBody=[[jamb,2.74],[jamb,jambY],...outline.slice(6)];
  panelShape(cabin,leftBody,.08,body,z-.04);panelShape(cabin,rightBody,.08,body,z-.04);
  for(const edge of [leftBody.slice(0,-1),rightBody.slice(1)])edgeTrim(cabin,edge.map(([x,y])=>[x,y,z+side*.08]),.028);
  for(const sign of [-1,1]){
   bar(cabin,[sign*jamb,2.72,z+side*.09],[sign*1.85,2.72,z+side*.09],.027,goldLight);
   for(let x=.85;x<1.7;x+=.3)flourish(cabin,sign*x,2.56,z+side*.09,.38);
  }
  for(let x of [-1.3,1.3]){flourish(cabin,x,2.15,z+side*.1,.78);shield(cabin,x,2.13,z+side*.11,.4);}
  // The window frames follow the curved roofline, with real hollow window openings.
  for(let x of [-1.83,-.65,.65,1.83]){let h=Math.abs(x)>1.5?1.47:1.55;box(cabin,.085,h,.12,body,x,3.45,z);}
  for(let cx of [-1.25,1.25]){
   box(cabin,1.1,.1,.11,body,cx,2.8,z);box(cabin,1.1,.12,.12,body,cx,4.15,z);
   frameTrim(cabin,cx<0?-1.83:.65,2.8,cx<0?-.65:1.83,4.15,z+side*.075);
   let pane=new THREE.Group();pane.position.set(cx,2.85,z);cabin.add(pane);box(pane,.97,1.18,.018,glass,0,.59,0);pane.userData.baseY=pane.position.y;windows.push(pane);
  }
  // One full-height hinge group carries the window, lower panel, trim and royal crest.
  let door=new THREE.Group();door.name=side>0?'right-complete-door':'left-complete-door';door.position.set(-.59,2.75,z+side*.025);door.userData.side=side;cabin.add(door);doors.push(door);
  panelShape(door,[[.03,0],[.03,-1.18],[1.15,-1.18],[1.15,0]],.08,body,-.04);
  box(door,.065,1.38,.1,body,.03,.66,0);box(door,.065,1.38,.1,body,1.15,.66,0);box(door,1.18,.1,.1,body,.59,1.36,0);box(door,1.18,.08,.1,body,.59,.02,0);
  frameTrim(door,.03,-1.18,1.15,1.36,side*.075,.044);
  box(door,1.12,.04,.025,goldLight,.59,.02,side*.075);
  for(let x of [.19,.59,.99])flourish(door,x,-.19,side*.09,.38);
  let pane=new THREE.Group();pane.position.set(.59,.08,0);pane.userData.baseY=.08;door.add(pane);box(pane,1.05,1.19,.02,glass,0,.59,0);windows.push(pane);
  sphere(door,.047,goldLight,1.05,.025,side*.13,[1,1,1.5]);bar(door,[.9,.025,side*.15],[1.06,.025,side*.15],.022,goldLight);
  const crest=new THREE.Group();crest.position.set(.59,-.67,side*.1);crest.rotation.y=side<0?Math.PI:0;door.add(crest);shield(crest,0,0,0,1.05);
  for(let x of [-.64,.64])bar(cabin,[x,1.59,z+side*.1],[x,2.72,z+side*.1],.022,gold);
  // Footboard below both doors.
  box(chassis,1.25,.065,.38,wood,0,1.04,side*1.28);box(chassis,1.26,.045,.045,gold,0,1.08,side*1.48);
  for(let x of [-.48,.48])tube(chassis,[[x,1.65,side*.9],[x,1.35,side*1.05],[x,1.03,side*1.3]],.03,gold);
 }
 box(cabin,3.35,.13,1.9,wood,0,1.7,0);
 // The front remains glazed; the rear wall is solid coachwork backed with leather.
 for(let s of [-1,1]){
  let x=s*1.8;box(cabin,.13,.72,1.98,body,x,2.35,0);box(cabin,.13,.15,2.08,body,x,4.14,0);
  for(let z of [-.96,.96])box(cabin,.13,1.4,.13,body,x,3.44,z);
  box(cabin,.14,.13,2,body,x,2.79,0);
  for(let z of [-.91,.91])bar(cabin,[x+s*.08,2.8,z],[x+s*.08,4.12,z],.021,goldLight);
  for(let y of [2.84,4.08])bar(cabin,[x+s*.09,y,-.95],[x+s*.09,y,.95],.023,goldLight);
  if(s<0){box(cabin,.13,1.29,.07,body,x,3.46,0);box(cabin,.02,1.16,1.8,glass,x,3.45,0);}
  else {const wall=box(cabin,.16,2.33,1.85,body,x,2.94,0);wall.name='solid-rear-coach-wall';}
 }
 // Rounded upholstered profiles have broad shoulders and softly bevelled leather edges.
 function cushionShape(w,h,r){
  const shape=new THREE.Shape(),l=-w/2,b=-h/2;
  shape.moveTo(l+r,b);shape.lineTo(l+w-r,b);shape.quadraticCurveTo(l+w,b,l+w,b+r);
  shape.lineTo(l+w,b+h-r);shape.quadraticCurveTo(l+w,b+h,l+w-r,b+h);
  shape.lineTo(l+r,b+h);shape.quadraticCurveTo(l,b+h,l,b+h-r);
  shape.lineTo(l,b+r);shape.quadraticCurveTo(l,b,l+r,b);return shape;
 }
 function leatherCushion(parent,w,h,thickness,r,pos,rotation,material=interior){
  const geometry=new THREE.ExtrudeGeometry(cushionShape(w-.08,h-.08,r),{depth:thickness-.08,bevelEnabled:true,bevelSize:.04,bevelThickness:.04,bevelSegments:5,curveSegments:16,steps:1});
  geometry.translate(0,0,-(thickness-.08)/2);
  return mesh(geometry,material,parent,pos,rotation);
 }
 // Two inward-facing seats: smooth white leather, rounded high backs and padded arms.
 for(let s of [-1,1]){
  const seat=new THREE.Group();seat.name=s>0?'rear-rounded-leather-seat':'front-rounded-leather-seat';cabin.add(seat);
  leatherCushion(seat,1.73,.76,.27,.16,[s*1.17,2.06,0],[-Math.PI/2,0,Math.PI/2]);
  const back=leatherCushion(seat,1.68,1.55,.24,.24,[s*1.46,2.88,0],[0,-s*Math.PI/2,0]);back.rotation.z=-s*.055;
  for(let z of [-.77,.77])leatherCushion(seat,.7,.2,.19,.075,[s*1.14,2.38,z],[0,0,0]);
  // Fine rolled piping follows the actual rounded outline of the backrest.
  const trim=cushionShape(1.61,1.48,.23).getPoints(64).map(p=>[s*(1.32-.055*p.y),2.88+p.y,p.x]);
  tube(seat,trim,.008,interior,true);
 }
 // Full-height opaque rear-wall padding. The diamond relief is one continuous
 // sculpted surface, with recessed seam intersections rather than separate round pads.
 const lining=new THREE.Group();lining.name='opaque-diamond-leather-rear-lining';lining.position.set(1.667,3.015,0);lining.rotation.y=-Math.PI/2;cabin.add(lining);
 leatherCushion(lining,1.83,2.12,.15,.15,[0,0,-.025],[0,0,0],wallLeather);
 const qw=1.72,qh=2.01,qr=.13;
 const quilt=new THREE.PlaneGeometry(qw,qh,76,88),vertices=quilt.attributes.position;
 for(let i=0;i<vertices.count;i++){
  let u=vertices.getX(i),v=vertices.getY(i),end=Math.max(0,Math.abs(v)-(qh/2-qr));
  const edge=qw/2-qr+Math.sqrt(Math.max(0,qr*qr-end*end));u*=edge/(qw/2);
  const a=u/.34+v/.39,b=u/.34-v/.39;
  const puff=Math.pow(Math.abs(Math.sin(Math.PI*a)*Math.sin(Math.PI*b)),.65);
  const fade=Math.min(1,(edge-Math.abs(u))/.06,(qh/2-Math.abs(v))/.06);
  vertices.setXYZ(i,u,v,.058+.055*puff*Math.max(0,fade));
 }
 quilt.computeVertexNormals();mesh(quilt,wallLeather,lining);
 for(let row=-5;row<=5;row++)for(let col=-2;col<=2;col++){
  const u=(col+(Math.abs(row)%2)*.5)*.34,v=row*.195;
  if(Math.abs(u)<qw/2-.1&&Math.abs(v)<qh/2-.08)sphere(lining,.016,wallLeather,u,v,.065,[1,1,.38]);
 }
 const welt=cushionShape(1.76,2.05,.14).getPoints(72).map(p=>[p.x,p.y,.064]);tube(lining,welt,.009,wallLeather,true);
 // Soft leather returns conceal the hard rear corners inside the cabin.
 for(let z of [-.89,.89])leatherCushion(cabin,.25,1.98,.1,.1,[1.6,3.02,z],[0,z>0?Math.PI:0,0],wallLeather);
 // Crown roof with a shallow barrel curve.
 const roofCross=[];for(let i=0;i<=12;i++){let z=-1.12+2.24*i/12;roofCross.push([z,4.26+.17*Math.cos(z/1.12*Math.PI/2)]);}const rs=new THREE.Shape();rs.moveTo(roofCross[0][0],roofCross[0][1]);for(let a of roofCross.slice(1))rs.lineTo(...a);rs.lineTo(1.12,4.16);rs.lineTo(-1.12,4.16);rs.closePath();let rg=new THREE.ExtrudeGeometry(rs,{depth:3.95,bevelEnabled:true,bevelSize:.035,bevelThickness:.04,bevelSegments:2,steps:1});let rm=mesh(rg,roofMat,roof,[1.975,0,0],[0,-Math.PI/2,0]);
 for(let s of [-1,1]){
  tube(roof,[[-2,4.23,s*1.14],[-1,4.23,s*1.14],[0,4.23,s*1.14],[1,4.23,s*1.14],[2,4.23,s*1.14]],.035,goldLight);
  tube(roof,[[-2,4.39,s*1.1],[-1,4.39,s*1.1],[0,4.39,s*1.1],[1,4.39,s*1.1],[2,4.39,s*1.1]],.025,gold);
  for(let x=-1.85;x<2;x+=.29){flourish(roof,x,4.48,s*1.1,.55);fleur(roof,x,4.53,s*1.1,.58);}
 }
 for(let s of [-1,1]){tube(roof,[[s*1.99,4.25,-1.12],[s*1.99,4.38,-.6],[s*1.99,4.43,0],[s*1.99,4.38,.6],[s*1.99,4.25,1.12]],.03,gold);for(let z=-.85;z<1;z+=.28)finial(roof,s*1.96,4.4,z,.38);}
 for(let x of [-1.96,1.96])for(let z of [-1.08,1.08])finial(roof,x,4.4,z,.78);
 // Central sculpted royal crown, eight arches, pearls and a cross.
 cyl(roof,.34,.38,.13,gold,0,4.55,0);torus(roof,.37,.035,goldLight,0,4.51,0,[Math.PI/2,0,0]);torus(roof,.34,.028,goldLight,0,4.62,0,[Math.PI/2,0,0]);
 for(let i=0;i<8;i++){let a=i*Math.PI/4;let ps=[];for(let j=0;j<=10;j++){let t=j/10;let r=.34*Math.cos(t*Math.PI/2);ps.push([Math.cos(a)*r,4.62+.37*Math.sin(t*Math.PI/2),Math.sin(a)*r]);}tube(roof,ps,.03,goldLight);sphere(roof,.035,red,Math.cos(a)*.36,4.57,Math.sin(a)*.36);sphere(roof,.04,goldLight,Math.cos(a)*.34,4.68,Math.sin(a)*.34);}
 sphere(roof,.09,goldLight,0,5.01,0);bar(roof,[0,5.07,0],[0,5.28,0],.025,goldLight);bar(roof,[-.075,5.21,0],[.075,5.21,0],.023,goldLight);
 // Scrolls and finials share the crown's longitudinal centreline.
 const roofCenterZ=0;
 for(let s of [-1,1]){for(let i=0;i<3;i++){flourish(roof,s*(.54+i*.31),4.55-.03*i,roofCenterZ,.9-i*.15);finial(roof,s*(.7+i*.35),4.44,roofCenterZ,.5-i*.08);}}
 // Gilded undercarriage and authentic sweeping C springs.
 for(let z of [-.8,.8]){
  tube(chassis,[[-3.35,.98,z],[-2.55,1.18,z],[-1.75,1.12,z],[-.9,.85,z],[0,.79,z],[1,.99,z],[1.8,1.48,z],[2.48,1.67,z]],.075,gold);
  tube(chassis,[[-3.35,.91,z],[-2.55,1.1,z],[-1.75,1.04,z],[-.9,.78,z],[0,.72,z],[1,.92,z],[1.8,1.4,z],[2.48,1.59,z]],.027,goldDark);
  for(let x of [-2.25,1.85]){
   tube(chassis,[[x-.62,1.31,z],[x-.42,1.15,z],[x,1.08,z],[x+.42,1.15,z],[x+.62,1.31,z]],.04,goldDark);
   tube(chassis,[[x-.58,1.34,z],[x-.4,1.19,z],[x,1.12,z],[x+.4,1.19,z],[x+.58,1.34,z]],.025,goldLight);
  }
  tube(chassis,[[-2.5,1.15,z],[-2.92,1.55,z],[-3.03,2.14,z],[-2.92,2.57,z],[-2.62,2.76,z],[-2.32,2.62,z]],.06,gold);
  tube(chassis,[[2.3,1.4,z],[2.68,1.72,z],[2.72,2.23,z],[2.55,2.58,z],[2.22,2.68,z],[2.04,2.55,z]],.05,gold);
 }
 for(let x of [-2.3,1.82])bar(chassis,[x,.91,-1.49],[x,.91,1.49],.095,gold);
 bar(chassis,[-3.55,1,0],[-1.9,1.15,0],.09,gold);box(chassis,1.15,.12,2.2,gold,-2.9,1.18,0);
 for(let s of [-1,1])tube(chassis,[[-2.7,1.15,s*.4],[-3.15,1.03,s*.54],[-3.72,.93,s*.47],[-4.15,1.02,s*.45]],.055,gold);
 // Coachman's raised bench and footwell.
 box(cabin,.85,.17,1.77,wood,-2.38,2.45,0);box(cabin,.68,.18,1.66,body,-2.4,2.58,0);box(cabin,.12,.51,1.75,body,-2.03,2.79,0);box(cabin,.13,.045,1.79,gold,-2.04,3.05,0);
 for(let z of [-.84,.84]){tube(cabin,[[-2.75,2.6,z],[-2.72,2.85,z],[-2.45,2.9,z],[-2.2,2.87,z]],.03,gold);tube(chassis,[[-2.45,1.18,z],[-2.45,1.8,z],[-2.3,2.43,z]],.04,gold);}
 box(chassis,.7,.08,1.6,wood,-3.05,1.7,0);box(chassis,.72,.04,.05,gold,-3.05,1.76,.8);box(chassis,.72,.04,.05,gold,-3.05,1.76,-.8);
 // Twelve carved spokes per wheel, gilded turned hubs and black iron tyres.
 for(let x of [-2.3,1.82])for(let s of [-1,1]){
  const r=x<0?.86:1.1;let wheel=new THREE.Group();wheel.position.set(x,r+.04,s*1.38);wheel.userData.side=s;wheel.userData.radius=r;wheels.push(wheel);root.add(wheel);
  torus(wheel,r,.066,rubber,0,0,0);torus(wheel,r-.062,.047,gold,0,0,0);torus(wheel,r-.08,.012,goldLight,0,0,s*.054);torus(wheel,r+.004,.012,goldDark,0,0,s*.055);
  for(let i=0;i<12;i++){
   let a=i/12*Math.PI*2;let v=(rad,z=0)=>[Math.cos(a)*rad,Math.sin(a)*rad,z];bar(wheel,v(.12),v(r-.09),.027,gold);bar(wheel,v(.19),v(.34),.045,goldLight);bar(wheel,v(r*.72),v(r*.87),.036,goldLight);for(let rad of [.22,.36,r*.72])sphere(wheel,.043,goldLight,...v(rad),[.85,.85,.85]);
  }
  cyl(wheel,.15,.18,.28,gold,0,0,0,[Math.PI/2,0,0]);cyl(wheel,.115,.15,.1,goldLight,0,0,s*.19,[Math.PI/2,0,0]);sphere(wheel,.1,gold,0,0,s*.25,[1,1,.4]);torus(wheel,.13,.016,goldDark,0,0,s*.245);
 }
 // Four glazed lanterns, each with a luminous core and open metal framework.
 for(let x of [-1.94,1.94])for(let s of [-1,1]){
  let z=s*1.26,y=3.44;
  tube(cabin,[[x,2.95,s*1.02],[x,2.99,s*1.24],[x,3.15,z]],.036,gold);cyl(cabin,.045,.065,.34,gold,x,3.14,z);
  cyl(cabin,.15,.12,.07,gold,x,y-.35,z);cyl(cabin,.18,.15,.06,goldLight,x,y-.3,z);
  box(cabin,.245,.45,.245,lampMat,x,y-.03,z);
  for(let a of [-1,1])for(let b of [-1,1])bar(cabin,[x+a*.13,y-.28,z+b*.13],[x+a*.13,y+.23,z+b*.13],.019,goldLight);
  cyl(cabin,.19,.17,.055,gold,x,y+.23,z);cyl(cabin,.055,.2,.18,gold,x,y+.34,z);sphere(cabin,.06,goldLight,x,y+.47,z);cyl(cabin,0,.04,.1,gold,x,y+.55,z);
  let light=new THREE.PointLight(0xffc66d,.85,1.5,2);light.position.set(x,y,z);cabin.add(light);lights.push(light);
 }
 // Rear footman rail and trunk.
 box(chassis,.53,.12,1.57,wood,2.34,1.93,0);
 for(let z of [-.73,.73]){bar(chassis,[2.52,1.99,z],[2.52,2.5,z],.025,gold);sphere(chassis,.047,goldLight,2.52,2.54,z);}
 bar(chassis,[2.52,2.5,-.73],[2.52,2.5,.73],.027,gold);
 // Batch static geometry inside each articulated group to keep the model responsive.
 function batch(group){for(let child of [...group.children])if(child.isGroup)batch(child);const mats=new Map();for(let child of [...group.children]){if(!child.isMesh||!child.material.isMaterial)continue;child.updateMatrix();let g=child.geometry.clone().applyMatrix4(child.matrix);if(g.index)g=g.toNonIndexed();const k=child.material.uuid;if(!mats.has(k))mats.set(k,{mat:child.material,geos:[]});mats.get(k).geos.push(g);group.remove(child);child.geometry.dispose();}for(let {mat,geos} of mats.values()){let g=mergeGeometries(geos,false);const m=new THREE.Mesh(g,mat);m.castShadow=!mat.transparent;m.receiveShadow=true;group.add(m);geos.forEach(a=>a.dispose());}}
 batch(root);
 root.userData={cabin,chassis,roof,wheels,doors,windows,lights,materials:{body,metal:gold,wheels:goldLight,interior},glass,allMaterials:[gold,goldLight,goldDark,body,roofMat,rubber,interior,wallLeather,wood,glass,lampMat,red],lampMat,roofMat};
 return root;
}
