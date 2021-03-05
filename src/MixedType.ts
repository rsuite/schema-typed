import { SchemaDeclaration, CheckResult, ValidCallbackType, PlainObject, RuleType } from './types';

function isEmpty(value?: any) {
  return typeof value === 'undefined' || value === null || value === '';
}
function basicEmptyCheck(value?: any) {
  return typeof value === 'undefined' || value === null;
}
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

/**
 * Create a data validator
 * @param data
 */
function createValidator<V, D, E>(data?: D) {
  return (value: V, rules: RuleType<V, D, E>[]): CheckResult<E> | null => {
    for (let i = 0; i < rules.length; i += 1) {
      const { onValid, errorMessage } = rules[i];
      const checkResult = onValid(value, data);

      if (checkResult === false) {
        return { hasError: true, errorMessage };
      } else if (typeof checkResult === 'object' && (checkResult.hasError || checkResult.array)) {
        return checkResult;
      }
    }

    return null;
  };
}

/**
 * Create a data asynchronous validator
 * @param data
 */
function createValidatorAsync<V, D, E>(data?: D) {
  function check(errorMessage?: E) {
    return (checkResult: CheckResult<E> | boolean): CheckResult<E> | null => {
      if (checkResult === false) {
        return { hasError: true, errorMessage };
      } else if (typeof checkResult === 'object' && (checkResult.hasError || checkResult.array)) {
        return checkResult;
      }
      return null;
    };
  }

  return (value: V, rules: RuleType<V, D, E>[]) => {
    const promises = rules.map(rule => {
      const { onValid, errorMessage } = rule;
      return Promise.resolve(onValid(value, data)).then(check(errorMessage));
    });

    return Promise.all(promises).then(results =>
      results.find((item: CheckResult<E> | null) => item && item?.hasError)
    );
  };
}

export class MixedType<ValueType = any, DataType = PlainObject, ErrorMsgType = string> {
  readonly name?: string;
  private required = false;
  private requiredMessage: ErrorMsgType | string = '';
  private trim = false;
  private emptyAllowed = false;
  private schemaShape: SchemaDeclaration<DataType, ErrorMsgType>;
  private rules: RuleType<ValueType, DataType, ErrorMsgType | string>[] = [];
  private priorityRules: RuleType<ValueType, DataType, ErrorMsgType | string>[] = [];

  constructor(name?: string) {
    this.name = name;
  }
  check(value: ValueType, data?: DataType) {
    const check = (value: any, data: any, type: any) => {
      if (type.required && !checkRequired(value, type.trim, type.emptyAllowed)) {
        return { hasError: true, errorMessage: type.requiredMessage };
      }

      if (type.schemaShape && typeof value === 'object') {
        const checkResult: any = {};
        Object.entries(type.schemaShape).forEach(([k, v]) => {
          checkResult[k] = check(value[k], value, v);
        });

        return { object: checkResult };
      }

      const validator = createValidator<ValueType, DataType, ErrorMsgType | string>(data);

      let checkStatus = validator(value, type.priorityRules);

      if (checkStatus) {
        return checkStatus;
      }

      if (!type.required && isEmpty(value)) {
        return { hasError: false };
      }

      checkStatus = validator(value, type.rules) || { hasError: false };

      if (checkStatus) {
        return checkStatus;
      }
    };

    return check(value, data, this) as CheckResult<ErrorMsgType | string>;
  }

  checkAsync(value: ValueType, data?: DataType) {
    const check = (value: any, data: any, type: any) => {
      if (this.required && !checkRequired(value, type.trim, type.emptyAllowed)) {
        return Promise.resolve({ hasError: true, errorMessage: type.requiredMessage });
      }

      const validator = createValidatorAsync<ValueType, DataType, ErrorMsgType | string>(data);

      return new Promise(resolve => {
        if (type.schemaShape && typeof value === 'object') {
          const checkResult: any = {};
          const checkAll: Promise<unknown>[] = [];
          const keys: string[] = [];
          Object.entries(type.schemaShape).forEach(([k, v]) => {
            checkAll.push(check(value[k], value, v));
            keys.push(k);
          });

          return Promise.all(checkAll).then(values => {
            values.forEach((v, index) => {
              checkResult[keys[index]] = v;
            });

            resolve({ object: checkResult });
          });
        }

        return validator(value, type.priorityRules)
          .then((checkStatus: CheckResult<ErrorMsgType | string> | void | null) => {
            if (checkStatus) {
              resolve(checkStatus);
            }
          })
          .then(() => {
            if (!type.required && isEmpty(value)) {
              resolve({ hasError: false });
            }
          })
          .then(() => validator(value, type.rules))
          .then((checkStatus: CheckResult<ErrorMsgType | string> | void | null) => {
            if (checkStatus) {
              resolve(checkStatus);
            }
            resolve({ hasError: false });
          });
      });
    };

    return check(value, data, this) as Promise<CheckResult<ErrorMsgType | string>>;
  }
  pushRule(
    onValid: ValidCallbackType<ValueType, DataType, ErrorMsgType | string>,
    errorMessage?: ErrorMsgType | string,
    priority?: boolean
  ) {
    errorMessage = errorMessage || this.rules?.[0]?.errorMessage;

    if (priority) {
      this.priorityRules.push({ onValid, errorMessage });
    } else {
      this.rules.push({ onValid, errorMessage });
    }
  }
  addRule(
    onValid: ValidCallbackType<ValueType, DataType, ErrorMsgType | string>,
    errorMessage?: ErrorMsgType,
    priority?: boolean
  ) {
    this.pushRule(onValid, errorMessage, priority);
    return this;
  }

  setSchemaShape(shape: SchemaDeclaration<DataType, ErrorMsgType>) {
    this.schemaShape = shape;
  }
  isRequired(errorMessage: ErrorMsgType | string, trim = true) {
    this.required = true;
    this.trim = trim;
    this.requiredMessage = errorMessage;
    return this;
  }
  isRequiredOrEmpty(errorMessage: ErrorMsgType | string, trim = true) {
    this.required = true;
    this.trim = trim;
    this.emptyAllowed = true;
    this.requiredMessage = errorMessage;
    return this;
  }
}

export default function getMixedType<DataType = any, ErrorMsgType = string>() {
  return new MixedType<DataType, ErrorMsgType>();
}
