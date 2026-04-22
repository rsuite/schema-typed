import { SchemaDeclaration, SchemaCheckResult, CheckResult, PlainObject } from './types';
import { MixedType, getFieldType, getFieldValue, CheckOptions } from './MixedType';
import { set, get, isEmpty, pathTransform } from './utils';

interface CheckForFieldOptions extends CheckOptions {
  /**
   * Check for nested object paths (e.g. `"address.city"` or `"list[0].name"`).
   * When omitted the value is auto-detected from the field name.
   */
  nestedObject?: boolean;
}

/**
 * A flat validation summary returned by `Schema.validate()`.
 */
export interface ValidationResult<DataType, ErrorMsgType = string> {
  /** `true` when at least one field has an error. */
  hasError: boolean;
  /**
   * Map of field names to their first error message.
   * Only fields with errors are included.
   */
  errorMessages: Partial<Record<keyof DataType, ErrorMsgType | string>>;
}

/** Returns `true` when `fieldName` looks like a nested path. */
function isNestedPath(fieldName: string): boolean {
  return fieldName.includes('.') || /\[\d+\]/.test(fieldName);
}

export class Schema<DataType = any, ErrorMsgType = string> {
  readonly $spec: SchemaDeclaration<DataType, ErrorMsgType>;
  private data: PlainObject;
  private checkedFields: string[] = [];
  private checkResult: SchemaCheckResult<DataType, ErrorMsgType> = {};

  constructor(schema: SchemaDeclaration<DataType, ErrorMsgType>) {
    this.$spec = schema;
  }

  private getFieldType<T extends keyof DataType>(
    fieldName: T,
    nestedObject?: boolean
  ): SchemaDeclaration<DataType, ErrorMsgType>[T] {
    return getFieldType(this.$spec, fieldName as string, nestedObject);
  }

  private setFieldCheckResult(
    fieldName: string,
    checkResult: CheckResult<ErrorMsgType | string>,
    nestedObject?: boolean
  ) {
    if (nestedObject) {
      const namePath = fieldName.split('.').join('.object.');
      set(this.checkResult, namePath, checkResult);

      return;
    }

    this.checkResult[fieldName] = checkResult;
  }

  private setSchemaOptionsForAllType(data: PlainObject) {
    if (data === this.data) {
      return;
    }

    Object.entries(this.$spec).forEach(([key, type]) => {
      (type as MixedType).setSchemaOptions(this.$spec as any, data?.[key]);
    });

    this.data = data;
  }

  /**
   * Get the check result of the schema
   * @returns CheckResult<ErrorMsgType | string>
   */
  getCheckResult(path?: string, result = this.checkResult): CheckResult<ErrorMsgType | string> {
    if (path) {
      return result?.[path] || get(result, pathTransform(path)) || { hasError: false };
    }

    return result;
  }

  /**
   * Get the error messages of the schema
   */
  getErrorMessages(path?: string, result = this.checkResult): (string | ErrorMsgType)[] {
    let messages: (string | ErrorMsgType)[] = [];

    if (path) {
      const { errorMessage, object, array } =
        result?.[path] || get(result, pathTransform(path)) || {};

      if (errorMessage) {
        messages = [errorMessage];
      } else if (object) {
        messages = Object.keys(object).map(key => object[key]?.errorMessage);
      } else if (array) {
        messages = array.map(item => item?.errorMessage);
      }
    } else {
      messages = Object.keys(result).map(key => result[key]?.errorMessage);
    }

    return messages.filter(Boolean);
  }

  /**
   * Get all the keys of the schema
   */
  getKeys() {
    return Object.keys(this.$spec);
  }

  /**
   * Get the schema specification
   */
  getSchemaSpec() {
    return this.$spec;
  }
  _checkForField<T extends keyof DataType>(
    fieldName: T,
    data: DataType,
    options: CheckForFieldOptions = {}
  ): CheckResult<ErrorMsgType | string> {
    this.setSchemaOptionsForAllType(data);

    // Auto-detect nested path when the option is not explicitly provided
    const nestedObject =
      options.nestedObject !== undefined ? options.nestedObject : isNestedPath(fieldName as string);

    // Add current field to checked list
    this.checkedFields = [...this.checkedFields, fieldName as string];

    const fieldChecker = this.getFieldType(fieldName, nestedObject);

    if (!fieldChecker) {
      return { hasError: false };
    }

    const fieldValue = getFieldValue(data, fieldName as string, nestedObject);
    const checkResult = fieldChecker.check(fieldValue, data, fieldName as string, options);

    this.setFieldCheckResult(fieldName as string, checkResult, nestedObject);

    if (!checkResult.hasError) {
      const { checkIfValueExists } = fieldChecker.proxyOptions;

      fieldChecker.otherFields?.forEach((field: string) => {
        if (!this.checkedFields.includes(field)) {
          if (checkIfValueExists) {
            if (!isEmpty(getFieldValue(data, field, nestedObject))) {
              this._checkForField(field as T, data, { ...options });
            }
            return;
          }
          this._checkForField(field as T, data, { ...options });
        }
      });
    }

    return checkResult;
  }

  checkForField<T extends keyof DataType>(
    fieldName: T,
    data: DataType,
    options: CheckForFieldOptions = {}
  ): CheckResult<ErrorMsgType | string> {
    const result = this._checkForField(fieldName, data, options);
    // clean checked fields after check finished
    this.checkedFields = [];
    return result;
  }

