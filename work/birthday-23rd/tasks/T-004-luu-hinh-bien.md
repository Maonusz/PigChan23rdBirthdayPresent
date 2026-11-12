---
id: T-004
title: Thêm phần lưu hình biển cho người dùng
project: birthday-23rd
status: todo
agent:
reviewer: codex
branch:
pr:
depends_on: []
created: 2026-11-13
updated: 2026-11-13
---

# T-004 — Thêm phần lưu hình biển cho người dùng

## Mục tiêu

Người chơi đang ở cảnh biển có thể lưu hình biển về máy (ảnh PNG của khung cảnh biển tại thời điểm bấm) để giữ làm kỷ niệm. Thêm nút "Lưu hình biển" ở màn biển, bấm là tải xuống/mở ảnh PNG chụp từ canvas của game.

## Phạm vi

- Trong phạm vi: nút + xử lý chụp canvas trong `gift/main.js` / `index.html` / `gift/style.css` (dùng khả năng có sẵn của Phaser/canvas, vd. snapshot hoặc `canvas.toDataURL`); tên file tải xuống thân thiện (vd. `bien-pigchan.png`).
- Ngoài phạm vi: lưu hình vườn/thư; máy chủ/upload ảnh; thư viện ngoài.

## Tiêu chí hoàn thành

- [ ] Ở màn biển có nút "Lưu hình biển" rõ ràng, không che nhân vật/nút khác, bấm được trên điện thoại.
- [ ] Bấm nút tạo được ảnh PNG đúng khung cảnh biển đang hiển thị (đúng tỉ lệ, không đen/trống).
- [ ] Trên iOS Safari: nếu tải xuống trực tiếp bị chặn, có đường lui mở ảnh ở tab mới để người dùng lưu tay (ghi rõ cách xử lý trong nhật ký).
- [ ] Không vi phạm quy tắc kỹ thuật trong AGENTS.md (CSP giữ nguyên — lưu ý `img-src data:` đã có; không thêm tài nguyên ngoài; không `eval`).

## Cách kiểm tra

1. Static server, vào biển, bấm "Lưu hình biển", mở file PNG nhận được: đúng cảnh, đúng kích thước canvas.
2. Thử khi nhân vật ở các vị trí khác nhau; ảnh chụp khớp khung hình.
3. Đọc code xử lý iOS và ghi rõ hành vi; kiểm console không lỗi.

## Ghi chú / việc phát sinh

- Chú ý: canvas Phaser có thể cần `preserveDrawingBuffer` hoặc dùng API snapshot của Phaser mới chụp đúng — kiểm tra cách làm đúng trong code hiện tại, tránh ảnh đen.

## Review

<!-- Reviewer ghi: "đạt" hoặc danh sách điểm cần sửa (file:dòng). -->

## QA (Nini)

<!-- Kết quả checklist QA trong WORKFLOW.md §7. -->

## Nhật ký bàn giao

<!-- Mới nhất ở dưới cùng. Không ghi mật khẩu hay nội dung thư. -->
