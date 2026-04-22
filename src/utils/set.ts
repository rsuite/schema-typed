/**
 * Sets the value at `path` of `object`, creating intermediate objects / arrays as needed.
 * Supports dot-notation, e.g. `"a.b.c"`.
 * Keys that could lead to prototype pollution (`__proto__`, `constructor`, `prototype`)
 * are silently ignored.
 */

const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function set(obj: any, path: string, value: any): void {
  if (obj == null || !path) return;
  // Normalize bracket notation
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (UNSAFE_KEYS.has(part)) return;
    if (current[part] == null || typeof current[part] !== 'object') {
      // Create array if next key is numeric, otherwise plain object
      current[part] = /^\d+$/.test(parts[i + 1]) ? [] : {};
    }
    current = current[part];
  }
  const lastPart = parts[parts.length - 1];
  if (!UNSAFE_KEYS.has(lastPart)) {
    current[lastPart] = value;
  }
}

export default set;
