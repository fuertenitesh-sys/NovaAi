/* Nova: native scroll, considered transitions, readable state. */
(() => {
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 if(new URLSearchParams(location.search).get('review')==='1')document.body.classList.add('review-mode');
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target)}}),{threshold:.12});
 $$('[data-reveal],.adoption-editorial,.closing-section').forEach(el=>observer.observe(el));
 const continuity=$('.continuity-art');
 if(continuity&&!reduced.matches){
  continuity.classList.add('can-assemble');
  const assemblyObserver=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){continuity.classList.add('assembled');assemblyObserver.disconnect()}},{threshold:.1});assemblyObserver.observe(continuity.parentElement);
  addEventListener('nova:motion',e=>{if(e.detail){continuity.classList.add('assembled');assemblyObserver.disconnect()}});
  reduced.addEventListener('change',()=>{if(reduced.matches){continuity.classList.add('assembled');assemblyObserver.disconnect()}});
 }

 // Readable by default, including when animation or JavaScript is unavailable.
 const work=[
  {label:'SALES & CUSTOMER SERVICE',heading:'Follow up with leads.<br>Help customers faster.',description:'Build AI that answers customer questions, follows up with leads, and updates your customer records (CRM). Complex requests reach your team with the conversation and relevant details attached.',link:'/solutions/#customer',cta:'Explore sales & customer service'},
  {label:'YOUR DOCUMENTS & BUSINESS DATA',heading:'Ask your business a question.<br>Get an answer with sources.',description:'Connect approved documents and business data so your team can ask questions, review contracts, and find answers with links to the source.',link:'/solutions/#knowledge',cta:'Explore business knowledge'},
  {label:'EVERYDAY BUSINESS OPERATIONS',heading:'Less data entry.<br>Fewer repetitive tasks.',description:'Build AI that reads documents, checks records, and prepares updates across your systems. Your team reviews exceptions and approves actions where needed.',link:'/solutions/#operations',cta:'Explore business operations'}
 ];
 let workIndex=0;
 function selectWork(index){workIndex=index;const item=work[index];$$('[data-work]').forEach((b,i)=>{b.setAttribute('aria-selected',i===index);b.tabIndex=i===index?0:-1});$('#work-panel').setAttribute('aria-labelledby','work-tab-'+index);$('#work-art-label').textContent=item.label;$('#work-heading').innerHTML=item.heading;$('#work-description').textContent=item.description;$('#work-deep-link').href=item.link;$('#work-deep-link').innerHTML=item.cta+' <span><svg class="nova-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 19 19 5M5 5h14v14"/></svg></span>';$('.work-display-meta>span:last-child').textContent='0'+(index+1)+'—03';window.dispatchEvent(new CustomEvent('nova:work',{detail:index}));if(!reduced.matches&&!document.body.classList.contains('motion-paused'))$('.work-display-copy').animate([{opacity:.2,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:450,easing:'cubic-bezier(.2,.75,.2,1)'});}
 $$('[data-work]').forEach(b=>b.addEventListener('click',()=>selectWork(Number(b.dataset.work))));
 function tabKeys(container,selector,select){const group=$(container);if(!group)return;group.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;const tabs=$$(selector),current=tabs.indexOf(e.target);if(current<0)return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(current+(['ArrowRight','ArrowDown'].includes(e.key)?1:tabs.length-1))%tabs.length;select(next);tabs[next].focus()})}
 tabKeys('.work-choices','[data-work]',selectWork);
 const environments=[['PRIVATE CLOUD','Run AI in your company’s cloud environment, with access and data connections approved by your IT team.'],['ON-PREMISE','Run supported AI systems on your own servers. We agree on hardware, data access, and who will operate and maintain them.'],['HYBRID','Combine your own infrastructure with approved cloud services. We define which data stays private and what each service can access.']];
 function selectEnvironment(index){$$('[data-env]').forEach((b,i)=>{b.setAttribute('aria-selected',i===index);b.tabIndex=i===index?0:-1});$('#environment-panel').setAttribute('aria-labelledby','env-tab-'+index);$('#environment-panel').textContent=environments[index][1];$('#environment-tag').textContent=environments[index][0]}
 $$('[data-env]').forEach(b=>b.addEventListener('click',()=>selectEnvironment(Number(b.dataset.env))));tabKeys('.environment-tabs','[data-env]',selectEnvironment);
 for(const group of ['.questions-list','.impact-ledger'])$$(group+' details').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)$$(group+' details').forEach(other=>{if(other!==item)other.open=false})}));
 const narrow=matchMedia('(max-width:760px)');function orientTabs(){$('.work-choices').setAttribute('aria-orientation',narrow.matches?'horizontal':'vertical')}orientTabs();narrow.addEventListener('change',orientTabs);
})();
