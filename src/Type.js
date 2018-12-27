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

function getCheck(data) {
  return (value, rules) => {
    for (let i = 0; i < rules.length; i += 1) {
      let { onValid, errorMessage } = rules[i];
      let checkResult = onValid(value, data);

      if (typeof checkResult === 'boolean' && !checkResult) {
        return { hasError: true, errorMessage };
      } else if (typeof checkResult === 'object') {
        return checkResult;
      }
    }

    return null;
  };
}

class Type {
  constructor(name) {
    this.name = name;
    this.required = false;
    this.requiredMessage = '';
    this.rules = [];
  }

  check(value, data) {
    if (this.required && !checkRequired(value)) {
      return { hasError: true, errorMessage: this.requiredMessage };
    }

    const checkValue = getCheck(data);
    let rules = [];
    let customRules = [];
    let checkStatus = null;

    this.rules.forEach(item => {
      if (item.customRule) {
        customRules.push(item);
      } else {
        rules.push(item);
      }
    });

    checkStatus = checkValue(value, customRules);
    if (checkStatus !== null) {
      return checkStatus;
    }

    if (!this.required && isEmpty(value)) {
      return { hasError: false };
    }

    checkStatus = checkValue(value, rules);
    if (checkStatus !== null) {
      return checkStatus;
    }

    return { hasError: false };
  }
  pushCheck(onValid, errorMessage, customRule) {
    errorMessage = errorMessage || this.rules[0].errorMessage;
    this.rules.push({
      onValid,
      errorMessage,
      customRule
    });
  }
  addRule(onValid, errorMessage) {
    this.pushCheck(onValid, errorMessage, true);
    return this;
  }
  isRequired(errorMessage) {
    this.required = true;
    this.requiredMessage = errorMessage;
    return this;
  }
}

export default Type;
