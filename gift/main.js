// Bản quà sinh nhật (T-066…T-069): Bắt đầu → biển thụ động → vườn → bức thư.
// Không Kiwi, không điều khiển đi/nhảy, không lưu tiến trình máy chủ.
import { SeaFlow } from './state.js';
import { GiftAudio, GAIN } from './audio.js';
import { renderLetter } from './letter-format.js';
import { fetchLetter, logout } from './letter-source.js';

const W = 640; // bề ngang thế giới nhìn thấy tối đa (ngang/desktop)
const H = 360;
// Điện thoại dọc: thu hẹp bề ngang khung nhìn để cảnh phóng to, cao ~66% màn hình
// (thay vì một dải mỏng ở giữa). Cảnh vẫn là thế giới 1280×360, camera chỉ nhìn phần giữa.
const PORTRAIT_FILL = 0.66;
const MIN_VIEW_W = 260;
function viewWidth() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (!vw || !vh) return W;
  const w = Math.round((H * vw) / (vh * PORTRAIT_FILL));
  return Math.min(W, Math.max(MIN_VIEW_W, w)) & ~1;
}
/** Giữ camera đúng kích thước khung nhìn hiện tại; gọi lại khi xoay máy. */
function setSceneTint(name) {
  if (name) document.body.dataset.scene = name;
  else delete document.body.dataset.scene;
}
function onViewResize(scene, fn) {
  const handler = (size) => { scene.cameras.main.setSize(size.width, size.height); fn?.(size.width); };
  scene.scale.on('resize', handler);
  scene.events.once('shutdown', () => scene.scale.off('resize', handler));
  fn?.(scene.scale.gameSize.width);
}
const GROUND = 304;
const IVORY = [250, 243, 230];
const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
const audio = new GiftAudio();
const $ = (id) => document.getElementById(id);

// ---------- DOM UI ----------
function show(el, on = true) { el.hidden = !on; }

const ui = {
  start: $('gift-start'),
  startBtn: $('gift-start-btn'),
  ask: $('gift-ask'),
  askGo: $('gift-ask-go'),
  askStay: $('gift-ask-stay'),
  goSmall: $('gift-go-small'),
  caption: $('gift-caption'),
  letter: $('gift-letter'),
  letterText: $('gift-letter-text'),
  letterClose: $('gift-letter-close'),
  musicBtn: $('gift-music'),
  rest: $('gift-rest'),
  reread: $('gift-reread'),
  toSea: $('gift-to-sea'),
  logout: $('gift-logout'),
  mute: $('gift-mute')
};

audio.onChange((m) => {
  ui.mute.textContent = m ? 'Tiếng: tắt' : 'Tiếng: bật';
  ui.mute.setAttribute('aria-pressed', m ? 'true' : 'false');
});
ui.mute.addEventListener('click', () => audio.toggleMute());

ui.logout.addEventListener('click', async () => {
  ui.logout.disabled = true;
  await logout();
});

function setCaption(text) {
  ui.caption.textContent = text || '';
  show(ui.caption, !!text);
}

// ---------- Thư ----------
let letterPromise = null;
function loadLetter() {
  if (!letterPromise) {
    letterPromise = fetchLetter().catch(() => null);
    letterPromise.then((t) => { if (!t) letterPromise = null; }); // cho thử lại lần sau
  }
  return letterPromise;
}

// Thư hiện độc lập với tải/phát piano (GIFT-R01): không await nhạc trước khi lấy thư.
// letterSession tăng mỗi lần mở/gấp để bỏ qua kết quả async cũ.
const MUSIC_HINT_MS = 3000;
let letterSession = 0;
let musicHintTimer = null;
let letterReceived = false; // đã nhận thư một lần → lần sau về vườn không diễn lại cảnh nhận thư

function clearMusicHint() {
  if (musicHintTimer) { clearTimeout(musicHintTimer); musicHintTimer = null; }
}

// 'started' chỉ phát ra khi play() thành công và đã bắt đầu fade lên (kể cả phát lại sau khi tab hiện);
// 'blocked'/'error' giữ nút Bật nhạc. Không ẩn nút chỉ vì media phát ở volume 0 (GIFT-R03).
audio.onPianoState((state) => {
  if (ui.letter.hidden) return;
  if (state === 'started') { clearMusicHint(); show(ui.musicBtn, false); }
  if (state === 'blocked' || state === 'error') { clearMusicHint(); show(ui.musicBtn, true); }
});

