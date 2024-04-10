type Key = string | number | symbol;
type Path = Array<Key> | string;

export default function set(object: any, path: Path, value: any): any {
  if (!object) {
    return object;
  }

  const keys = Array.isArray(path) ? path : path.split('.');
  const length = keys.length;

  for (let i = 0; i < length - 1; i++) {
    const key = keys[i];
    if (!object[key] || typeof object[key] !== 'object') {
      object[key] = {};
    }
    object = object[key];
  }

  object[keys[length - 1]] = value;
  return object;
}
