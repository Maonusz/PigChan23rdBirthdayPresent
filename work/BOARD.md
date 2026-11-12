# BOARD — Bảng task

Mọi agent đọc file này **đầu mỗi phiên**. Quy trình: [docs/agents/WORKFLOW.md](../docs/agents/WORKFLOW.md).

Mã task tiếp theo: **chờ anh chốt** (code hiện có đã nhắc mã từ repo gốc, vd. `T-066` — xem "Câu hỏi mở" trong PRD của dự án).

## Cách đọc

- Mỗi dòng là một task; chi tiết nằm trong file task ở thư mục dự án.
- Trạng thái: `todo` → `doing` → `review` → `done`, kèm `changes` (review/QA yêu cầu sửa) và `blocked` (bị chặn).
- Đổi trạng thái thì sửa **cả file task lẫn dòng ở đây** trong cùng một commit.
- Chỉ nhận task `todo` được giao cho mình (hoặc chưa gán). Task `doing` của người khác — không đụng vào.

## Task

| Mã | Task | Dự án | Trạng thái | Agent | Nhánh | Phụ thuộc | Cập nhật (JST) |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

## Dự án hiện có

| Dự án | PRD | Mô tả |
|---|---|---|
| `birthday-23rd` | [PRD](birthday-23rd/PRD.md) | Website quà sinh nhật 23 tuổi cho Pig-chan |
