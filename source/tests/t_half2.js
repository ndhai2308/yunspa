const L=require('./lib.js');const res=[];const chk=(n,c,i)=>res.push([c?'PASS':'FAIL',n,i||'']);
(async()=>{const {b,p,errs}=await L.open();
 const setAtt=async(k,v)=>{await p.click(`[data-att="${k}"]`);await p.click(`[data-setatt="${v}"]`);await p.waitForTimeout(30)};
 await p.click('[data-att="k1"]');const opts=await p.$$eval('[data-setatt]',b=>b.map(x=>x.textContent));console.log('Lựa chọn:',opts.join(' | '));await p.click('[data-closeatt]');
 // cài giờ nửa buổi
 await p.click('[data-tab="setup"]');
 console.log('Mặc định: sớm sáng vào',await p.inputValue('#s-amt'),'| sớm chiều về',await p.inputValue('#s-pmf'),'| nửa sáng',await p.inputValue('#s-hamf'),'-',await p.inputValue('#s-hamt'),'| nửa chiều',await p.inputValue('#s-hpmf'),'-',await p.inputValue('#s-hpmt'));
 await p.fill('#s-hamf','09:00');await p.fill('#s-hamt','13:00');await p.fill('#s-hpmf','15:00');await p.fill('#s-hpmt','21:30');
 await p.click('#saveCfg');await p.waitForTimeout(60);await p.click('[data-tab="book"]');
 await setAtt('k1','am');await setAtt('k2','pm');await setAtt('k3','ham');await setAtt('k4','hpm');
 console.log('Thanh KTV:',(await p.textContent('#att')).replace(/\s+/g,' ').slice(0,190));
 let r;
 r=await L.fill(p,{svc:'goi',time:600,staff:'k1'});chk('Nhi nghỉ sớm sáng: 10:00 chặn',!r.canSave,r.check.slice(0,60));
 r=await L.fill(p,{svc:'goi',time:630,staff:'k1'});chk('Nhi 10:30 được',r.canSave);
 r=await L.fill(p,{svc:'goi',time:1070,staff:'k2'});chk('My nghỉ sớm chiều: gội 17:50 (xong 18:35) chặn',!r.canSave);
 r=await L.fill(p,{svc:'goi',time:1065,staff:'k2'});chk('My gội 17:45 được',r.canSave);
 r=await L.fill(p,{svc:'goi',time:720,staff:'k3'});chk('Thơ nghỉ nửa buổi sáng (9–13h): 12:00 chặn',!r.canSave,r.check.slice(0,70));
 let s=await L.suggestions(p);chk('Gợi ý Thơ từ 13:00',s.some(x=>x.st==='k3'&&x.t===780)&&s.filter(x=>x.st==='k3').every(x=>x.t>=780),JSON.stringify(s.slice(0,3)));
 r=await L.fill(p,{svc:'goi',time:780,staff:'k3'});chk('Thơ 13:00 được',r.canSave);
 r=await L.fill(p,{svc:'goi',time:870,staff:'k4'});chk('Duyên nghỉ nửa buổi chiều (15h–): gội 14:30 (xong 15:15) chặn',!r.canSave);
 r=await L.fill(p,{svc:'goi',time:855,staff:'k4'});chk('Duyên gội 14:15 (xong 15:00) được',r.canSave);
 r=await L.fill(p,{svc:'goi',time:600,staff:'k4'});chk('Duyên sáng 10:00 được',r.canSave);
 // tự động 9:00 không xếp Nhi, Thơ
 for(let i=0;i<8;i++)await L.book(p,{cus:'A'+i,svc:'body60',time:540,staff:''});
 const st=await L.state(p);const a=st.bookings.filter(x=>x.customer[0]==='A');
 chk('9:00 Body 60 tự động: không xếp Nhi (sớm sáng), Thơ (nửa sáng)',!a.some(x=>x.staffId==='k1'||x.staffId==='k3'),a.map(x=>x.staffName).join(','));
 // lịch tuần
 await p.click('[data-tab="setup"]');for(let i=0;i<4;i++)await p.click('[data-wk="5"][data-d="6"]'); // Nụ T7 → NS
 console.log('Nụ T7:',await p.textContent('[data-wk="5"][data-d="6"]'));await p.click('#saveCfg');await p.waitForTimeout(60);
 console.log('Lưu tuần Nụ:',JSON.stringify((await L.state(p)).config.staff[5].weekly));
 await p.click('[data-tab="book"]');r=await L.fill(p,{svc:'goi',time:700,staff:'k6'});chk('Nụ lịch tuần nghỉ nửa buổi sáng: 11:40 chặn',!r.canSave);
 await p.screenshot({path:'/tmp/half2.png',clip:{x:0,y:100,width:1400,height:720}});
 chk('Không lỗi JS',errs.length===0,errs.join(';'));
 await b.close();for(const x of res)console.log(x.join(' | '));})();
