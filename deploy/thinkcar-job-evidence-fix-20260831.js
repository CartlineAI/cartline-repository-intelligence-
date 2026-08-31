(function(global){
'use strict';
const ROOT='#ct-thinkcar-v6';
const SPECIAL=new Set(['oil_reset','brake_reset','battery','dpf','tpms','coding','immo','ev','gearbox','clutch']);
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function currentVehicle(root){return{vin:(root.querySelector('[data-cvi="vin"]')||{}).value||'',make:(root.querySelector('[data-cvi="make"]')||{}).value||'',model:(root.querySelector('[data-cvi="model"]')||{}).value||'',year:(root.querySelector('[data-cvi="year"]')||{}).value||''}}
function card(title,badge,body){return '<div class="cvi-result"><span class="cvi-badge">'+esc(badge)+'</span><h4>'+esc(title)+'</h4>'+(body||'')+'</div>'}
async function verify(root,jobId){
  if(!SPECIAL.has(jobId))return;
  const VI=global.CartlineVehicleIntelligence||{},provider=global.CartlineThinkcarProvider,JobCatalog=VI.JobCatalog,JobMap=global.CartlineThinkcarJobMap,Rules=global.CartlineThinkcarRecommendationRules;
  if(!provider||!JobCatalog||!JobMap||!Rules)return;
  const out=root.querySelector('[data-cvi-out="job"]'),job=JobCatalog.get(jobId),mapped=JobMap.resolve(jobId),v=currentVehicle(root);
  if(!out||!job||!mapped||!v.make||!v.model||!v.year)return;
  out.innerHTML=card(job.label,'VERIFIC','<p>Verific funcția pe vehiculul identificat…</p>');
  try{
    const proc=await provider.searchProcedures(Object.assign({},v,{functionName:'Special Functions',term:mapped.procedureTerm||mapped.productFunctionName,pageSize:100,maxPages:150,concurrency:5}));
    const rows=proc&&proc.rows||[];
    let best=null;
    const candidates=Rules.candidatesFor?Rules.candidatesFor(jobId,'consumer'):[];
    for(const c of candidates){
      const pe=await provider.getProductEvidence(Object.assign({},v,{productKey:c.productKey,functionName:mapped.productFunctionName,swId:mapped.swId||null}));
      if(pe&&pe.ok&&pe.productListed&&pe.brandFound&&pe.moduleFound){best=c;break}
    }
    if(rows.length){
      const list='<div class="cvi-function-list">'+rows.slice(0,12).map(r=>'<div class="cvi-function-item">'+esc([r.functionName,r.system,r.subSystem,r.subFunction].filter(Boolean).join(' · '))+'</div>').join('')+'</div>';
      out.innerHTML=card(job.label,'FUNCȚIE GĂSITĂ','<p>Funcția relevantă a fost găsită în datele THINKCAR pentru <b>'+esc([v.make,v.model,v.year].join(' '))+'</b>.</p>'+list)+(best?card('Tester recomandat','RECOMANDARE','<p><b>'+esc(best.name)+'</b></p><p>Produsul este listat de THINKCAR pentru marcă și include modulul <b>'+esc(mapped.productFunctionName)+'</b>.</p><a class="cvi-btn" href="'+esc(best.url)+'">Vezi produsul</a>'):'');
    }else{
      out.innerHTML=card(job.label,'NECONFIRMAT PE VEHICUL','<p>Vehiculul este identificat, dar nu am găsit în datele publice THINKCAR o procedură suficient de clară pentru această funcție pe <b>'+esc([v.make,v.model,v.year].join(' '))+'</b>. Nu confundăm lipsa dovezii cu lipsa datelor vehiculului.</p>');
    }
  }catch(e){out.innerHTML=card(job.label,'INDISPONIBIL','<p>Vehiculul este identificat, dar sursa THINKCAR nu a răspuns pentru verificarea acestei funcții.</p>')}
}
function run(){const root=document.querySelector(ROOT);if(!root)return;root.addEventListener('click',e=>{const b=e.target.closest('[data-cvi-job]');if(!b)return;const id=b.dataset.cviJob;if(SPECIAL.has(id))setTimeout(()=>verify(root,id),0)},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})(window);
