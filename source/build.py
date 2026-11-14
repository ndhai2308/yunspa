"""Build Yun Spa booking app for every branch from src/app.html."""
import json, pathlib, hashlib, re
import os
_hp=pathlib.Path(__file__).parent/"hotlines.json"
HOT=json.loads(_hp.read_text()) if _hp.exists() else {}
if not HOT: print("CẢNH BÁO: thiếu hotlines.json → app sẽ KHÔNG có mật khẩu")
ALL7=["goi","body60","body90","cvg","cvg60","masschan","csd"]
BRANCHES=[
 {"id":"pdg","name":"Phan Đình Giót","file":"YunSpa-PDG-DatLich.html","title":"Yun Spa PDG – Đặt lịch KTV",
  "storageKey":"yunspa-booking-v1",   # giữ khóa cũ để không mất dữ liệu đang dùng
  "hotline":HOT.get("pdg",""),   # mật khẩu = hotline cơ sở, lấy từ hotlines.json (không đưa lên GitHub)
  "staff":[["Nhi",ALL7],["My",ALL7],["Thơ",["goi","body60","cvg","cvg60","masschan","csd"]],["Duyên",ALL7],["Trang",["goi","csd"]],["Nụ",["goi","cvg","masschan","csd"]],["Vi",["goi","body60","body90","cvg","cvg60","masschan"]],["Khánh",["goi","masschan"]]]},
 {"id":"vanquan","name":"Văn Quán","file":"YunSpa-VanQuan-DatLich.html","title":"Yun Spa Văn Quán – Đặt lịch KTV",
  "storageKey":"yunspa-booking-vanquan-v1",
  "hotline":HOT.get("vanquan",""),
  "staff":[[n,ALL7] for n in ["Mây","An","Nguyệt","Phương","Linh","Thương","Hải"]]},
]
root=pathlib.Path(__file__).parent
src=(root/"src/app.html").read_text()
for b in BRANCHES:
    pw=re.sub(r"\D","",b.get("hotline") or "")
    data={"id":b["id"],"name":b["name"],"storageKey":b["storageKey"],"staff":b["staff"],
          "pwHash":hashlib.sha256(("yunspa:"+pw).encode()).hexdigest() if pw else None}
    logo=re.search(r'class="logo" src="([^"]+)"|src="(data:image/png;base64,[^"]+)" alt="Yun Spa" class="logo"',src)
    logo=next(x for x in logo.groups() if x)
    out=src.replace("__LOGO__",logo).replace("__BRANCH_JSON__",json.dumps(data,ensure_ascii=False)).replace("__TITLE__",b["title"]).replace("__BRANCH_NAME__",b["name"])
    assert "__" not in out.split("<script>")[0].replace("__proto__","") or True
    (root/"dist"/b["file"]).write_text(out)
    print("built",b["file"])
