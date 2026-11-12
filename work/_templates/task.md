---
id: T-xxx
title: <tên ngắn>
project: <du-an>
status: todo            # todo | doing | review | changes | blocked | done
agent:                  # agent đang code (claude | codex | ...)
reviewer:               # agent review (mặc định: codex)
branch:                 # feature/T-xxx-ten-ngan | fix/T-xxx-ten-ngan
pr:                     # link PR
depends_on: []          # [T-yyy, ...]
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# T-xxx — <tên ngắn>

## Mục tiêu

<Một hai câu: làm gì, vì sao. Liên kết mục tương ứng trong PRD.>

## Phạm vi

- Trong phạm vi: ...
- Ngoài phạm vi: ...
- File dự kiến đụng tới: ...

## Tiêu chí hoàn thành

- [ ] ...
- [ ] Không vi phạm quy tắc kỹ thuật trong AGENTS.md (CSP, textContent, không lộ bí mật, không build).

## Cách kiểm tra

1. Chạy static server cục bộ, mở site.
2. Điện thoại dựng đứng: ...
3. ...

## Ghi chú / việc phát sinh

-

## Review

<!-- Reviewer ghi: "đạt" hoặc danh sách điểm cần sửa (file:dòng). -->

## QA (Nini)

<!-- Kết quả checklist QA trong WORKFLOW.md §7. -->

## Nhật ký bàn giao

<!-- Mới nhất ở dưới cùng. Không ghi mật khẩu hay nội dung thư.
### YYYY-MM-DD HH:MM JST — <agent>
- Đã làm:
- Trạng thái:
- Còn lại / bước tiếp theo:
- Rủi ro / câu hỏi:
- Commit cuối:
-->
