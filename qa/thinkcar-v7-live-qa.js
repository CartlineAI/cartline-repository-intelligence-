(function(){
'use strict';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const now=()=>Date.now();
function text(el){return (el&&el.textContent||'').replace(/\s+/g,' ').trim()}
function set(el,value){if(!el)throw new Error('FIELD_MISSING');el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}
async function waitFor(fn,timeout=30000,step=250){const start=now();let last;while(now()-start<timeout){try{last=fn();if(last)return last}catch(e){last=e}await sleep(step)}throw last instanceof Error?last:new Error('TIMEOUT')}
function settledJob(t){return /CONFIRMAT ÎN DATELE THINKCAR|TESTER GĂSIT|FUNCȚIE IDENTIFICATĂ|NECESITĂ VERIFICARE|INDISPONIBIL|IDENTIFICARE NECESARĂ/.test(t)&&!/Verific funcția|Verific compatibilitatea|VERIFIC\b/.test(t)}
function resultState(t){for(const s of ['CONFIRMAT ÎN DATELE THINKCAR','TESTER GĂSIT','FUNCȚIE IDENTIFICATĂ','NECESITĂ VERIFICARE','INDISPONIBIL','IDENTIFICARE NECESARĂ'])if(t.includes(s))return s;return 'UNKNOWN'}
function marks(d,w){const root=d&&d.querySelector('#ct-thinkcar-v6');return {root:!!root,provider:!!(w&&w.CartlineThinkcarProvider),make:!!(root&&root.querySelector('[data-cvi="make"]')),model:!!(root&&root.querySelector('[data-cvi="model"]')),year:!!(root&&root.querySelector('[data-cvi="year"]')),jobs:!!(root&&root.querySelector('[data-cvi-tab="jobs"]')&&root.querySelector('[data-cvi-job]')),dtc:!!(root&&root.querySelector('[data-cvi-dtc-code]')),eng:!!(root&&root.querySelector('[data-eng="send"]'))}}
function titleMarks(prefix,m){document.title=prefix+' r'+(+m.root)+' p'+(+m.provider)+' m'+(+m.make)+' o'+(+m.model)+' y'+(+m.year)+' j'+(+m.jobs)+' d'+(+m.dtc)+' e'+(+m.eng)}
async function run(){
 const host=document.getElementById('ct-v7-qa-host')||document.body;
 host.innerHTML='<h1>THINKCAR V7 LIVE QA</h1><p id="ct-v7-qa-status">Pornesc verificarea…</p><div id="ct-v7-qa-report"></div><iframe id="ct-v7-qa-frame" style="width:100%;height:1100px;border:1px solid #ccc" src="/selector-thinkcar/?qa_isolated='+Date.now()+'"></iframe>';
 const status=document.getElementById('ct-v7-qa-status'),report=document.getElementById('ct-v7-qa-report'),frame=document.getElementById('ct-v7-qa-frame');
 const started=now();let ready=null,lastMarks={};
 while(now()-started<60000){
   try{const d=frame.contentDocument,w=frame.contentWindow,m=marks(d,w);lastMarks=m;titleMarks('QA INIT',m);if(m.root&&m.provider&&m.make&&m.model&&m.year&&m.jobs){ready={d,w,root:d.querySelector('#ct-thinkcar-v6')};break}}catch(e){}
   await sleep(500);
 }
 if(!ready)throw new Error('BOOTSTRAP_TIMEOUT_'+Object.entries(lastMarks).map(([k,v])=>k+'='+ (+v)).join(','));
 const doc=ready.d,root=ready.root;
 status.textContent='Selector încărcat. Setez Volkswagen Passat 2003…';
 const make=root.querySelector('[data-cvi="make"]'),model=root.querySelector('[data-cvi="model"]'),year=root.querySelector('[data-cvi="year"]');
 set(make,'VOLKSWAGEN');await sleep(150);set(model,'Passat');await sleep(150);set(year,'2003');await sleep(700);
 const selected={make:make.value,model:model.value,year:year.value};
 if(!/VOLKSWAGEN/i.test(selected.make)||!/PASSAT/i.test(selected.model)||selected.year!=='2003')throw new Error('VEHICLE_SET_FAILED_'+JSON.stringify(selected));
 root.querySelector('[data-cvi-tab="jobs"]').click();await sleep(250);
 const jobs=[...root.querySelectorAll('[data-cvi-job]')],jobResults=[];
 if(jobs.length!==12)throw new Error('JOB_BUTTON_COUNT_'+jobs.length);
 for(let i=0;i<jobs.length;i++){
   const btn=jobs[i],label=text(btn.querySelector('b')||btn),out=root.querySelector('[data-cvi-out="job"]');
   status.textContent='Testez '+(i+1)+'/12: '+label;document.title='QA JOB '+(i+1)+'/12 · '+label;
   const before=text(out);btn.click();
   await waitFor(()=>{const x=text(out);return x!==before&&x},7000,100);
   document.title='QA CLICK OK '+(i+1)+'/12 · '+label;
   const t=await waitFor(()=>{const x=text(out);return settledJob(x)&&x},60000,300);
   const state=resultState(t),hasReco=/RECOMANDARE/.test(t),logicOk=(state==='NECESITĂ VERIFICARE'||state==='INDISPONIBIL'||state==='IDENTIFICARE NECESARĂ')?!hasReco:true;
   jobResults.push({id:btn.dataset.cviJob,label,state,hasReco,logicOk,text:t});
 }
 const forbidden=['Nu avem încă detalii suficiente pe vehicul','NECONFIRMAT PE VEHICUL'];const pageText=text(root),forbiddenFound=forbidden.filter(x=>pageText.includes(x));
 document.title='QA SYMPTOM · THINKCAR V7';status.textContent='Testez fluxul de simptom…';root.querySelector('[data-cvi-tab="symptom"]').click();const symptom=root.querySelector('[data-cvi="symptom"]');set(symptom,'motorul nu trage bine și accelerează greu');const symptomText=await waitFor(()=>{const t=text(root.querySelector('[data-cvi-out="symptom"]'));return t&&!/Analizez problema|VERIFIC/.test(t)&&t},30000,300);
 document.title='QA DTC WAIT · THINKCAR V7';status.textContent='Aștept modulul DTC…';const dtc=await waitFor(()=>root.querySelector('[data-cvi-dtc-code]'),20000,250);document.title='QA DTC P0420 · THINKCAR V7';set(dtc,'P0420');const dtcText=await waitFor(()=>{const t=text(root.querySelector('[data-cvi-dtc-result]'));return /P0420/.test(t)&&/catalizator|catalitic/i.test(t)&&t},10000,200);
 document.title='QA ENG WAIT · THINKCAR V7';status.textContent='Aștept formularul Engineering…';const send=await waitFor(()=>root.querySelector('[data-eng="send"]'),20000,250),email=root.querySelector('[data-eng="email"]'),phone=root.querySelector('[data-eng="phone"]'),note=root.querySelector('[data-eng="note"]');document.title='QA ENGINEERING · THINKCAR V7';set(email,'contact@cartline.ro');if(phone)set(phone,'');send.click();const engText=await waitFor(()=>{const t=text(note);return /Caz trimis către Cartline Engineering|Trimiterea nu a reușit|Introdu mai întâi codul|Emailul este obligatoriu/.test(t)&&t},30000,300);
 const engineeringOk=/Caz trimis către Cartline Engineering/.test(engText),allJobsOk=jobResults.every(x=>x.logicOk&&x.state!=='UNKNOWN'),pass=allJobsOk&&!forbiddenFound.length&&/P0420/.test(dtcText)&&engineeringOk&&!!symptomText;
 const data={status:pass?'PASS':'FAIL',vehicle:'VOLKSWAGEN Passat 2003',selected,jobCount:jobs.length,allJobsOk,forbiddenFound,jobResults,symptom:symptomText,dtc:dtcText,engineering:engText,engineeringOk,bootstrap:marks(doc,ready.w),checkedAt:new Date().toISOString()};
 status.textContent=pass?'QA PASS':'QA FAIL';report.innerHTML='<pre id="ct-v7-qa-json" style="white-space:pre-wrap">'+JSON.stringify(data,null,2).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]))+'</pre>';document.title=(pass?'QA PASS':'QA FAIL')+' · THINKCAR V7';window.__CARTLINE_V7_QA__=data;
}
run().catch(e=>{document.title='QA ERROR · '+e.message;const s=document.getElementById('ct-v7-qa-status');if(s)s.textContent='QA ERROR: '+e.message;window.__CARTLINE_V7_QA__={status:'ERROR',error:e.message,checkedAt:new Date().toISOString()}});
})();
