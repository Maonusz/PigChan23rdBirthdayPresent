# BOARD — Bảng task

Mọi agent đọc file này **đầu mỗi phiên**. Quy trình: [docs/agents/WORKFLOW.md](../docs/agents/WORKFLOW.md).

Mã task tiếp theo: **T-006** (repo này đánh số riêng từ T-001; mã `T-066` trong code là tham chiếu từ dự án bên repo pigchan, không dùng lại ở đây).

> **Ủy quyền tạm thời (anh giao 2026-11-13):** với các task T-001…T-005 bên dưới, sau khi Codex review đạt và Nini QA đạt, **Nini được tự commit và merge PR thay anh** (thay cho quy tắc "chỉ anh merge" trong AGENTS.md). Ủy quyền chỉ áp dụng cho 5 task này và hết hiệu lực khi cả 5 task xong; các task sau quay lại quy tắc gốc.

## Cách đọc

- Mỗi dòng là một task; chi tiết nằm trong file task ở thư mục dự án.
- Trạng thái: `todo` → `doing` → `review` → `done`, kèm `changes` (review/QA yêu cầu sửa) và `blocked` (bị chặn).
- Đổi trạng thái thì sửa **cả file task lẫn dòng ở đây** trong cùng một commit.
- Chỉ nhận task `todo` được giao cho mình (hoặc chưa gán). Task `doing` của người khác — không đụng vào.

## Task

| Mã | Task | Dự án | Trạng thái | Agent | Nhánh | Phụ thuộc | Cập nhật (JST) |
|---|---|---|---|---|---|---|---|
| T-001 | Lấy skills làm game (pixel art) từ repo pigchan sang | birthday-23rd | todo | gợi ý: claude → review: codex | — | — | 2026-11-13 |
| T-002 | Chỉnh layout để trên điện thoại không bị bé quá | birthday-23rd | todo | gợi ý: claude → review: codex | — | — | 2026-11-13 |
| T-003 | Thêm / hoàn thiện nút quay lại biển cho người chơi | birthday-23rd | todo | gợi ý: claude → review: codex | — | — | 2026-11-13 |
| T-004 | Thêm phần lưu hình biển cho người dùng | birthday-23rd | todo | gợi ý: claude → review: codex | — | — | 2026-11-13 |
| T-005 | Cải thiện đồ hoạ của vườn | birthday-23rd | todo | gợi ý: claude → review: codex | — | T-001 | 2026-11-13 |

## Dự án hiện có

| Dự án | PRD | Mô tả |
|---|---|---|
| `birthday-23rd` | [PRD](birthday-23rd/PRD.md) | Website quà sinh nhật 23 tuổi cho Pig-chan |
