import basicEmptyCheck from './basicEmptyCheck';
import isEmpty from './isEmpty';

function checkRequired(value: any, trim: boolean, emptyAllowed: boolean) {
  // String trim
  if (trim && typeof value === 'string') {
    value = value.replace(/(^\s*)|(\s*$)/g, '');
  }

  if (emptyAllowed) {
    return !basicEmptyCheck(value);
  }

  // Array
  if (Array.isArray(value)) {
    return !!value.length;
  }

  return !isEmpty(value);
}

export default checkRequired;
