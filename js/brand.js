// Assemble the original artwork before it first appears, then keep it quietly present.
(() => {
 const root=document.documentElement;
 const brand=document.querySelector('.site-header .brand'),image=brand?.querySelector('img');
 const release=()=>root.classList.remove('brand-arrival-pending');
 if(!brand||!image){release();return}
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),hover=matchMedia('(hover:hover) and (pointer:fine)');
 let ready=false,running=false,timer=0,lastStart=performance.now();
 const stage=document.createElement('span');stage.className='brand-fragments';stage.setAttribute('aria-hidden','true');
 stage.style.setProperty('--brand-art',`url("${image.src}")`);
 const badge=document.createElement('span');badge.className='brand-badge';stage.append(badge);
 for(let row=0;row<4;row++)for(let col=0;col<4;col++){
  const piece=document.createElement('span');piece.className='brand-piece';
  const props={'--row':row,'--col':col,'--dx':`${(col-1.5)*3.2}px`,'--dy':`${(row-1.5)*3.2-1}px`,'--angle':`${(col-1.5)*1.5}deg`,'--delay':`${col*18+(3-row)*16}ms`,'--mask-x':`${col*24/342*100}%`,'--mask-y':`${row/3*100}%`};
  Object.entries(props).forEach(([name,value])=>piece.style.setProperty(name,value));
  const cut=document.createElement('span');cut.className='brand-piece-cut';
  const fragment=image.cloneNode();fragment.alt='';fragment.removeAttribute('id');
  const warm=document.createElement('span');warm.className='brand-piece-warm';
  cut.append(fragment,warm);piece.append(cut);badge.append(piece);
 }
 const type=document.createElement('span');type.className='brand-type';const word=image.cloneNode();word.alt='';word.removeAttribute('id');type.append(word);stage.append(type);brand.append(stage);
 function finish(){clearTimeout(timer);running=false;brand.classList.remove('is-forming','is-reforming','is-settling');release()}
 function settle(){brand.classList.add('is-settling');timer=setTimeout(finish,180)}
 function start(replay=false){
  if(!ready||running||reduced.matches||document.hidden)return false;
  const r=brand.getBoundingClientRect();if(r.bottom<=0||r.top>=innerHeight)return false;
  running=true;lastStart=performance.now();
  brand.classList.add(replay?'is-reforming':'is-forming');release();
  timer=setTimeout(settle,replay?1040:1080);return true;
 }
 function loaded(){
  if(ready)return;ready=true;
  // Never replace a logo that has already painted, including after the fallback deadline.
  if(!root.classList.contains('brand-arrival-pending')||!start())release();
 }
 if(image.complete&&image.naturalWidth)loaded();else image.addEventListener('load',loaded,{once:true});
 image.addEventListener('error',release,{once:true});
 brand.addEventListener('pointerenter',event=>{
  if(event.pointerType==='mouse'&&hover.matches&&performance.now()-lastStart>5000)start(true)
 });
 reduced.addEventListener('change',()=>{if(reduced.matches)finish()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)finish()});
 new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)finish()}).observe(brand);
 addEventListener('pagehide',finish);
})();
