const store = new Map();

export function setOtp(key, code, ttlMs = 5 * 60 * 1000) {
  const expiresAt = Date.now() + ttlMs;
  store.set(key, { code, expiresAt });
  setTimeout(() => {
    const v = store.get(key);
    if (v && v.expiresAt <= Date.now()) store.delete(key);
  }, ttlMs + 1000);
}

export function verifyOtp(key, code) {
  const v = store.get(key);
  if (!v) return false;
  if (v.expiresAt < Date.now()) {
    store.delete(key);
    return false;
  }
  const ok = String(v.code) === String(code);
  if (ok) store.delete(key);
  return ok;
}

