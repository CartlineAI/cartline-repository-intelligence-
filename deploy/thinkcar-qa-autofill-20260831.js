(function(){
'use strict';
const p=new URLSearchParams(location.search),mode=p.get('qa_case');if(!mode)return;
function set(el,value,eventName){if(!el)return;el.value=value;el.dispatchEvent(new Event(eventName||'input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function baseVehicle(root){set(root.querySelector('[data-cvi="make"]'),'VOLKSWAGEN');set(root.querySelector('[data-cvi="model"]'),'Passat');set(root.querySelector('[data-cvi="year"]'),'2003','change')}
function settled(text){return /FUNCȚIE GĂSITĂ|NECONFIRMAT PE VEHICUL|INDISPONIBIL|IDENTIFICARE NECESARĂ|VERIFICARE NECESARĂ/.test(text)&&!/Verific funcția|Verific compatibilitatea/.test(text)}
async function allJobs(root){
  baseVehicle(root);await sleep(400);
  root.querySelector('[data-cvi-tab="jobs"]')?.click();await sleep(200);
  const buttons=[...root.querySelectorAll('[data-cvi-job]')],out=root.querySelector('[data-cvi-out="job"]'),results=[];
  for(const b of buttons){
    b.click();let text='';
    for(let i=0;i<100;i++){await sleep(250);text=(out&&out.innerText||'').trim();if(settled(text))break}
    const oldBad=/Nu avem încă detalii suficiente pe vehicul/i.test(text);
    results.push({id:b.dataset.cviJob,label:(b.querySelector('b')||b).textContent.trim(),text,oldBad});
  }
  let qa=document.getElementById('ct-qa-all-jobs');if(!qa){qa=document.createElement('section');qa.id='ct-qa-all-jobs';qa.style.cssText='margin:20px;padding:18px;border:2px solid #f47a16;background:#07111d;color:#fff;position:relative;z-index:9999';root.appendChild(qa)}
  const pass=results.length===buttons.length&&results.every(x=>!x.oldBad&&x.text&&settled(x.text));
  qa.innerHTML='<h3>QA ALL JOBS '+(pass?'PASS':'FAIL')+'</h3>'+results.map(x=>'<p data-qa-job="'+x.id+'"><b>QA JOB | '+x.id+' | '+x.label+' | '+(x.oldBad?'OLD_BAD_MESSAGE':'OK')+'</b><br>'+x.text.replace(/</g,'&lt;')+'</p>').join('');
  qa.dataset.qaStatus=pass?'PASS':'FAIL';document.title='QA ALL JOBS '+(pass?'PASS':'FAIL')+' · '+document.title;
}
function run(){const root=document.querySelector('#ct-thinkcar-v6');if(!root)return false;
  if(mode==='alljobs'){allJobs(root);return true}
  const make=root.querySelector('[data-cvi="make"]'),model=root.querySelector('[data-cvi="model"]'),year=root.querySelector('[data-cvi="year"]');
  if(mode==='accel'){set(make,'VOLKSWAGEN');set(model,'Passat');set(year,'2003','change');set(root.querySelector('[data-cvi="symptom"]'),'masina nu accelereaza liniar');return true}
  if(mode==='dtc'||mode==='submit'){set(make,'VOLKSWAGEN');set(model,'Passat');set(year,'2003','change');const dtc=root.querySelector('[data-cvi-dtc-code]');set(dtc,'P0420');if(mode==='submit'){setTimeout(()=>{const email=root.querySelector('[data-eng="email"]'),send=root.querySelector('[data-eng="send"]');set(email,p.get('qa_email')||'contact@cartline.ro');if(send)send.click()},1200)}return true}
  return true;
}
let n=0;const t=setInterval(()=>{if(run()||++n>30)clearInterval(t)},200);
})();
