import { MixedType } from './MixedType';
import { ErrorMessageType } from './types';
import { StringTypeLocale } from './locales';

export class StringType<DataType = any, E = ErrorMessageType> extends MixedType<
  string,
  DataType,
  E,
  StringTypeLocale
> {
  constructor(errorMessage?: E | string) {
    super('string');
    super.pushRule({
      onValid: v => typeof v === 'string',
      errorMessage: errorMessage || this.locale.type
    });
  }

  containsLetter(errorMessage: E | string = this.locale.containsLetter) {
    super.pushRule({
      onValid: v => /[a-zA-Z]/.test(v),
      errorMessage
    });
    return this;
  }

  containsUppercaseLetter(errorMessage: E | string = this.locale.containsUppercaseLetter) {
    super.pushRule({
      onValid: v => /[A-Z]/.test(v),
      errorMessage
    });
    return this;
  }

  containsLowercaseLetter(errorMessage: E | string = this.locale.containsLowercaseLetter) {
    super.pushRule({
      onValid: v => /[a-z]/.test(v),
      errorMessage
    });
    return this;
  }

  containsLetterOnly(errorMessage: E | string = this.locale.containsLetterOnly) {
    super.pushRule({
      onValid: v => /^[a-zA-Z]+$/.test(v),
      errorMessage
    });
    return this;
  }

  containsNumber(errorMessage: E | string = this.locale.containsNumber) {
    super.pushRule({
      onValid: v => /[0-9]/.test(v),
      errorMessage
    });
    return this;
  }

  isOneOf(values: string[], errorMessage: E | string = this.locale.isOneOf) {
    super.pushRule({
      onValid: v => !!~values.indexOf(v),
      errorMessage,
      params: { values }
    });
    return this;
  }

  isEmail(errorMessage: E | string = this.locale.isEmail) {
    // http://emailregex.com/
    const regexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    super.pushRule({
      onValid: v => regexp.test(v),
      errorMessage
    });
    return this;
  }

  isURL(errorMessage: E | string = this.locale.isURL) {
    const regexp = new RegExp(
      '^(?!mailto:)(?:(?:http|https|ftp)://|//)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$',
      'i'
    );
    super.pushRule({
      onValid: v => regexp.test(v),
      errorMessage
    });
    return this;
  }
  isHex(errorMessage: E | string = this.locale.isHex) {
    const regexp = /^#?([a-f0-9]{6}|[a-f0-9]{3})$/i;
    super.pushRule({
      onValid: v => regexp.test(v),
      errorMessage
    });
    return this;
  }
  pattern(regexp: RegExp, errorMessage: E | string = this.locale.pattern) {
    super.pushRule({
      onValid: v => regexp.test(v),
      errorMessage,
      params: { regexp }
    });
    return this;
  }

  rangeLength(
    minLength: number,
    maxLength: number,
    errorMessage: E | string = this.locale.rangeLength
  ) {
    super.pushRule({
      onValid: value => value.length >= minLength && value.length <= maxLength,
      errorMessage,
      params: { minLength, maxLength }
    });
    return this;
  }

  minLength(minLength: number, errorMessage: E | string = this.locale.minLength) {
    super.pushRule({
      onValid: value => Array.from(value).length >= minLength,
      errorMessage,
      params: { minLength }
    });
    return this;
  }

  maxLength(maxLength: number, errorMessage: E | string = this.locale.maxLength) {
    super.pushRule({
      onValid: value => Array.from(value).length <= maxLength,
      errorMessage,
      params: { maxLength }
    });
    return this;
  }
}

export default function getStringType<DataType = any, E = string>(errorMessage?: E) {
  return new StringType<DataType, E>(errorMessage);
}
