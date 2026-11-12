# WORKFLOW — Quy trình làm việc đa agent

Chi tiết hóa [AGENTS.md](../../AGENTS.md). Nếu hai file lệch nhau, AGENTS.md thắng.

## 1. Vai trò

- **Claude** — code / triển khai. Nhận task, làm, chuyển `review`.
- **Codex** — review mọi task Claude làm xong. Chỉ code khi được yêu cầu hoặc Claude hết lượt (khi đó task Codex code phải do agent khác review).
- **Nini (Muse)** — điều phối trung tâm + QA. Giao việc, theo dõi tiến độ, chạy QA, báo anh khi sẵn sàng merge.
- **Anh** — chủ repo, quyết định cuối, người duy nhất merge vào `main`.

## 2. Cấu trúc `work/`

```
work/
  BOARD.md                     bảng task tổng — mọi agent đọc đầu phiên
  _templates/task.md           mẫu file task
  _templates/prd.md            mẫu PRD dự án
  <du-an>/PRD.md               yêu cầu của dự án
  <du-an>/T-xxx-ten-ngan.md    một file cho mỗi task
```

- Mã task `T-xxx` tăng dần, không dùng lại. Code hiện có đã nhắc mã từ repo gốc (vd. `T-066`) — kiểm tra bằng `grep -rn "T-<số>"` để tránh trùng.
- File task là nguồn sự thật về trạng thái; BOARD là bản tóm tắt. Đổi trạng thái thì sửa **cả hai** trong cùng commit.

## 3. Vòng đời task

```
todo → doing → review → done
          ↑       │
          └─ changes ┘        (review yêu cầu sửa → quay lại người code)
   doing/review → blocked     (chờ anh quyết hoặc thiếu thông tin)
```

| Trạng thái | Nghĩa | Ai chuyển |
|---|---|---|
| `todo` | Đã định nghĩa, chưa ai nhận | Nini / anh tạo |
| `doing` | Đang code | Agent nhận task |
| `review` | Code xong, chờ review | Agent code |
| `changes` | Review yêu cầu sửa | Reviewer (Codex) |
| `blocked` | Bị chặn, ghi rõ lý do trong task | Bất kỳ ai |
| `done` | Anh đã merge vào `main` | Nini, sau khi anh merge |

## 4. Bắt đầu một phiên

1. `git fetch` rồi đọc `work/BOARD.md` và file task được giao (cùng PRD của dự án).
2. Đọc **nhật ký bàn giao** gần nhất trong file task.
3. Nhận task: tạo nhánh từ `main` mới nhất, sửa file task (`status: doing`, `agent`, `branch`) + BOARD → **commit + push ngay** (`T-xxx: nhận task`).
4. Nếu task đã có người `doing` mà không phải mình → không đụng vào, báo Nini.

## 5. Trong khi làm

- Chỉ làm đúng phạm vi task. Phát hiện việc khác → ghi vào mục "Ghi chú / việc phát sinh" của task để Nini tạo task mới.
- Commit nhỏ, tiền tố mã task: `T-xxx: mô tả`. Push thường xuyên.
- Tuân thủ quy tắc kỹ thuật trong AGENTS.md (không build, đường dẫn tương đối, CSP, textContent, không lộ bí mật).
- Tự kiểm tra theo mục "Cách kiểm tra" của task trước khi chuyển `review`; chạy site cục bộ bằng một static server bất kỳ (vd. `python3 -m http.server`) — không mở bằng `file://` vì `fetch` và module không chạy.

## 6. Bàn giao (bắt buộc trước khi dừng)

Thêm một mục vào **Nhật ký bàn giao** của file task, mới nhất ở dưới cùng:

```
### YYYY-MM-DD HH:MM JST — <agent>
- Đã làm: ...
- Trạng thái: doing | review | blocked
- Còn lại / bước tiếp theo: ...
- Rủi ro / câu hỏi: ...
- Commit cuối: <hash>
```

Bàn giao cả khi chưa xong, khi hết lượt, hoặc khi bị chặn. Không ghi mật khẩu hay nội dung thư vào nhật ký.

Code xong: mở PR từ nhánh task vào `main`, đặt `status: review`, cập nhật BOARD, commit + push.

## 7. Review (Codex)