function openLetter(scene) {
  const session = ++letterSession;
  ui.letterText.classList.remove('is-formatted');
  ui.letterText.textContent = 'Đang mở thư…';
  show(ui.rest, false);
  show(ui.letter, true);
  ui.letter.scrollTop = 0;
  ui.letterText.scrollTop = 0;
  ui.letterClose.focus({ preventScroll: true });
  audio.setAmbience('garden-letter', 1.2);
  show(ui.musicBtn, false);

  // Nhạc: bị chặn/lỗi → hiện "Bật nhạc"; còn chờ tải quá 3s → cũng hiện để người nhận thử lại.
  clearMusicHint();
  musicHintTimer = setTimeout(() => {
    if (session === letterSession && !audio.pianoPlaying) show(ui.musicBtn, true);
  }, MUSIC_HINT_MS);
  audio.playPiano().then((playing) => {
    if (session !== letterSession) return;
    if (playing) { clearMusicHint(); show(ui.musicBtn, false); } else { show(ui.musicBtn, true); }
  });

  // Thư: lấy và hiện ngay khi API trả về, không phụ thuộc nhạc.
  loadLetter().then((text) => {
    if (session !== letterSession) return;
    // Bố cục thư bằng createElement + textContent; lệch chữ thì tự về dạng thô (letter-format.js).
    if (text) renderLetter(ui.letterText, text);
    else ui.letterText.textContent = 'Bức thư chưa mở được. Bạn thử tải lại trang nhé.';
    ui.letterText.scrollTop = 0;
  });
  scene?.events.emit('letter-open');
}

ui.musicBtn.addEventListener('click', async () => {
  const session = letterSession;
  const ok = await audio.resumePiano();
  if (session === letterSession && !ui.letter.hidden) show(ui.musicBtn, !ok && !audio.pianoPlaying);
});
ui.letterClose.addEventListener('click', () => {
  letterSession++;
  clearMusicHint();
  show(ui.letter, false);
  audio.stopPiano(1800);
  audio.setAmbience('garden', 1.8);
  show(ui.musicBtn, false);
  show(ui.rest, true);
});
ui.reread.addEventListener('click', () => openLetter(null));
ui.toSea.addEventListener('click', () => {
  audio.unlockFromGesture();
  if (game.scene.isActive('GiftGarden')) game.scene.getScene('GiftGarden').toSea();
});

// ---------- Scenes ----------
class GiftBoot extends Phaser.Scene {
  constructor() { super('GiftBoot'); }
  preload() {
    this.load.image('sea_far', 'assets/backgrounds/sea_sunset/far.png');
    this.load.image('sea_mid', 'assets/backgrounds/sea_sunset/middle.png');
    this.load.image('sea_near', 'assets/backgrounds/sea_sunset/near.png');
    this.load.image('garden_far', 'assets/gift/garden/far.png');
    this.load.image('garden_mid', 'assets/gift/garden/middle.png');
    this.load.image('garden_near', 'assets/gift/garden/near.png');
    this.load.image('pig_back', 'assets/gift/pig_back.png');
    this.load.atlas('chars', 'assets/sprites/characters.png', 'assets/sprites/characters.json');
    this.load.atlas('props', 'assets/sprites/props.png', 'assets/sprites/props.json');
    this.load.audio('blue', 'assets/audio/blue-music-box-r3.mp3');
  }
  create() {
    this.anims.create({
      key: 'pig-walk',
      frames: [0, 1, 2, 3].map((i) => ({ key: 'chars', frame: `pig_walk_${i}` })),
      frameRate: 7,
      repeat: -1
    });
    show(ui.start, true);
    ui.startBtn.disabled = false;
    ui.startBtn.focus({ preventScroll: true });
    ui.startBtn.addEventListener('click', () => {
      ui.startBtn.disabled = true;
      show(ui.start, false);
      show(ui.mute, true);
      audio.attach(this.game);
      audio.unlockFromGesture();
      this.scene.start('GiftSea');
    }, { once: true });
  }
}

function addLayers(scene, prefix) {
  scene.add.image(0, 0, `${prefix}_far`).setOrigin(0).setScrollFactor(0.15).setDepth(0);
  scene.add.image(0, 0, `${prefix}_mid`).setOrigin(0).setScrollFactor(0.15).setDepth(1);
  return scene.add.image(0, 0, `${prefix}_near`).setOrigin(0).setScrollFactor(1).setDepth(10);
}

