const { chromium } = require((()=>{for(const m of ['/opt/node-tools/node_modules/playwright','/opt/npm-tools/node_modules/playwright','playwright'])try{return require.resolve(m)}catch(e){}})());
const CFG=require('./cfg.js');
const FILE=process.argv[2]||'file:///home/claude/yunspa/index.html';
async function open(extra){
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1400,height:950}});
  await p.clock.install({time:new Date('2026-11-14T08:00:00+07:00')});
  await p.addInitScript(([c,e])=>{ if(!sessionStorage.getItem('init')){sessionStorage.setItem('init','1');localStorage.setItem('yunspa-booking-v1',JSON.stringify(Object.assign({config:c,bookings:[],days:{}},e||{})));}},[CFG,extra]);
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(FILE); await p.waitForTimeout(300);
  await p.evaluate(()=>{const g=document.getElementById('gate');if(g)g.classList.add('ok')}); // bỏ qua màn đăng nhập khi thử
  return {b,p,errs};
}
async function fill(p,{cus='KH',svc,time,staff=''}){
  await p.fill('#f-cus',cus); await p.selectOption('#f-svc',svc); await p.selectOption('#f-time',String(time));
  await p.selectOption('#f-staff',staff); await p.waitForTimeout(30);
  return {check:(await p.textContent('#check')).replace(/\s+/g,' ').trim(), canSave:!(await p.isDisabled('#saveBtn'))};
}
async function book(p,o){const r=await fill(p,o); if(r.canSave){await p.click('#saveBtn');await p.waitForTimeout(30);} return r;}
async function state(p){return p.evaluate(()=>JSON.parse(localStorage.getItem('yunspa-booking-v1')))}
async function suggestions(p){return p.$$eval('#check button[data-st]',bs=>bs.map(b=>({st:b.dataset.st,t:+b.dataset.t})))}
function audit(st){ // invariants
  const probs=[];const cfg=st.config;const B=st.bookings;
  for(const a of B){const k=cfg.staff.find(s=>s.id===a.staffId);
    if(!k)probs.push('unknown staff '+a.customer);
    else if(!k.skills.includes(a.serviceId))probs.push(`${a.customer}: ${k.name} không làm ${a.serviceId}`);
    for(const b of B) if(a.id<b.id&&a.staffId===b.staffId&&a.date===b.date&&a.start<b.start+b.dur+b.buf&&b.start<a.start+a.dur+a.buf)probs.push(`TRÙNG ${k&&k.name}: ${a.customer} & ${b.customer}`);
  }
  return probs;
}
const hm=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
module.exports={open,fill,book,state,suggestions,audit,hm,CFG};
