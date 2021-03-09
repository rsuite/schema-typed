function basicEmptyCheck(value?: any) {
  return typeof value === 'undefined' || value === null;
}

export default basicEmptyCheck;
