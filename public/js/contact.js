(() => {
  const dialog=document.querySelector('#brief-dialog');if(!dialog)return;
  const form=dialog.querySelector('form'),entry=dialog.querySelector('#contact-entry'),success=dialog.querySelector('#contact-success'),status=dialog.querySelector('#contact-status'),submit=dialog.querySelector('#contact-submit');
  const fields=['name','email','company','context'].map(name=>dialog.querySelector('#contact-'+name));
  let trigger=null,busy=false,complete=false,context='';
  const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function message(field){const value=field.value.trim();if(field.required&&!value)return field.name==='name'?'Please enter your name.':field.name==='email'?'Please enter your email.':'Please enter your company.';if(field.name==='email'&&!emailPattern.test(value))return 'Please check your email address.';if(value.length>field.maxLength)return 'Please shorten this to '+field.maxLength+' characters.';return '';}
  function validate(field){const error=message(field);field.setAttribute('aria-invalid',String(!!error));dialog.querySelector('#'+field.id+'-error').textContent=error;return !error;}
  fields.forEach(field=>{field.addEventListener('blur',()=>{if(field.value.trim()||field.getAttribute('aria-invalid')==='true')validate(field)});field.addEventListener('input',()=>{if(field.getAttribute('aria-invalid')==='true')validate(field)})});
  function open(button){trigger=button;context=[button.dataset.briefChoice,button.dataset.briefScenario].filter(Boolean).join(' — ');document.querySelectorAll('dialog[open]').forEach(d=>d.close());const menu=document.querySelector('.mobile-menu'),toggle=document.querySelector('.menu-toggle');if(menu)menu.hidden=true;if(toggle){toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open menu')}document.documentElement.classList.add('contact-open');dialog.showModal();dialog.querySelector(complete?'#contact-success-title':'#brief-title').focus({preventScroll:true})}
  document.querySelectorAll('[data-open="brief"]').forEach(button=>button.addEventListener('click',()=>open(button)));
  dialog.querySelector('.contact-close').addEventListener('click',()=>dialog.close());dialog.querySelector('[data-contact-done]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{document.documentElement.classList.remove('contact-open');if(trigger&&trigger.isConnected)trigger.focus({preventScroll:true})});
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()});
  function error(text){status.replaceChildren(document.createTextNode(text+' '));const a=document.createElement('a');a.href='mailto:info@ravan.ai?subject=Enterprise%20AI%20enquiry';a.textContent='Email us instead.';status.append(a);status.hidden=false;}
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||complete)return;
    const invalid=fields.filter(field=>!validate(field));if(invalid.length){invalid[0].focus();return}
    busy=true;submit.disabled=true;submit.querySelector('span').textContent='Sending your request…';form.setAttribute('aria-busy','true');status.hidden=true;
    const payload={name:fields[0].value.trim(),email:fields[1].value.trim(),company:fields[2].value.trim(),message:fields[3].value.trim(),website:form.elements.website.value,context,page:location.pathname};
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
    try{
      const response=await fetch('/api/demo-request',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify(payload),signal:controller.signal});
      const result=await response.json().catch(()=>({}));
      if(!response.ok||result.ok!==true)throw new Error(response.status===429?'Please wait a minute before trying again.':result.code==='validation'?'Please check your details and try again.':'We couldn’t confirm your request. Please try again.');
      complete=true;entry.hidden=true;success.hidden=false;dialog.setAttribute('aria-labelledby','contact-success-title');dialog.querySelector('#contact-confirmed-email').textContent=payload.email;if(dialog.open)dialog.querySelector('#contact-success-title').focus({preventScroll:true});
    }catch(e){error(e.name==='AbortError'?'We couldn’t confirm delivery in time. Your details are still here; please try again.':e.message==='Failed to fetch'?'We couldn’t connect. Check your connection and try again.':e.message||'Something went wrong. Please try again.');}
    finally{clearTimeout(timeout);busy=false;submit.disabled=false;form.removeAttribute('aria-busy');submit.querySelector('span').textContent='Request a conversation';}
  });

  // Direct Phone Call Dialog Handler
  const phoneDialog = document.querySelector('#phone-dialog');
  if (phoneDialog) {
    const phoneForm = phoneDialog.querySelector('#home-phone-form');
    const numberInput = phoneDialog.querySelector('#home-phone-number');
    const countrySelect = phoneDialog.querySelector('#home-country-code');
    const phoneSubmit = phoneDialog.querySelector('#home-phone-submit');
    const errorSpan = phoneDialog.querySelector('#home-phone-error');
    const tracker = phoneDialog.querySelector('#home-call-tracker');
    const trackerStep = phoneDialog.querySelector('#home-tracker-step');
    const trackerText = phoneDialog.querySelector('#home-tracker-text');
    const closeBtn = phoneDialog.querySelector('.contact-close');

    let callTimeouts = [];

    function clearTimeouts() {
      callTimeouts.forEach(t => clearTimeout(t));
      callTimeouts = [];
    }

    function openPhoneDialog() {
      document.querySelectorAll('dialog[open]').forEach(d => d.close());
      const menu = document.querySelector('.mobile-menu'), toggle = document.querySelector('.menu-toggle');
      if (menu) menu.hidden = true;
      if (toggle) { toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open menu'); }
      document.documentElement.classList.add('contact-open');
      phoneDialog.showModal();
      if (numberInput) numberInput.focus({ preventScroll: true });
    }

    document.querySelectorAll('[data-open="phone-call"]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        openPhoneDialog();
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => phoneDialog.close());
    }

    phoneDialog.addEventListener('close', () => {
      document.documentElement.classList.remove('contact-open');
      clearTimeouts();
      if (tracker) tracker.style.display = 'none';
      if (phoneSubmit) {
        phoneSubmit.disabled = false;
        const span = phoneSubmit.querySelector('span');
        if (span) span.textContent = 'Call My Phone Now';
      }
    });

    phoneDialog.addEventListener('click', event => {
      if (event.target !== phoneDialog) return;
      const r = phoneDialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) phoneDialog.close();
    });

    if (phoneForm) {
      phoneForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const rawNumber = (numberInput.value || '').trim();
        const countryCode = countrySelect ? countrySelect.value : '+91';

        if (!rawNumber || rawNumber.length < 7) {
          if (errorSpan) errorSpan.textContent = ' — Please enter a valid number';
          numberInput.focus();
          return;
        }
        if (errorSpan) errorSpan.textContent = '';

        phoneSubmit.disabled = true;
        const submitSpan = phoneSubmit.querySelector('span');
        if (submitSpan) submitSpan.textContent = 'Connecting Carrier...';

        try {
          const response = await fetch('/api/phone-call', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phoneNumber: rawNumber,
              countryCode: countryCode,
              persona: 'Customer Support Specialist'
            })
          });

          const data = await response.json();
          if (!data.ok && !data.success) {
            throw new Error(data.error || 'Failed to initiate call');
          }

          if (tracker) tracker.style.display = 'block';
          if (trackerStep) trackerStep.textContent = 'STEP 1 / INITIALIZING GATEWAY';
          if (trackerText) trackerText.textContent = `Carrier Gateway connected. Preparing dial to ${data.phoneNumber}...`;

          callTimeouts.push(setTimeout(() => {
            if (trackerStep) trackerStep.textContent = 'STEP 2 / DIALING MOBILE';
            if (trackerText) trackerText.textContent = `Dialing ${data.phoneNumber} across cellular network...`;
          }, 1200));

          callTimeouts.push(setTimeout(() => {
            if (trackerStep) trackerStep.textContent = 'STEP 3 / HANDSET RINGING';
            if (trackerText) trackerText.textContent = `Handset ringing! Please answer your mobile to speak with Riya.`;
          }, 3500));

          callTimeouts.push(setTimeout(() => {
            if (trackerStep) trackerStep.textContent = 'STEP 4 / AGENT CONNECTED';
            if (trackerText) trackerText.textContent = `Call Connected. Riya is speaking with you live!`;
          }, 7000));

        } catch (err) {
          alert('Call error: ' + err.message);
          phoneSubmit.disabled = false;
          if (submitSpan) submitSpan.textContent = 'Call My Phone Now';
        }
      });
    }
  }
})();
