(function(){
'use strict';
const ROOT='#ct-thinkcar-v6';
function apply(){
  const root=document.querySelector(ROOT);if(!root)return;
  if(!document.getElementById('ct-selector-ui-refine-20260831')){
    const s=document.createElement('style');s.id='ct-selector-ui-refine-20260831';s.textContent=`
body.page-id-10709{background:#08111e!important}
#ct-thinkcar-v6 .cvi-selector{padding:24px 18px 30px!important;border-radius:0!important;border-left:0!important;border-right:0!important;background:linear-gradient(145deg,#07111d 0%,#0a1624 64%,#0c1928 100%)!important}
#ct-thinkcar-v6 .cvi-kicker{font-size:12px!important;letter-spacing:.11em!important;margin-bottom:5px!important}
#ct-thinkcar-v6 .cvi-selector>h2{font-size:clamp(27px,2.35vw,38px)!important;line-height:1.08!important;letter-spacing:-.025em!important;margin:0!important;max-width:980px!important}
#ct-thinkcar-v6 .cvi-hero-subtitle{display:block!important;max-width:900px;margin:8px 0 18px!important;color:#9eafc3!important;font-size:15px;line-height:1.5}
#ct-thinkcar-v6 .cvi-card{border-color:#26374c!important;background:linear-gradient(180deg,rgba(16,29,45,.96),rgba(10,21,34,.96))!important;box-shadow:0 12px 30px rgba(0,0,0,.14);margin-top:12px!important}
#ct-thinkcar-v6 .cvi-card>h3{font-size:18px!important;letter-spacing:-.01em!important}
#ct-thinkcar-v6 .cvi-card:hover{border-color:rgba(244,122,22,.62)!important;box-shadow:0 13px 30px rgba(0,0,0,.2),0 0 0 1px rgba(244,122,22,.08)!important}
#ct-thinkcar-v6 .cvi-tabs{gap:10px!important;margin:12px 0 14px!important}
#ct-thinkcar-v6 .cvi-tab{min-height:46px!important;text-align:center!important;font-weight:800!important;border-color:#314157!important;background:#0e1b2b!important;box-shadow:none!important;position:relative!important;overflow:hidden!important}
#ct-thinkcar-v6 .cvi-tab:hover{border-color:#f47a16!important;transform:translateY(-3px)!important;box-shadow:0 8px 20px rgba(0,0,0,.20)!important}
#ct-thinkcar-v6 .cvi-tab.on{color:#fff!important;border-color:#f47a16!important;background:linear-gradient(180deg,#18283a,#132235)!important;box-shadow:0 0 0 1px rgba(244,122,22,.18),0 8px 22px rgba(0,0,0,.18)!important}
#ct-thinkcar-v6 .cvi-tab.on:after{content:'';position:absolute;left:18px;right:18px;bottom:0;height:3px;border-radius:3px 3px 0 0;background:#f47a16}
#ct-thinkcar-v6 [data-cvi-vin-actions] .cvi-btn{background:transparent!important;border-color:#53657b!important}
#ct-thinkcar-v6 [data-cvi-vin-actions] .cvi-btn:hover{border-color:#f47a16!important;background:rgba(244,122,22,.08)!important}
#ct-thinkcar-v6 .cvi-engineering{border-top:2px solid rgba(244,122,22,.38)!important}
#ct-thinkcar-v6 .cvi-engineering>h3:after{content:' · opțional';font-size:12px;font-weight:700;color:#9eafc3}
@media(max-width:760px){#ct-thinkcar-v6 .cvi-selector{padding:18px 8px 24px!important}#ct-thinkcar-v6 .cvi-selector>h2{font-size:27px!important}#ct-thinkcar-v6 .cvi-hero-subtitle{font-size:14px;margin-bottom:14px!important}#ct-thinkcar-v6 .cvi-tab{text-align:left!important}}
`;
    document.head.appendChild(s);
  }
  const h2=root.querySelector('.cvi-selector>h2');if(h2){h2.textContent='Găsește testerul potrivit pentru mașina și lucrarea ta';let sub=root.querySelector('.cvi-hero-subtitle');if(!sub){sub=document.createElement('p');sub.className='cvi-hero-subtitle';h2.insertAdjacentElement('afterend',sub)}sub.textContent='Identifică vehiculul, descrie problema sau alege lucrarea. Selectorul verifică funcțiile relevante și îți arată testerul THINKCAR potrivit pe baza acoperirii disponibile.'}
}
let n=0;const timer=setInterval(()=>{apply();if(++n>20)clearInterval(timer)},150);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
