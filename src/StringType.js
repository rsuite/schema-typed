import Type from './Type';

/* eslint-disable no-bitwise */

class StringType extends Type {
  static from(s) {
    return `${s}`;
  }

  constructor(errorMessage = 'Please enter a valid string') {
    super('string');
    super.addRule(v => typeof v === 'string', errorMessage);
  }

  containsLetter(errorMessage) {
    super.addRule(v => /[a-zA-Z]/.test(v), errorMessage);

    return this;
  }

  containsUppercaseLetter(errorMessage) {
    super.addRule(v => /[A-Z]/.test(v), errorMessage);

    return this;
  }

  containsLowercaseLetter(errorMessage) {
    super.addRule(v => /[a-z]/.test(v), errorMessage);

    return this;
  }

  containsLetterOnly(errorMessage) {
    super.addRule(v => /^[a-zA-Z]+$/.test(v), errorMessage);

    return this;
  }

  containsNumber(errorMessage) {
    super.addRule(v => /[0-9]/.test(v), errorMessage);

    return this;
  }

  isOneOf(strArr, errorMessage) {
    super.addRule(v => ~strArr.indexOf(v), errorMessage);

    return this;
  }

  isEmail(errorMessage) {
    // http://emailregex.com/
    const regexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    super.addRule(v => regexp.test(v), errorMessage);

    return this;
  }

  isURL(errorMessage) {
    const regexp = new RegExp(
      '^(?!mailto:)(?:(?:http|https|ftp)://|//)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$',
      'i'
    );

    super.addRule(v => regexp.test(v), errorMessage);

    return this;
  }
  isHex(errorMessage) {
    const regexp = /^#?([a-f0-9]{6}|[a-f0-9]{3})$/i;

    super.addRule(v => regexp.test(v), errorMessage);

    return this;
  }
  pattern(regexp, errorMessage) {
    super.addRule(value => regexp.test(value), errorMessage);

    return this;
  }

  rangeLength(minLength, maxLength, errorMessage) {
    super.addRule(value => value.length >= minLength && value.length <= maxLength, errorMessage);

    return this;
  }

  minLength(minLength, errorMessage) {
    super.addRule(value => [...value].length >= minLength, errorMessage);

    return this;
  }

  maxLength(maxLength, errorMessage) {
    super.addRule(value => [...value].length <= maxLength, errorMessage);

    return this;
  }
}

export default errorMessage => new StringType(errorMessage);
