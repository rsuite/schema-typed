/**
 * Sets the value at `path` of `object`, creating intermediate objects / arrays as needed.
 * Supports dot-notation, e.g. `"a.b.c"`.
 */
export function set(obj: any, path: string, value: any): void {
  if (obj == null || !path) return;
  // Normalise bracket notation
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (current[part] == null || typeof current[part] !== 'object') {
      // Create array if next key is numeric, otherwise plain object
      current[part] = /^\d+$/.test(parts[i + 1]) ? [] : {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

export default set;
