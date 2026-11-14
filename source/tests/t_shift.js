const L=require('./lib.js');const res=[];const chk=(n,c,i)=>res.push([c?'PASS':'FAIL',n,i||'']);
(async()=>{const {b,p,errs}=await L.open();
 const setAtt=async(k,v)=>{await p.click(`[data-att="${k}"]`);await p.click(`[data-setatt="${v}"]`);await p.waitForTimeout(40)};
 await setAtt('k1','am'); // Nhi nghi sang
 await setAtt('k2','pm'); // My nghi chieu
 let r=await L.fill(p,{svc:'goi',time:600,staff:'k1'}); let s=await L.suggestions(p);
 chk('Nhi nghỉ sáng, đặt 10:00 → chặn',!r.canSave&&r.check.includes('nghỉ sáng'),r.check.slice(0,60));
 chk('Gợi ý cho Nhi bắt đầu từ 10:30',s.some(x=>x.st==='k1'&&x.t===630)&&s.filter(x=>x.st==='k1').every(x=>x.t>=630),JSON.stringify(s.slice(0,4)));
 r=await L.fill(p,{svc:'goi',time:630,staff:'k1'}); chk('Nhi 10:30 → cho đặt',r.canSave);
 r=await L.fill(p,{svc:'body90',time:1050,staff:'k2'}); chk('My nghỉ chiều, Body 90 lúc 17:30 (xong 19:10) → chặn',!r.canSave&&r.check.includes('nghỉ chiều'),r.check.slice(0,90));
 s=await L.suggestions(p); chk('Gợi ý cho My đều xong trước 18:30',s.filter(x=>x.st==='k2').every(x=>x.t+100<=1110),JSON.stringify(s.filter(x=>x.st==='k2')));
 r=await L.fill(p,{svc:'goi',time:1065,staff:'k2'}); chk('My gội 17:45 (xong 18:30 đúng giờ về) → cho đặt',r.canSave);
 r=await L.fill(p,{svc:'goi',time:1070,staff:'k2'}); chk('My gội 17:50 (xong 18:35) → chặn',!r.canSave);
 // tu dong khong xep nhi buoi sang
 for(let i=0;i<8;i++)await L.book(p,{cus:'S'+i,svc:'body90',time:540,staff:''});
 let st=await L.state(p);const m=st.bookings.filter(x=>x.customer[0]==='S');
 chk('9:00 Body 90 tự động: không xếp Nhi (nghỉ sáng)',!m.some(x=>x.staffId==='k1')&&m.length===3,m.map(x=>x.staffName).join(','));
 for(let i=0;i<8;i++)await L.book(p,{cus:'E'+i,svc:'body90',time:1080,staff:''});
 st=await L.state(p);const e=st.bookings.filter(x=>x.customer[0]==='E');
 chk('18:00 Body 90 tự động: không xếp My (về 18:30)',!e.some(x=>x.staffId==='k2'),e.map(x=>x.staffName).join(','));
 // lich co san bi ngoai ca khi doi trang thai
 await L.book(p,{cus:'Sớm',svc:'goi',time:545,staff:'k3'});
 await setAtt('k3','am');
 const stats=await p.textContent('#daystats');chk('Đổi Thơ sang nghỉ sáng khi đã có lịch 9:05 → cảnh báo cần chuyển',stats.includes('ngoài giờ'),stats);
 const opts=await p.$$eval('#f-staff option',o=>o.map(x=>x.textContent));
 chk('Ô chọn KTV ghi giờ vào/về',opts.join('|').includes('vào 10:30')||opts.join('|').includes('nghỉ sáng'),opts.slice(0,4).join(' / '));
 chk('Không lỗi JS',errs.length===0,errs.join(';'));
 await p.screenshot({path:'/tmp/shift.png',clip:{x:0,y:0,width:1400,height:700}});
 await b.close();for(const x of res)console.log(x.join(' | '));})();
