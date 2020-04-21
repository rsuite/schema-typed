interface CheckResult<ErrorMsgType = string> {
  hasError: boolean;
  errorMessage: ErrorMsgType;
}

declare class Type<ValueType = any, DataType = any, ErrorMsgType = string> {
  readonly name: string;
  constructor(name: string);
  check: (value: ValueType, data: any) => CheckResult<ErrorMsgType>;
  addRule: (
    onValid: (
      value: ValueType,
      data: DataType
    ) =>
      | CheckResult<ErrorMsgType>
      | boolean
      | void
      | undefined
      | Promise<boolean>
      | Promise<CheckResult<ErrorMsgType>>
      | Promise<void>,
    errorMessage?: ErrorMsgType,
    priority?: boolean
  ) => this;
  isRequired: (errorMessage?: ErrorMsgType) => this;
  isRequiredOrEmpty: (errorMessage?: ErrorMsgType) => this;
}

export { CheckResult, Type };
