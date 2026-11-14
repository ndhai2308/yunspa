# Yun Spa – App đặt lịch KTV · Quy trình cập nhật

Bản gốc dùng chung cho 2 cơ sở: **Phan Đình Giót (PDG)** và **Văn Quán**.

## Cấu trúc
- `source/app.html` – bản gốc giao diện + logic (chứa token `__BRANCH_JSON__`, `__TITLE__`, `__BRANCH_NAME__`, `__LOGO__`).
- `source/build.py` – xuất 2 bản vào `dist/` (tên KTV, kỹ năng, khóa lưu trữ từng cơ sở). Hotline (mật khẩu) đọc từ `hotlines.json` **không đưa lên GitHub** – lấy trong hướng dẫn của Project.
- `source/make_download.py` – trang tải file (dist/download.html).
- `source/tests/` – bài thử Playwright (`node tests/t_cases.js file:///…/dist/YunSpa-PDG-DatLich.html`). Bài thử tự bỏ qua màn đăng nhập và dùng khóa lưu của PDG, nên chạy trên bản PDG; Văn Quán thử tay (đăng nhập + đặt 1 lịch).
- Gốc kho: `index.html` (chọn cơ sở), `pdg.html`, `vanquan.html` = bản đang chạy trên GitHub Pages.

## Dựng lại môi trường (phiên mới)
```
git clone https://github.com/ndhai2308/yunspa && mkdir -p yunspa_work/src yunspa_work/dist
cp yunspa/source/build.py yunspa/source/make_download.py yunspa_work/ && cp yunspa/source/app.html yunspa_work/src/app.html
# tạo yunspa_work/hotlines.json: {"pdg":"…","vanquan":"…"}
cd yunspa_work && python3 build.py && python3 make_download.py
```

## Mỗi lần cập nhật
1. Sửa `src/app.html` (hoặc `build.py` nếu đổi KTV/kỹ năng mặc định) → `python3 build.py && python3 make_download.py`.
2. Chạy lại bài thử, không có FAIL.
3. GitHub Pages: tải `dist/YunSpa-PDG-DatLich.html` → `pdg.html`, `dist/YunSpa-VanQuan-DatLich.html` → `vanquan.html` lên gốc kho (qua Chrome của chủ, trang github.com/ndhai2308/yunspa/upload/main). Cập nhật cả `source/` nếu bản gốc đổi.
4. ~~Google Drive~~ – đã bỏ từ 14/11/2026 theo yêu cầu chủ.
5. Link Claude (artifact): PDG `647fb3bd-ed72-4b0e-90f9-7cd91cdc80fb`, Văn Quán `38413bab-b27a-4f75-8da0-00310152c48a`, trang tải `757a5655-820c-4d07-b606-fc3c4731cadb` – republish (mode patch, as index.html).

## Quy tắc nghiệp vụ đã chốt
- Chỉ đặt được với KTV đang đi làm, đang trống, làm được dịch vụ; không có nút “vẫn lưu” chung.
- Ngoại lệ (chốt 14/11/2026): khi lịch mới chỉ lấn vào **thời gian dọn** (không trùng giờ làm) của KTV đã chọn, hiện nút “Vẫn lưu… – chọn lý do”. Bắt buộc tích lý do: “Tình hình thực tế: KTV đã dọn xong sớm”, “Tình hình thực tế: khách đến sớm / làm xong sớm”, hoặc “Lý do khác” + ghi chú. Lý do lưu cùng lịch (`bufReason`, `bufOverlap`) và hiện ở bảng lịch; giờ dọn của lịch bị lấn được rút ngắn tương ứng (`bufCut`). Chỉ áp dụng khi chọn đích danh KTV, 1 dịch vụ (lịch nhiều dịch vụ vẫn chặt).
- Giữ chỗ = thời gian làm + dọn (mặc định 10p, sửa riêng được từng dịch vụ). Giờ nhận khách 09:00–19:50, bước 5 phút.
- Trạng thái ngày của KTV: đi làm / nghỉ sớm sáng (vào lúc …) / nghỉ sớm chiều (về lúc …) / nghỉ nửa buổi sáng (từ–đến) / nghỉ nửa buổi chiều (từ–đến) / nghỉ cả ngày; có lịch cố định hằng tuần.
- Một khách nhiều dịch vụ: luôn nối tiếp (không có 2 DV cùng lúc); “cùng KTV” thì không tính dọn giữa các DV.
- Khi trùng: ưu tiên gợi ý “xin khách lùi sang giờ gần nhất của KTV đó” (nút lớn), giờ khác tăng 5 phút, rồi KTV khác đúng giờ.
- Tự động xếp ưu tiên KTV ít kỹ năng hiếm; chỉ gợi ý chuyển lịch của khách không chọn KTV và chưa bắt đầu.
- Chỉ dùng trong ngày (không lưu lịch sử); dữ liệu lưu trên máy (localStorage) theo khóa riêng từng cơ sở.
- Thương hiệu: màu #EF4395, font Times New Roman, logo Yun Spa. Form: B1 Tên khách*, SĐT (bỏ qua được), B2 Dịch vụ*, B3 Giờ*, B4 KTV.
