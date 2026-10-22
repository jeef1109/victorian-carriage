import * as THREE from 'three';

// One four-metre course of staggered stone blocks, repeated without a visible seam.
export function createRoad(renderer){
 const size=1024,tiles=8,cell=size/tiles;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#706754';ctx.fillRect(0,0,size,size);
 const random=(row,col,k)=>{let n=(row*73856093+(col+tiles)%tiles*19349663+k*83492791)>>>0;n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967296;};
 for(let row=0;row<tiles;row++)for(let col=-1;col<=tiles;col++){
  const x=col*cell+(row%2)*cell/2,y=row*cell;
  const shade=Math.round(186+random(row,col,1)*31),radius=7+random(row,col,2)*6;
  ctx.fillStyle=`rgb(${shade+13},${shade+5},${shade-12})`;
  ctx.beginPath();ctx.roundRect(x+5,y+5,cell-10,cell-10,radius);ctx.fill();
  ctx.strokeStyle='#f1e8d088';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+13,y+8);ctx.lineTo(x+cell-15,y+8);ctx.moveTo(x+8,y+14);ctx.lineTo(x+8,y+cell-15);ctx.stroke();
  ctx.strokeStyle='#796e5b88';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+cell-8,y+14);ctx.lineTo(x+cell-8,y+cell-13);ctx.lineTo(x+13,y+cell-8);ctx.stroke();
  for(let n=0;n<45;n++){let a=random(row,col,n+3),b=random(row,col,n+90);ctx.fillStyle=n%2?'#f4edd926':'#786c5620';ctx.fillRect(x+10+a*(cell-20),y+10+b*(cell-20),1+a*3,1+b*3);}
 }
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(11/4,6/3);map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 const bump=map.clone();bump.colorSpace=THREE.NoColorSpace;
 const mask=document.createElement('canvas');mask.width=mask.height=256;
 const mc=mask.getContext('2d'),gradient=mc.createRadialGradient(128,128,48,128,128,128);
 gradient.addColorStop(0,'white');gradient.addColorStop(.55,'#ffffff');gradient.addColorStop(.8,'#969696');gradient.addColorStop(1,'black');mc.fillStyle=gradient;mc.fillRect(0,0,256,256);
 const material=new THREE.MeshStandardMaterial({color:0xb2a895,map,bumpMap:bump,bumpScale:.025,alphaMap:new THREE.CanvasTexture(mask),transparent:true,opacity:.36,roughness:.95,metalness:0,depthWrite:false});
 const road=new THREE.Mesh(new THREE.PlaneGeometry(11,6),material);road.rotation.x=-Math.PI/2;road.position.y=-.025;road.name='moving-cobblestone-road';road.renderOrder=-2;
 let distance=0;
 return {mesh:road,update(travel,driveAmount,exploded,centerX=0){
  distance+=travel;
  // Keep stone joints fixed in world space while the visible patch follows the camera.
  road.position.x=centerX;map.offset.x=(centerX%4)/4;bump.offset.x=map.offset.x;
  material.opacity=(.36+.54*driveAmount)*(1-.8*exploded);
 },getDistance:()=>distance};
}
