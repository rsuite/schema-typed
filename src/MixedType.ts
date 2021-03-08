import { SchemaDeclaration, CheckResult, ValidCallbackType, RuleType } from './types';
import { checkRequired, createValidator, createValidatorAsync, isEmpty } from './utils';

export class MixedType<ValueType = any, DataType = any, ErrorMsgType = string> {
  readonly name?: string;
  protected required = false;
  protected requiredMessage: ErrorMsgType | string = '';
  protected trim = false;
  protected emptyAllowed = false;
  protected rules: RuleType<ValueType, DataType, ErrorMsgType | string>[] = [];
  protected priorityRules: RuleType<ValueType, DataType, ErrorMsgType | string>[] = [];

  schemaSpec: SchemaDeclaration<DataType, ErrorMsgType>;
  value: any;

  constructor(name?: string) {
    this.name = name;
  }

  setSchemaOptions(schemaSpec: SchemaDeclaration<DataType, ErrorMsgType>, value: any) {
    this.schemaSpec = schemaSpec;
    this.value = value;
  }

  check(value: ValueType = this.value, data?: DataType) {
    if (this.required && !checkRequired(value, this.trim, this.emptyAllowed)) {
      return { hasError: true, errorMessage: this.requiredMessage };
    }

    const validator = createValidator<ValueType, DataType, ErrorMsgType | string>(data);

    let checkStatus = validator(value, this.priorityRules);

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
    data?: DataType
  ): Promise<CheckResult<ErrorMsgType | string>> {
    if (this.required && !checkRequired(value, this.trim, this.emptyAllowed)) {
      return Promise.resolve({ hasError: true, errorMessage: this.requiredMessage });
    }

    const validator = createValidatorAsync<ValueType, DataType, ErrorMsgType | string>(data);

    return new Promise(resolve =>
      validator(value, this.priorityRules)
        .then((checkStatus: CheckResult<ErrorMsgType | string> | void | null) => {
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
        .then((checkStatus: CheckResult<ErrorMsgType | string> | void | null) => {
          if (checkStatus) {
            resolve(checkStatus);
          }
          resolve({ hasError: false });
        })
    );
  }
  protected pushRule(
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
    errorMessage?: ErrorMsgType | string,
    priority?: boolean
  ) {
    this.pushRule(onValid, errorMessage, priority);
    return this;
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

  /**
   * Define data verification rules based on conditions.
   * @param validator
   * @example
   * MixedType().when(schema => {
   *   return schema.filed1.check() ? NumberType().min(5) : NumberType().min(0);
   * });
   */
  when(condition: (schemaSpec: SchemaDeclaration<DataType, ErrorMsgType>) => MixedType) {
    this.addRule(
      (value, data) => {
        return condition(this.schemaSpec).check(value, data);
      },
      'error',
      true
    );
    return this;
  }
}

export default function getMixedType<DataType = any, ErrorMsgType = string>() {
  return new MixedType<DataType, ErrorMsgType>();
}
