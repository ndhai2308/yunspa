const L=require('./lib.js');
const results=[];function chk(name,cond,info){results.push([cond?'PASS':'FAIL',name,info||''])}
(async()=>{
 let {b,p,errs}=await L.open();
 // 1. ranh gioi: Nhi goi 9:00 giu den 9:55
 await L.book(p,{cus:'A',svc:'goi',time:540,staff:'k1'});
 let r=await L.fill(p,{svc:'goi',time:590,staff:'k1'}); chk('Trùng 5 phút (9:50, Nhi đang dọn đến 9:55) bị chặn',!r.canSave&&r.check.includes('đang bận'),r.check.slice(0,80));
 r=await L.fill(p,{svc:'goi',time:595,staff:'k1'}); chk('Sát giờ 9:55 (vừa dọn xong) cho phép',r.canSave);
 let s=await L.suggestions(p);
 r=await L.fill(p,{svc:'goi',time:540,staff:'k1'}); s=await L.suggestions(p);
 chk('Gợi ý cho Nhi khi trùng: giờ gần nhất 9:55',s[0]&&s[0].t===595&&s[0].st==='k1',JSON.stringify(s.slice(0,3)));
 // 2. sai ky nang
 r=await L.fill(p,{svc:'body60',time:600,staff:'k5'}); s=await L.suggestions(p);
 const CFG=L.CFG;const ok=s.every(x=>CFG.staff.find(k=>k.id===x.st).skills.includes('body60'));
 chk('Trang + Body 60 → cảnh báo sai kỹ năng',!r.canSave&&r.check.includes('không làm'));
 chk('Gợi ý chỉ gồm KTV làm được Body 60',s.length>0&&ok,s.map(x=>x.st).join(','));
 r=await L.fill(p,{svc:'body90',time:600,staff:'k8'}); chk('Khánh + Body 90 → cảnh báo',r.check.includes('không làm'));
 // 3. nang co: khong ai lam
 r=await L.fill(p,{svc:'nangco',time:600,staff:''}); chk('Nâng cơ (không ai làm) → báo không có KTV',!r.canSave&&r.check.includes('Không có KTV'));
 // 4. tu dong khong xep KTV sai ky nang
 for(let i=0;i<10;i++) await L.book(p,{cus:'B'+i,svc:'body90',time:720,staff:''});
 let st=await L.state(p); const b90=st.bookings.filter(x=>x.serviceId==='body90'&&x.start===720);
 chk('Body 90 lúc 12:00 tự động: chỉ 4 người làm được → xếp đúng 4',b90.length===4,b90.map(x=>x.staffName).join(','));
 r=await L.fill(p,{svc:'body90',time:720,staff:''}); s=await L.suggestions(p);
 chk('Người thứ 5 bị chặn và gợi ý giờ khác',!r.canSave&&s.length>0,s.slice(0,3).map(x=>L.hm(x.t)+' '+x.st).join(' | '));
 // 5. sua lich: doi 5p khong tu trung voi chinh no
 await p.click('[data-edit]'); await p.waitForTimeout(50);
 const tsel=await p.inputValue('#f-time'); await p.selectOption('#f-time',String(+tsel+5)); await p.waitForTimeout(30);
 r={check:await p.textContent('#check'),canSave:!(await p.isDisabled('#saveBtn'))};
 chk('Sửa lịch lùi 5 phút không bị báo trùng với chính nó',r.canSave,r.check.replace(/\s+/g,' ').slice(0,80));
 await p.click('#cancelEdit');
 // 6. KTV nghi
 await p.click('[data-att=\"k4\"]'); await p.click('[data-setatt=\"off\"]'); await p.waitForTimeout(50);
 r=await L.fill(p,{svc:'body90',time:900,staff:''}); 
 for(let i=0;i<5;i++) await L.book(p,{cus:'C'+i,svc:'body90',time:900,staff:''});
 st=await L.state(p); const c=st.bookings.filter(x=>x.customer.startsWith('C'));
 chk('Duyên nghỉ → Body 90 lúc 15:00 không xếp cho Duyên',!c.some(x=>x.staffId==='k4')&&c.length===3,c.map(x=>x.staffName).join(','));
 // 7. sat gio dong cua
 r=await L.fill(p,{svc:'body90',time:1190,staff:'k1'}); chk('19:50 Body 90 → cho đặt nhưng nhắc quá giờ đóng cửa',r.canSave&&r.check.includes('sau giờ đóng cửa'),r.check.slice(0,90));
 const times=await p.$$eval('#f-time option',o=>o.map(x=>x.value).filter(Boolean).map(Number));
 chk('Không cho chọn giờ sau 19:50',Math.max(...times)===1190);
 chk('Không lỗi JavaScript',errs.length===0,errs.join(';'));
 chk('Dữ liệu không có lịch trùng / sai kỹ năng',L.audit(await L.state(p)).length===0,L.audit(await L.state(p)).join(';'));
 await b.close();
 for(const r of results)console.log(r.join(' | '));
})();
