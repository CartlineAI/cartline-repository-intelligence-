(function(){
'use strict';
const p=new URLSearchParams(location.search),mode=p.get('qa_case');if(!mode)return;
function set(el,value,eventName){if(!el)return;el.value=value;el.dispatchEvent(new Event(eventName||'input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}
function run(){const root=document.querySelector('#ct-thinkcar-v6');if(!root)return false;
  const make=root.querySelector('[data-cvi="make"]'),model=root.querySelector('[data-cvi="model"]'),year=root.querySelector('[data-cvi="year"]');
  if(mode==='accel'){set(make,'VOLKSWAGEN');set(model,'Passat');set(year,'2003','change');set(root.querySelector('[data-cvi="symptom"]'),'masina nu accelereaza liniar');return true}
  if(mode==='dtc'||mode==='submit'){set(make,'VOLKSWAGEN');set(model,'Passat');set(year,'2003','change');const dtc=root.querySelector('[data-cvi-dtc-code]');set(dtc,'P0420');if(mode==='submit'){setTimeout(()=>{const email=root.querySelector('[data-eng="email"]'),send=root.querySelector('[data-eng="send"]');set(email,p.get('qa_email')||'contact@cartline.ro');if(send)send.click()},1200)}return true}
  return true;
}
let n=0;const t=setInterval(()=>{if(run()||++n>30)clearInterval(t)},200);
})();
