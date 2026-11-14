const L=require('./lib.js');const res=[];const chk=(n,c,i)=>res.push([c?'PASS':'FAIL',n,i||'']);
(async()=>{const {b,p,errs}=await L.open();
 const combo=async(cus,t,k1,svc1,extra)=>{ // extra: [{svc,staff,mode}]
   if(await p.isVisible('#cancelEdit'))await p.click('#cancelEdit');
   while(await p.$('#extraParts .xp-del'))await p.click('#extraParts .xp-del');
   await p.fill('#f-cus',cus);await p.selectOption('#f-svc',svc1);await p.selectOption('#f-time',String(t));await p.selectOption('#f-staff',k1);
   for(const x of extra){await p.click('#addPart');const r=(await p.$$('#extraParts .xp')).pop();
     await (await r.$('.xp-svc')).selectOption(x.svc);await (await r.$('.xp-staff')).selectOption(x.staff??'same');}
   await p.waitForTimeout(40);
   return {check:(await p.textContent('#check')).replace(/\s+/g,' '),canSave:!(await p.isDisabled('#saveBtn'))};
 };
 const save=async()=>{await p.click('#saveBtn');await p.waitForTimeout(80)};
 const B=async()=>(await L.state(p)).bookings;
 // A. 1 KTV làm cả 2 DV
 let r=await combo('chị A',600,'k1','goi',[{svc:'body60',staff:'same'}]);
 chk('TH1: Nhi gội 10:00 + Body 60 cùng Nhi → cho lưu',r.canSave,r.check.slice(0,140));
 await save();let bs=(await B()).filter(x=>x.customer==='chị A');
 chk('TH1: lưu 2 lịch nối tiếp, Nhi 10:00–10:45 rồi 10:45–11:55, không dọn giữa 2 DV',bs.length===2&&bs[0].staffId==='k1'&&bs[1].staffId==='k1'&&bs[1].start===645&&bs[0].buf===0&&bs[1].buf===10&&bs[0].groupId&&bs[0].groupId===bs[1].groupId,bs.map(x=>`${x.serviceId} ${L.hm(x.start)} buf${x.buf}`).join(' | '));
 // B. 2 KTV nối tiếp, tự động
 r=await combo('chị B',600,'','goi',[{svc:'body60',staff:''}]);await save();
 bs=(await B()).filter(x=>x.customer==='chị B');
 chk('TH2 nối tiếp: gội 10:00 rồi body 10:45, 2 KTV khác nhau',bs.length===2&&bs[1].start===645&&bs[0].staffId!==bs[1].staffId,bs.map(x=>`${x.serviceId} ${L.hm(x.start)} ${x.staffName}`).join(' | '));
 // C. 2 KTV cùng lúc
 r=await combo('chị C',660,'k5','goi',[{svc:'masschan',staff:'k8'}]);await save();
 bs=(await B()).filter(x=>x.customer==='chị C');
 chk('TH2 chọn tên: Trang gội 11:00 rồi Khánh massa chân 11:45',bs.length===2&&bs[0].start===660&&bs[1].start===705,bs.map(x=>`${x.serviceId} ${L.hm(x.start)} ${x.staffName}`).join(' | '));
 chk('Không còn lựa chọn làm cùng lúc',!(await p.$('.xp-mode')));
 // D. trùng: Nhi đang bận (chị A tới 11:55+10) → đòi Nhi 11:00 cả 2 DV
 r=await combo('chị D',660,'k1','goi',[{svc:'body60',staff:'same'}]);
 chk('Trùng: Nhi bận lúc 11:00 → chặn, báo DV1',!r.canSave&&r.check.includes('Nhi đang bận'),r.check.slice(0,120));
 chk('Gợi ý lùi sang 12:05 vẫn Nhi làm cả 2',r.check.includes('12:05'),r.check.match(/👉.{0,160}/)?.[0]);
 chk('Gợi ý giữ giờ, đổi KTV DV1',r.check.includes('Hoặc giữ giờ 11:00'),'');
 await p.click('#check button[data-ct]');await p.waitForTimeout(40);
 chk('Bấm gợi ý → lưu được',!(await p.isDisabled('#saveBtn')),await p.inputValue('#f-time'));
 // E. tự động + cùng KTV: Body 90 → phải chọn người làm được cả 2
 r=await combo('chị E',780,'','masschan',[{svc:'body90',staff:'same'}]);await save();
 bs=(await B()).filter(x=>x.customer==='chị E');
 chk('Tự động + cùng KTV: chọn người làm được cả massa chân và Body 90',bs.length===2&&['k1','k2','k4','k7'].includes(bs[0].staffId)&&bs[0].staffId===bs[1].staffId,bs.map(x=>x.staffName).join(','));
 // F. cùng KTV + cùng lúc → lỗi
 r=await combo('chị F',900,'k2','goi',[{svc:'masschan',staff:'same'},{svc:'cvg',staff:'k2'}]);
 chk('3 DV: My gội → massa chân → cvg 30, nối tiếp',r.canSave&&r.check.includes('15:00–15:45')&&r.check.includes('15:45–16:40')&&r.check.includes('16:40–17:20'),r.check.slice(0,200));
 // G. DV2 vướng: Trang làm DV2 lúc đang bận
 await p.click('#cancelEdit').catch(()=>{});
 r=await combo('chị G',615,'k6','goi',[{svc:'csd',staff:'k5'}]); // DV2 Trang 11:00 đang làm chị C
 chk('DV2 vướng (Trang bận) → báo DV2',!r.canSave&&r.check.includes('dịch vụ 2'),r.check.slice(0,140));
 // H. sửa nhóm
 if(await p.isVisible('#cancelEdit'))await p.click('#cancelEdit');else{await p.fill('#f-cus','');}
 await p.click('#extraParts .xp-del').catch(()=>{});
 const row=p.locator('tr',{hasText:'chị A'}).first();await row.locator('[data-edit]').click();await p.waitForTimeout(60);
 chk('Sửa chị A: mở đủ 2 dịch vụ',(await p.$$('#extraParts .xp')).length===1&&(await p.inputValue('#f-svc'))==='goi',await p.textContent('#formTitle'));
 await p.selectOption('#f-time','720');await p.waitForTimeout(40);
 r={canSave:!(await p.isDisabled('#saveBtn')),check:(await p.textContent('#check')).replace(/\s+/g,' ')};
 chk('Dời chị A sang 12:00 (không vướng chính mình)',r.canSave,r.check.slice(0,120));
 await save();bs=(await B()).filter(x=>x.customer==='chị A');
 chk('Sau sửa vẫn 2 lịch, 12:00 và 12:45',bs.length===2&&bs.map(x=>x.start).sort().join()==='720,765',bs.map(x=>L.hm(x.start)).join(','));
 await p.locator('tr',{hasText:'chị A'}).first().locator('[data-edit]').click();await p.waitForTimeout(40);
 await p.click('#delBtn');await p.click('#delBtn');await p.waitForTimeout(60);
 chk('Xoá chị A → xoá cả 2 lịch',(await B()).filter(x=>x.customer==='chị A').length===0);
 chk('Dữ liệu không trùng/sai kỹ năng',L.audit(await L.state(p)).length===0,L.audit(await L.state(p)).join(';'));
 await p.click('#cancelEdit').catch(()=>{});
 await combo('chị Mai',600,'k1','goi',[{svc:'body60',staff:'same'}]);
 await p.screenshot({path:'/tmp/combo.png',clip:{x:0,y:100,width:1400,height:900}});
 chk('Không lỗi JS',errs.length===0,errs.join(';'));
 await b.close();for(const x of res)console.log(x.join(' | '));})();
