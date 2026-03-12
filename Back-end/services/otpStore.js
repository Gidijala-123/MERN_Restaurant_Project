const store = new Map();

export function setOtp(key, code, ttlMs = 5 * 60 * 1000) {
  // normalize email keys to lower case for case-insensitive matching
  const normKey = key.includes("@") ? key.toLowerCase() : key;
  const expiresAt = Date.now() + ttlMs;
  store.set(normKey, { code, expiresAt });
  setTimeout(() => {
    const v = store.get(normKey);
    if (v && v.expiresAt <= Date.now()) store.delete(normKey);
  }, ttlMs + 1000);
}

export function verifyOtp(key, code) {
  const normKey = key.includes("@") ? key.toLowerCase() : key;
  const v = store.get(normKey);
  if (!v) return false;
  if (v.expiresAt < Date.now()) {
    store.delete(normKey);
    return false;
  }
  const ok = String(v.code) === String(code);
  if (ok) store.delete(normKey);
  return ok;
}
