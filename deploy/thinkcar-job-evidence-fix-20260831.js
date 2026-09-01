(function(global){
'use strict';
const ROOT='#ct-thinkcar-v6';
const TERMS={
  oil_reset:['oil','service reset','maintenance reset','service interval','inspection reset'],
  brake_reset:['parking brake','epb','electronic parking brake','brake pad replacement','brake reset'],
  battery:['battery matching','battery registration','battery replacement','bms reset'],
  dpf:['dpf','particulate filter','regeneration','regen','soot'],
  tpms:['tpms','tire pressure','tyre pressure','pressure sensor'],
  coding:['coding','codage','ecu coding','adaptation','configuration'],
  immo:['immobilizer','immobiliser','anti-theft','key programming','key matching'],
  ev:['high voltage','high-voltage','hv battery','traction battery'],
  gearbox:['gearbox relearn','transmission relearn','gearbox adaptation','transmission adaptation'],
  clutch:['clutch matching','clutch adaptation','clutch relearn']
};
const STRICT=new Set(['brake_reset','battery','dpf','tpms','ev','gearbox','clutch']);
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function rowText(r){return norm([r&&r.functionName,r&&r.system,r&&r.subSystem,r&&r.subFunction,r&&r.function].filter(Boolean).join(' '))}
function exactRows(jobId,rows){const terms=(TERMS[jobId]||[]).map(norm);if(!terms.length)return rows||[];return (rows||[]).filter(r=>{const t=rowText(r);return terms.some(x=>t.includes(x))})}
function currentVehicle(root){return{vin:(root.querySelector('[data-cvi="vin"]')||{}).value||'',make:(root.querySelector('[data-cvi="make"]')||{}).value||'',model:(root.querySelector('[data-cvi="model"]')||{}).value||'',year:(root.querySelector('[data-cvi="year"]')||{}).value||''}}
function card(title,badge,body){return '<div class="cvi-result"><span class="cvi-badge">'+esc(badge)+'</span><h4>'+esc(title)+'</h4>'+(body||'')+'</div>'}
function rowsHtml(rows){const list=(rows||[]).filter(Boolean);if(!list.length)return'';return '<div class="cvi-function-list">'+list.slice(0,10).map(r=>'<div class="cvi-function-item">'+esc([r.functionName,r.system,r.subSystem,r.subFunction||r.function].filter(Boolean).join(' · '))+'</div>').join('')+'</div>'}
async function vehicleEvidence(provider,v,mapped,jobId){
  if(mapped.vehicleFunctionName){
    const r=await provider.getVehicleFunctions(Object.assign({},v,{functions:[mapped.vehicleFunctionName],pageSize:100}));
    const x=r&&r.results&&r.results[0],rows=x&&x.rows||[];
    return {found:!!(x&&Number(x.total||0)>0),rows,label:mapped.vehicleFunctionName,complete:true};
  }
  const proc=await provider.searchProcedures(Object.assign({},v,{functionName:'Special Functions',term:'',pageSize:100,maxPages:150,concurrency:5}));
  const rows=exactRows(jobId,proc&&proc.rows||[]);
  return {found:rows.length>0,rows,label:mapped.productFunctionName,complete:!!(proc&&proc.complete)};
}
async function productCandidates(provider,v,mapped,jobId,Rules){
  const found=[];
  const candidates=Rules.candidatesFor?Rules.candidatesFor(jobId,'consumer'):[];
  for(const c of candidates){
    try{
      const pe=await provider.getProductEvidence(Object.assign({},v,{productKey:c.productKey,functionName:mapped.productFunctionName||mapped.functionName,swId:mapped.swId||null}));
      const moduleOk=mapped.moduleRequired===false?true:!!(pe&&pe.moduleFound);
      if(pe&&pe.ok&&pe.productListed&&pe.brandFound&&moduleOk)found.push({candidate:c,evidence:pe});
    }catch(_){ }
  }
  return found;
}
function recommendationHtml(item,mapped,vehicleConfirmed){
  if(!item)return'';
  const c=item.candidate;
  const note=vehicleConfirmed
    ? 'Funcția a fost identificată pe vehicul, iar produsul include modulul necesar.'
    : 'Produsul include modulul <b>'+esc(mapped.productFunctionName||mapped.functionName)+'</b> și acoperă marca. Disponibilitatea exactă pe acest vehicul poate depinde de ECU și versiunea software.';
  return card('Tester recomandat','RECOMANDARE','<p><b>'+esc(c.name)+'</b></p><p>'+note+'</p><a class="cvi-btn" href="'+esc(c.url)+'">Vezi produsul</a>');
}
async function verify(root,jobId){
  const VI=global.CartlineVehicleIntelligence||{},provider=global.CartlineThinkcarProvider,JobCatalog=VI.JobCatalog,JobMap=global.CartlineThinkcarJobMap,Rules=global.CartlineThinkcarRecommendationRules;
  if(!provider||!JobCatalog||!JobMap||!Rules)return;
  const out=root.querySelector('[data-cvi-out="job"]'),job=JobCatalog.get(jobId),mapped=JobMap.resolve(jobId),v=currentVehicle(root);
  if(!out||!job||!mapped)return;
  if(!v.make||!v.model||!v.year){out.innerHTML=card(job.label,'IDENTIFICĂ MAȘINA','<p>Introdu VIN-ul sau completează Marca, Model și An.</p>');return}
  out.innerHTML=card(job.label,'VERIFIC','<p>Verific funcția și testerul potrivit…</p>');
  try{
    const [ev,products]=await Promise.all([vehicleEvidence(provider,v,mapped,jobId),productCandidates(provider,v,mapped,jobId,Rules)]);
    const best=products[0]||null;
    if(ev.found){
      out.innerHTML=card(job.label,'DISPONIBIL','<p>Funcția relevantă a fost găsită pentru <b>'+esc([v.make,v.model,v.year].join(' '))+'</b>.</p>'+rowsHtml(ev.rows))+recommendationHtml(best,mapped,true);
      return;
    }
    if(best&&!STRICT.has(jobId)){
      out.innerHTML=card(job.label,'TESTER POTRIVIT','<p>Pentru această lucrare, THINKCAR listează modulul necesar pe un produs care acoperă marca <b>'+esc(v.make)+'</b>.</p>')+recommendationHtml(best,mapped,false);
      return;
    }
    if(best&&STRICT.has(jobId)){
      out.innerHTML=card(job.label,'VERIFICARE COMPATIBILITATE','<p>Am găsit testere THINKCAR care includ funcția <b>'+esc(mapped.productFunctionName||job.label)+'</b>, dar nu avem încă o confirmare suficient de precisă pentru configurația acestui vehicul.</p>')+recommendationHtml(best,mapped,false);
      return;
    }
    out.innerHTML=card(job.label,'VERIFICARE COMPATIBILITATE','<p>Nu avem încă o confirmare suficient de precisă pentru această lucrare pe configurația vehiculului selectat.</p>');
  }catch(e){out.innerHTML=card(job.label,'VERIFICARE COMPATIBILITATE','<p>Verificarea automată nu a putut fi finalizată. Poți trimite cazul către Cartline Engineering din formularul de mai jos.</p>')}
}
function run(){const root=document.querySelector(ROOT);if(!root)return;root.addEventListener('click',e=>{const b=e.target.closest('[data-cvi-job]');if(!b)return;setTimeout(()=>verify(root,b.dataset.cviJob),0)},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})(window);
