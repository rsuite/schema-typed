type Key = string | number | symbol;
type Path = Array<Key> | string;

export default function get(object: any, path: Path, defaultValue?: any): any {
  if (!object) {
    return defaultValue;
  }

  const keys = Array.isArray(path) ? path : path.split('.');
  let result = object;

  for (const key of keys) {
    if (result && typeof result === 'object') {
      result = result[key];
    } else {
      return defaultValue;
    }
  }

  return result !== undefined ? result : defaultValue;
}
