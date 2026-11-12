---
id: T-005
title: Cải thiện đồ hoạ của vườn
project: birthday-23rd
status: todo
agent:
reviewer: codex
branch:
pr:
depends_on: [T-001]
created: 2026-11-13
updated: 2026-11-13
---

# T-005 — Cải thiện đồ hoạ của vườn

## Mục tiêu

Khu vườn hiện tại (`assets/gift/garden/` far/middle/near + sprite) còn đơn giản so với cảnh biển. Cải thiện đồ hoạ vườn cho sinh động và cùng tông với biển: thêm chi tiết có lý do (hoa, cỏ, cây, lối đi, ánh sáng chiều), giữ phong cách pastel trầm dịu và nguyên tắc "nền tương phản thấp, nhân vật nổi bật". Dùng skill `pxl-pixel-art` + `tools/pxl` (từ T-001) khi cần vẽ/sửa pixel art.

## Phạm vi

- Trong phạm vi: các lớp nền vườn trong `assets/gift/garden/`, sprite/props liên quan trong `assets/sprites/` nếu cần, file vẽ nguồn trong `art/`; chỉnh nhẹ `gift/main.js` nếu phải nạp asset mới.
- Ngoài phạm vi: đổi bố cục/cơ chế vườn, thêm cảnh mới, đổi đồ hoạ biển.

## Tiêu chí hoàn thành

- [ ] Vườn có thêm chiều sâu và chi tiết rõ rệt so với bản cũ (liệt kê trong nhật ký: lớp nào, thêm gì), vẫn hài hoà với biển và nhân vật vẫn nổi bật nhất.
- [ ] Asset mới tối ưu cho web (PNG nén hợp lý, tổng dung lượng tăng thêm ghi rõ), nạp không lỗi 404, không vỡ tỉ lệ ở mobile dựng đứng.
- [ ] File vẽ nguồn `.px.js` (nếu có) nằm trong `art/`, build lại được bằng `tools/pxl`; PNG dùng cho game nằm trong `assets/`.
- [ ] Không vi phạm quy tắc kỹ thuật trong AGENTS.md.

## Cách kiểm tra

1. Static server, vào vườn ở 390×844 và desktop: xem trực tiếp, so với ảnh cũ (đường dẫn/ghi chú trong nhật ký).
2. Kiểm tra Network/console: không 404, không lỗi.
3. Nếu dùng pxl: chạy lại lệnh build từ file nguồn trong `art/` ra cùng kết quả.

## Ghi chú / việc phát sinh

- Đồ hoạ là việc cảm tính: làm xong cần gửi anh xem ảnh vườn mới (qua Nini) — anh là người chốt gu cuối cùng; nếu anh chưa ưng thì task quay lại `changes` với ghi chú cụ thể.

## Review

<!-- Reviewer ghi: "đạt" hoặc danh sách điểm cần sửa (file:dòng). -->

## QA (Nini)

<!-- Kết quả checklist QA trong WORKFLOW.md §7. -->

## Nhật ký bàn giao

<!-- Mới nhất ở dưới cùng. Không ghi mật khẩu hay nội dung thư. -->
