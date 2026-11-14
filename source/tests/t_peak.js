const L=require('./lib.js');
async function scenario(name,list){
 const {b,p,errs}=await L.open();
 let ok=0,blocked=[];
 for(const [svc,t] of list){const r=await L.book(p,{cus:svc+'@'+L.hm(t),svc,time:t,staff:''}); if(r.canSave)ok++; else blocked.push(svc+'@'+L.hm(t));}
 const st=await L.state(p);
 console.log(`\n== ${name}: xếp được ${ok}/${list.length}`+(blocked.length?' — bị từ chối: '+blocked.join(', '):''));
 console.log('   phân công:',st.bookings.map(x=>x.serviceId+'→'+x.staffName).join(', '));
 const a=L.audit(st); if(a.length)console.log('   LỖI:',a); if(errs.length)console.log('   JS:',errs);
 await b.close(); return {ok,blocked};
}
(async()=>{
 // A: 18h - 4 khach goi dau den truoc, sau do 4 khach body 90
 await scenario('18:00 · 4 gội đến trước, 4 body 90 đến sau',[['goi',1080],['goi',1080],['goi',1080],['goi',1080],['body90',1080],['body90',1080],['body90',1080],['body90',1080]]);
 // B: 8 khach cung luc, dich vu tron
 await scenario('18:00 · 8 khách cùng lúc, dịch vụ trộn',[['csd',1080],['csd',1080],['goi',1080],['goi',1080],['body90',1080],['body60',1080],['cvg60',1080],['masschan',1080]]);
 // C: buoi toi day dac 17:00-19:00
 const C=[];for(let t=1020;t<=1140;t+=15){C.push(['goi',t]);C.push(['body60',t]);C.push(['csd',t]);}
 await scenario('17:00–19:00 · mỗi 15 phút 3 khách (gội, body 60, chăm sóc da)',C);
})();
