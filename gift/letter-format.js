// Trình bày bức thư bản quà (T-069): chỉ đổi ngắt dòng/khoảng trắng, không đổi chữ.
// Thư thật đến từ /api/gift-letter; ở đây không có câu chữ nào của thư.
//
// Quy ước đọc thư thô:
// - Dòng trống = hết đoạn. Các dòng liền nhau trong một đoạn được nối lại để tự wrap
//   (nối bằng dấu cách, hoặc không cách nếu chỗ nối là chữ/dấu câu Nhật).
// - Đoạn đầu ngắn (Dear …/Gửi …/…へ) = lời chào, giữ từng dòng. Phần trong ngoặc ở dòng
//   chào (biệt danh) được hạ thành dòng nhỏ hơn.
// - Dòng chỉ gồm ・ (vd "・・") = nhịp nghỉ.
// - Từ dòng bắt đầu bằng P.S./PS/P/S tới hết = tái bút.
// - Đoạn cuối trước P.S. (hoặc cuối thư) ngắn = chữ ký, giữ từng dòng.
// Bất biến: bỏ mọi khoảng trắng thì chữ hiển thị trùng khớp thư gốc (lettersMatch).

const CJK = /[　-〿぀-ヿㇰ-ㇿ㐀-䶿一-鿿豈-﫿＀-￯]/u;
const CJK_ALL = /[぀-ヿㇰ-ㇿ㐀-䶿一-鿿豈-﫿]/gu;
const PAUSE = /^[・･·•‧∙\s]*[・･][・･·•‧∙\s]*$/u;
const PS = /^(?:P\.\s?S\b|P\.?S\.?(?=[\s:：.,、]|$)|P\/S\b)/iu;
const GREETING = /^(?:dear|gửi|thân gửi|thương gửi|kính gửi|to|hi|hello|chào|親愛なる)(?=[\s,，、:：!！]|$)/iu;
const GREETING_END = /(?:へ|さんへ|ちゃんへ|[,，、:：])$/u;
const SENTENCE_END = /[.!?。！？]$/u;

export const MAX_GREETING_LINES = 3;
export const MAX_SIGNATURE_LINES = 3;
export const SHORT_LINE = 40;

const len = (s) => [...s].length;

/** Nối các dòng của một đoạn thành một dòng tự wrap. */
export function joinLines(lines) {
  let out = '';
  for (const line of lines) {
    if (!out) { out = line; continue; }
    const glue = CJK.test(out.slice(-1)) || CJK.test(line[0]) ? '' : ' ';
    out += glue + line;
  }
  return out;
}

/** 'ja' nếu chữ Nhật chiếm phần lớn đoạn, ngược lại 'vi'. */
export function detectLang(text) {
  const visible = text.replace(/[\s\p{P}\p{S}\d]/gu, '');
  if (!visible) return 'vi';
  const ja = (text.match(CJK_ALL) || []).length;
  return ja / [...visible].length >= 0.3 ? 'ja' : 'vi';
}

