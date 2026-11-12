// Bản tĩnh: thư đã giải mã ở cổng mật khẩu (gate.js), chỉ giữ trong bộ nhớ.
let text = null;
export function unlock(t) { text = typeof t === 'string' && t.trim() ? t.replace(/\r\n?/g, '\n') : null; }
export function fetchLetter() { return Promise.resolve(text); }
export function logout() { text = null; window.location.reload(); }
