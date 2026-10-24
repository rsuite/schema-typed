import { CheckResult, RuleType } from '../types';
import formatErrorMessage, { joinName } from './formatErrorMessage';

/**
 * Create a data asynchronous validator
 * @param data
 */
export function createValidatorAsync<V, D, E>(
  data?: D,
  name?: string | string[],
  label?: string,
  syncRuleMessageOrder = false
) {
  function check(errorMessage?: E | string) {
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
    const promises = rules.map(async rule => {
      const { errorMessage, params } = rule;
      const onValid = rule.onValidAsync || rule.onValid;
      const messageAfterRule = syncRuleMessageOrder && !rule.isAsync;
      const readMessage = () =>
        typeof errorMessage === 'function' ? errorMessage() : errorMessage;
      const beforeMessage = messageAfterRule ? undefined : readMessage();
      const pending = Promise.resolve(onValid(value, data, name));

      try {
        const errorMsg = messageAfterRule ? readMessage() : beforeMessage;
        const validate = check(
          formatErrorMessage<E>(errorMsg, {
            ...params,
            name: label || joinName(name)
          })
        );

        return validate(await pending);
      } catch (error) {
        // A throwing message factory must not detach a rejection already returned by the rule.
        pending.catch(() => undefined);
        throw error;
      }
    });

    return Promise.all(promises).then(results =>
      results.find((item: CheckResult<E> | null) => item && item?.hasError)
    );
  };
}

export default createValidatorAsync;
