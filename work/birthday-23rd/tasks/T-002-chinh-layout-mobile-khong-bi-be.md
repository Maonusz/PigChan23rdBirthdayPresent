---
id: T-002
title: Chỉnh layout để trên điện thoại không bị bé quá
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

# T-002 — Chỉnh layout để trên điện thoại không bị bé quá

## Mục tiêu

Anh phản hồi: trên điện thoại, khung game/hình đang bị bé quá, khó xem và khó chạm. Chỉnh layout để vùng chơi và chữ/nút trên điện thoại dựng đứng to, rõ, dùng được thoải mái. (Commit gần nhất `26f8a8f` đã nới khung một lần nhưng anh vẫn thấy bé — cần làm tiếp, kiểm tra bằng số đo cụ thể chứ không cảm tính.)

## Phạm vi

- Trong phạm vi: `gift/main.js` (cấu hình scale/camera của Phaser), `gift/style.css`, `gate.css`, các overlay trong `index.html` nếu cần; giữ nguyên luồng chơi và nội dung.
- Ngoài phạm vi: đổi đồ hoạ (T-005), thêm tính năng mới.

## Tiêu chí hoàn thành

- [ ] Ở viewport 390×844 và 360×740 (điện thoại dựng đứng): vùng game chiếm phần lớn chiều cao khả dụng (ghi rõ tỉ lệ trước/sau trong nhật ký), nhân vật và chi tiết chính nhìn rõ ở cỡ thật.
- [ ] Nút bấm và chữ không nhỏ hơn chuẩn chạm thoải mái (~44px chiều cao nút), không tràn/ngang vỡ ở 320px chiều ngang.
- [ ] Màn ngang và desktop không vỡ bố cục; không cuộn trang ngoài ý muốn khi chơi.
- [ ] Không vi phạm quy tắc kỹ thuật trong AGENTS.md (CSP, textContent, không lộ bí mật, không build).

## Cách kiểm tra

1. Chạy static server, mở site ở các viewport: 390×844, 360×740, 320×700, ngang 844×390, desktop 1280×800.
2. Đo/ghi tỉ lệ chiều cao vùng game so với màn hình trước và sau khi sửa.
3. Qua hết luồng: cổng → biển → vườn → thư, bấm mọi nút ở cỡ điện thoại nhỏ nhất.

## Ghi chú / việc phát sinh

- Nguyên nhân nghi ngờ ban đầu: scene cao 360px world, scale theo bề ngang tối đa 640px nên trên máy dựng đứng khung bị thu hẹp theo tỉ lệ — kiểm tra lại trong code trước khi sửa.

## Review

<!-- Reviewer ghi: "đạt" hoặc danh sách điểm cần sửa (file:dòng). -->

## QA (Nini)

<!-- Kết quả checklist QA trong WORKFLOW.md §7. -->

## Nhật ký bàn giao

<!-- Mới nhất ở dưới cùng. Không ghi mật khẩu hay nội dung thư. -->
