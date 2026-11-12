// Logic thuần của bản quà (T-066): nhịp hỏi rời biển và khóa chuyển cảnh một lần.
// Thời gian chỉ cộng khi scene chạy (Phaser dừng vòng lặp lúc tab ẩn) => "30s foreground".

export const ASK_AFTER_MS = 30000;

export class SeaFlow {
  constructor({ askAfterMs = ASK_AFTER_MS, returning = false } = {}) {
    this.askAfterMs = askAfterMs;
    this.elapsed = 0;
    // idle → asking → staying | leaving. Quay lại từ vườn: đã từng hỏi rồi → vào thẳng staying.
    this.phase = returning ? 'staying' : 'idle';
  }

  /** Cộng thời gian foreground; trả true đúng một lần khi tới lúc hỏi. */
  advance(ms) {
    if (this.phase !== 'idle' || !(ms > 0)) return false;
    this.elapsed += Math.min(ms, 1000); // chặn bước nhảy lớn khi tab quay lại
    if (this.elapsed >= this.askAfterMs) {
      this.phase = 'asking';
      return true;
    }
    return false;
  }

  stay() {
    if (this.phase === 'asking') this.phase = 'staying';
    return this.phase;
  }

  /** Trả true chỉ ở lần rời biển đầu tiên (chống double click). */
  leave() {
    if (this.phase !== 'asking' && this.phase !== 'staying') return false;
    this.phase = 'leaving';
    return true;
  }

  get canShowGardenButton() {
    return this.phase === 'staying';
  }
}

/** Chuẩn hóa thư nhận từ API: chuỗi, bỏ \r, giữ xuống dòng. */
export function normalizeLetter(payload) {
  if (!payload || payload.ok !== true || typeof payload.text !== 'string') return null;
  const text = payload.text.replace(/\r\n?/g, '\n');
  return text.trim() ? text : null;
}
