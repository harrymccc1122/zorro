const store = new Map();

function get(key) {
  const entry = store.get(key);
  if (!entry) {
    return null;
  }
  if (entry.expiresAt && entry.expiresAt <= Date.now()) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

function set(key, value, ttlMs) {
  const expiresAt = ttlMs ? Date.now() + ttlMs : null;
  store.set(key, { value, expiresAt });
}

module.exports = {
  get,
  set
};
