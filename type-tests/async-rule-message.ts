import { StringType, CheckResult } from '../lib';

type Data = { name: string; limit: number };
type Message = { detail: string };
const message: Message = { detail: 'Invalid' };

export const defaultFactory = StringType().addAsyncRule(
  async value => value.length > 0,
  () => 'Invalid'
);

export const customFactory = StringType<Data, Message>()
  .addAsyncRule(
    async (value, data, fieldName) => {
      const text: string = value;
      const limit: number | undefined = data?.limit;
      const field: string | string[] | undefined = fieldName;
      return { hasError: text.length > (limit ?? 0) || !field, errorMessage: message };
    },
    () => message,
    true
  )
  .isEmail();

export const result: Promise<CheckResult<Message>> = customFactory.checkAsync('value', {
  name: 'field',
  limit: 4
});

export const customStaticMessage = StringType<Data, Message>().addAsyncRule(
  () => Promise.resolve(false),
  message
);
export const stringStaticMessage = StringType<Data, Message>().addAsyncRule(() => false, 'Invalid');
export const omittedMessage = StringType().addAsyncRule(() => Promise.resolve(true));
export const throwingFactory = StringType().addAsyncRule(
  () => false,
  () => {
    throw new Error('message factory failed');
  }
);
export const synchronousFactory = StringType().addRule(
  () => false,
  () => 'Invalid'
);

StringType().addAsyncRule(
  () => false,
  // @ts-expect-error The default message type does not accept numeric factory results.
  () => 42
);
StringType().addAsyncRule(
  () => false,
  // @ts-expect-error Message factories are synchronous; their results are not awaited.
  async () => 'Invalid'
);
StringType().addAsyncRule(
  () => false,
  // @ts-expect-error A message factory receives no validation arguments.
  (value: string) => value
);
StringType<Data, Message>().addAsyncRule(
  () => false,
  // @ts-expect-error Custom message factories must return the declared message or a string.
  () => ({ other: true })
);
// @ts-expect-error String validators keep their string value parameter.
StringType().addAsyncRule(async (value: number) => value > 0, 'Invalid');
// @ts-expect-error The optional priority parameter remains boolean.
StringType().addAsyncRule(() => false, 'Invalid', 'priority');