  checkForFieldAsync<T extends keyof DataType>(
    fieldName: T,
    data: DataType,
    options: CheckForFieldOptions = {}
  ): Promise<CheckResult<ErrorMsgType | string>> {
    this.setSchemaOptionsForAllType(data);

    // Auto-detect nested path when the option is not explicitly provided
    const nestedObject =
      options.nestedObject !== undefined ? options.nestedObject : isNestedPath(fieldName as string);

    const fieldChecker = this.getFieldType(fieldName, nestedObject);

    if (!fieldChecker) {
      // fieldValue can be anything if no schema defined
      return Promise.resolve({ hasError: false });
    }

    const fieldValue = getFieldValue(data, fieldName as string, nestedObject);
    const checkResult = fieldChecker.checkAsync(fieldValue, data, fieldName as string);

    return checkResult.then(async result => {
      this.setFieldCheckResult(fieldName as string, result, nestedObject);

      if (!result.hasError) {
        const { checkIfValueExists } = fieldChecker.proxyOptions;
        const checkAll: Promise<CheckResult<ErrorMsgType | string>>[] = [];

        // Check other fields if the field depends on them for validation
        fieldChecker.otherFields?.forEach((field: string) => {
          if (checkIfValueExists) {
            if (!isEmpty(getFieldValue(data, field, nestedObject))) {
              checkAll.push(this.checkForFieldAsync(field as T, data, options));
            }
            return;
          }

          checkAll.push(this.checkForFieldAsync(field as T, data, options));
        });

        await Promise.all(checkAll);
      }

      return result;
    });
  }

  check<T extends keyof DataType>(data: DataType, options: CheckOptions = {}) {
    const checkResult: SchemaCheckResult<DataType, ErrorMsgType> = {};
    Object.keys(this.$spec).forEach(key => {
      if (typeof data === 'object') {
        checkResult[key] = this.checkForField(key as T, data, options);
      }
    });

    return checkResult;
  }

  checkAsync<T extends keyof DataType>(data: DataType) {
    const checkResult: SchemaCheckResult<DataType, ErrorMsgType> = {};
    const promises: Promise<CheckResult<ErrorMsgType | string>>[] = [];
    const keys: string[] = [];

    Object.keys(this.$spec).forEach((key: string) => {
      keys.push(key);
      promises.push(this.checkForFieldAsync(key as T, data));
    });

    return Promise.all(promises).then(values => {
      for (let i = 0; i < values.length; i += 1) {
        checkResult[keys[i]] = values[i];
      }

      return checkResult;
    });
  }

  /**
   * A convenience method that runs `check()` and returns a flat summary.
   *
   * @returns `{ hasError, errorMessages }` where `errorMessages` maps field names to their
   *          first error message (only fields that failed are included).
   *
   * @example
   * const { hasError, errorMessages } = model.validate(formData);
   * if (hasError) console.log(errorMessages.username);
   */
  validate(data: DataType): ValidationResult<DataType, ErrorMsgType> {
    const rawResult = this.check(data);
    const errorMessages: Partial<Record<keyof DataType, ErrorMsgType | string>> = {};
    let hasError = false;

    (Object.keys(rawResult) as (keyof DataType)[]).forEach(key => {
      const result = rawResult[key];
      if (result?.hasError) {
        hasError = true;
        errorMessages[key] = result.errorMessage;
      }
    });

    return { hasError, errorMessages };
  }

  /**
   * Returns a new `Schema` that merges the current spec with additional field declarations.
   * Fields in `fields` override same-name fields from the current spec.
   *
   * @example
   * const baseModel = SchemaModel({ name: StringType() });
   * const extendedModel = baseModel.extend({ age: NumberType() });
   */
  extend<ExtendType = Partial<DataType>>(
    fields: SchemaDeclaration<ExtendType, ErrorMsgType>
  ): Schema<DataType & ExtendType, ErrorMsgType> {
    return new Schema<DataType & ExtendType, ErrorMsgType>({
      ...(this.$spec as any),
      ...(fields as any)
    });
  }

  /**
   * Returns a new `Schema` containing only the specified fields.
   *
   * @example
   * const fullModel = SchemaModel({ name: StringType(), age: NumberType(), email: StringType() });
   * const partialModel = fullModel.pick(['name', 'email']);
   */
  pick<K extends keyof DataType>(keys: K[]): Schema<Pick<DataType, K>, ErrorMsgType> {
    const picked: any = {};
    keys.forEach(key => {
      if (this.$spec[key] !== undefined) {
        picked[key] = this.$spec[key];
      }
    });
    return new Schema<Pick<DataType, K>, ErrorMsgType>(picked);
  }

  /**
   * Returns a new `Schema` with the specified fields removed.
   *
   * @example
   * const fullModel = SchemaModel({ name: StringType(), age: NumberType(), token: StringType() });
   * const publicModel = fullModel.omit(['token']);
   */
  omit<K extends keyof DataType>(keys: K[]): Schema<Omit<DataType, K>, ErrorMsgType> {
    const omitted: any = { ...(this.$spec as any) };
    keys.forEach(key => {
      delete omitted[key as string];
    });
    return new Schema<Omit<DataType, K>, ErrorMsgType>(omitted);
  }
}

export function SchemaModel<DataType = PlainObject, ErrorMsgType = string>(
  o: SchemaDeclaration<DataType, ErrorMsgType>
) {
  return new Schema<DataType, ErrorMsgType>(o);
}

SchemaModel.combine = function combine<DataType = any, ErrorMsgType = string>(
  ...specs: Schema<any, ErrorMsgType>[]
) {
  return new Schema<DataType, ErrorMsgType>(
    specs
      .map(model => model.$spec)
      .reduce((accumulator, currentValue) => Object.assign(accumulator, currentValue), {} as any)
  );
};

