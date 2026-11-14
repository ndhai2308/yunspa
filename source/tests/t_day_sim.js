const L=require('./lib.js');
const N=n=>L.CFG.staff.find(k=>k.id===n).name;
let seed=+(process.env.SEED||7);const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
const pick=a=>a[Math.floor(rnd()*a.length)];
(async()=>{
 const {b,p,errs}=await L.open();
 const setAtt=async(k,v)=>{await p.click(`[data-att="${k}"]`);await p.click(`[data-setatt="${v}"]`);await p.waitForTimeout(30)};
 // Ngày thực tế: Nhi nghỉ sáng, Thơ nghỉ sáng, My nghỉ chiều, Vi nghỉ chiều, Khánh nghỉ cả ngày
 await setAtt('k1','am');await setAtt('k3','am');await setAtt('k2','pm');await setAtt('k7','pm');await setAtt('k8','off');
 console.log('Ca hôm nay:',await p.textContent('#att').then(t=>t.replace(/\s+/g,' ').slice(0,140)));
 // Luồng khách: sáng thưa, trưa vừa, tối đông
 const svcW=['goi','goi','goi','csd','csd','body60','body60','body90','cvg','cvg60','masschan'];
 const reqs=[];
 for(let t=540;t<=1190;t+=5){ const rate=t<660?0.25:t<1020?0.35:0.8; if(rnd()<rate){ const want=rnd()<0.2?pick(['k1','k2','k3','k4','k5','k6','k7']):''; reqs.push({t,svc:pick(svcW),want}); } }
 let ok=0,moved=0,alt=0,reject=[],badSug=0,log=[];
 for(const [i,r] of reqs.entries()){
   const cus='KH'+(i+1);
   let f=await L.fill(p,{cus,svc:r.svc,time:r.t,staff:r.want});
   if(f.canSave){await p.click('#saveBtn');await p.waitForTimeout(25);ok++;continue}
   // không được → thử các gợi ý theo thứ tự: chuyển KTV, đổi KTV cùng giờ, giờ gần nhất
   const sw=await p.$('button[data-swap]');
   if(sw){await sw.click();await p.waitForTimeout(30); if(!(await p.isDisabled('#saveBtn'))){await p.click('#saveBtn');await p.waitForTimeout(25);moved++;log.push(`${cus} ${r.svc} ${L.hm(r.t)}: chuyển lịch cũ để nhận đúng giờ`);continue}}
   const sug=await L.suggestions(p);
   if(sug.length){
     const s0=sug.sort((a,b)=>Math.abs(a.t-r.t)-Math.abs(b.t-r.t))[0];
     await p.click(`#check button[data-st="${s0.st}"][data-t="${s0.t}"]`);await p.waitForTimeout(30);
     if(await p.isDisabled('#saveBtn')){badSug++;log.push(`GỢI Ý SAI: ${cus} ${r.svc} ${L.hm(s0.t)} ${N(s0.st)} | ${(await p.textContent('#check')).slice(0,80)}`);continue}
     await p.click('#saveBtn');await p.waitForTimeout(25);alt++;
     if(Math.abs(s0.t-r.t)>=60)log.push(`${cus} ${r.svc} muốn ${L.hm(r.t)}${r.want?' ('+N(r.want)+')':''} → ${L.hm(s0.t)} ${N(s0.st)}`);
     continue}
   reject.push(`${cus} ${r.svc} ${L.hm(r.t)}`);
 }
 // Giữa ngày: Duyên xin về sớm (nghỉ chiều) khi đã có lịch tối
 await setAtt('k4','pm');
 const stats=await p.textContent('#daystats');
 const st=await L.state(p);
 const cfg=st.config;
 const shiftOf=id=>(st.days[Object.keys(st.days)[0]]||{override:{}}).override[id]||'on';
 const out=st.bookings.filter(x=>{const s=shiftOf(x.staffId);return s==='off'||(s==='am'&&x.start<630)||(s==='pm'&&x.start+x.dur>1110)});
 console.log(`\nKhách: ${reqs.length} | đúng yêu cầu ${ok} | nhờ chuyển KTV ${moved} | đổi giờ/KTV theo gợi ý ${alt} | không xếp được ${reject.length}`);
 console.log('Gợi ý bấm vào mà không lưu được:',badSug);
 console.log('Một số ca phải đổi giờ ≥1 tiếng:\n  '+log.slice(0,12).join('\n  '));
 if(reject.length)console.log('Không xếp được:',reject.join(', '));
 console.log('\nKiểm tra dữ liệu (trùng/sai kỹ năng):',L.audit(st).length?L.audit(st):'OK');
 const outBefore=out.filter(x=>x.staffId!=='k4');
 console.log('Lịch nằm ngoài ca (trừ Duyên vừa đổi):',outBefore.length?outBefore.map(x=>x.customer+' '+x.staffName+' '+L.hm(x.start)):'0');
 console.log('Sau khi Duyên xin về 18:30:',stats,'| lịch của Duyên cần chuyển:',out.filter(x=>x.staffId==='k4').map(x=>x.customer+' '+L.hm(x.start)).join(', '));
 // Khánh nghỉ: có lịch nào của Khánh?
 console.log('Lịch của Khánh (nghỉ):',st.bookings.filter(x=>x.staffId==='k8').length);
 const perStaff={};st.bookings.forEach(x=>perStaff[x.staffName]=(perStaff[x.staffName]||0)+1);console.log('Số khách mỗi KTV:',JSON.stringify(perStaff));
 console.log('JS errors:',errs);
 await p.screenshot({path:'/tmp/daysim.png',fullPage:false});
 await b.close();
})();
