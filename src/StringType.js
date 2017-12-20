import Type from './Type';

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
    /* eslint-disable */
    super.addRule(v => ~strArr.indexOf(v), errorMessage);
    return this;
  }

  isEmail(errorMessage) {
    /* eslint-disable */
    let re = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
    super.addRule(v => re.test(v), errorMessage);
    return this;
  }

  isURL(errorMessage) {
    let re = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
    super.addRule(v => re.test(v), errorMessage);
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
    super.addRule(value => value.length >= minLength, errorMessage);
    return this;
  }

  maxLength(maxLength, errorMessage) {
    super.addRule(value => value.length <= maxLength, errorMessage);
    return this;
  }

}

export default (errorMessage) => new StringType(errorMessage);
