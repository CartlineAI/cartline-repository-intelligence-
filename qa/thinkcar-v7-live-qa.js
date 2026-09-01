(function(){
'use strict';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const now=()=>Date.now();
function text(el){return (el&&el.textContent||'').replace(/\s+/g,' ').trim()}
function set(el,value){if(!el)throw new Error('FIELD_MISSING');el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}
async function waitFor(fn,timeout=30000,step=250){const start=now();let last;while(now()-start<timeout){try{last=fn();if(last)return last}catch(e){last=e}await sleep(step)}throw last instanceof Error?last:new Error('TIMEOUT')}
function settledJob(t){return /CONFIRMAT ÎN DATELE THINKCAR|TESTER GĂSIT|FUNCȚIE IDENTIFICATĂ|NECESITĂ VERIFICARE|INDISPONIBIL|IDENTIFICARE NECESARĂ/.test(t)&&!/Verific funcția|Verific compatibilitatea|VERIFIC\b/.test(t)}
function resultState(t){for(const s of ['CONFIRMAT ÎN DATELE THINKCAR','TESTER GĂSIT','FUNCȚIE IDENTIFICATĂ','NECESITĂ VERIFICARE','INDISPONIBIL','IDENTIFICARE NECESARĂ'])if(t.includes(s))return s;return 'UNKNOWN'}
async function run(){
 const host=document.getElementById('ct-v7-qa-host')||document.body;
 host.innerHTML='<h1>THINKCAR V7 LIVE QA</h1><p id="ct-v7-qa-status">Pornesc verificarea…</p><div id="ct-v7-qa-report"></div><iframe id="ct-v7-qa-frame" style="width:100%;height:1100px;border:1px solid #ccc" src="/selector-thinkcar/?qa_isolated='+Date.now()+'"></iframe>';
 const status=document.getElementById('ct-v7-qa-status'),report=document.getElementById('ct-v7-qa-report'),frame=document.getElementById('ct-v7-qa-frame');
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('IFRAME_LOAD_TIMEOUT')),30000);frame.onload=()=>{clearTimeout(timer);resolve()}});
 const doc=frame.contentDocument;await waitFor(()=>doc.querySelector('#ct-thinkcar-v6 [data-cvi="make"]'));
 const root=doc.querySelector('#ct-thinkcar-v6');
 set(root.querySelector('[data-cvi="make"]'),'VOLKSWAGEN');set(root.querySelector('[data-cvi="model"]'),'Passat');set(root.querySelector('[data-cvi="year"]'),'2003');await sleep(500);
 root.querySelector('[data-cvi-tab="jobs"]').click();await sleep(250);
 const jobs=[...root.querySelectorAll('[data-cvi-job]')],jobResults=[];
 if(jobs.length!==12)throw new Error('JOB_BUTTON_COUNT_'+jobs.length);
 for(const btn of jobs){status.textContent='Testez: '+text(btn.querySelector('b')||btn);btn.click();const out=root.querySelector('[data-cvi-out="job"]');const t=await waitFor(()=>{const x=text(out);return settledJob(x)&&x},45000,300);const state=resultState(t),hasReco=/RECOMANDARE/.test(t),logicOk=(state==='NECESITĂ VERIFICARE'||state==='INDISPONIBIL'||state==='IDENTIFICARE NECESARĂ')?!hasReco:true;jobResults.push({id:btn.dataset.cviJob,label:text(btn.querySelector('b')||btn),state,hasReco,logicOk,text:t});}
 const forbidden=['Nu avem încă detalii suficiente pe vehicul','NECONFIRMAT PE VEHICUL'];const pageText=text(root);const forbiddenFound=forbidden.filter(x=>pageText.includes(x));
 root.querySelector('[data-cvi-tab="symptom"]').click();const symptom=root.querySelector('[data-cvi="symptom"]');set(symptom,'motorul nu trage bine și accelerează greu');const symptomText=await waitFor(()=>{const t=text(root.querySelector('[data-cvi-out="symptom"]'));return t&&!/Analizez problema|VERIFIC/.test(t)&&t},30000,300);
 const dtc=await waitFor(()=>root.querySelector('[data-cvi-dtc-code]'),10000);set(dtc,'P0420');const dtcText=await waitFor(()=>{const t=text(root.querySelector('[data-cvi-dtc-result]'));return /P0420/.test(t)&&/catalizator|catalitic/i.test(t)&&t},10000,200);
 const email=await waitFor(()=>root.querySelector('[data-eng="email"]'),10000),phone=root.querySelector('[data-eng="phone"]'),send=root.querySelector('[data-eng="send"]'),note=root.querySelector('[data-eng="note"]');set(email,'contact@cartline.ro');if(phone)set(phone,'');send.click();const engText=await waitFor(()=>{const t=text(note);return /Caz trimis către Cartline Engineering|Trimiterea nu a reușit|Introdu mai întâi codul|Emailul este obligatoriu/.test(t)&&t},30000,300);
 const engineeringOk=/Caz trimis către Cartline Engineering/.test(engText);
 const allJobsOk=jobResults.every(x=>x.logicOk&&x.state!=='UNKNOWN');const pass=allJobsOk&&!forbiddenFound.length&&/P0420/.test(dtcText)&&engineeringOk&&!!symptomText;
 const data={status:pass?'PASS':'FAIL',vehicle:'VOLKSWAGEN Passat 2003',jobCount:jobs.length,allJobsOk,forbiddenFound,jobResults,symptom:symptomText,dtc:dtcText,engineering:engText,engineeringOk,checkedAt:new Date().toISOString()};
 status.textContent=pass?'QA PASS':'QA FAIL';report.innerHTML='<pre id="ct-v7-qa-json" style="white-space:pre-wrap">'+JSON.stringify(data,null,2).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]))+'</pre>';document.title=(pass?'QA PASS':'QA FAIL')+' · THINKCAR V7';window.__CARTLINE_V7_QA__=data;
}
run().catch(e=>{document.title='QA ERROR · THINKCAR V7';const s=document.getElementById('ct-v7-qa-status');if(s)s.textContent='QA ERROR: '+e.message;window.__CARTLINE_V7_QA__={status:'ERROR',error:e.message,checkedAt:new Date().toISOString()}});
})();
