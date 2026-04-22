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

/** Options passed to `check()` / `checkForField()`. */
export interface CheckOptions {
  /** Collect ALL validation errors for a field instead of stopping at the first one. */
  abortEarly?: boolean;
}

export const schemaSpecKey = 'objectTypeSchemaSpec';
export const arrayTypeSchemaSpec = 'arrayTypeSchemaSpec';

/**
 * Get the field type from the schema object
 */
export function getFieldType(schemaSpec: any, fieldName: string, nestedObject?: boolean) {
  if (schemaSpec) {
    if (nestedObject) {
      const namePath = fieldName.split('.');
      const currentField = namePath[0];
      const arrayMatch = currentField.match(/(\w+)\[(\d+)\]/);
      if (arrayMatch) {
        const [, arrayField, arrayIndex] = arrayMatch;
        const type = schemaSpec[arrayField];
        if (type?.[arrayTypeSchemaSpec]) {
          const arrayType = type[arrayTypeSchemaSpec];

          if (namePath.length > 1) {
            if (arrayType[schemaSpecKey]) {
              return getFieldType(arrayType[schemaSpecKey], namePath.slice(1).join('.'), true);
            }
            if (Array.isArray(arrayType) && arrayType[parseInt(arrayIndex)][schemaSpecKey]) {
              return getFieldType(
                arrayType[parseInt(arrayIndex)][schemaSpecKey],
                namePath.slice(1).join('.'),
                true
              );
            }
          }
          if (Array.isArray(arrayType)) {
            return arrayType[parseInt(arrayIndex)];
          }
          // Otherwise return the array element type directly
          return arrayType;
        }
        return type;
      } else {
        const type = schemaSpec[currentField];

        if (namePath.length === 1) {
          return type;
        }

        if (namePath.length > 1 && type && type[schemaSpecKey]) {
          return getFieldType(type[schemaSpecKey], namePath.slice(1).join('.'), true);
        }
      }
    }
    return schemaSpec?.[fieldName];
  }
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

  /** When `true`, a `null` value is treated as valid regardless of other rules. */
  protected nullableFlag = false;
  /** When `true`, an `undefined` value is treated as valid regardless of other rules. */
  protected optionalFlag = false;

  /** Ordered list of transform functions applied before validation. */
  protected transformFns: ((value: ValueType) => any)[] = [];

  /** Arbitrary metadata attached to this type (e.g. for UI rendering). */
  protected metadata: Record<string, any> = {};

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

  /** Apply all registered transform functions to `value` and return the result. */
  cast(value: ValueType): any {
    return this.transformFns.reduce((v: any, fn) => fn(v), value);
  }

  check(value: any = this.value, data?: DataType, fieldName?: string | string[], options?: CheckOptions) {
    // Apply transforms before validation
    const v = this.transformFns.length ? this.cast(value) : value;

    // Explicit nullable / optional fast-paths
    if (v === null && this.nullableFlag) {
      return { hasError: false };
    }
    if (v === undefined && this.optionalFlag) {
      return { hasError: false };
    }

    if (this.required && !checkRequired(v, this.trim, this.emptyAllowed)) {
      return {
        hasError: true,
        errorMessage: formatErrorMessage(this.requiredMessage, {
          name: this.fieldLabel || joinName(fieldName)
        })
      };
    }

    const abortEarly = options?.abortEarly !== false;

    const validator = createValidator<ValueType, DataType, E | string>(
      data,
      fieldName,
      this.fieldLabel,
      abortEarly
    );

    const checkResult = validator(v, this.priorityRules);

    // If the priority rule fails, return the result directly
    if (checkResult) {
      return checkResult;
    }

    if (!this.required && isEmpty(v)) {
      return { hasError: false };
    }

    return validator(v, this.rules) || { hasError: false };
  }

  async checkAsync(
    value: any = this.value,
    data?: DataType,
    fieldName?: string | string[]
  ): Promise<CheckResult<E | string>> {
    // Apply transforms before validation
    const v = this.transformFns.length ? this.cast(value) : value;

    // Explicit nullable / optional fast-paths
    if (v === null && this.nullableFlag) {
      return { hasError: false };
    }
    if (v === undefined && this.optionalFlag) {
      return { hasError: false };
    }

    if (this.required && !checkRequired(v, this.trim, this.emptyAllowed)) {
      return {
        hasError: true,
        errorMessage: formatErrorMessage(this.requiredMessage, {
          name: this.fieldLabel || joinName(fieldName)
        })
      };
    }

    const validator = createValidatorAsync<ValueType, DataType, E | string>(
      data,
      fieldName,
      this.fieldLabel
    );

    const priorityResult = await validator(v, this.priorityRules);
    if (priorityResult) {
      return priorityResult;
    }

    if (!this.required && isEmpty(v)) {
      return { hasError: false };
    }

    return (await validator(v, this.rules)) || { hasError: false };
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
   * Mark this field as accepting `null` as a valid value.
   * When set, a `null` value short-circuits all further validation and returns no error.
   *
   * @example
   * StringType().nullable()
   */
  nullable() {
    this.nullableFlag = true;
    return this;
  }

  /**
   * Mark this field as accepting `undefined` as a valid value.
   * When set, an `undefined` value short-circuits all further validation and returns no error.
   *
   * @example
   * StringType().optional()
   */
  optional() {
    this.optionalFlag = true;
    return this;
  }

  /**
   * Register a transform function that is applied to the raw value **before** validation.
   * Multiple transforms are applied in registration order.
   * Use `cast(value)` to obtain the transformed value without running validation.
   *
   * @example
   * StringType().transform(v => v.trim()).minLength(1)
   */
  transform(fn: (value: ValueType) => any) {
    this.transformFns.push(fn);
    return this;
  }

  /**
   * Attach arbitrary metadata to this type.
   * Useful for driving UI rendering (labels, placeholders, disabled state, etc.)
   * from the schema without coupling to a specific form library.
   *
   * @example
   * StringType().meta({ label: 'Email address', placeholder: 'you@example.com' })
   */
  meta(data: Record<string, any>) {
    this.metadata = { ...this.metadata, ...data };
    return this;
  }

  /**
   * Read metadata previously set with `meta()`.
   */
  getMeta(): Record<string, any> {
    return this.metadata;
  }

  /**
   * Define data verification rules based on conditions.
   *
   * **Callback form** (original behaviour): receives the full schema spec.
   * ```js
   * StringType().when(schema => {
   *   const { value } = schema.option;
   *   return value === 'other' ? StringType().isRequired('Other required') : StringType();
   * })
   * ```
   *
   * **Field-name form** (Yup-style): receives the current values of the named field(s) and
   * returns a fresh type to validate with. The returned type is only used for that single check
   * and does not affect the original type.
   * ```js
   * StringType().when('role', (role) =>
   *   role === 'admin' ? StringType().isRequired('Required for admins') : StringType()
   * )
   *
   * StringType().when(['plan', 'role'], (plan, role) =>
   *   plan === 'pro' && role === 'admin' ? StringType().isRequired() : StringType()
   * )
   * ```
   */
  when(
    fieldsOrCondition:
      | string
      | string[]
      | ((schemaSpec: SchemaDeclaration<DataType, E>) => MixedType),
    fn?: (...args: any[]) => MixedType
  ) {
    if (typeof fieldsOrCondition === 'function') {
      // Original behaviour
      this.addRule(
        (value, data, fieldName) => {
          return fieldsOrCondition(this.$schemaSpec).check(value, data, fieldName);
        },
        undefined,
        true
      );
    } else {
      // Field-name form
      const fields = Array.isArray(fieldsOrCondition) ? fieldsOrCondition : [fieldsOrCondition];
      this.addRule(
        (value, data, fieldName) => {
          const fieldValues = fields.map(f => get(data as Record<string, unknown>, f));
          const schema = fn!(...fieldValues);
          return schema.check(value, data, fieldName);
        },
        undefined,
        true
      );
    }
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
   * Alias for `proxy()` with a more descriptive name.
   * After this field passes validation, the listed fields are also re-validated.
   *
   * @example
   * ```js
   * SchemaModel({
   *   password: StringType().isRequired().triggers(['confirmPassword']),
   *   confirmPassword: StringType().equalTo('password').isRequired()
   * });
   * ```
   */
  triggers(fieldNames: string[], options?: ProxyOptions) {
    return this.proxy(fieldNames, options);
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

