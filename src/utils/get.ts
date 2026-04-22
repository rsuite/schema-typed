/**
 * Gets the value at `path` of `object`.
 * Supports dot-notation and bracket array notation, e.g. `"a.b[0].c"`.
 * Returns `undefined` for missing paths without throwing.
 */
export function get(obj: any, path: string): any {
  if (obj == null || !path) return undefined;
  // Normalise bracket notation: "a[0].b" → "a.0.b"
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  return current;
}

export default get;
