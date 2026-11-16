// An ordered flow: the same architectural members take three useful forms.
// The installation is decorative; the accessible copy carries the proposition.
export function mountWorkSculpture({THREE,geometry}) {
 const host=document.querySelector('.work-sculpture');if(!host)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const count=12*30,poses=[[],[],[]],object=new THREE.Object3D();
 const up=new THREE.Vector3(0,1,0),axis=new THREE.Vector3(1,0,0),q=new THREE.Quaternion();
 const point=(mode,i,t)=>{
  const lane=i-5.5;
  if(mode===0)return new THREE.Vector3(-2.75+5.5*t,.25+Math.sin(Math.PI*t)*.8+Math.pow(t,3)*.35,lane*(.32-.15*t)+.65*Math.sin(Math.PI*t));
  if(mode===1)return new THREE.Vector3(-2.7+5.4*t,.32+i*.085+Math.sin(Math.PI*t)*(.85+i*.025),lane*.22+Math.sin(Math.PI*t)*lane*.045);
  return new THREE.Vector3(-2.75+5.5*t,.3+Math.sin(Math.PI*t)*.48,lane*.17+.95*Math.sin(t*Math.PI*2-Math.PI*.5));
 };
 for(let mode=0;mode<3;mode++)for(let i=0;i<12;i++)for(let j=0;j<30;j++){
  const t=(j+.5)/30,a=point(mode,i,j/30),b=point(mode,i,(j+1)/30),p=point(mode,i,t),tangent=b.clone().sub(a);
  q.setFromUnitVectors(axis,tangent.clone().normalize());
  poses[mode].push({p,q:q.clone(),s:new THREE.Vector3(tangent.length()*.965,mode===1?.065:.12,mode===0?.105:.085)});
 }
 let renderer,scene,camera,mesh,raf=0,visible=false,paused=false,progress=1,selected=0,last=0,age=0,from=poses[0].map(p=>({p:p.p.clone(),q:p.q.clone(),s:p.s.clone()})),current=poses[0],lastPose=-1;
 const ease=x=>x*x*x*(x*(x*6-15)+10);
 function init(){
  if(renderer)return true;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'})}catch{return false}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor(0xf1efea,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);
  scene=new THREE.Scene();camera=new THREE.OrthographicCamera(-5,5,3,-3,.1,40);camera.position.set(6.4,6.2,8.5);camera.lookAt(0,.3,0);
  scene.add(new THREE.HemisphereLight(0xffffff,0xbab5ab,2.1));const light=new THREE.DirectionalLight(0xfffaf2,3.3);light.position.set(-3,8,5);light.castShadow=true;light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-7,right:7,top:6,bottom:-6,near:.1,far:30});light.shadow.normalBias=.025;light.shadow.bias=-.0001;scene.add(light);const fill=new THREE.DirectionalLight(0xf2f5fa,.8);fill.position.set(5,2,-5);scene.add(fill);
  mesh=new THREE.InstancedMesh(geometry,new THREE.MeshStandardMaterial({color:0x2563eb,roughness:.28,metalness:.24}),count);mesh.castShadow=mesh.receiveShadow=true;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;scene.add(mesh);
  const color=new THREE.Color();for(let i=0;i<count;i++){const lane=Math.floor(i/30);color.set(lane<2?0xebdfcb:0xffffff);mesh.setColorAt(i,color)}
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.ShadowMaterial({color:0x665646,opacity:.14}));floor.rotation.x=-Math.PI/2;floor.position.y=.025;floor.receiveShadow=true;scene.add(floor);
  host.classList.add('ready');resize();
  renderer.domElement.addEventListener('webglcontextlost',()=>{host.classList.remove('ready');visible=false;cancelAnimationFrame(raf);raf=0});return true;
 }
 function resize(){if(!renderer)return;const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);const ratio=w/h;camera.left=-3.45;camera.right=3.45;camera.top=3.45/ratio;camera.bottom=-3.45/ratio;camera.updateProjectionMatrix();lastPose=-1;start()}
 function pose(){if(!renderer)return;const p=reduced.matches||paused?1:ease(progress);for(let i=0;i<count;i++){const a=from[i],b=current[i];object.position.copy(a.p).lerp(b.p,p);object.quaternion.copy(a.q).slerp(b.q,p);object.scale.copy(a.s).lerp(b.s,p);object.updateMatrix();mesh.setMatrixAt(i,object.matrix)}mesh.instanceMatrix.needsUpdate=true;renderer.render(scene,camera);lastPose=progress}
 function frame(time){raf=0;if(!visible||document.hidden)return;const dt=Math.min(60,last?time-last:16);last=time;age+=dt;progress=reduced.matches||paused?1:Math.min(1,age/1250);if(lastPose!==progress)pose();if(progress<1)raf=requestAnimationFrame(frame)}
 function start(){if(renderer&&visible&&!document.hidden&&!raf)raf=requestAnimationFrame(frame)}
 addEventListener('nova:work',e=>{const next=Number(e.detail);if(next===selected)return;const p=ease(progress);from=from.map((a,i)=>({p:a.p.clone().lerp(current[i].p,p),q:a.q.clone().slerp(current[i].q,p),s:a.s.clone().lerp(current[i].s,p)}));selected=next;current=poses[selected];age=0;progress=0;lastPose=-1;start()});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible&&init())start();else{cancelAnimationFrame(raf);raf=0;last=0}},{rootMargin:'80px'}).observe(host);
 new ResizeObserver(resize).observe(host);document.addEventListener('visibilitychange',()=>{last=0;start()});addEventListener('nova:motion',e=>{paused=e.detail;lastPose=-1;start()});reduced.addEventListener('change',()=>{lastPose=-1;start()});
}
