import { SchemaDeclaration, SchemaCheckResult, CheckResult, PlainObject } from './types';
import { MixedType } from './MixedType';

export class Schema<DataType = any, ErrorMsgType = string> {
  readonly spec: SchemaDeclaration<DataType, ErrorMsgType>;
  private data: PlainObject;

  constructor(schema: SchemaDeclaration<DataType, ErrorMsgType>) {
    this.spec = schema;
  }

  getFieldType<T extends keyof DataType>(fieldName: T) {
    return this.spec?.[fieldName];
  }

  getKeys() {
    return Object.keys(this.spec);
  }

  setSchemaOptionsForAllType(data: PlainObject) {
    if (data === this.data) {
      return;
    }

    Object.entries(this.spec).forEach(([key, type]) => {
      (type as MixedType).setSchemaOptions(this.spec as any, data?.[key]);
    });

    this.data = data;
  }

  checkForField<T extends keyof DataType>(fieldName: T, data: DataType) {
    this.setSchemaOptionsForAllType(data);

    const fieldChecker = this.spec[fieldName];
    if (!fieldChecker) {
      // fieldValue can be anything if no schema defined
      return { hasError: false };
    }

    return fieldChecker.check((data[fieldName] as unknown) as never, data, fieldName as string);
  }

  checkForFieldAsync<T extends keyof DataType>(
    fieldName: T,
    data: DataType
  ): Promise<CheckResult<ErrorMsgType | string>> {
    this.setSchemaOptionsForAllType(data);

    const fieldChecker = this.spec[fieldName];
    if (!fieldChecker) {
      // fieldValue can be anything if no schema defined
      return Promise.resolve({ hasError: false });
    }
    return fieldChecker.checkAsync(
      (data[fieldName] as unknown) as never,
      data,
      fieldName as string
    );
  }

  check<T extends keyof DataType>(data: DataType) {
    const checkResult: PlainObject = {};
    Object.keys(this.spec).forEach(key => {
      if (typeof data === 'object') {
        checkResult[key] = this.checkForField(key as T, data);
      }
    });

    return checkResult as SchemaCheckResult<DataType, ErrorMsgType>;
  }

  checkAsync<T extends keyof DataType>(data: DataType) {
    const checkResult: PlainObject = {};
    const promises: Promise<CheckResult<ErrorMsgType | string>>[] = [];
    const keys: string[] = [];

    Object.keys(this.spec).forEach((key: string) => {
      keys.push(key);
      promises.push(this.checkForFieldAsync(key as T, data));
    });

    return Promise.all(promises).then(values => {
      for (let i = 0; i < values.length; i += 1) {
        checkResult[keys[i]] = values[i];
      }
      return checkResult as SchemaCheckResult<DataType, ErrorMsgType>;
    });
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
      .map(model => model.spec)
      .reduce((accumulator, currentValue) => Object.assign(accumulator, currentValue), {} as any)
  );
};
