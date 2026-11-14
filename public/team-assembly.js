// Two sets of architectural members interlock as the team enters the page.
export function mountTeamBridge({THREE,geometry}){
 const section=document.querySelector('.team-section'),host=document.querySelector('.team-art');if(!section||!host)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let renderer,scene,camera,mesh,floor,dummy,raf=0,last=0,progress=0,target=0,visible=false,paused=false,lastPose=-1;
 const clamp=x=>Math.min(1,Math.max(0,x)),ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)};
 const parts=[];
 // Alternating fingers from each side become one load-bearing structure.
 for(let i=0;i<12;i++){
  const left=i%2===0,z=(i-5.5)*.27;
  parts.push({x:left?-.68:.68,y:.75,z,sx:3.2,sy:.32,sz:.22,left,delay:i*.011});
  parts.push({x:left?-2.08:2.08,y:.27,z,sx:.28,sy:.65,sz:.22,left,delay:i*.011+.03});
 }
 function initialize(){
  if(renderer)return true;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch{return false;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor(0x1b1c1e,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);
  scene=new THREE.Scene();camera=new THREE.OrthographicCamera(-5,5,3.5,-3.5,.1,40);camera.position.set(6.2,5.8,7.4);camera.lookAt(0,.2,0);
  scene.add(new THREE.HemisphereLight(0xfff7e7,0x292a2d,2.2));
  const key=new THREE.DirectionalLight(0xfff4dc,3.2);key.position.set(-4,8,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.normalBias=.025;key.shadow.bias=-.0001;Object.assign(key.shadow.camera,{left:-8,right:8,top:7,bottom:-7,near:.1,far:30});scene.add(key);
  const fill=new THREE.DirectionalLight(0xe8ecf0,1.2);fill.position.set(5,2,-6);scene.add(fill);
  mesh=new THREE.InstancedMesh(geometry,new THREE.MeshStandardMaterial({color:0xffffff,roughness:.35,metalness:.17}),parts.length);mesh.castShadow=mesh.receiveShadow=true;mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(mesh);dummy=new THREE.Object3D();
  parts.forEach((part,i)=>mesh.setColorAt(i,new THREE.Color(part.left?0xe9e6de:0x2563eb)));
  floor=new THREE.Mesh(new THREE.PlaneGeometry(50,50),new THREE.ShadowMaterial({color:0x000000,opacity:.18}));floor.rotation.x=-Math.PI/2;floor.position.y=-.07;floor.receiveShadow=true;scene.add(floor);
  host.classList.add('ready');resize();
  renderer.domElement.addEventListener('webglcontextlost',()=>{host.classList.remove('ready');visible=false;cancelAnimationFrame(raf);raf=0;});
  return true;
 }
 function resize(){if(!renderer)return;const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);const aspect=w/h,extent=innerWidth<761?3.05:3.0;camera.left=-extent*aspect;camera.right=extent*aspect;camera.top=extent;camera.bottom=-extent;camera.updateProjectionMatrix();lastPose=-1;start();}
 function updateTarget(){const rect=host.getBoundingClientRect();target=reduced.matches||paused?1:clamp((innerHeight*.92-rect.top)/(innerHeight*.62));start();}
 function pose(p){if(Math.abs(lastPose-p)<.0001)return;lastPose=p;parts.forEach((part,i)=>{const t=ease((p-part.delay)/.8);dummy.position.set(part.x+(part.left?-1:1)*(1-t)*2.0,part.y+(1-t)*.35,part.z);dummy.rotation.set(0,0,(part.left?-1:1)*(1-t)*.035);dummy.scale.set(part.sx,part.sy,part.sz);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix)});mesh.instanceMatrix.needsUpdate=true;renderer.render(scene,camera);}
 function frame(time){raf=0;if(!visible||document.hidden)return;const dt=Math.min(65,last?time-last:16);last=time;progress=reduced.matches||paused?1:progress+(target-progress)*(1-Math.exp(-dt/160));if(Math.abs(target-progress)<.0003)progress=target;pose(progress);if(Math.abs(target-progress)>.0003)raf=requestAnimationFrame(frame);}
 function start(){if(renderer&&visible&&!document.hidden&&!raf)raf=requestAnimationFrame(frame);}
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible&&initialize()){updateTarget();start()}else{cancelAnimationFrame(raf);raf=0;last=0;}},{rootMargin:'80px'}).observe(host);
 new ResizeObserver(resize).observe(host);
 addEventListener('scroll',updateTarget,{passive:true});document.addEventListener('visibilitychange',()=>{last=0;start()});addEventListener('ravan:motion',e=>{paused=e.detail;updateTarget()});reduced.addEventListener('change',updateTarget);
}
