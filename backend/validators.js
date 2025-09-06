export function validateURL(url) {
  try {
    const u = new URL(url);
    return ['http:', 'https:'].includes(u.protocol);
  } catch {
    return false;
  }
}

export function validateValidityMinutes(v) {
  if (v === undefined || v === null) return true; // default later
  return Number.isInteger(v) && v > 0 && v <= 365 * 24 * 60;
}

export function validateShortcode(code) {
  if (code === undefined || code === null || code === '') return true;
  return /^[A-Za-z0-9_-]{3,32}$/.test(code);
}
