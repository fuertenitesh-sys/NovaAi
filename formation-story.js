// The hero's actual block geometry becomes the next section's typography.
export async function mountFormationStory({THREE, geometry}) {
  const section=document.querySelector('.formation-story');
  if(!section)return;
  const sticky=section.querySelector('.story-sticky'),art=section.querySelector('.story-art');
  const host=section.querySelector('.story-canvas'),title=section.querySelector('.story-title');
  const text=section.querySelector('.story-type-text'),baseline=section.querySelector('.story-baseline');
  const state=section.querySelector('.story-state'),replay=section.querySelector('.story-replay');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const clamp=x=>Math.max(0,Math.min(1,x));
  const ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
  const mix=THREE.MathUtils.lerp;
  let renderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.08;renderer.setClearColor(0xf1efea,0);
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-6,6,4,-4,.1,60);
  scene.add(new THREE.HemisphereLight(0xffffff,0xb9b8b5,2));
  const key=new THREE.DirectionalLight(0xfff9f1,3);key.position.set(-4,7,8);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);key.shadow.normalBias=.025;key.shadow.bias=-.0001;
  Object.assign(key.shadow.camera,{left:-8,right:8,top:7,bottom:-6,near:.1,far:30});scene.add(key);
  const fill=new THREE.DirectionalLight(0xffffff,.6);fill.position.set(5,2,-4);scene.add(fill);
  const material=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.32,metalness:.18,transparent:true});
  const shadowMaterial=new THREE.ShadowMaterial({color:0x575552,opacity:.13,transparent:true});
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(80,80),shadowMaterial);
  floor.rotation.x=-Math.PI/2;floor.position.y=-1.39;floor.receiveShadow=true;scene.add(floor);
  const dummy=new THREE.Object3D(),color=new THREE.Color(),orange=new THREE.Color(0x2563eb),ink=new THREE.Color(0x1b1c1e);
  let mesh,points=[],width=1,height=1,px=1,initialZoom=1.6;
  let target=0,progress=0,last=0,raf=0,onScreen=false,paused=false;
  let replayElapsed=null,holdReplay=false,heldScroll=0;
  let lastPhase='',lastPose=-1;
  await document.fonts.ready;

  function sampleType(){
    width=art.clientWidth;height=art.clientHeight;if(!width||!height)return;
    renderer.setSize(width,height);px=width/12;
    initialZoom=Math.max(1.35,Math.min(3.1,height*.68*12/(3.5*width)));
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)return;
    const style=getComputedStyle(title),size=parseFloat(style.fontSize),spacing=parseFloat(style.letterSpacing)||0;
    ctx.font=`${style.fontWeight} ${size}px ${style.fontFamily}`;ctx.fontKerning='none';ctx.textBaseline='alphabetic';
    const area=art.getBoundingClientRect(),box=text.getBoundingClientRect();
    let x=box.left-area.left;const y=baseline.getBoundingClientRect().top-area.top;
    for(const character of 'AI, at work.'){
      ctx.fillStyle=character==='.'?'#2563eb':'#20251f';ctx.fillText(character,x,y);
      x+=ctx.measureText(character).width+spacing;
    }
    const pixels=ctx.getImageData(0,0,width,height).data,step=Math.max(2,Math.round(size/32));
    const samples=[];
    for(let py=1;py<height;py+=step)for(let pxx=1;pxx<width;pxx+=step){
      const j=(py*width+pxx)*4;
      if(pixels[j+3]>120)samples.push({x:(pxx-width/2)/px,y:(height/2-py)/px,dot:pixels[j]>180&&pixels[j+1]<140});
    }
    samples.sort((a,b)=>a.x-b.x||a.y-b.y);
    const count=samples.length;if(!count)return;
    if(mesh){scene.remove(mesh);mesh.dispose();}
    mesh=new THREE.InstancedMesh(geometry,material,count);mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(mesh);
    const perRib=Math.ceil(count/11),perimeter=3.0*2+2.24,segment=perimeter/perRib;
    points=samples.map((sample,i)=>{
      const rib=i%11,row=Math.floor(i/11),distance=(row+.5)*segment;
      let sx,sy,sizex,sizey;
      if(distance<3){sx=-1.12;sy=distance;sizex=.23;sizey=segment*.97;}
      else if(distance<5.24){sx=-1.12+distance-3;sy=3.11;sizex=segment*.97;sizey=.23;}
      else{sx=1.12;sy=3-(distance-5.24);sizex=.23;sizey=segment*.97;}
      const start=new THREE.Vector3(sx*.8,sy*.8-1.35,(rib-5)*.27*.8);
      start.applyAxisAngle(new THREE.Vector3(0,1,0),-.12);
      const end=new THREE.Vector3(sample.x,sample.y,0);
      const bend=(i%17)/17;
      return {start,end,
        c1:new THREE.Vector3(start.x+sample.x*.19,start.y+.32+bend*.2,start.z+.28),
        c2:new THREE.Vector3(sample.x*.92,sample.y+.1+Math.sin(i*.13)*.12,.35),
        startScale:new THREE.Vector3(sizex*.8,sizey*.8,.075*.8),
        endScale:new THREE.Vector3(step/px*.99,step/px*.99,.035),
        delay:.035+(sample.x+6)/12*.11,
        dot:sample.dot};
    });
    section.classList.add('story-enhanced');lastPose=-1;updateTarget();start();
  }
  function updateTarget(){
    const bounds=section.getBoundingClientRect(),travel=section.offsetHeight-sticky.offsetHeight;
    target=clamp((-bounds.top+innerHeight*.10)/(Math.max(1,travel)+innerHeight*.10));
    if(holdReplay&&Math.abs(scrollY-heldScroll)>8){holdReplay=false;replayElapsed=null;}
    if(reduced.matches||paused)target=1;
  }
  function pose(p){
    if(!mesh||Math.abs(p-lastPose)<.00001)return;lastPose=p;
    const dissolve=ease((p-.86)/.14);
    section.style.setProperty('--type-opacity',dissolve.toFixed(4));
    section.style.setProperty('--story-progress',p.toFixed(4));
    const tint=ease((p-.25)/.55);
    points.forEach((part,i)=>{
      const t=ease((p-part.delay)/.70),v=1-t;
      dummy.position.copy(part.start).multiplyScalar(v*v*v).addScaledVector(part.c1,3*v*v*t).addScaledVector(part.c2,3*v*t*t).addScaledVector(part.end,t*t*t);
      dummy.scale.copy(part.startScale).lerp(part.endScale,t);
      dummy.rotation.set(0,-.12*(1-t),Math.sin(t*Math.PI)*Math.sin(i*.21)*.10);
      dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
      color.copy(orange).lerp(part.dot?orange:ink,tint);mesh.setColorAt(i,color);
    });
    mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;
    material.opacity=1-dissolve;mesh.visible=dissolve<.999;
    shadowMaterial.opacity=.13*(1-dissolve);
    const angle=ease(p);
    camera.position.set(mix(5.5,0,angle),mix(3.9,0,angle),mix(12,18,angle));camera.lookAt(0,0,0);
    camera.zoom=mix(initialZoom,1,angle);camera.left=-6;camera.right=6;camera.top=height/px/2;camera.bottom=-height/px/2;camera.updateProjectionMatrix();
    const phase=p<.18?'structure':p<.86?'forming':'work';
    if(phase!==lastPhase){state.textContent={structure:'SCROLL TO TAKE SHAPE',forming:'BECOMING PART OF THE WORK',work:'AI, IN EVERYDAY OPERATION'}[phase];lastPhase=phase;}
    section.dataset.phase=phase;section.dataset.progress=Math.round(p*100);
    renderer.render(scene,camera);
  }
  function tick(now){
    raf=0;if(document.hidden||!onScreen)return;
    const dt=Math.min(now-last||16,65);last=now;
    if(replayElapsed!==null&&!reduced.matches&&!paused){
      replayElapsed+=dt;progress=clamp(replayElapsed/3600);
      if(progress===1){replayElapsed=null;holdReplay=true;heldScroll=scrollY;}
    }else if(reduced.matches||paused){progress=1;}
    else if(holdReplay){progress=1;}
    else {progress+=(target-progress)*(1-Math.exp(-dt/110));if(Math.abs(target-progress)<.0001)progress=target;}
    pose(progress);
    if(!paused&&!reduced.matches&&(replayElapsed!==null||(!holdReplay&&Math.abs(target-progress)>.0001)))raf=requestAnimationFrame(tick);
  }
  function start(){if(!raf&&onScreen&&!document.hidden){last=performance.now();raf=requestAnimationFrame(tick);}}
  const observer=new IntersectionObserver(entries=>{onScreen=entries[0].isIntersecting;if(onScreen){updateTarget();start();}else{cancelAnimationFrame(raf);raf=0;}},{threshold:0});observer.observe(section);
  let scrollThrottle = false;
  window.addEventListener('scroll',()=>{if(!scrollThrottle){scrollThrottle=true;requestAnimationFrame(()=>{updateTarget();start();scrollThrottle=false;});}},{passive:true});
  new ResizeObserver(sampleType).observe(art);
  document.addEventListener('visibilitychange',start);
  reduced.addEventListener('change',()=>{updateTarget();start();});
  window.addEventListener('nova:motion',e=>{paused=e.detail;updateTarget();start();});
  window.addEventListener('nova:direction',()=>{holdReplay=false;replayElapsed=null;updateTarget();start();});
  replay?.addEventListener('click',()=>{
    if(reduced.matches)return;
    if(paused)document.querySelector(`[data-hero="${document.body.dataset.direction}"] .motion-control`)?.click();
    holdReplay=false;replayElapsed=0;progress=0;lastPose=-1;start();
  });
  renderer.domElement.addEventListener('webglcontextlost',()=>{section.classList.remove('story-enhanced');cancelAnimationFrame(raf);});
  sampleType();
}
