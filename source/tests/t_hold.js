const L=require('./lib.js');
(async()=>{const {b,p,errs}=await L.open();
 await p.click('[data-tab="setup"]');
 await p.fill('[data-sv="0"][data-f="hold"]','65');   // Gội: giữ 65p (dọn 20p)
 await p.fill('[data-sv="7"][data-f="hold"]','60');   // Massa chân: 60p
 await p.fill('[data-sv="1"][data-f="hold"]','70');   // Chăm sóc da 80p, nhập 70 (<80) → phải tự nâng lên 80
 await p.click('#saveCfg'); await p.waitForTimeout(80);
 const cfg=(await L.state(p)).config.services;
 console.log('Lưu:',cfg.slice(0,2).map(s=>s.name+' làm '+s.dur+' giữ '+(s.hold??'mặc định')).join(' | '),'|',cfg[7].name,'giữ',cfg[7].hold,'|',cfg[3].name,'giữ',cfg[3].hold??'mặc định');
 const vals=await p.$$eval('[data-f="hold"]',i=>i.map(x=>x.value));console.log('Bảng hiển thị giữ chỗ:',vals.join(', '));
 await p.click('[data-tab="book"]');
 await L.book(p,{cus:'chị Lan',svc:'goi',time:560,staff:'k1'}); // 9:20, giữ đến 10:25
 let r=await L.fill(p,{cus:'chị Mai',svc:'goi',time:600,staff:'k1'});
 console.log('Nhi 10:00:',r.check.replace(/\s+/g,' ').slice(0,190));
 console.log('Giờ kết thúc hiển thị:',await p.inputValue('#f-end'));
 r=await L.fill(p,{cus:'chị Mai',svc:'goi',time:625,staff:'k1'});console.log('Nhi 10:25 cho đặt:',r.canSave);
 // đổi thời gian dọn chung 10 -> 15: dịch vụ không chỉnh riêng đổi theo, dịch vụ đã chỉnh giữ nguyên
 await p.click('[data-tab="setup"]');await p.fill('#s-buf','15');await p.waitForTimeout(50);
 console.log('Đổi dọn chung 15p → bảng:',(await p.$$eval('[data-f="hold"]',i=>i.map(x=>x.value))).join(', '));
 console.log('errs',errs);await b.close();})();
