// Keep navigation within reach without taking space from the story.
(() => {
 const header=document.querySelector('.site-header'),menu=document.querySelector('.mobile-menu'),toggle=document.querySelector('.menu-toggle');if(!header)return;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');let previous=scrollY,turn=scrollY,direction=0,raf=0;
 function update(){raf=0;const y=Math.max(0,scrollY),delta=y-previous,next=delta>0?1:delta<0?-1:direction;if(next!==direction){turn=previous;direction=next}const detached=y>180;header.classList.toggle('is-detached',detached);document.body.classList.toggle('header-detached',detached);if(!detached){header.classList.remove('is-shown')}else if(toggle.getAttribute('aria-expanded')==='true'||header.contains(document.activeElement)||reduced.matches){header.classList.add('is-shown')}else if(direction<0&&turn-y>28){header.classList.add('is-shown')}else if(direction>0&&y-turn>60){header.classList.remove('is-shown')}document.body.classList.toggle('header-visible',detached&&header.classList.contains('is-shown'));previous=y;const max=document.documentElement.scrollHeight-innerHeight;document.documentElement.style.setProperty('--reading-progress',max>0?Math.min(1,y/max):0)}
 addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(update)},{passive:true});addEventListener('resize',update);header.addEventListener('focusin',()=>{if(scrollY>180){header.classList.add('is-shown');document.body.classList.add('header-visible')}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){toggle.click();toggle.focus()}});
 document.addEventListener('click',e=>{if(toggle.getAttribute('aria-expanded')==='true'&&!header.contains(e.target)&&!menu.contains(e.target)){toggle.click()}});
 toggle.addEventListener('click',()=>{if(toggle.getAttribute('aria-expanded')==='true'&&scrollY>180){header.classList.add('is-shown');document.body.classList.add('header-visible')}});
 const sectionNav=document.querySelector('.solution-nav,.model-spine nav');
 if(sectionNav){
  const links=[...sectionNav.querySelectorAll('a[href^="#"]')],sections=links.map(link=>document.querySelector(link.getAttribute('href')));let sectionRaf=0;
  function updateSection(){sectionRaf=0;let active=0;sections.forEach((section,i)=>{if(section&&section.getBoundingClientRect().top<innerHeight*.36)active=i});links.forEach((link,i)=>{if(i===active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')})}
  addEventListener('scroll',()=>{if(!sectionRaf)sectionRaf=requestAnimationFrame(updateSection)},{passive:true});addEventListener('resize',updateSection);updateSection();
 }
 // Font loading can move a direct chapter link after the browser's initial jump.
 // Correct only that initial navigation, and yield immediately to any user input.
 const initialHash=location.hash,entry=performance.getEntriesByType('navigation')[0];
 if(initialHash&&entry?.type==='navigate'&&document.fonts){
  let interrupted=false;
  const stop=()=>{interrupted=true};
  const events=['wheel','touchstart','pointerdown','keydown'];events.forEach(name=>addEventListener(name,stop,{once:true,passive:true}));
  document.fonts.ready.then(()=>requestAnimationFrame(()=>{
   events.forEach(name=>removeEventListener(name,stop));
   if(interrupted||location.hash!==initialHash)return;
   let target;try{target=document.getElementById(decodeURIComponent(initialHash.slice(1)))}catch{}
   target?.scrollIntoView({behavior:'instant',block:'start'});update();
  }));
 }
 update();
})();
