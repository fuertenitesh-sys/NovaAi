const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>[...root.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let direction=2,motionPaused=false;
function setDirection(value,updateURL=true){
 direction=Math.max(1,Math.min(3,Number(value)||1));document.body.dataset.direction=direction;
 $$('[data-hero]').forEach(el=>{el.hidden=Number(el.dataset.hero)!==direction;el.classList.remove('switching')});
 $$('.direction-tabs button').forEach(el=>{const on=Number(el.dataset.direction)===direction;el.setAttribute('aria-selected',on);el.tabIndex=on?0:-1});
 if(updateURL){const url=new URL(location.href);url.searchParams.set('direction',direction);url.hash='';history.replaceState(null,'',url)}
 if(updateURL||!location.hash)window.scrollTo({top:0,behavior:'instant'});closeMenu();requestAnimationFrame(()=>$(`[data-hero="${direction}"]`).classList.add('switching'));
 window.dispatchEvent(new CustomEvent('nova:direction',{detail:direction}));

}
$$('.direction-tabs button').forEach(button=>button.addEventListener('click',()=>setDirection(button.dataset.direction)));
$('.direction-tabs').addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?1:e.key==='End'?3:(direction-1+(e.key==='ArrowRight'?1:2))%3+1;setDirection(next);$(`.direction-tabs [data-direction="${next}"]`).focus()});
$$('[data-select]').forEach(b=>b.addEventListener('click',()=>{$('#compare-dialog').close();setDirection(b.dataset.select)}));
function closeMenu(){$('.mobile-menu').hidden=true;$('.menu-toggle').setAttribute('aria-expanded','false');$('.menu-toggle').setAttribute('aria-label','Open menu')}
$('.menu-toggle').addEventListener('click',()=>{const open=$('.menu-toggle').getAttribute('aria-expanded')==='true';$('.mobile-menu').hidden=open;$('.menu-toggle').setAttribute('aria-expanded',!open);$('.menu-toggle').setAttribute('aria-label',open?'Open menu':'Close menu')});
$$('.mobile-menu a').forEach(a=>a.addEventListener('click',closeMenu));
$$('.brand').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const url=new URL(location.href);url.hash='';history.replaceState(null,'',url);window.scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'})}));
$$('[data-open]:not([data-open=brief])').forEach(b=>b.addEventListener('click',()=>{$$('dialog[open]').forEach(d=>d.close());closeMenu();$('#'+b.dataset.open+'-dialog').showModal()}));
$$('.dialog-close').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));
const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');revealObserver.unobserve(e.target)}}),{threshold:.12});$$('.work-intro,.work-layout,.approach-main,.principles').forEach(el=>{el.classList.add('reveal');revealObserver.observe(el)});



$$('.motion-control').forEach(b=>b.addEventListener('click',()=>{
 motionPaused=!motionPaused;document.body.classList.toggle('motion-paused',motionPaused);$$('.motion-control').forEach(x=>{x.setAttribute('aria-pressed',motionPaused);x.setAttribute('aria-label',motionPaused?'Resume animation':'Pause animation');$('.motion-symbol',x).textContent=motionPaused?'▷':'Ⅱ';$('.motion-word',x).textContent=motionPaused?'Resume motion':'Pause motion'});
 window.dispatchEvent(new CustomEvent('nova:motion',{detail:motionPaused}));
}));
setDirection(new URLSearchParams(location.search).get('direction')||2,false);

$$('.replay-morph').forEach(b=>b.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('nova:replay-morph'))));
$$('.form-toggle').forEach(b=>b.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('nova:toggle-form'))));
