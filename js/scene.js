import * as THREE from './assets/vendor/three.module.min.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const hosts = [...document.querySelectorAll('[data-scene] .scene-mount')];
const clamp = x => Math.min(1, Math.max(0, x));
const ease = x => { x = clamp(x); return x*x*x*(x*(x*6-15)+10); };
const mix = THREE.MathUtils.lerp;
const random = i => { const v = Math.sin(i*127.1+311.7)*43758.5453123; return v-Math.floor(v); };
const motion = {2:{hold:350,assembly:5000,toggle:3900},3:{hold:900,assembly:6800,toggle:4800}};
let direction = Number(document.body.dataset.direction)||1;
let host = hosts[direction-1] || hosts[0], paused = false, visible = true, raf = 0;
let last = 0, elapsed = 0, sequence = 0, progress = 0;
let manual = null, manualFrom = 0, manualTime = 0;
const pointer = {x:0,y:0}, cursor = {x:0,y:0};
let renderer;
try { renderer = new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'}); } catch {}

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
  renderer.setClearColor(0xfaf9f6,0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-hidden','true');
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-4,4,4,-4,.1,60);
  let aspect = 2;
  scene.add(new THREE.AmbientLight(0xfff5e8,.85));
  scene.add(new THREE.HemisphereLight(0xffffff,0xd9d3c4,1.6));
  const key = new THREE.DirectionalLight(0xfff9f3,3.15);
  key.position.set(-4,8,5); key.castShadow = true;
  key.shadow.mapSize.set(2048,2048);
  Object.assign(key.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.1,far:25});
  key.shadow.normalBias=.018;key.shadow.bias=-.0001;key.shadow.radius=5;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff,.75);fill.position.set(6,3,-5);scene.add(fill);
  const material = new THREE.MeshStandardMaterial({color:0x2563eb,roughness:.28,metalness:.22});
  const blockMaterial = material.clone();blockMaterial.roughness=.3;blockMaterial.metalness=.24;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.ShadowMaterial({color:0x6c6556,opacity:.14}));
  ground.rotation.x=-Math.PI/2;ground.position.y=-.025;ground.receiveShadow=true;scene.add(ground);
  const grid=new THREE.GridHelper(16,40,0xd0ceca,0xe4e1db);
  grid.position.y=-.024;grid.material.transparent=true;grid.material.opacity=.24;scene.add(grid);
  scene.fog=new THREE.Fog(0xfaf9f6,13,24);

  // 01 retains the original, continuous architectural ribs.
  const original = new THREE.Group();scene.add(original);
  const outline = new THREE.Shape();
  outline.moveTo(-1.21,0);outline.lineTo(-1.21,3.23);outline.lineTo(1.21,3.23);
  outline.lineTo(1.21,0);outline.lineTo(.92,0);outline.lineTo(.92,2.94);
  outline.lineTo(-.92,2.94);outline.lineTo(-.92,0);outline.closePath();
  const ribGeo = new THREE.ExtrudeGeometry(outline,{depth:.064,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.012,bevelThickness:.012});
  const ribs=[];
  for(let i=0;i<15;i++) {const m=new THREE.Mesh(ribGeo,material);m.castShadow=m.receiveShadow=true;m.position.z=(i-7)*.19;original.add(m);ribs.push(m);}

  // Shared bevels catch light without outlining every voxel.
  const square = new THREE.Shape();square.moveTo(-.48,-.48);square.lineTo(.48,-.48);square.lineTo(.48,.48);square.lineTo(-.48,.48);square.closePath();
  const blockGeo=new THREE.ExtrudeGeometry(square,{depth:.96,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:.02,bevelThickness:.02,curveSegments:1});
  blockGeo.translate(0,0,-.48);
  const portalParts=[];
  for(let rib=0;rib<11;rib++) {
    const z=(rib-5)*.27;
    for(let row=0;row<17;row++) for(const side of [-1,1]) portalParts.push({x:side*1.12,y:(row+.5)*2.99/17,z,sx:.234,sy:2.99/17-.006,sz:.075,layer:rib/10});
    for(let col=0;col<14;col++) portalParts.push({x:(col-6.5)*2.48/14,y:3.11,z,sx:2.48/14-.006,sy:.234,sz:.075,layer:rib/10});
  }
  const coreParts=[], pitch=.36;
  for(let x=-3;x<=3;x++) for(let y=0;y<7;y++) for(let z=-3;z<=3;z++) {
    const cx=Math.abs(x)<=1, cy=Math.abs(y-3)<=1, cz=Math.abs(z)<=1;
    if((cx&&cy)||(cy&&cz)||(cx&&cz)) continue;
    coreParts.push({x:x*pitch,y:(y+.5)*pitch,z:z*pitch,sx:pitch-.009,sy:pitch-.009,sz:pitch-.009,layer:(z+3)/6});
  }
  const object = new THREE.Object3D(), color = new THREE.Color();
  function build(parts,kind) {
    const group=new THREE.Group();scene.add(group);
    const mesh=new THREE.InstancedMesh(blockGeo,blockMaterial,parts.length);
    mesh.castShadow=mesh.receiveShadow=true;mesh.frustumCulled=false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);group.add(mesh);
    parts.forEach((p,i)=>{
      const seed=i+(kind===3?2000:0),r=random(seed),theta=random(seed+9)*Math.PI*2;
      const radius=1.45+random(seed+27)*2.25;
      p.start=new THREE.Vector3(Math.cos(theta)*radius,.13+random(seed+37)*.16,Math.sin(theta)*radius*.68);
      p.c1=new THREE.Vector3(Math.cos(theta-.5)*radius*.77,1.05+random(seed+56)*1.4,Math.sin(theta-.5)*radius*.72);
      p.c2=new THREE.Vector3(p.x+Math.cos(theta-.85)*.52,p.y+.55+random(seed+83)*.3,p.z+Math.sin(theta-.85)*.52);
      p.target=new THREE.Vector3(p.x,p.y,p.z);
      p.rotation=new THREE.Vector3((random(seed+102)-.5)*2.6,(random(seed+174)-.5)*3.4,(r-.5)*2.6);
      p.delay=(p.y/3.3)*.37+p.layer*.12+random(seed+108)*.055;
      p.duration=.40+random(seed+122)*.025;
      if(kind===2) {
        // Overlap the arrivals: a shorter overall sequence with a gentler trip for each block.
        p.c1.set(Math.cos(theta-.35)*radius*.77,.75+(p.y/3.3)*.8+random(seed+56)*.12,Math.sin(theta-.35)*radius*.72);
        p.c2.set(p.x+Math.cos(theta-.65)*.32,p.y+.32+random(seed+83)*.08,p.z+Math.sin(theta-.65)*.32);
        p.rotation.multiplyScalar(.46);
        p.delay=(p.y/3.3)*.28+p.layer*.09+random(seed+108)*.015;
        p.duration=.58+random(seed+122)*.02;
      }
      color.setRGB(.965+r*.035,.965+r*.035,.965+r*.035);mesh.setColorAt(i,color);
    });
    return {group,mesh,parts,kind};
  }
  const studies={2:build(portalParts,2),3:build(coreParts,3)};
  const controls=[...document.querySelectorAll('.assembly-study')].map(section=>({
    status:section.querySelector('.morph-status')
  }));
  let lastPhase='';
  function sync() {
    const phase=progress<.06?'parts':progress<.44?'gather':progress<.98?'build':'complete';
    const words={parts:'POSSIBILITY, IN PIECES.',gather:'COMING TOGETHER.',build:'BUILT FROM WITHIN.',complete:'ONE WORKING SYSTEM.'};
    for(const c of controls) {
      if(lastPhase!==phase)c.status.textContent=words[phase];

    }
    lastPhase=phase;document.body.dataset.motionStage=phase;document.body.dataset.assembly=Math.round(progress*100);
  }
  function updateBlocks(study,p) {
    study.parts.forEach((part,i)=>{
      const t=ease((p-part.delay)/part.duration), inv=1-t;
      object.position.copy(part.start).multiplyScalar(inv*inv*inv)
        .addScaledVector(part.c1,3*inv*inv*t).addScaledVector(part.c2,3*inv*t*t).addScaledVector(part.target,t*t*t);
      // A soft final rotation aligns the faces before the blocks make contact.
      const turn=study.kind===2?1-t:1-ease(Math.min(1,t*1.12));
      object.rotation.set(part.rotation.x*turn,part.rotation.y*turn,part.rotation.z*turn);
      const settled=mix(.78,1,ease(t));
      object.scale.set(part.sx*settled,part.sy*settled,part.sz*settled);
      object.updateMatrix();study.mesh.setMatrixAt(i,object.matrix);
    });
    study.mesh.instanceMatrix.needsUpdate=true;
  }
  function render(now) {
    const dt=Math.min(now-last||16,65);last=now;
    if(!paused&&!reduced.matches){elapsed+=dt;sequence+=dt;manualTime+=dt;}
    cursor.x+=(pointer.x-cursor.x)*.055;cursor.y+=(pointer.y-cursor.y)*.055;
    original.visible=direction===1;studies[2].group.visible=direction===2;studies[3].group.visible=direction===3;
    let half=2.7;
    if(direction===1) {
      original.rotation.y=-.4+(reduced.matches?0:Math.sin(elapsed*.00026)*.035+cursor.x*.13);
      ribs.forEach((m,i)=>{const t=reduced.matches?1:ease((sequence-i*28)/1400);m.position.y=(1-t)*(.35+i%3*.24);m.position.z=(i-7)*.19+(1-t)*(i-7)*.12;});
      camera.position.set(6.8,5.1,9);camera.lookAt(0,1.43,0);
    } else {
      const timing=motion[direction];
      progress=reduced.matches?(manual??1):manual===null?clamp((sequence-timing.hold)/timing.assembly):mix(manualFrom,manual,ease(manualTime/timing.toggle));
      const study=studies[direction];if(study.lastPose!==progress){updateBlocks(study,progress);study.lastPose=progress;}
      study.group.rotation.y=(direction===2?-.12:0)+(reduced.matches?0:cursor.x*.11+Math.sin(elapsed*.00018)*.012);
      const zoom=ease(progress);
      half=direction===2?mix(2.85,2.63,zoom):mix(2.85,2.36,zoom);
      half=Math.max(half,(direction===2?3.05:2.9)/aspect);
      camera.position.set(direction===2?mix(7.8,4.8,zoom):mix(8.8,7.8,zoom),direction===2?mix(6.2,4.5,zoom):5.2,10);camera.lookAt(0,mix(.75,direction===2?1.36:1.05,zoom),0);
      sync();
    }
    camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();
    renderer.render(scene,camera);
  }
  function resize(){if(!host||!host.clientWidth||!host.clientHeight)return;renderer.setSize(host.clientWidth,host.clientHeight);aspect=host.clientWidth/host.clientHeight;render(performance.now());}
  function tick(now){raf=0;if(document.hidden||!visible)return;render(now);if(!paused&&!reduced.matches)raf=requestAnimationFrame(tick);}
  function start(){cancelAnimationFrame(raf);raf=0;last=performance.now();render(last);if(visible&&!paused&&!reduced.matches&&!document.hidden)raf=requestAnimationFrame(tick);}
  function reset(){sequence=(reduced.matches||paused)?8000:0;manual=null;manualTime=0;progress=(reduced.matches||paused)?1:0;pointer.x=pointer.y=0;lastPhase='';start();}
  function move(n){direction=n;host=hosts[n-1]||hosts[0];if(!host)return;const fb=host.querySelector('.scene-fallback');if(fb)fb.style.display='none';host.appendChild(renderer.domElement);hosts.forEach((h,i)=>h.classList.toggle('ready',i===n-1||hosts.length===1));visible=true;reset();resize();}
  hosts.forEach(h=>{
    new ResizeObserver(()=>{if(h===host)resize();}).observe(h);
    new IntersectionObserver(entries=>{if(h===host){visible=entries[0].isIntersecting;start();}},{threshold:.01}).observe(h);
    h.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||paused)return;const r=h.getBoundingClientRect();pointer.x=(e.clientX-r.left)/r.width-.5;pointer.y=(e.clientY-r.top)/r.height-.5;});
    h.addEventListener('pointerleave',()=>{pointer.x=pointer.y=0;});
  });
  window.addEventListener('nova:direction',e=>move(Number(e.detail)));
  window.addEventListener('nova:motion',e=>{paused=e.detail;start();});
  window.addEventListener('nova:assemble',reset);
  window.addEventListener('nova:replay-morph',()=>{if(paused)document.querySelector(`[data-hero="${direction}"] .motion-control`)?.click();reset();});
  window.addEventListener('nova:toggle-form',()=>{manualFrom=progress;manual=progress>.5?0:1;manualTime=0;if(paused||reduced.matches)manualFrom=manual;start();});
  document.querySelectorAll('.morph-scrub').forEach(input=>{
    const scrub=()=>{manual=Number(input.value)/100;manualFrom=manual;manualTime=4800;progress=manual;start();};
    input.addEventListener('focus',scrub);input.addEventListener('input',scrub);
  });
  document.addEventListener('visibilitychange',start);reduced.addEventListener('change',start);
  move(direction);
  function mountNear(selector, module, exported) {
    const target = document.querySelector(selector);
    if (!target) return;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      import(module).then(loaded => loaded[exported]({THREE,geometry:blockGeo})).catch(() => {});
    }, {rootMargin:'700px'});
    observer.observe(target);
  }
  mountNear('.formation-story', './formation-story.js', 'mountFormationStory');
  mountNear('.team-section', './team-assembly.js', 'mountTeamBridge');
  mountNear('.work-sculpture', './work-sculpture.js', 'mountWorkSculpture');
}
