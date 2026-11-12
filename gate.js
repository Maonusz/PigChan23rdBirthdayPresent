// Cổng mật khẩu bản tĩnh: giải mã thư rồi mới chạy game. Mật khẩu không lưu ở đâu.
import { unlock } from './gift/letter-source.js';

const form = document.getElementById('gate-form');
const pw = document.getElementById('gate-pw');
const btn = document.getElementById('gate-btn');
const err = document.getElementById('gate-error');
const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
let box = null;

async function openLetter(password) {
  box ??= await (await fetch('letter.enc.json', { cache: 'no-store' })).json();
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password.normalize('NFC')), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: fromB64(box.salt), iterations: box.iter },
    base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(box.iv) }, key, fromB64(box.ct));
  return new TextDecoder().decode(plain);
}

pw.focus();
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  btn.disabled = true;
  err.hidden = true;
  btn.textContent = 'Đang mở…';
  try {
    const text = await openLetter(pw.value);
    pw.value = '';
    unlock(text);
    document.getElementById('gate').remove();
    await import('./gift/main.js');
  } catch {
    err.textContent = 'Mật khẩu chưa đúng.';
    err.hidden = false;
    btn.disabled = false;
    btn.textContent = 'Mở quà';
    pw.select();
  }
});
