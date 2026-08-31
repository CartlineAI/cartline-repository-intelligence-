(function(){
'use strict';
function install(){
  const p=window.CartlineThinkcarProvider,A=window.CartlineThinkcarAdapter;if(!p||!A||p.__ctParallelFunctions)return false;
  const cache=new Map();
  const key=(x,name)=>[A.packageId(x.make),String(x.model||'').toUpperCase(),x.year,name,x.pageSize||100].join('|');
  async function load(x,name){const k=key(x,name);if(cache.has(k))return cache.get(k);const promise=A.vehicleFunctionEvidence({make:x.make,model:x.model,year:x.year,functionName:name,page:1,pageSize:x.pageSize||100,timeoutMs:Math.max(2000,Math.min(8000,Number(x.timeoutMs||6000)))});cache.set(k,promise);const r=await promise;if(!r.ok)cache.delete(k);return r}
  p.getVehicleFunctions=async function(input){const x=input||{},raw=x.functions&&x.functions.length?x.functions:['Live Data','Active Test','Special Functions'],names=[...new Set(raw.map(v=>String(v||'').trim()).filter(Boolean))],limit=Math.min(6,names.length),results=new Array(names.length);let next=0;async function worker(){while(true){const i=next++;if(i>=names.length)return;const name=names[i],r=await load(x,name);results[i]={functionName:name,ok:r.ok,state:r.state,total:r.total,rows:r.normalizedRows||[],rawRows:r.rows||[],query:r.query||null,error:r.error||null}}}await Promise.all(Array.from({length:limit},worker));return{provider:'thinkcar',ok:results.some(r=>r&&r.ok),results}}
  p.__ctParallelFunctions=true;return true;
}
let n=0;const t=setInterval(()=>{if(install()||++n>30)clearInterval(t)},100);install();
})();
