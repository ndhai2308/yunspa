"""Trang tải về 2 file app (dùng capability downloads)."""
import base64, pathlib, re
root=pathlib.Path(__file__).parent
logo=re.search(r'src="(data:image/png;base64,[^"]+)"',(root/"src/app.html").read_text()).group(1)
items=[("Yun Spa PDG","Phan Đình Giót","YunSpa-PDG-DatLich.html"),("Yun Spa Văn Quán","Văn Quán","YunSpa-VanQuan-DatLich.html")]
blobs="".join(f'<script type="text/plain" id="f{i}">{base64.b64encode((root/"dist"/f).read_bytes()).decode()}</script>' for i,(_,_,f) in enumerate(items))
cards="".join(f'''<div class="card"><div class="t">{n}</div><div class="s">Chi nhánh {b}</div>
<button data-i="{i}" data-name="{f}">⬇ Tải file {n}</button><div class="msg" id="m{i}"></div></div>''' for i,(n,b,f) in enumerate(items))
html=f'''<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tải app đặt lịch Yun Spa</title><style>
body{{margin:0;font:16px/1.5 "Times New Roman",Times,serif;background:#fbf6f8;color:#2a2226}}
header{{background:#EF4395;color:#fff;padding:14px 20px;display:flex;align-items:center;gap:14px}}
header img{{height:64px}} header h1{{font-size:20px;margin:0;font-weight:700}}
main{{max-width:720px;margin:0 auto;padding:20px}}
.grid{{display:grid;grid-template-columns:1fr 1fr;gap:14px}}@media(max-width:600px){{.grid{{grid-template-columns:1fr}}}}
.card{{background:#fff;border:1px solid #eedde5;border-radius:14px;padding:18px}}
.t{{font-size:19px;font-weight:700}}.s{{color:#7a6d73;margin-bottom:12px}}
button{{width:100%;background:#d22f7c;color:#fff;border:0;border-radius:10px;padding:12px;font:inherit;font-weight:700;cursor:pointer}}
button:disabled{{opacity:.5}}.msg{{font-size:14px;margin-top:8px;color:#2e7d4f;min-height:20px}}.msg.err{{color:#b8432f}}
ol{{background:#fff;border:1px solid #eedde5;border-radius:14px;padding:16px 16px 16px 36px;margin-top:16px}}
#na{{background:#fdf0ec;color:#7d2a1b;border-radius:10px;padding:10px 14px;margin-bottom:14px}}
</style></head><body>
<header><img src="{logo}" alt="Yun Spa"><h1>Tải app đặt lịch KTV</h1></header>
<main><div id="na" hidden>Trang này chưa tải được file trên thiết bị này. Hãy mở bằng trình duyệt trên máy tính (claude.ai) rồi thử lại.</div>
<div class="grid">{cards}</div>
<ol><li>Bấm nút tải của chi nhánh, xác nhận lưu file.</li>
<li>Gửi file cho máy lễ tân của chi nhánh đó (Zalo, USB…).</li>
<li>Trên máy lễ tân: mở file bằng <b>Chrome</b> (hoặc Safari), rồi đánh dấu trang để hôm sau mở lại.</li></ol>
</main>{blobs}
<script>
(async function(){{
  const btns=[...document.querySelectorAll("button[data-i]")];
  btns.forEach(b=>b.disabled=true);
  let dl=null;
  try{{dl=window.claude&&window.claude.use?await window.claude.use("downloads"):null}}catch(e){{dl=null}}
  if(!dl){{document.getElementById("na").hidden=false;return}}
  btns.forEach(b=>{{b.disabled=false;b.addEventListener("click",async()=>{{
    const i=b.dataset.i,m=document.getElementById("m"+i);m.className="msg";m.textContent="";
    const bin=atob(document.getElementById("f"+i).textContent.trim());
    const bytes=new Uint8Array(bin.length);for(let k=0;k<bin.length;k++)bytes[k]=bin.charCodeAt(k);
    try{{await dl.save({{filename:b.dataset.name,data:new Blob([bytes])}});m.textContent="✓ Đã tải: "+b.dataset.name}}
    catch(e){{m.className="msg err";m.textContent=e&&e.code==="declined"?"Bạn đã huỷ tải.":(e&&e.code==="rate_limited"?"Đang có hộp xác nhận mở, đợi chút rồi bấm lại.":"Chưa tải được, thử lại.")}}
  }})}});
}})();
</script></body></html>'''
(root/"dist/download.html").write_text(html);print("ok",len(html))