/** Tách dòng chào thành phần chính + phần trong ngoặc (biệt danh), không đổi chữ. */
export function splitGreetingLine(line) {
  const aka = line.search(/\s(?:aka|a\.k\.a\.?)\s/iu);
  const paren = line.search(/[(（]/u);
  const i = [aka >= 0 ? aka + 1 : -1, paren].filter((x) => x > 0).sort((a, b) => a - b)[0];
  if (!i) return { main: line, aside: '' };
  return { main: line.slice(0, i).trimEnd(), aside: line.slice(i) };
}

/** Gộp các dòng chào khi ngoặc (biệt danh) mở ở dòng trên, đóng ở dòng dưới. */
export function mergeOpenParens(lines) {
  const out = [];
  let depth = 0;
  for (const line of lines) {
    if (depth > 0 && out.length) out[out.length - 1] = joinLines([out.at(-1), line]);
    else out.push(line);
    depth += (line.match(/[(（]/gu) || []).length - (line.match(/[)）]/gu) || []).length;
    if (depth < 0) depth = 0;
  }
  return out;
}

function paragraphsOf(text) {
  const lines = String(text).replace(/\r\n?/g, '\n').split('\n').map((l) => l.trim());
  const paras = [];
  let cur = [];
  const flush = () => { if (cur.length) paras.push(cur); cur = []; };
  for (const line of lines) {
    if (!line) { flush(); continue; }
    if (PAUSE.test(line)) { flush(); paras.push({ pause: line }); continue; }
    if (PS.test(line)) { flush(); paras.push({ ps: true }); }
    cur.push(line);
  }
  flush();
  return paras;
}

/**
 * Dòng hiển thị của một đoạn: tiếng Việt gom thành văn xuôi tự wrap; tiếng Nhật giữ mỗi câu
 * một dòng (thư viết câu ngắn, không 。 cuối), chỉ nối khi dòng trên dừng ở 、 hoặc ，.
 */
export function paraLines(lines, lang) {
  if (lang !== 'ja') return [joinLines(lines)];
  const out = [];
  for (const l of lines) {
    if (out.length && /[、，]$/u.test(out.at(-1))) out[out.length - 1] = joinLines([out.at(-1), l]);
    else out.push(l);
  }
  return out;
}

function isShortBlock(lines, max) {
  return lines.length <= max && lines.every((l) => len(l) <= SHORT_LINE);
}

/**
 * Phân thư thô thành các khối trình bày:
 * { type:'greeting', lines:[{main, aside}] } | { type:'para', lang, text, lead?, shift? }
 * | { type:'pause', text } | { type:'signature', lines:[…] } | { type:'ps', paras:[{lang,text}] }
 */
export function formatLetter(raw) {
  const paras = paragraphsOf(raw);
  const blocks = [];

  // Tái bút: mọi thứ từ dấu P.S. đầu tiên.
  const psAt = paras.findIndex((p) => p && p.ps === true);
  const body = psAt >= 0 ? paras.slice(0, psAt) : paras.slice();
  const psParas = psAt >= 0 ? paras.slice(psAt + 1) : [];

  // Lời chào: đoạn đầu (hoặc phần đầu của đoạn đầu) nếu là câu chào ngắn.
  if (Array.isArray(body[0])) {
    const first = mergeOpenParens(body[0]);
    body[0] = first;
    const looksGreeting = GREETING.test(first[0]) || GREETING_END.test(first[0]);
    if (looksGreeting && len(splitGreetingLine(first[0]).main) <= SHORT_LINE * 2) {
      let n = 1;
      while (n < first.length && n < MAX_GREETING_LINES && len(first[n]) <= SHORT_LINE
        && !SENTENCE_END.test(first[n - 1]) && !SENTENCE_END.test(first[n])) n++;
      // Cả đoạn ngắn → toàn bộ là lời chào; còn lại thì chỉ các dòng đầu.
      if (n < first.length && !isShortBlock(first, MAX_GREETING_LINES)) {
        body.splice(0, 1, first.slice(0, n), first.slice(n));
      }
      blocks.push({ type: 'greeting', lines: body.shift().map(splitGreetingLine) });
    } else if (body.length > 1 && isShortBlock(first, 2) && !SENTENCE_END.test(first.at(-1))) {
      blocks.push({ type: 'greeting', lines: body.shift().map(splitGreetingLine) });
    }
  }

  // Chữ ký: đoạn cuối của thân thư nếu ngắn và không phải đoạn duy nhất.
  let signature = null;
  const lastIdx = body.length - 1;
  if (lastIdx >= 1 && Array.isArray(body[lastIdx]) && isShortBlock(body[lastIdx], MAX_SIGNATURE_LINES)
    && !SENTENCE_END.test(body[lastIdx].at(-1))) {
    signature = body.pop();
  }

  let prevLang = null;
  let leadDone = false;
  let afterPause = false;
  for (const p of body) {
    if (!Array.isArray(p)) {
      blocks.push({ type: 'pause', text: p.pause });
      afterPause = true;
      continue;
    }
    const text = joinLines(p);
    const lang = detectLang(text);
    const block = { type: 'para', lang, text, lines: paraLines(p, lang) };
    if (!leadDone) { leadDone = true; if (len(text) <= 160) block.lead = true; }
    if (prevLang && prevLang !== lang && !afterPause) block.shift = true;
    prevLang = lang;
    afterPause = false;
    blocks.push(block);
  }
  if (signature) blocks.push({ type: 'signature', lines: signature });
  if (psParas.length) {
    blocks.push({
      type: 'ps',
      paras: psParas.map((p) => {
        if (!Array.isArray(p)) return { lang: 'vi', text: p.pause, pause: true };
        const lang = detectLang(joinLines(p));
        return { lang, text: joinLines(p), lines: paraLines(p, lang) };
      })
    });
  }
  return blocks;
}

/** Toàn bộ chữ của các khối, theo thứ tự hiển thị. */
export function blocksText(blocks) {
  const parts = [];
  for (const b of blocks) {
    if (b.type === 'greeting') b.lines.forEach((l) => parts.push(l.main, l.aside));
    else if (b.type === 'signature') parts.push(...b.lines);
    else if (b.type === 'ps') b.paras.forEach((p) => parts.push(p.text));
    else parts.push(b.text);
  }
  return parts.join('\n');
}

/** So khớp bỏ khoảng trắng: chứng minh không mất/đổi/đảo chữ. */
export function lettersMatch(raw, shown) {
  const strip = (s) => String(s).replace(/\s+/gu, '');
  return strip(raw) === strip(shown);
}

/**
 * Dựng DOM thư bằng createElement + textContent (không innerHTML).
 * Trả false (và để nguyên dạng thô) nếu bố cục làm lệch chữ.
 */
export function renderLetter(container, raw, doc = container.ownerDocument) {
  const blocks = formatLetter(raw);
  const frag = doc.createDocumentFragment();
  const el = (tag, cls, text, lang) => {
    const n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (lang) n.lang = lang;
    if (text != null) n.textContent = text;
    return n;
  };
  // Chèn chữ kèm <br> giữa các dòng và <wbr> sau "/" (chỗ ngắt dòng gợi ý); chỉ text node.
  const fill = (node, lines) => {
    lines.forEach((line, i) => {
      if (i) node.append(doc.createElement('br'));
      line.split(/(?<=\/)/u).forEach((part, k) => {
        if (k) node.append(doc.createElement('wbr'));
        node.append(doc.createTextNode(part));
      });
    });
    return node;
  };
  const para = (cls, b) => {
    const n = el('p', cls, null, b.lang);
    const lines = b.lines || [b.text];
    const label = /^(?:P\.?\s?S\.?|P\/S)[:：]?$/iu.test(lines[0]) && lines.length > 1;
    if (label) n.append(el('span', 'gl-ps-label', lines[0]), doc.createElement('br'));
    const rest = label ? lines.slice(1) : lines;
    // Nhiều câu (tiếng Nhật): mỗi câu một khối để phân biệt với dòng tự wrap.
    if (rest.length > 1) rest.forEach((l) => n.append(fill(el('span', 'gl-line'), [l])));
    else fill(n, rest);
    return n;
  };
  for (const b of blocks) {
    if (b.type === 'greeting') {
      const box = el('div', 'gl-greeting');
      b.lines.forEach((l, i) => {
        const line = el('p', i === 0 ? 'gl-dear' : 'gl-dear-sub', null, detectLang(l.main + l.aside) === 'ja' ? 'ja' : null);
        line.append(el('span', 'gl-dear-main', l.main));
        if (l.aside) line.append(fill(el('span', 'gl-aside'), [l.aside]));
        box.append(line);
      });
      frag.append(box);
    } else if (b.type === 'pause') {
      frag.append(el('p', 'gl-pause', b.text));
    } else if (b.type === 'para') {
      const cls = ['gl-p', b.lead && 'gl-lead', b.shift && 'gl-shift'].filter(Boolean).join(' ');
      frag.append(para(cls, b));
    } else if (b.type === 'signature') {
      const box = el('div', 'gl-sign');
      b.lines.forEach((l) => box.append(el('p', 'gl-sign-line', l, detectLang(l) === 'ja' ? 'ja' : null)));
      frag.append(box);
    } else if (b.type === 'ps') {
      const box = el('div', 'gl-ps');
      b.paras.forEach((p) => box.append(p.pause ? el('p', 'gl-pause', p.text) : para('gl-p', p)));
      frag.append(box);
    }
  }
  container.replaceChildren(frag);
  container.classList.add('is-formatted');
  if (!lettersMatch(raw, container.textContent)) {
    container.classList.remove('is-formatted');
    container.textContent = raw;
    return false;
  }
  return true;
}
