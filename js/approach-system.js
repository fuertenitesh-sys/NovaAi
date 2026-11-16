// The delivery story accumulates capability, one reviewed layer at a time.
const host=document.querySelector('.delivery-system');
if(host){
 const chapters=[...document.querySelectorAll('[data-delivery-stage]')],number=document.querySelector('.delivery-stage-number'),caption=document.querySelector('.delivery-stage-caption');
 const captions=['Understand the business problem.','Test a working prototype.','Connect and launch the system.','Train your team. Improve the results.'];
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let stage=0,visible=false,started=false,runner=null,scrollFrame=0,paused=document.body.classList.contains('motion-paused');
 function chooseStage(){scrollFrame=0;let next=0;chapters.forEach((chapter,i)=>{if(chapter.getBoundingClientRect().top<innerHeight*.36)next=i});if(next===stage)return;stage=next;host.dataset.stage=String(stage);number.textContent=`0${stage+1} / 04`;caption.textContent=captions[stage];runner?.change(stage)}
 host.dataset.stage='0';
 addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(chooseStage)},{passive:true});addEventListener('resize',chooseStage);chooseStage();
 const observer=new IntersectionObserver(async entries=>{visible=entries[0].isIntersecting;if(visible&&!started){started=true;try{const T=await import('./assets/vendor/three.module.min.js');runner=mount(T,host,()=>visible,()=>paused||reduced.matches);runner.change(stage);host.classList.add('ready');runner.start()}catch{host.classList.remove('ready')}}else runner?.start()},{rootMargin:'80px'});observer.observe(host);
 addEventListener('nova:motion',e=>{paused=e.detail;runner?.start()});reduced.addEventListener('change',()=>runner?.start());document.addEventListener('visibilitychange',()=>runner?.start());
}
function mount(T,host,isVisible,isStill){
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-4,4,2,-2,.1,40);camera.position.set(5,4.5,7);camera.lookAt(0,1.15,0);scene.add(new T.HemisphereLight(0xffffff,0xa8a39b,2.1));
 const key=new T.DirectionalLight(0xfff5e7,3.3);key.position.set(-4,7,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.normalBias=.025;key.shadow.bias=-.0001;Object.assign(key.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:.1,far:25});scene.add(key);const fill=new T.DirectionalLight(0xf1f5ff,1.1);fill.position.set(5,2,-5);scene.add(fill);
 const shape=new T.Shape();shape.moveTo(-.48,-.48);shape.lineTo(.48,-.48);shape.lineTo(.48,.48);shape.lineTo(-.48,.48);shape.closePath();const geometry=new T.ExtrudeGeometry(shape,{depth:.96,steps:1,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2,curveSegments:1});geometry.translate(0,0,-.48);
 const orange=new T.Color(0x2563eb),porcelain=new T.Color(0xe0dcd3),future=new T.Color(0xc7c1b6),layers=[];
 for(let layer=0;layer<4;layer++){
  const material=new T.MeshStandardMaterial({color:0xffffff,roughness:.32,metalness:.13,transparent:true,opacity:1});const mesh=new T.InstancedMesh(geometry,material,13);mesh.receiveShadow=true;mesh.frustumCulled=false;scene.add(mesh);layers.push({mesh,y:layer*.68+.18,angle:layer%2?Math.PI/2:0,color:new T.Color(0xffffff),opacity:1});
 }
 const ground=new T.Mesh(new T.PlaneGeometry(40,40),new T.ShadowMaterial({color:0x574b3a,opacity:.16}));ground.rotation.x=-Math.PI/2;ground.position.y=-.015;ground.receiveShadow=true;scene.add(ground);
 const dummy=new T.Object3D();let target=0,raf=0,last=0,active=true,lost=false;const targets=[];
 function change(stage){target=stage;targets.length=0;layers.forEach((_,i)=>{const built=i<=target;targets.push({y:built?.14+i*.28:1.2+(i-target)*.48,angle:(i%2?Math.PI/2:0)+(built?0:.1*(i-target)),color:i===target?orange:built?porcelain:future,opacity:built?1:.16})});active=true;start()}
 function render(dt){const snap=isStill(),blend=snap?1:1-Math.exp(-dt/190);active=false;layers.forEach((layer,i)=>{const t=targets[i];if(!t)return;layer.y+=(t.y-layer.y)*blend;layer.angle+=(t.angle-layer.angle)*blend;layer.opacity+=(t.opacity-layer.opacity)*blend;layer.color.lerp(t.color,blend);if(Math.abs(t.y-layer.y)>.001||Math.abs(t.opacity-layer.opacity)>.002||Math.abs(layer.color.r-t.color.r)+Math.abs(layer.color.g-t.color.g)+Math.abs(layer.color.b-t.color.b)>.002)active=true;layer.mesh.material.color.copy(layer.color);layer.mesh.material.opacity=layer.opacity;layer.mesh.material.depthWrite=i<=target;layer.mesh.castShadow=i<=target;layer.mesh.rotation.y=layer.angle;
  for(let j=0;j<13;j++){const z=(j-6)*.205,length=3.05-.32*Math.pow(Math.abs(j-6)/6,3);dummy.position.set(0,layer.y,z);dummy.scale.set(length,.105,.185);dummy.rotation.set(0,0,0);dummy.updateMatrix();layer.mesh.setMatrixAt(j,dummy.matrix)}layer.mesh.instanceMatrix.needsUpdate=true;
 });renderer.render(scene,camera)}
 function frame(now){raf=0;if(lost||!isVisible()||document.hidden)return;const dt=Math.min(60,last?now-last:16);last=now;render(dt);if(active&&!isStill())raf=requestAnimationFrame(frame)}
 function start(){if(!raf&&!lost&&isVisible()&&!document.hidden){last=0;raf=requestAnimationFrame(frame)}}
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);const aspect=w/h,half=Math.max(1.95,2.6/aspect);camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();render(0);start()}
 change(target);new ResizeObserver(resize).observe(host);resize();renderer.domElement.addEventListener('webglcontextlost',()=>{lost=true;cancelAnimationFrame(raf);raf=0;host.classList.remove('ready')});return{change,start};
}