Reviewer **không** phải người code task đó. Codex kiểm tra:

- [ ] Thay đổi đúng phạm vi và đạt mọi tiêu chí hoàn thành của task.
- [ ] Không build step, không dependency/CDN mới; đường dẫn tương đối.
- [ ] CSP trong `index.html` không đổi (hoặc đổi đúng như anh đã duyệt).
- [ ] Không có mật khẩu, plaintext thư, khóa trong diff, commit message, log/console.
- [ ] Nội dung động hiển thị bằng `textContent`/`createElement`, không `innerHTML`.
- [ ] `noindex`, `robots.txt`, `.nojekyll` còn nguyên.
- [ ] Commit có tiền tố mã task, nhật ký bàn giao đầy đủ.

Kết quả ghi vào file task (mục "Review"):
- **Đạt** → giữ `review`, ghi "Review: đạt", báo Nini chạy QA.
- **Cần sửa** → `status: changes`, liệt kê từng điểm cần sửa (file:dòng), báo Nini.

### Checklist QA của Nini (sau khi review đạt, trước khi báo anh)

Mở site từ nhánh task (static server cục bộ hoặc bản preview):

- [ ] Điện thoại dựng đứng (vd. viewport 390×844): bố cục, chữ, nút bấm vừa màn hình.
- [ ] Màn ngang và desktop không vỡ bố cục.
- [ ] Mật khẩu sai → báo lỗi tiếng Việt, nhập lại được. Mật khẩu đúng → vào quà. *(Chỉ anh/Nini giữ mật khẩu; không ghi ra đâu.)*
- [ ] Luồng biển → hỏi rời biển → vườn → thư → "Đọc lại thư" / "Về biển" / "Đăng xuất" chạy đúng.
- [ ] Âm thanh: bật/tắt tiếng hoạt động; thử trên iOS nếu task đụng tới audio.
- [ ] Console không có lỗi CSP hay lỗi tải tài nguyên (404).
- [ ] Các tiêu chí riêng trong mục "Cách kiểm tra" của task.

QA không đạt → `status: changes` kèm mô tả lỗi, giao lại Claude.

## 8. Nhánh và merge

- Nhánh task tách từ `main` mới nhất: `feature/T-xxx-ten-ngan`, `fix/T-xxx-ten-ngan`.
- Một task — một nhánh — một PR. Không gộp nhiều task.
- **Chỉ anh merge vào `main`.** Không agent nào merge hay push thẳng `main`.
- GitHub Pages publish từ `main` ⇒ **merge = phát hành** ngay cho Pig-chan. Vì vậy chỉ báo anh merge khi đã qua cả review lẫn QA.
- Sau khi anh merge: Nini đặt `status: done`, cập nhật BOARD; nhánh có thể xóa.

## 9. Vòng điều phối của Nini

Khi vòng điều phối đang bật, Nini kiểm tra mỗi **10–15 phút** (commit, PR, `work/BOARD.md`):

1. Task chuyển sang `review` → giao **Codex** review.
2. Review **đạt** → Nini chạy QA → QA đạt → **báo anh merge** (kèm link PR + tóm tắt) → giao task `todo` tiếp theo cho **Claude**.
3. Review hoặc QA **yêu cầu sửa** (`changes`) → giao lại **Claude** kèm danh sách điểm cần sửa.
4. Task `blocked` hoặc không có commit mới quá lâu → hỏi agent đó / báo anh.
5. Hết task `todo` → báo anh, không tự nghĩ thêm yêu cầu sản phẩm.

Nini không tự báo "đã giao" hay "đã merge" nếu chưa kiểm chứng được trên repo. Vòng điều phối chỉ chạy khi anh bật; không tự tạo lịch chạy định kỳ mới khi chưa được duyệt.

### Tiết kiệm lượt dùng

- Mỗi phiên agent chỉ làm **đúng phạm vi được giao**; không đọc lại toàn repo khi không cần.
- Task nên đủ nhỏ để xong trong một phiên.
- Sắp hết lượt → **dừng sớm, commit + push, ghi nhật ký bàn giao** để agent khác tiếp được ngay.
- Nini giao việc kèm đủ ngữ cảnh (đường dẫn file task, điểm cần sửa) để agent không phải dò lại.
