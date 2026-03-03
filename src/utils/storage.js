export const storage = {
  get: (key, fallback) => {
    try {
      const item = localStorage.getItem(`pp_${key}`);
      return item ? JSON.parse(item) : fallback;
    } catch { return fallback; }
  },
  set: (key, value) => {
    try { localStorage.setItem(`pp_${key}`, JSON.stringify(value)); } catch (e) { console.error('Storage full?', e); }
  }
};
