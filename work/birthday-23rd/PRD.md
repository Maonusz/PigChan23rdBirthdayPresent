---
project: birthday-23rd
status: active
owner: anh
updated: 2026-11-13
---

# PRD — Quà sinh nhật 23 tuổi cho Pig-chan

> Khung PRD chỉ ghi những gì đã biết chắc từ repo hiện tại. Yêu cầu mới phải do anh xác nhận rồi mới thêm vào mục "Yêu cầu".

## Mục đích

Website tĩnh làm quà tặng sinh nhật 23 tuổi cho Pig-chan: một trải nghiệm nhỏ dẫn tới bức thư riêng.

## Người dùng & bối cảnh

- Người dùng chính: Pig-chan (người nhận quà).
- Thiết bị chính: điện thoại cầm dựng đứng (mobile-first); vẫn phải dùng được trên màn ngang và desktop.
- Ngôn ngữ giao diện: tiếng Việt.

## Đã có (hiện trạng)

- **Cổng mật khẩu** (`gate.js`): giải mã `letter.enc.json` ngay trên trình duyệt bằng WebCrypto (PBKDF2-SHA-256 → AES-GCM-256). Mật khẩu không được lưu; thư đã giải mã chỉ giữ trong bộ nhớ. Sai mật khẩu → báo lỗi và cho nhập lại.
- **Trải nghiệm Phaser** (`gift/`): màn bắt đầu → biển (sau một thời gian ở biển thì hỏi có muốn rời biển không, có thể ở lại) → khu vườn → bức thư.
- Sau khi đọc thư: "Đọc lại thư", "Về biển", "Đăng xuất"; nút bật/tắt tiếng; nhạc nền và nhạc piano cho thư.
- Âm thanh đã xử lý cho mobile (iOS silent switch, autoplay).
- Bảo mật & riêng tư: CSP nghiêm ngặt, `noindex`, `robots.txt` chặn toàn bộ, `no-referrer`.
- Phát hành: GitHub Pages từ `main`, không build step (`.nojekyll`).

## Yêu cầu

<!-- Chưa có yêu cầu mới được anh xác nhận. -->

## Ràng buộc

- Tuân theo quy tắc kỹ thuật trong [AGENTS.md](../../AGENTS.md): thuần HTML/CSS/JS, không dependency mới, đường dẫn tương đối, giữ CSP, chỉ `textContent`, giữ `noindex`.
- Thư chỉ tồn tại trong repo dưới dạng `letter.enc.json`; không bao giờ commit mật khẩu hay thư plaintext.
- Merge vào `main` = phát hành ngay cho người nhận.

## Ngoài phạm vi

- Backend, tài khoản người dùng, analytics, tài nguyên bên thứ ba.

## Câu hỏi mở

- [ ] Ngày sinh nhật / hạn chót cần hoàn tất là khi nào?
- [ ] Còn tính năng hay chỉnh sửa nào anh muốn thêm trước ngày tặng?
- [ ] Nội dung thư có còn thay đổi không? Nếu có, ai mã hóa lại `letter.enc.json` và bằng công cụ nào (công cụ mã hóa không nằm trong repo)?
- [ ] Danh sách thiết bị/trình duyệt cần QA (iPhone/Android cụ thể nào)?
- [ ] Có cần bản preview trước khi merge (môi trường ngoài `main`) không, hay QA cục bộ là đủ?
- [ ] Mã task mới bắt đầu từ số nào (code hiện có đã nhắc mã từ repo gốc, vd. `T-066`)?

## Task liên quan

| Mã | Task | Trạng thái |
|---|---|---|
| | | |
