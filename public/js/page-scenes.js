// Material studies for each page. Render only while visible; honor motion controls.
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
for(const host of document.querySelectorAll('[data-page-scene]')){
 let visible=false,started=false,paused=document.body.classList.contains('motion-paused'),runner=null;
 const observer=new IntersectionObserver(async entries=>{visible=entries[0].isIntersecting;if(visible&&!started){started=true;try{const THREE=await import('./assets/vendor/three.module.min.js');runner=mount(THREE,host,()=>visible,()=>paused);host.classList.add('scene-ready');runner.start()}catch{host.classList.remove('scene-ready')}}else if(runner)runner.start()},{rootMargin:'80px'});observer.observe(host);
 addEventListener('nova:motion',e=>{paused=e.detail;runner?.start()});document.addEventListener('visibilitychange',()=>runner?.start());reduced.addEventListener('change',()=>runner?.start());
 addEventListener('nova:voice-stage',e=>{if(host.dataset.pageScene==='products')runner?.setVoiceStage(e.detail)});
}
function mount(T,host,isVisible,isPaused){
 const mode=host.dataset.pageScene,renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.setClearColor(0xfaf9f6,0);renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-8,8,3,-3,.1,50);camera.position.set(mode==='products'?5:7,mode==='products'?5:6.5,10);camera.lookAt(0,.25,0);scene.add(new T.HemisphereLight(0xffffff,0xbbb4a8,2));const key=new T.DirectionalLight(0xfff6e8,3);key.position.set(-5,8,7);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.normalBias=.025;key.shadow.bias=-.0001;Object.assign(key.shadow.camera,{left:-9,right:9,top:7,bottom:-7,near:.1,far:35});scene.add(key);const fill=new T.DirectionalLight(0xf4f6ff,.9);fill.position.set(6,3,-6);scene.add(fill);
 const square=new T.Shape();square.moveTo(-.48,-.48);square.lineTo(.48,-.48);square.lineTo(.48,.48);square.lineTo(-.48,.48);square.closePath();const geo=new T.ExtrudeGeometry(square,{depth:.96,steps:1,bevelEnabled:true,bevelSize:.02,bevelThickness:.02,bevelSegments:2,curveSegments:1});geo.translate(0,0,-.48);
 const parts=[];
 if(mode==='approach')for(let i=0;i<22;i++){const left=i%2===0,z=(i-10.5)*.18;parts.push({x:left?-.7:.7,y:.65,z,sx:4,sy:.25,sz:.13,side:left?-1:1,color:left?0xe2dbcd:0x2563eb});parts.push({x:left?-2.43:2.43,y:.25,z,sx:.28,sy:.65,sz:.13,side:left?-1:1,color:left?0xe2dbcd:0x2563eb});}
 if(mode==='solutions')for(let i=0;i<14;i++)for(let j=0;j<32;j++){const t=(j+.5)/32,lane=i-6.5;parts.push({x:(t-.5)*8,y:.15+Math.sin(Math.PI*t)*(.6+lane*.04),z:lane*.17+Math.sin(t*Math.PI*2)*.55,sx:.245,sy:.1,sz:.095,side:Math.sin(i*5+j*2),color:i<3?0xe2d9c8:0x2563eb,t,lane});}
 if(mode==='products')for(let i=0;i<90;i++){const x=(i-44.5)*.09;parts.push({x,y:.5,z:Math.sin(i*.08)*.28,sx:.055,sy:1,sz:.16,side:x>0?1:-1,color:i<20?0xdcd4c5:0x2563eb,i});}
 const mesh=new T.InstancedMesh(geo,new T.MeshStandardMaterial({color:0xffffff,roughness:.31,metalness:.18}),parts.length);mesh.castShadow=mesh.receiveShadow=true;mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);scene.add(mesh);parts.forEach((p,i)=>mesh.setColorAt(i,new T.Color(p.color)));const dummy=new T.Object3D();const ground=new T.Mesh(new T.PlaneGeometry(60,60),new T.ShadowMaterial({color:0x5d4b39,opacity:.14}));ground.rotation.x=-Math.PI/2;ground.position.y=-.04;ground.receiveShadow=true;scene.add(ground);
 let raf=0,last=0,elapsed=0,lost=false,voiceStage=Number(host.dataset.voiceStage||0),stageElapsed=1200;
 const current=parts.map(p=>({x:p.x,y:p.y,z:p.z,sx:p.sx,sy:p.sy,sz:p.sz}));let from=current.map(p=>({...p}));
 const ease=x=>{x=Math.min(1,Math.max(0,x));return x*x*x*(x*(x*6-15)+10)};
 function voicePose(p,stage,still){
  const lane=Math.floor(p.i/30),slot=p.i%30;
  if(stage===0)return{x:(slot-14.5)*.16+(lane-1)*.2,y:.22+lane*.32,z:(lane-1)*.42,sx:.115,sy:.21,sz:1.55};
  if(stage===2)return{x:(lane-1)*2.65+(slot-14.5)*.061,y:.84,z:(lane-1)*.12,sx:.043,sy:1.42,sz:.22};
  const envelope=Math.exp(-p.x*p.x*.18),sy=.12+envelope*(.5+1.3*Math.pow(Math.sin(p.i*.14-(still?0:elapsed*.00035)),2));return{x:p.x,y:sy/2+.1,z:p.z,sx:p.sx,sy,sz:p.sz};
 }
 function render(dt){
  if(lost)return;const still=reduced.matches||isPaused();if(!still){elapsed+=dt;stageElapsed+=dt}const formation=still?1:ease(elapsed/2400),blend=reduced.matches?1:ease(stageElapsed/1150);
  parts.forEach((p,i)=>{
   if(mode==='products'){
    const target=voicePose(p,voiceStage,reduced.matches),pose=current[i];for(const key of ['x','y','z','sx','sy','sz'])pose[key]=from[i][key]+(target[key]-from[i][key])*blend;
    dummy.position.set(pose.x,pose.y,pose.z);dummy.rotation.set(0,0,0);dummy.scale.set(pose.sx,pose.sy,pose.sz);
   }else{dummy.position.set(p.x+(1-formation)*p.side*(mode==='approach'?1.4:.7),p.y+(1-formation)*.15,p.z);dummy.rotation.set(0,0,mode==='solutions'?Math.cos(p.t*Math.PI)*.16:0);dummy.scale.set(p.sx,p.sy,p.sz)}
   dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix)
  });mesh.instanceMatrix.needsUpdate=true;renderer.render(scene,camera)
 }
 function frame(now){raf=0;if(lost||!isVisible()||document.hidden)return;const dt=Math.min(60,last?now-last:16);last=now;render(dt);if(!reduced.matches&&!isPaused()&&(mode==='products'?(voiceStage===1||stageElapsed<1200):elapsed<2500))raf=requestAnimationFrame(frame)}
 function start(){if(!lost&&!raf&&isVisible()&&!document.hidden){last=0;raf=requestAnimationFrame(frame)}}
 function setVoiceStage(stage){if(mode!=='products'||stage===voiceStage)return;from=current.map(p=>({...p}));voiceStage=stage;stageElapsed=isPaused()||reduced.matches?1200:0;start()}
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);const aspect=w/h,halfHeight=Math.max(mode==='approach'?1.85:mode==='products'?1.8:1.55,(mode==='products'?4.8:4.6)/aspect);camera.left=-halfHeight*aspect;camera.right=halfHeight*aspect;camera.top=halfHeight;camera.bottom=-halfHeight;camera.updateProjectionMatrix();render(0);start()}
 new ResizeObserver(resize).observe(host);resize();renderer.domElement.addEventListener('webglcontextlost',()=>{lost=true;cancelAnimationFrame(raf);raf=0;host.classList.remove('scene-ready')});return{start,setVoiceStage};
}
