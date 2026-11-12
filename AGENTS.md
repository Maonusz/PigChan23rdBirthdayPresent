# AGENTS.md — Quy tắc chung cho mọi agent

File này là **nguồn quy tắc duy nhất** của repo. Codex và Gemini đọc trực tiếp; Claude Code đọc qua `CLAUDE.md`. Quy trình chi tiết: [`docs/agents/WORKFLOW.md`](docs/agents/WORKFLOW.md). Nếu file khác mâu thuẫn với file này, **AGENTS.md thắng**.

Giao tiếp với anh (chủ repo) bằng **tiếng Việt**.

## Dự án

Website tĩnh tặng sinh nhật 23 tuổi cho Pig-chan. Người nhận nhập mật khẩu ở cổng → trình duyệt giải mã bức thư bằng WebCrypto (PBKDF2 → AES-GCM) → mở trải nghiệm Phaser (biển → khu vườn → thư). Giao diện tiếng Việt, mobile-first. Không có build step; GitHub Pages publish thẳng từ `main`.

```
index.html          trang duy nhất: CSP, noindex, các overlay/nút của quà
gate.js / gate.css  cổng mật khẩu: tải letter.enc.json, giải mã, rồi import gift/main.js
letter.enc.json     bức thư ĐÃ MÃ HÓA (salt, iv, iter, ct) — dạng duy nhất của thư trong repo
gift/               trải nghiệm Phaser
  main.js           scene GiftBoot / GiftSea / GiftGarden + điều khiển UI
  state.js          logic thuần (nhịp hỏi rời biển, khóa chuyển cảnh)
  audio.js          âm thanh (xử lý autoplay / iOS)
  letter-source.js  giữ thư đã giải mã trong bộ nhớ
  letter-format.js  dựng DOM thư bằng createElement + textContent
  style.css
assets/             ảnh nền, sprite, font, âm thanh, vendor/phaser.min.js
robots.txt          Disallow: /
.nojekyll           để Pages phục vụ file nguyên trạng
docs/agents/        quy trình làm việc của agent
work/               bảng task (BOARD.md), PRD và file task theo dự án
```

## Vai trò

| Ai | Vai trò | Được làm | Không được làm |
|---|---|---|---|
| **Claude** (Claude Code) | Code / triển khai | Nhận task `todo`, làm trên nhánh task, xong chuyển `review` | Tự review task mình code; merge vào `main` |
| **Codex** | Review | Review mọi task Claude chuyển `review`; chỉ code khi anh/Nini yêu cầu hoặc Claude hết lượt | Review task chính mình code; merge vào `main` |
| **Nini** (Muse) | Điều phối trung tâm + QA | Theo dõi BOARD/commit/PR, giao việc, chạy QA trước khi báo anh | Merge vào `main`; tự quyết thay anh |
| **Anh** | Chủ repo | Quyết định cuối, **người duy nhất merge vào `main`** | — |

Gemini/Antigravity nếu tham gia sau này: làm theo vai trò anh hoặc Nini giao cho từng task.

## Bắt buộc khi làm việc

1. **Đầu phiên đọc `work/BOARD.md`** và file task được giao. Không làm việc ngoài task.
2. **Nhận task bằng commit:** sửa file task (`status: doing`, `agent: <tên>`, `branch: ...`) và BOARD, rồi **commit + push ngay** trước khi code để agent khác thấy.
3. **Commit nhỏ, có tiền tố mã task:** `T-001: mô tả ngắn`. Mỗi commit một thay đổi có nghĩa.
4. **Nhật ký bàn giao bắt buộc** trong file task trước khi dừng phiên (kể cả khi chưa xong, hết lượt, hoặc bị chặn).
5. **Không tự review** task mình code.
6. **Không agent nào merge vào `main`** và **không push thẳng lên `main`**. Mọi thay đổi đi qua nhánh task + PR; chỉ anh merge.
7. Không chắc → ghi câu hỏi vào file task, đặt `blocked`, báo Nini. Không đoán yêu cầu sản phẩm.

## Quy tắc kỹ thuật của site

- **Thuần HTML/CSS/JS.** Không build step, không bundler, không npm, không thêm dependency hay CDN mới. Phaser chỉ dùng bản có sẵn ở `assets/vendor/`.
- **Đường dẫn tương đối** (`assets/...`, `./gift/...`) — site chạy dưới đường dẫn con của GitHub Pages. Không dùng `/` ở đầu.
- **Giữ nguyên CSP** trong `index.html`. Không inline script/style, không tài nguyên ngoài, không `eval`. Muốn đổi CSP phải được anh duyệt trong task.
- **Bí mật — TUYỆT ĐỐI:** không đưa mật khẩu, thư gốc dạng plaintext, hay khóa/salt-đã-dẫn-xuất vào git, commit message, log, console, file task hay chat. `letter.enc.json` là **dạng duy nhất** của thư được phép tồn tại trong repo. Không thêm file thư nháp, không log nội dung đã giải mã. Thấy bí mật bị lộ → dừng, báo anh ngay, không tự sửa lịch sử git.
- **Dữ liệu hiển thị bằng `textContent`** / `createElement`. Không dùng `innerHTML` với nội dung thư hay dữ liệu người dùng.
- **Giữ `noindex`** (`<meta name="robots">`) và `robots.txt`; giữ `.nojekyll`.
- **Kiểm tra trên mobile:** điện thoại dựng đứng là đối tượng chính; kiểm tra thêm màn ngang và desktop. Chú ý âm thanh trên iOS (autoplay, công tắc im lặng).
- Comment và chữ giao diện bằng tiếng Việt, theo văn phong code hiện có.
