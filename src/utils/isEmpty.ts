function isEmpty(value?: any) {
  return typeof value === 'undefined' || value === null || value === '';
}

export default isEmpty;
