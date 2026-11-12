---
id: T-003
title: Thêm / hoàn thiện nút quay lại biển cho người chơi
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

# T-003 — Thêm / hoàn thiện nút quay lại biển cho người chơi

## Mục tiêu

Anh yêu cầu: có nút quay lại biển cho người chơi. Trước khi code, KIỂM TRA HIỆN TRẠNG: commit `e1875e6` đã thêm nút "Về biển" (từ vườn về biển) và sau khi đọc thư cũng có nút "Về biển". Cần rà soát mọi màn (bắt đầu, biển, vườn, thư, các overlay) xem người chơi đang ở đâu thì quay về biển được, chỗ nào còn thiếu hoặc nút khó thấy/khó bấm trên điện thoại thì bổ sung và làm rõ. Nếu rà soát thấy đã đủ ở mọi màn: ghi rõ bằng chứng vào nhật ký (màn nào, nút nào, dòng code) và chuyển `review` để đóng task, không code thừa.

## Phạm vi

- Trong phạm vi: các nút điều hướng về biển trong `gift/main.js`, `index.html`, `gift/style.css`; giữ nguyên cơ chế chuyển cảnh và nhịp hỏi rời biển hiện có.
- Ngoài phạm vi: đổi luồng thư/vườn, thêm cảnh mới.

## Tiêu chí hoàn thành

- [ ] Từ vườn: có nút "Về biển" rõ ràng, bấm được trên điện thoại, quay về biển đúng trạng thái hợp lý (không mất tiến trình thư đã mở khoá).
- [ ] Từ màn thư: nút "Về biển" hoạt động (giữ/kiểm chứng cái đã có).
- [ ] Không tạo vòng lặp chuyển cảnh, không lỗi console khi bấm qua lại biển ↔ vườn nhiều lần.
- [ ] Không vi phạm quy tắc kỹ thuật trong AGENTS.md.

## Cách kiểm tra

1. Static server, đi hết luồng: vào biển → sang vườn → bấm "Về biển" → vào lại vườn → mở thư → "Về biển".
2. Lặp chuyển cảnh 3 lần, xem console.
3. Thử ở viewport 360×740: nút đủ to, không bị che.

## Ghi chú / việc phát sinh

-

## Review

<!-- Reviewer ghi: "đạt" hoặc danh sách điểm cần sửa (file:dòng). -->

## QA (Nini)

<!-- Kết quả checklist QA trong WORKFLOW.md §7. -->

## Nhật ký bàn giao

<!-- Mới nhất ở dưới cùng. Không ghi mật khẩu hay nội dung thư. -->
