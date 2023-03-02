import {
  SchemaDeclaration,
  CheckResult,
  ValidCallbackType,
  AsyncValidCallbackType,
  RuleType,
  ErrorMessageType,
  TypeName
} from './types';
import {
  checkRequired,
  createValidator,
  createValidatorAsync,
  isEmpty,
  formatErrorMessage
} from './utils';
import locales, { MixedTypeLocale } from './locales';

export class MixedType<ValueType = any, DataType = any, E = ErrorMessageType, L = any> {
  readonly typeName?: string;
  protected required = false;
  protected requiredMessage: E | string = '';
  protected trim = false;
  protected emptyAllowed = false;
  protected rules: RuleType<ValueType, DataType, E | string>[] = [];
  protected priorityRules: RuleType<ValueType, DataType, E | string>[] = [];

  schemaSpec: SchemaDeclaration<DataType, E>;
  value: any;
  locale: L & MixedTypeLocale;

  constructor(name?: TypeName) {
    this.typeName = name;
    this.locale = Object.assign(name ? locales[name] : {}, locales.mixed) as L & MixedTypeLocale;
  }

  setSchemaOptions(schemaSpec: SchemaDeclaration<DataType, E>, value: any) {
    this.schemaSpec = schemaSpec;
    this.value = value;
  }

  check(value: ValueType = this.value, data?: DataType, fieldName?: string | string[]) {
    if (this.required && !checkRequired(value, this.trim, this.emptyAllowed)) {
      return {
        hasError: true,
        errorMessage: formatErrorMessage(this.requiredMessage, { name: fieldName })
      };
    }

    const validator = createValidator<ValueType, DataType, E | string>(data, fieldName);

    const checkStatus = validator(value, this.priorityRules);

    if (checkStatus) {
      return checkStatus;
    }

    if (!this.required && isEmpty(value)) {
      return { hasError: false };
    }

    return validator(value, this.rules) || { hasError: false };
  }

  checkAsync(
    value: ValueType = this.value,
    data?: DataType,
    fieldName?: string | string[]
  ): Promise<CheckResult<E | string>> {
    if (this.required && !checkRequired(value, this.trim, this.emptyAllowed)) {
      return Promise.resolve({
        hasError: true,
        errorMessage: formatErrorMessage(this.requiredMessage, { name: fieldName })
      });
    }

    const validator = createValidatorAsync<ValueType, DataType, E | string>(data, fieldName);

    return new Promise(resolve =>
      validator(value, this.priorityRules)
        .then((checkStatus: CheckResult<E | string> | void | null) => {
          if (checkStatus) {
            resolve(checkStatus);
          }
        })
        .then(() => {
          if (!this.required && isEmpty(value)) {
            resolve({ hasError: false });
          }
        })
        .then(() => validator(value, this.rules))
        .then((checkStatus: CheckResult<E | string> | void | null) => {
          if (checkStatus) {
            resolve(checkStatus);
          }
          resolve({ hasError: false });
        })
    );
  }
  protected pushRule(rule: RuleType<ValueType, DataType, E | string>) {
    const { onValid, errorMessage, priority, params } = rule;
    const nextRule = {
      onValid,
      params,
      isAsync: rule.isAsync,
      errorMessage: errorMessage || this.rules?.[0]?.errorMessage
    };

    if (priority) {
      this.priorityRules.push(nextRule);
    } else {
      this.rules.push(nextRule);
    }
  }
  addRule(
    onValid: ValidCallbackType<ValueType, DataType, E | string>,
    errorMessage?: E | string,
    priority?: boolean
  ) {
    this.pushRule({ onValid, errorMessage, priority });
    return this;
  }
  addAsyncRule(
    onValid: AsyncValidCallbackType<ValueType, DataType, E | string>,
    errorMessage?: E | string,
    priority?: boolean
  ) {
    this.pushRule({ onValid, isAsync: true, errorMessage, priority });
    return this;
  }
  isRequired(errorMessage: E | string = this.locale.isRequired, trim = true) {
    this.required = true;
    this.trim = trim;
    this.requiredMessage = errorMessage;
    return this;
  }
  isRequiredOrEmpty(errorMessage: E | string = this.locale.isRequiredOrEmpty, trim = true) {
    this.required = true;
    this.trim = trim;
    this.emptyAllowed = true;
    this.requiredMessage = errorMessage;
    return this;
  }

  /**
   * Define data verification rules based on conditions.
   * @param validator
   * @example
   * MixedType().when(schema => {
   *   return schema.filed1.check() ? NumberType().min(5) : NumberType().min(0);
   * });
   */
  when(condition: (schemaSpec: SchemaDeclaration<DataType, E>) => MixedType) {
    this.addRule(
      (value, data, filedName) => {
        return condition(this.schemaSpec).check(value, data, filedName);
      },
      undefined,
      true
    );
    return this;
  }
}

export default function getMixedType<DataType = any, E = ErrorMessageType>() {
  return new MixedType<DataType, E>();
}
