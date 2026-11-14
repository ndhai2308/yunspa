// Lấn giờ dọn: vẫn lưu được nhưng bắt buộc chọn lý do
const L=require('./lib.js');
const FILE=process.argv[2];
(async()=>{const {b,p,errs}=await L.open();const R=[];const chk=(n,ok,d='')=>{R.push(ok);console.log((ok?'PASS':'FAIL')+' | '+n+' | '+d)};
 await L.book(p,{cus:'A1',svc:'goi',time:900,staff:'k1'});            // Nhi gội 15:00–15:45, dọn đến 15:55
 let r=await L.fill(p,{cus:'A2',svc:'goi',time:940,staff:'k1'});
 chk('15:40 trùng giờ làm → chặn, không có nút lý do',!r.canSave&&!(await p.$('#softBtn')));
 r=await L.fill(p,{cus:'A2',svc:'goi',time:945,staff:'k1'});
 chk('15:45 chỉ lấn 10p dọn → nút Lưu khoá, có nút chọn lý do',!r.canSave&&!!(await p.$('#softBtn')),r.check.slice(0,80));
 await p.click('#softBtn');await p.waitForTimeout(50);
 chk('Mở cửa sổ lý do',await p.isVisible('#rsn'));
 await p.click('#rsn-ok');await p.waitForTimeout(30);
 chk('Không chọn lý do → báo lỗi, chưa lưu',(await p.textContent('#rsn-err')).includes('Chọn')&&(await L.state(p)).bookings.length===1);
 await p.check('#rsn-other');await p.click('#rsn-ok');await p.waitForTimeout(30);
 chk('Lý do khác để trống → báo lỗi',(await p.textContent('#rsn-err')).includes('Ghi rõ'));
 await p.uncheck('#rsn-other');await p.check('input[data-r="KTV đã dọn xong sớm"]');await p.click('#rsn-ok');await p.waitForTimeout(80);
 let st=await L.state(p);const a1=st.bookings.find(x=>x.customer==='A1'),a2=st.bookings.find(x=>x.customer==='A2');
 chk('Đã lưu A2 với Nhi 15:45 kèm lý do',!!a2&&a2.staffId==='k1'&&a2.start===945&&a2.bufReason==='KTV đã dọn xong sớm'&&a2.bufOverlap===10,JSON.stringify(a2&&{r:a2.bufReason,o:a2.bufOverlap}));
 chk('Giờ dọn của A1 rút còn 0p',a1.buf===0&&a1.bufCut===10);
 chk('Bảng lịch hiện lý do',(await p.textContent('#tab-book')+await p.content()).includes('Lấn 10 phút dọn'));
 // chiều ngược: lịch mới kết thúc sát lịch sau của KTV
 await L.book(p,{cus:'B1',svc:'goi',time:960,staff:'k2'});           // My 16:00
 r=await L.fill(p,{cus:'B2',svc:'goi',time:910,staff:'k2'});         // 15:10–15:55, dọn đến 16:05
 chk('Lịch mới lấn 5p dọn vào lịch sau → có nút lý do',!!(await p.$('#softBtn')));
 await p.click('#softBtn');await p.check('#rsn-other');await p.fill('#rsn-text','Khách quen, KTV dọn nhanh');await p.click('#rsn-ok');await p.waitForTimeout(80);
 st=await L.state(p);const b2=st.bookings.find(x=>x.customer==='B2');
 chk('Lưu B2, dọn của B2 còn 5p, lý do khác ghi đúng',!!b2&&b2.buf===5&&b2.bufReason==='Khác: Khách quen, KTV dọn nhanh',JSON.stringify(b2&&{buf:b2.buf,r:b2.bufReason}));
 chk('Dữ liệu không trùng / sai kỹ năng',L.audit(st).length===0,L.audit(st).join('; '));
 chk('Không lỗi JS',errs.length===0,errs.join('; '));
 await b.close();console.log(R.every(x=>x)?'ALL PASS':'HAS FAIL');})();
