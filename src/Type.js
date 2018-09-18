import { asyncSerialArray } from './util';

function isEmpty(value) {
  return typeof value === 'undefined' || value === null || value === '';
}

function checkRequired(value) {
  // String trim
  if (typeof value === 'string') {
    value = value.replace(/(^\s*)|(\s*$)/g, '');
  }

  // Array
  if (Array.isArray(value)) {
    return !!value.length;
  }

  return !isEmpty(value);
}

class Type {
  constructor(name) {
    this.name = name;
    this.required = false;
    this.requiredMessage = '';
    this.rules = [];
  }

  check(value, data, cb) {
    if (this.required && !checkRequired(value)) {
      cb && cb({ hasError: true, errorMessage: this.requiredMessage });

      return;
    }

    asyncSerialArray(
      this.rules,
      (rule, _, next) => {
        const { onValid, errorMessage } = rule;

        if (!this.required && isEmpty(value)) {
          next({ hasError: false });

          return;
        }

        onValid(value, data, checkStatus => {
          if (typeof checkStatus === 'boolean' && !checkStatus) {
            return next({ hasError: true, errorMessage });
          } else if (typeof checkStatus === 'string') {
            return next({ hasError: true, errorMessage: checkStatus || errorMessage });
          } else if (typeof checkStatus === 'object') {
            return next({ ...checkStatus, errorMessage: checkStatus.errorMessage || errorMessage });
          }

          return next({ hasError: false });
        });
      },
      cb
    );
  }

  addRule(onValid, errorMessage) {
    errorMessage = errorMessage || this.rules[0].errorMessage;

    this.rules.push({
      onValid,
      errorMessage
    });

    return this;
  }

  isRequired(errorMessage) {
    this.required = true;
    this.requiredMessage = errorMessage;

    return this;
  }
}

export default Type;
