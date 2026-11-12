---
id: T-001
title: Lấy skills làm game (pixel art) từ repo pigchan sang
project: birthday-23rd
status: doing
agent: claude
reviewer: codex
branch: feature/T-001-lay-skills-game-pixel
pr:
depends_on: []
created: 2026-11-13
updated: 2026-11-13
---

# T-001 — Lấy skills làm game (pixel art) từ repo pigchan sang

## Mục tiêu

Đưa skill `pxl-pixel-art` và công cụ `tools/pxl` từ repo `Maonusz/pigchan` sang repo này (nguyên trạng như quy ước của pigchan), để các task đồ hoạ sau (đặc biệt T-005) dùng được ngay. Anh yêu cầu làm task này ĐẦU TIÊN.

## Phạm vi

- Trong phạm vi:
  - Chép `.agents/skills/pxl-pixel-art/SKILL.md` (bản gốc cho Codex/Gemini) và bản chép cho Claude Code ở `.claude/skills/pxl-pixel-art/SKILL.md`; chép `scripts/sync-skills.mjs` để đồng bộ hai bản.
  - Chép nguyên trạng `tools/pxl/` (bin, src, types, examples, tài liệu, LICENSE, UPSTREAM.md) — không sửa code của tool, không chạy npm install trong đó.
  - Chỉnh SKILL.md ở những chỗ tham chiếu repo cũ cho đúng repo này: vị trí file vẽ nguồn đặt ở `art/*.px.js`, kết quả build ở `art/out/` (không đưa `out/_preview/` lên Git — thêm `.gitignore`), PNG/JSON dùng cho game thì chép vào `assets/`; mục quy ước thẩm mỹ giữ tinh thần bản gốc (pastel trầm dịu, nhân vật nổi trên nền, bé lợn là vai chính) nhưng bỏ tham chiếu tới file không tồn tại ở repo này (`drafts/pigchan-birthday/ideas.md`).
  - Thêm mục "Skill" vào `AGENTS.md`: nguồn ở `.agents/skills/`, bản chép `.claude/skills/`, lệnh đồng bộ `node scripts/sync-skills.mjs`.
  - Ghi vào mục "Ghi chú / việc phát sinh": đánh giá các skill còn lại của pigchan (`new-topic`, `plan-project`, `work-task`, `review-task`, `pig-chan-canva`, `pig-chan-japanese-script`) — skill nào không chép và vì sao (đặc thù slide/thuyết trình, hoặc đã được WORKFLOW.md bao phủ), để anh/Nini quyết sau nếu muốn bổ sung.
- Ngoài phạm vi: sửa code site; vẽ art mới (đó là việc của T-005); chép các skill không liên quan game.

## Tiêu chí hoàn thành

- [ ] `.agents/skills/pxl-pixel-art/SKILL.md` và `.claude/skills/pxl-pixel-art/SKILL.md` giống nhau (trừ ghi chú đồng bộ nếu có), đã chỉnh tham chiếu cho repo này.
- [ ] `tools/pxl/` đầy đủ, chạy được trên máy này: `node tools/pxl/bin/pxl.js build tools/pxl/examples/basics.px.js` ra PNG không lỗi (Node ≥ 22.18).
- [ ] `AGENTS.md` có mục Skill; `.gitignore` chặn `art/out/`.
- [ ] Không vi phạm quy tắc kỹ thuật trong AGENTS.md (CSP, textContent, không lộ bí mật, không build cho site).

## Cách kiểm tra

1. Chạy lệnh build ví dụ ở trên, xác nhận có PNG trong thư mục out của ví dụ (xong thì xoá thư mục out đó).
2. `diff` hai bản SKILL.md.
3. Đọc lại mục Skill trong AGENTS.md và SKILL.md: không còn tham chiếu chết tới repo pigchan.

## Ghi chú / việc phát sinh

- Nguồn chép do Nini đã tải sẵn từ repo pigchan qua GitHub connector và kiểm chứng tool chạy được (build ví dụ ra PNG) ngày 2026-11-13; thư mục nguồn sẽ nằm trong thư mục làm việc của phiên, chép xong thì xoá khỏi bản đẩy.
- Đánh giá các skill còn lại của pigchan: (điền khi làm)

## Review

<!-- Reviewer ghi: "đạt" hoặc danh sách điểm cần sửa (file:dòng). -->

## QA (Nini)

<!-- Kết quả checklist QA trong WORKFLOW.md §7. -->

## Nhật ký bàn giao

<!-- Mới nhất ở dưới cùng. Không ghi mật khẩu hay nội dung thư. -->