class GiftSea extends Phaser.Scene {
  constructor() { super('GiftSea'); }
  create(data) {
    this.flow = new SeaFlow({ returning: !!data?.returning });
    this.cameras.main.setBounds(0, 0, 1280, H);
    // Biển: camera đứng yên, canh giữa Pig (x=640) dù khung nhìn rộng hay hẹp.
    onViewResize(this, (w) => this.cameras.main.setScroll(640 - w / 2, 0));
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.fadeIn(1200, ...IVORY);
    setSceneTint('sea');
    addLayers(this, 'sea');

    // Foam: tối đa 3 dải mảnh, lệch nhịp 4–6s; vẽ theo thời gian, không theo frame.
    this.foam = this.add.graphics().setDepth(12);
    this.shimmer = this.add.graphics().setDepth(2).setScrollFactor(0.15);
    this.waves = [
      { period: 5200, phase: 0, y: GROUND + 14, amp: reduced ? 2 : 5 },
      { period: 4300, phase: 1700, y: GROUND + 24, amp: reduced ? 2 : 4 },
      { period: 5900, phase: 3100, y: GROUND + 34, amp: reduced ? 1 : 3 }
    ];
    this.lastSwell = -1;

    // Pig ngồi quay lưng ngắm chân trời (pose riêng gift), nửa dưới khung hình; "thở" rất nhẹ.
    this.pig = this.add.sprite(640, GROUND + 2, 'pig_back').setOrigin(0.5, 1).setScale(2).setDepth(20);
    if (!reduced) {
      this.tweens.add({ targets: this.pig, scaleY: 2.04, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }

    // Blue fade-in ~2s.
    this.blue = this.sound.get('blue') || this.sound.add('blue', { loop: true, volume: 0 });
    if (!this.blue.isPlaying) this.blue.play({ loop: true, volume: 0 });
    this.tweens.add({ targets: this.blue, volume: GAIN.blue, duration: 2000 });
    audio.setAmbience('sea', 2);

    const onGo = () => { audio.unlockFromGesture(); this.leave(); };
    const onStay = () => {
      this.flow.stay();
      show(ui.ask, false);
      show(ui.goSmall, this.flow.canShowGardenButton);
    };
    ui.askGo.addEventListener('click', onGo);
    ui.askStay.addEventListener('click', onStay);
    ui.goSmall.addEventListener('click', onGo);
    // Quay lại từ vườn: không hỏi lại sau 30s, nút "Đến khu vườn" có sẵn ở góc.
    show(ui.goSmall, this.flow.canShowGardenButton);
    this.events.once('shutdown', () => {
      ui.askGo.removeEventListener('click', onGo);
      ui.askStay.removeEventListener('click', onStay);
      ui.goSmall.removeEventListener('click', onGo);
      show(ui.ask, false);
      show(ui.goSmall, false);
    });
  }

  update(time, delta) {
    if (this.flow.advance(delta)) {
      show(ui.ask, true);
      ui.askGo.focus({ preventScroll: true });
    }
    // Foam
    const g = this.foam;
    g.clear();
    this.waves.forEach((w, i) => {
      const t = ((time + w.phase) % w.period) / w.period; // 0..1
      const reach = Math.sin(t * Math.PI); // dâng rồi rút
      const y = Math.round(w.y - reach * w.amp);
      g.fillStyle(0xfffaf0, 0.55 - i * 0.12);
      for (let x = 320; x < 960; x += 2) {
        const wob = Math.sin((x + time * 0.02 * (i + 1)) / (18 + i * 7));
        if (wob > -0.2) g.fillRect(x, y + Math.round(wob * 1.5), 2, 1);
      }
      if (i === 0) {
        const cycle = Math.floor((time + w.phase) / w.period);
        if (cycle !== this.lastSwell) { this.lastSwell = cycle; audio.waveSwell(w.period / 1000); }
      }
    });
    // Phản sáng nhẹ trên mặt biển
    const s = this.shimmer;
    s.clear();
    for (let k = 0; k < 6; k++) {
      const a = 0.18 + 0.12 * Math.sin(time / 900 + k * 1.3);
      s.fillStyle(0xfff3d6, reduced ? 0.15 : a);
      s.fillRect(560 + k * 9 - (k % 2) * 4, 214 + k * 9, 14 - k, 1);
    }
  }

  leave() {
    if (!this.flow.leave()) return;
    show(ui.ask, false);
    show(ui.goSmall, false);
    audio.preparePiano();
    loadLetter();
    this.tweens.killTweensOf(this.pig);
    this.pig.setScale(2).setTexture('chars', 'pig_walk_0').play('pig-walk');
    const walkMs = reduced ? 2500 : 5000;
    this.tweens.add({ targets: this.pig, x: 990, duration: walkMs, ease: 'Linear' });
    this.tweens.add({ targets: this.blue, volume: 0, duration: 1800, onComplete: () => this.blue.stop() });
    audio.setAmbience('off', 2);
    this.time.delayedCall(walkMs - 1000, () => {
      this.cameras.main.fadeOut(1000, ...IVORY);
      setSceneTint(null);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('GiftGarden'));
    });
  }
}

class GiftGarden extends Phaser.Scene {
  constructor() { super('GiftGarden'); }
  create() {
    const cam = this.cameras.main;
    cam.setBounds(0, 0, 1280, H);
    cam.setRoundPixels(true);
    onViewResize(this);
    addLayers(this, 'garden');
    // Ghế và phong thư: chỉ một renderer (props atlas) theo anchor layout garden_bg.
    this.add.image(1030, GROUND, 'props', 'wooden_bench').setOrigin(0.5, 1).setScale(2).setDepth(30);
    this.letterProp = this.add.image(1045, 288, 'props', 'letter').setOrigin(0.5, 1).setDepth(31)
      .setVisible(!letterReceived);
    this.leaving = false;
    // Hoa delphinium tĩnh dọc lối (không nhân bản ghế/thư).
    [180, 360, 610, 820, 1150].forEach((x, i) => {
      this.add.image(x, GROUND, 'props', ['delphinium_a', 'delphinium_b', 'delphinium_c'][i % 3])
        .setOrigin(0.5, 1).setDepth(25 + (i % 2));
    });

    this.pig = this.add.sprite(60, GROUND + 2, 'chars', 'pig_walk_0').setOrigin(0.5, 1).setScale(2).setDepth(40);
    this.pig.play('pig-walk');
    cam.startFollow(this.pig, true, 0.08, 0.08, -60, 0);
    cam.fadeIn(1100, ...IVORY);
    setSceneTint('garden');
    audio.setAmbience('garden', 2);
    if (!letterReceived) this.time.delayedCall(900, () => setCaption('Có một bức thư đang đợi bạn.'));

    const walkMs = reduced ? 4500 : 10000;
    this.tweens.add({
      targets: this.pig,
      x: 1000,
      duration: walkMs,
      ease: 'Sine.out',
      onComplete: () => (letterReceived ? this.arrive() : this.receive())
    });
    this.events.once('shutdown', () => { setCaption(''); show(ui.rest, false); });
  }

