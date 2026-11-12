// Âm thanh bản quà (T-068/T-069): sóng/gió tổng hợp nhẹ trên AudioContext của Phaser,
// Blue qua Phaser sound, piano MP3 stream bằng HTMLAudioElement (không decode cả bài).

const MUTE_KEY = 'pigchan-gift-mute';

export const GAIN = Object.freeze({ blue: 0.48, wave: 0.08, wind: 0.04, windUnderPiano: 0.015 });

function readMute() {
  try { return localStorage.getItem(MUTE_KEY) === '1'; } catch { return false; }
}
function writeMute(v) {
  try { localStorage.setItem(MUTE_KEY, v ? '1' : '0'); } catch { /* bỏ qua */ }
}

export class GiftAudio {
  constructor() {
    this.muted = readMute();
    this.game = null;
    this.ctx = null;
    this.master = null;
    this.ambGain = null;
    this.filter = null;
    this.noise = null;
    this.mode = 'off';
    this.piano = null;
    this.pianoFade = null;
    this.pianoWanted = false;
    this.playToken = 0;
    this.pianoListener = null;
    this.listeners = new Set();
    document.addEventListener('visibilitychange', () => this.onVisibility());
  }

  attach(game) {
    this.game = game;
    game.sound.mute = this.muted;
    const ctx = game.sound.context;
    if (!ctx || this.ctx) return;
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 1;
    this.master.connect(ctx.destination);
    this.ambGain = ctx.createGain();
    this.ambGain.gain.value = 0;
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 520;
    this.filter.Q.value = 0.4;
    // 2 giây nhiễu hồng nhẹ, lặp — nguồn duy nhất, đổi màu bằng filter.
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + w * 0.029591;
      b1 = 0.985 * b1 + w * 0.032534;
      b2 = 0.95 * b2 + w * 0.048056;
      d[i] = (b0 + b1 + b2 + w * 0.05) * 0.6;
    }
    // Làm mềm điểm nối vòng lặp để không click.
    const fade = Math.floor(ctx.sampleRate * 0.05);
    for (let i = 0; i < fade; i++) {
      const t = i / fade;
      d[len - fade + i] = d[len - fade + i] * (1 - t) + d[i] * t;
    }
    this.noise = ctx.createBufferSource();
    this.noise.buffer = buf;
    this.noise.loop = true;
    this.noise.loopEnd = (len - fade) / ctx.sampleRate;
    this.noise.connect(this.filter).connect(this.ambGain).connect(this.master);
    this.noise.start();
  }

  onChange(fn) { this.listeners.add(fn); fn(this.muted); }

  setMuted(v) {
    this.muted = !!v;
    writeMute(this.muted);
    if (this.game) this.game.sound.mute = this.muted;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(this.muted ? 0 : 1, this.ctx.currentTime, 0.05);
    if (this.piano) this.piano.muted = this.muted;
    this.listeners.forEach((fn) => fn(this.muted));
  }

  toggleMute() { this.setMuted(!this.muted); }

  /** Một nhịp sóng: dâng lên rồi rút êm, khớp với foam. */
  waveSwell(durationSec) {
    if (!this.ctx || this.mode !== 'sea') return;
    const g = this.ambGain.gain;
    const t = this.ctx.currentTime;
    const peak = GAIN.wave;
    g.cancelScheduledValues(t);
    g.setValueAtTime(Math.max(g.value, 0.012), t);
    g.linearRampToValueAtTime(peak, t + durationSec * 0.38);
    g.linearRampToValueAtTime(0.012, t + durationSec * 0.95);
    this.filter.frequency.cancelScheduledValues(t);
    this.filter.frequency.setValueAtTime(420, t);
    this.filter.frequency.linearRampToValueAtTime(720, t + durationSec * 0.38);
    this.filter.frequency.linearRampToValueAtTime(400, t + durationSec * 0.95);
  }

  setAmbience(mode, fadeSec = 1.5) {
    this.mode = mode;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const g = this.ambGain.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    this.filter.frequency.cancelScheduledValues(t);
    if (mode === 'garden') {
      this.filter.type = 'bandpass';
      this.filter.frequency.setValueAtTime(900, t);
      g.linearRampToValueAtTime(GAIN.wind, t + fadeSec);
    } else if (mode === 'garden-letter') {
      g.linearRampToValueAtTime(GAIN.windUnderPiano, t + fadeSec);
    } else if (mode === 'sea') {
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(450, t);
      g.linearRampToValueAtTime(0.012, t + fadeSec);
    } else {
      g.linearRampToValueAtTime(0, t + fadeSec);
    }
  }

  // ---- Piano (stream) ----
  preparePiano() {
    if (this.piano) return;
    const a = new Audio();
    a.preload = 'metadata';
    a.loop = false;
    a.muted = this.muted;
    a.src = 'assets/gift/audio/letter-piano.mp3';
    // Báo lỗi tải cho UI (gắn một lần). Không dùng sự kiện 'playing' để ẩn nút Bật nhạc:
    // media có thể phát ở volume 0 (GIFT-R03); chỉ startPlay thành công + fade mới báo 'started'.
    a.addEventListener('error', () => this.emitPiano('error'));
    this.piano = a;
  }

  onPianoState(fn) { this.pianoListener = fn; }
  emitPiano(state) { if (this.pianoListener) this.pianoListener(state); }

  get pianoPlaying() {
    return !!this.piano && !this.piano.paused && this.piano.readyState >= 3;
  }

  /** Thử phát từ đầu; resolve(true) nếu phát được, false nếu bị chặn/lỗi. */
  async playPiano() {
    this.preparePiano();
    const a = this.piano;
    this.pianoWanted = true;
    this.clearPianoFade();
    try { a.currentTime = 0; } catch { /* metadata chưa có */ }
    a.volume = 0;
    return this.startPlay(2000);
  }

  /** Bật/thử lại nhạc từ cử chỉ thật (nút "Bật nhạc"), không tua lại; nạp lại nếu lần trước lỗi mạng. */
  async resumePiano() {
    this.preparePiano();
    this.pianoWanted = true;
    const a = this.piano;
    if (a.error) { a.src = a.src; a.load(); }
    return this.startPlay(1200);
  }

  async startPlay(fadeMs) {
    const a = this.piano;
    const token = ++this.playToken;
    const current = () => token === this.playToken && this.pianoWanted;
    try {
      await a.play();
    } catch {
      // Bị chặn/lỗi/bị hủy (vd. ẩn tab khi đang tải): giữ đường thử lại nếu lệnh này còn hiệu lực.
      if (current() && !document.hidden) this.emitPiano('blocked');
      return false;
    }
    // Người nhận đã gấp thư (hoặc có lệnh phát mới) trong lúc play() còn chờ tải: bỏ kết quả cũ.
    if (!current()) {
      if (!this.pianoWanted) a.pause();
      return false;
    }
    if (document.hidden) {
      // Tải xong đúng lúc tab ẩn: dừng, để onVisibility phát lại qua cùng đường fade.
      a.pause();
      this.resumeOnShow = true;
      return false;
    }
    this.fadePiano(1, fadeMs);
    this.emitPiano('started');
    return true;
  }

  stopPiano(ms = 1800) {
    this.pianoWanted = false;
    this.resumeOnShow = false;
    this.playToken++;
    if (!this.piano) return;
    if (this.piano.paused) { this.clearPianoFade(); return; }
    this.fadePiano(0, ms, () => { this.piano.pause(); });
  }

  clearPianoFade() {
    if (this.pianoFade) { clearInterval(this.pianoFade); this.pianoFade = null; }
  }

  fadePiano(target, ms, done) {
    this.clearPianoFade();
    const a = this.piano;
    const from = a.volume;
    const start = performance.now();
    this.pianoFade = setInterval(() => {
      const k = Math.min(1, (performance.now() - start) / ms);
      try { a.volume = from + (target - from) * k; } catch { /* iOS khóa volume */ }
      if (k >= 1) { this.clearPianoFade(); if (done) done(); }
    }, 50);
  }

  onVisibility() {
    if (!this.piano) return;
    if (document.hidden) {
      // !paused bao gồm cả play() đang chờ tải; pause hủy promise đó.
      if (!this.piano.paused && this.pianoWanted) this.resumeOnShow = true;
      if (!this.piano.paused) this.piano.pause();
    } else if (this.resumeOnShow) {
      this.resumeOnShow = false;
      // Phát lại qua startPlay: token mới, fade từ volume hiện tại lên 1, báo started/blocked cho UI (GIFT-R03).
      if (this.pianoWanted) this.startPlay(1200);
    }
  }
}
