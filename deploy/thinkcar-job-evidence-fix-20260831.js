(function(global){
'use strict';
const ROOT='#ct-thinkcar-v6';
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function currentVehicle(root){return{vin:(root.querySelector('[data-cvi="vin"]')||{}).value||'',make:(root.querySelector('[data-cvi="make"]')||{}).value||'',model:(root.querySelector('[data-cvi="model"]')||{}).value||'',year:(root.querySelector('[data-cvi="year"]')||{}).value||''}}
function card(title,badge,body){return '<div class="cvi-result"><span class="cvi-badge">'+esc(badge)+'</span><h4>'+esc(title)+'</h4>'+(body||'')+'</div>'}
function rowsHtml(rows){const list=(rows||[]).filter(Boolean);if(!list.length)return'';return '<div class="cvi-function-list">'+list.slice(0,12).map(r=>'<div class="cvi-function-item">'+esc([r.functionName,r.system,r.subSystem,r.subFunction||r.function].filter(Boolean).join(' · '))+'</div>').join('')+'</div>'}
async function vehicleEvidence(provider,v,mapped){
  if(mapped.vehicleFunctionName){
    const r=await provider.getVehicleFunctions(Object.assign({},v,{functions:[mapped.vehicleFunctionName],pageSize:100}));
    const x=r&&r.results&&r.results[0];
    return {found:!!(x&&Number(x.total||0)>0),rows:x&&x.rows||[],label:mapped.vehicleFunctionName};
  }
  const proc=await provider.searchProcedures(Object.assign({},v,{functionName:'Special Functions',term:mapped.procedureTerm||mapped.productFunctionName,pageSize:100,maxPages:150,concurrency:5}));
  return {found:!!(proc&&proc.rows&&proc.rows.length),rows:proc&&proc.rows||[],label:mapped.productFunctionName};
}
async function verify(root,jobId){
  const VI=global.CartlineVehicleIntelligence||{},provider=global.CartlineThinkcarProvider,JobCatalog=VI.JobCatalog,JobMap=global.CartlineThinkcarJobMap,Rules=global.CartlineThinkcarRecommendationRules;
  if(!provider||!JobCatalog||!JobMap||!Rules)return;
  const out=root.querySelector('[data-cvi-out="job"]'),job=JobCatalog.get(jobId),mapped=JobMap.resolve(jobId),v=currentVehicle(root);
  if(!out||!job||!mapped)return;
  if(!v.make||!v.model||!v.year){out.innerHTML=card(job.label,'IDENTIFICARE NECESARĂ','<p>Identifică vehiculul prin VIN sau introdu Marca / Model / An.</p>');return}
  out.innerHTML=card(job.label,'VERIFIC','<p>Verific funcția pentru <b>'+esc([v.make,v.model,v.year].join(' '))+'</b>…</p>');
  try{
    const ev=await vehicleEvidence(provider,v,mapped);
    let best=null;
    const candidates=Rules.candidatesFor?Rules.candidatesFor(jobId,'consumer'):[];
    for(const c of candidates){
      const pe=await provider.getProductEvidence(Object.assign({},v,{productKey:c.productKey,functionName:mapped.productFunctionName||mapped.functionName,swId:mapped.swId||null}));
      const moduleOk=mapped.moduleRequired===false?true:!!(pe&&pe.moduleFound);
      if(pe&&pe.ok&&pe.productListed&&pe.brandFound&&moduleOk){best=c;break}
    }
    if(ev.found){
      let html=card(job.label,'FUNCȚIE GĂSITĂ','<p>Funcția a fost găsită în datele THINKCAR pentru <b>'+esc([v.make,v.model,v.year].join(' '))+'</b>.</p>'+rowsHtml(ev.rows));
      if(best)html+=card('Tester recomandat','RECOMANDARE','<p><b>'+esc(best.name)+'</b></p><p>Recomandarea este făcută numai după confirmarea funcției pe vehicul și a acoperirii produsului.</p><a class="cvi-btn" href="'+esc(best.url)+'">Vezi produsul</a>');
      else html+=card('Tester','VERIFICARE NECESARĂ','<p>Funcția este confirmată pe vehicul, dar nu avem încă dovadă suficientă pentru a lega sigur un anumit tester de această funcție.</p>');
      out.innerHTML=html;
    }else{
      out.innerHTML=card(job.label,'NECONFIRMAT PE VEHICUL','<p>Vehiculul este identificat complet ca <b>'+esc([v.make,v.model,v.year].join(' '))+'</b>, dar această funcție nu a fost găsită în datele THINKCAR disponibile pentru vehicul. Asta nu înseamnă că lipsesc datele mașinii.</p>');
    }
  }catch(e){out.innerHTML=card(job.label,'INDISPONIBIL','<p>Vehiculul este identificat, dar sursa THINKCAR nu a răspuns pentru verificarea acestei funcții.</p>')}
}
function run(){const root=document.querySelector(ROOT);if(!root)return;root.addEventListener('click',e=>{const b=e.target.closest('[data-cvi-job]');if(!b)return;setTimeout(()=>verify(root,b.dataset.cviJob),0)},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})(window);
