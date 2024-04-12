import {
  SchemaDeclaration,
  CheckResult,
  ValidCallbackType,
  AsyncValidCallbackType,
  RuleType,
  ErrorMessageType,
  TypeName,
  PlainObject
} from './types';
import {
  checkRequired,
  createValidator,
  createValidatorAsync,
  isEmpty,
  shallowEqual,
  formatErrorMessage,
  get
} from './utils';
import { joinName } from './utils/formatErrorMessage';
import locales, { MixedTypeLocale } from './locales';

type ProxyOptions = {
  // Check if the value exists
  checkIfValueExists?: boolean;
};

export const schemaSpecKey = 'objectTypeSchemaSpec';

/**
 * Get the field type from the schema object
 */
export function getFieldType(schemaSpec: any, fieldName: string, nestedObject?: boolean) {
  if (nestedObject) {
    const namePath = fieldName.split('.').join(`.${schemaSpecKey}.`);
    return get(schemaSpec, namePath);
  }
  return schemaSpec?.[fieldName];
}

/**
 * Get the field value from the data object
 */
export function getFieldValue(data: PlainObject, fieldName: string, nestedObject?: boolean) {
  return nestedObject ? get(data, fieldName) : data?.[fieldName];
}

export class MixedType<ValueType = any, DataType = any, E = ErrorMessageType, L = any> {
  readonly $typeName?: string;
  protected required = false;
  protected requiredMessage: E | string = '';
  protected trim = false;
  protected emptyAllowed = false;
  protected rules: RuleType<ValueType, DataType, E | string>[] = [];
  protected priorityRules: RuleType<ValueType, DataType, E | string>[] = [];
  protected fieldLabel?: string;

  $schemaSpec: SchemaDeclaration<DataType, E>;
  value: any;
  locale: L & MixedTypeLocale;

  // The field name that depends on the verification of other fields
  otherFields: string[] = [];
  proxyOptions: ProxyOptions = {};

  constructor(name?: TypeName) {
    this.$typeName = name;
    this.locale = Object.assign(name ? locales[name] : {}, locales.mixed) as L & MixedTypeLocale;
  }

  setSchemaOptions(schemaSpec: SchemaDeclaration<DataType, E>, value: any) {
    this.$schemaSpec = schemaSpec;
    this.value = value;
  }

  check(value: any = this.value, data?: DataType, fieldName?: string | string[]) {
    if (this.required && !checkRequired(value, this.trim, this.emptyAllowed)) {
      return {
        hasError: true,
        errorMessage: formatErrorMessage(this.requiredMessage, {
          name: this.fieldLabel || joinName(fieldName)
        })
      };
    }

    const validator = createValidator<ValueType, DataType, E | string>(
      data,
      fieldName,
      this.fieldLabel
    );

    const checkResult = validator(value, this.priorityRules);

    // If the priority rule fails, return the result directly
    if (checkResult) {
      return checkResult;
    }

    if (!this.required && isEmpty(value)) {
      return { hasError: false };
    }

    return validator(value, this.rules) || { hasError: false };
  }

  checkAsync(
    value: any = this.value,
    data?: DataType,
    fieldName?: string | string[]
  ): Promise<CheckResult<E | string>> {
    if (this.required && !checkRequired(value, this.trim, this.emptyAllowed)) {
      return Promise.resolve({
        hasError: true,
        errorMessage: formatErrorMessage(this.requiredMessage, {
          name: this.fieldLabel || joinName(fieldName)
        })
      });
    }

    const validator = createValidatorAsync<ValueType, DataType, E | string>(
      data,
      fieldName,
      this.fieldLabel
    );

    return new Promise(resolve =>
      validator(value, this.priorityRules)
        .then((checkResult: CheckResult<E | string> | void | null) => {
          // If the priority rule fails, return the result directly
          if (checkResult) {
            resolve(checkResult);
          }
        })
        .then(() => {
          if (!this.required && isEmpty(value)) {
            resolve({ hasError: false });
          }
        })
        .then(() => validator(value, this.rules))
        .then((checkResult: CheckResult<E | string> | void | null) => {
          if (checkResult) {
            resolve(checkResult);
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
    errorMessage?: E | string | (() => E | string),
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
   * @param condition
   * @example
   *
   * ```js
   * SchemaModel({
   *   option: StringType().isOneOf(['a', 'b', 'other']),
   *   other: StringType().when(schema => {
   *     const { value } = schema.option;
   *     return value === 'other' ? StringType().isRequired('Other required') : StringType();
   *   })
   * });
   * ```
   */
  when(condition: (schemaSpec: SchemaDeclaration<DataType, E>) => MixedType) {
    this.addRule(
      (value, data, fieldName) => {
        return condition(this.$schemaSpec).check(value, data, fieldName);
      },
      undefined,
      true
    );
    return this;
  }

  /**
   * Check if the value is equal to the value of another field.
   * @example
   *
   * ```js
   * SchemaModel({
   *   password: StringType().isRequired(),
   *   confirmPassword: StringType().equalTo('password').isRequired()
   * });
   * ```
   */
  equalTo(fieldName: string, errorMessage: E | string = this.locale.equalTo) {
    const errorMessageFunc = () => {
      const type = getFieldType(this.$schemaSpec, fieldName, true);
      return formatErrorMessage(errorMessage, { toFieldName: type?.fieldLabel || fieldName });
    };

    this.addRule((value, data) => {
      return shallowEqual(value, get(data, fieldName));
    }, errorMessageFunc);
    return this;
  }

  /**
   * After the field verification passes, proxy verification of other fields.
   * @param options.checkIfValueExists When the value of other fields exists, the verification is performed (default: false)
   * @example
   *
   * ```js
   * SchemaModel({
   *   password: StringType().isRequired().proxy(['confirmPassword']),
   *   confirmPassword: StringType().equalTo('password').isRequired()
   * });
   * ```
   */
  proxy(fieldNames: string[], options?: ProxyOptions) {
    this.otherFields = fieldNames;
    this.proxyOptions = options || {};
    return this;
  }

  /**
   * Overrides the key name in error messages.
   *
   * @example
   * ```js
   * SchemaModel({
   *  first_name: StringType().label('First name'),
   *  age: NumberType().label('Age')
   * });
   * ```
   */
  label(label: string) {
    this.fieldLabel = label;
    return this;
  }
}

export default function getMixedType<DataType = any, E = ErrorMessageType>() {
  return new MixedType<DataType, E>();
}
