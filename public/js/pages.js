(() => {
 const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const menu=$('.mobile-menu'),menuButton=$('.menu-toggle');
 function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open menu')}
 menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')==='true';menu.hidden=open;menuButton.setAttribute('aria-expanded',String(!open));menuButton.setAttribute('aria-label',open?'Open menu':'Close menu')});$$('.mobile-menu a').forEach(a=>a.addEventListener('click',closeMenu));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menuButton.getAttribute('aria-expanded')==='true'){closeMenu();menuButton.focus()}});
 let paused=false;$$('.motion-control').forEach(b=>b.addEventListener('click',()=>{paused=!paused;document.body.classList.toggle('motion-paused',paused);$$('.motion-control').forEach(x=>{x.setAttribute('aria-pressed',String(paused));x.setAttribute('aria-label',paused?'Resume animation':'Pause animation');$('.motion-symbol',x).textContent=paused?'▷':'Ⅱ';$('.motion-word',x).textContent=paused?'Resume motion':'Pause motion'});window.dispatchEvent(new CustomEvent('ravan:motion',{detail:paused}))}));
 $$('.questions-list details').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)$$('.questions-list details').forEach(other=>{if(item!==other)other.open=false})}));

})();
