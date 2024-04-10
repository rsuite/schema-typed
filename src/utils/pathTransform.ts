export default function pathTransform(path: string) {
  const arr = path.split('.');

  if (arr.length === 1) {
    return path;
  }

  return path
    .split('.')
    .map((item, index) => {
      if (index === 0) {
        return item;
      }

      // Check if the item is a number, e.g. `list.0`
      return /^\d+$/.test(item) ? `array.${item}` : `object.${item}`;
    })
    .join('.');
}