  /** Lần về vườn sau: Pig đã cầm thư, đến ghế là hiện các nút (không tự mở thư). */
  arrive() {
    this.pig.stop().setFrame('pig_letter');
    show(ui.rest, true);
  }

  /** Nút "Về biển": Pig quay lưng đi về bên trái, mờ dần rồi về biển. */
  toSea() {
    if (this.leaving) return;
    this.leaving = true;
    show(ui.rest, false);
    setCaption('');
    this.tweens.killTweensOf(this.pig);
    this.pig.setAngle(0).setFlipX(true).play('pig-walk');
    const walkMs = reduced ? 1200 : 2400;
    this.tweens.add({ targets: this.pig, x: this.pig.x - 220, duration: walkMs, ease: 'Linear' });
    audio.setAmbience('off', 1.2);
    this.time.delayedCall(walkMs - 1000, () => {
      this.cameras.main.fadeOut(1000, ...IVORY);
      setSceneTint(null);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('GiftSea', { returning: true }));
    });
  }

  receive() {
    letterReceived = true;
    this.pig.stop().setFrame('pig');
    setCaption('');
    // Nghiêng nhìn một nhịp, phong thư bay về tay rồi mở thư.
    this.tweens.add({ targets: this.pig, angle: 6, duration: 350, yoyo: true, ease: 'Sine.inOut' });
    this.tweens.add({
      targets: this.letterProp,
      x: this.pig.x + 14,
      y: this.pig.y - 22,
      duration: 700,
      delay: 500,
      ease: 'Sine.inOut',
      onComplete: () => {
        this.pig.setFrame('pig_letter');
        this.letterProp.setVisible(false);
        this.time.delayedCall(600, () => openLetter(this));
      }
    });
  }
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-container',
  width: viewWidth(),
  height: H,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#faf3e6',
  input: { keyboard: false },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  audio: { disableWebAudio: false },
  // CSP img-src không có blob: → nạp ảnh bằng HTMLImageElement (giống src/config.js, T-029).
  loader: { imageLoadType: 'HTMLImageElement' },
  scene: [GiftBoot, GiftSea, GiftGarden]
});
let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const w = viewWidth();
    if (w !== game.scale.gameSize.width) game.scale.setGameSize(w, H);
  }, 120);
});
window.__giftGame = game;
window.__giftAudio = audio; // chỉ để regression đọc trạng thái mute/piano, không có hook đổi phase
