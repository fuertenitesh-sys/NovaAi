// A material metaphor for adoption: a new capability woven into an existing way of working.
const host = document.querySelector('.adoption-weave');
if (host) {
 const replayButton=document.querySelector('.weave-replay');
 const reduced = matchMedia('(prefers-reduced-motion:reduce)');
 let visible = false, paused = document.body.classList.contains('motion-paused'), loading = false, scene;
 const observe = new IntersectionObserver(async entries => {
  visible = entries[0].isIntersecting;
  if (visible && !loading) {
   loading = true;
   try { scene = mount(await import('./assets/vendor/three.module.min.js')); } catch { host.classList.remove('ready'); }
  }
  scene?.start();
 }, { rootMargin:'100px' });
 observe.observe(host);
 addEventListener('nova:motion',e=>{paused=e.detail;scene?.start();syncControl()});
 document.addEventListener('visibilitychange',()=>scene?.start());
 reduced.addEventListener('change',()=>{scene?.start();syncControl()});
 function syncControl(){if(!replayButton)return;replayButton.disabled=paused||reduced.matches;replayButton.setAttribute('aria-label',paused?'Adoption animation paused':reduced.matches?'Reduced motion enabled':'Replay the adoption weave');replayButton.innerHTML=paused?'Motion paused <span>Ⅱ</span>':reduced.matches?'Reduced motion <span>—</span>':'See it come together <span>↻</span>'}
 document.querySelector('.weave-replay')?.addEventListener('click',()=>scene?.replay());
 function mount(T) {
  const renderer = new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor(0xf1efea,0);
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);
  const world=new T.Scene(),camera=new T.OrthographicCamera(-5,5,4,-4,.1,60);
  camera.position.set(7,9,10);camera.lookAt(0,.1,0);
  world.add(new T.HemisphereLight(0xffffff,0xaaa39a,2));
  const key=new T.DirectionalLight(0xfff9f0,3.3);key.position.set(-5,9,6);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);key.shadow.normalBias=.02;key.shadow.bias=-.00015;
  Object.assign(key.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:.1,far:35});world.add(key);
  const fill=new T.DirectionalLight(0xf0f3ff,1.1);fill.position.set(7,5,-6);world.add(fill);
  const porcelain=new T.MeshStandardMaterial({color:0xe7e4dd,roughness:.33,metalness:.14});
  const copper=new T.MeshStandardMaterial({color:0x2563eb,roughness:.3,metalness:.22});
  const ribbons=[],spacing=.8,segments=180,length=7.2;
  // Rounded rectangular ribbon cross sections, closed on all four sides.
  const section=[[-.25,-.025],[-.235,-.04],[.235,-.04],[.25,-.025],[.25,.025],[.235,.04],[-.235,.04],[-.25,.025]];
  function ribbon(row,cross) {
   const positions=[],indices=[],points=section.length;
   for(let j=0;j<=segments;j++){
    const s=(j/segments-.5)*length;
    const phase=s*Math.PI/spacing+row*Math.PI;
    const h=.36+(cross?-1:1)*.13*Math.cos(phase);
    for(const [width,depth] of section)positions.push(cross?row*spacing+width:s,h+depth,cross?s:row*spacing+width);
   }
   for(let j=0;j<segments;j++)for(let k=0;k<points;k++){
    const a=j*points+k,b=j*points+(k+1)%points,c=(j+1)*points+k,d=(j+1)*points+(k+1)%points;
    if(cross)indices.push(a,b,c,b,d,c);else indices.push(a,c,b,b,c,d);
   }
   const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
   const mesh=new T.Mesh(geometry,cross?copper:porcelain);mesh.castShadow=mesh.receiveShadow=true;world.add(mesh);
   if(cross)ribbons.push({mesh,count:indices.length,delay:(row+2)*110});
  }
  for(let row=-3;row<=3;row++)ribbon(row,false);
  for(let row=-2;row<=2;row++)ribbon(row,true);
  const ground=new T.Mesh(new T.PlaneGeometry(50,50),new T.ShadowMaterial({color:0x635a4a,opacity:.2}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;world.add(ground);
  let elapsed=0,last=0,raf=0;
  function render(){
   for(const item of ribbons){const p=reduced.matches||paused?1:Math.min(1,Math.max(0,(elapsed-item.delay)/2100));const eased=p*p*(3-2*p);item.mesh.geometry.setDrawRange(0,Math.max(0,Math.floor(item.count*eased/48)*48));}
   renderer.render(world,camera);
  }
  function frame(now){raf=0;if(!visible||document.hidden)return;const dt=Math.min(60,last?now-last:16);last=now;if(!paused&&!reduced.matches)elapsed+=dt;render();if(!paused&&!reduced.matches&&elapsed<2650)raf=requestAnimationFrame(frame)}
  function start(){if(!raf&&visible&&!document.hidden){last=0;raf=requestAnimationFrame(frame)}}
  function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);const aspect=w/h,extent=Math.max(3.4,4.5/aspect);camera.left=-extent*aspect;camera.right=extent*aspect;camera.top=extent;camera.bottom=-extent;camera.updateProjectionMatrix();render();start()}
  new ResizeObserver(resize).observe(host);resize();host.classList.add('ready');if(replayButton)replayButton.hidden=false;syncControl();
  renderer.domElement.addEventListener('webglcontextlost',()=>{cancelAnimationFrame(raf);raf=0;host.classList.remove('ready');if(replayButton)replayButton.hidden=true});
  return {start,replay(){elapsed=0;last=0;start()}};
 }
}
