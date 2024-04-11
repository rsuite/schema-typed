import isEmpty from './isEmpty';

export function joinName(name: string | string[]) {
  return Array.isArray(name) ? name.join('.') : name;
}

/**
 * formatErrorMessage('${name} is a required field', {name: 'email'});
 * output: 'email is a required field'
 */
export default function formatErrorMessage<E>(errorMessage?: string | E, params?: any) {
  if (typeof errorMessage === 'string') {
    return errorMessage.replace(/\$\{\s*(\w+)\s*\}/g, (_, key) => {
      return isEmpty(params?.[key]) ? `$\{${key}\}` : params?.[key];
    });
  }

  return errorMessage;
}
