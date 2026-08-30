(function(){
'use strict';
const manifest='https://raw.githubusercontent.com/CartlineAI/cartline-repository-intelligence-/main/deploy/thinkcar-current.json?ts='+Date.now();
fetch(manifest,{cache:'no-store'})
  .then(r=>{if(!r.ok)throw new Error('MANIFEST_HTTP_'+r.status);return r.json();})
  .then(m=>{
    if(!m||!m.commit)throw new Error('MANIFEST_COMMIT_MISSING');
    const s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/gh/CartlineAI/cartline-repository-intelligence-@'+encodeURIComponent(m.commit)+'/deploy/thinkcar-mvp.js';
    s.async=false;
    s.dataset.cartlineThinkcarRelease=String(m.release||'current');
    s.onerror=()=>{const d=document.createElement('div');d.style.cssText='padding:18px;border:1px solid #f47a16';d.textContent='Selectorul THINKCAR nu a putut fi încărcat. Reîncarcă pagina.';(document.currentScript&&document.currentScript.parentNode?document.currentScript.parentNode:document.body).appendChild(d);};
    (document.currentScript&&document.currentScript.parentNode?document.currentScript.parentNode:document.body).appendChild(s);
  })
  .catch(e=>{
    const d=document.createElement('div');d.style.cssText='padding:18px;border:1px solid #f47a16';d.textContent='Selectorul THINKCAR nu a putut fi încărcat: '+(e&&e.message?e.message:'bootstrap error');(document.currentScript&&document.currentScript.parentNode?document.currentScript.parentNode:document.body).appendChild(d);
  });
})();
