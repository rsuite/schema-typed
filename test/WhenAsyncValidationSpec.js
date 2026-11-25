import { strict as assert } from 'assert';
import { execFileSync } from 'child_process';
import { ArrayType, BooleanType, ObjectType, SchemaModel, StringType } from '../src';

describe('conditional asynchronous validation', () => {
  it('awaits the selected rule and evaluates its condition once', async () => {
    let calls = 0;
    let conditions = 0;
    let release;
    const selected = StringType().addAsyncRule(() => {
      calls++;
      return new Promise(resolve => {
        release = resolve;
      });
    }, 'Selected rule failed');
    const type = StringType().when(() => {
      conditions++;
      return selected;
    });
    let settled = false;
    const pending = type.checkAsync('value').then(result => {
      settled = true;
      return result;
    });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(calls, 1);
    assert.equal(conditions, 1);
    assert.equal(settled, false);
    release(false);
    assert.deepEqual(await pending, { hasError: true, errorMessage: 'Selected rule failed' });
  });

  for (const enabled of [true, false]) {
    it(`selects the ${
      enabled ? 'enabled' : 'disabled'
    } async branch from current model data`, async () => {
      const calls = [];
      const selected = branch =>
        StringType().addAsyncRule(async value => {
          calls.push([branch, value]);
          return false;
        }, branch);
      const model = SchemaModel({
        enabled: BooleanType(),
        name: StringType().when(schema => selected(schema.enabled.value ? 'Enabled' : 'Disabled'))
      });
      assert.deepEqual(await model.checkAsync({ enabled, name: 'value' }), {
        enabled: { hasError: false },
        name: { hasError: true, errorMessage: enabled ? 'Enabled' : 'Disabled' }
      });
      assert.deepEqual(calls, [[enabled ? 'Enabled' : 'Disabled', 'value']]);
    });
  }

  it('forwards the field value, data and field name through field validation', async () => {
    let received;
    const data = { name: 'value', enabled: true };
    const model = SchemaModel({
      name: StringType().when(() =>
        StringType().addAsyncRule(async (value, currentData, fieldName) => {
          received = [value, currentData, fieldName];
          return { hasError: true, errorMessage: 'Selected error' };
        })
      )
    });
    assert.deepEqual(await model.checkForFieldAsync('name', data), {
      hasError: true,
      errorMessage: 'Selected error'
    });
    assert.equal(received[0], 'value');
    assert.equal(received[1], data);
    assert.equal(received[2], 'name');
  });

  it('validates selected array children without flattening their errors', async () => {
    let calls = 0;
    const type = ArrayType().when(() =>
      ArrayType().of(
        StringType().addAsyncRule(async value => {
          calls++;
          return value === 'good';
        }, 'Invalid item')
      )
    );
    assert.deepEqual(await type.checkAsync(['bad', 'good']), {
      hasError: true,
      array: [{ hasError: true, errorMessage: 'Invalid item' }, { hasError: false }]
    });
    assert.equal(calls, 2);
  });

  it('validates selected shaped objects without flattening their errors', async () => {
    let calls = 0;
    const type = ObjectType().when(() =>
      ObjectType().shape({
        name: StringType().addAsyncRule(async () => {
          calls++;
          return false;
        }, 'Invalid name')
      })
    );
    assert.deepEqual(await type.checkAsync({ name: 'value' }), {
      hasError: true,
      object: { name: { hasError: true, errorMessage: 'Invalid name' } }
    });
    assert.equal(calls, 1);
  });

  it('traverses nested selected conditions', async () => {
    let calls = 0;
    const type = StringType().when(() =>
      StringType().when(() =>
        StringType().addAsyncRule(async () => {
          calls++;
          return false;
        }, 'Nested error')
      )
    );
    assert.deepEqual(await type.checkAsync('value'), {
      hasError: true,
      errorMessage: 'Nested error'
    });
    assert.equal(calls, 1);
  });

  for (const priority of [false, true]) {
    for (const mode of ['reject', 'throw']) {
      it(`preserves ${mode} identity from a selected ${
        priority ? 'priority' : 'regular'
      } async rule`, async () => {
        const failure = new Error('Selected validation unavailable');
        const type = StringType().when(() =>
          StringType().addAsyncRule(
            () => {
              if (mode === 'throw') throw failure;
              return Promise.reject(failure);
            },
            'Invalid',
            priority
          )
        );
        await assert.rejects(type.checkAsync('value'), error => error === failure);
      });
    }
  }

  it('propagates a throwing condition in both validation modes', async () => {
    const failure = new Error('Cannot select a type');
    const type = StringType().when(() => {
      throw failure;
    });
    assert.throws(
      () => type.check('value'),
      error => error === failure
    );
    await assert.rejects(type.checkAsync('value'), error => error === failure);
  });

  it('retains rule-before-message ordering for selected synchronous rules', async () => {
    let message;
    const order = [];
    const type = StringType().when(() =>
      StringType().addRule(
        value => {
          order.push('rule');
          message = value;
          return false;
        },
        () => {
          order.push('message');
          return message;
        }
      )
    );
    assert.deepEqual(type.check('first'), { hasError: true, errorMessage: 'first' });
    assert.deepEqual(await type.checkAsync('second'), { hasError: true, errorMessage: 'second' });
    assert.deepEqual(order, ['rule', 'message', 'rule', 'message']);
  });

  it('does not evaluate a message factory after a selected synchronous rule throws', async () => {
    const failure = new Error('Rule failed');
    let messages = 0;
    const type = StringType().when(() =>
      StringType().addRule(
        () => {
          throw failure;
        },
        () => {
          messages++;
          return 'Invalid';
        }
      )
    );
    assert.throws(
      () => type.check('value'),
      error => error === failure
    );
    await assert.rejects(type.checkAsync('value'), error => error === failure);
    assert.equal(messages, 0);
  });

  it('handles an already returned rejection when a selected synchronous message factory throws', () => {
    const output = execFileSync(
      process.execPath,
      [
        '-r',
        'ts-node/register/transpile-only',
        '-e',
        `
      const { StringType } = require('./src');
      const events = [];
      const failure = new Error('Message failed');
      process.on('unhandledRejection', () => events.push('unhandled'));
      StringType().when(() => StringType().addRule(
        () => { events.push('rule'); return Promise.reject(new Error('Rule failed')); },
        () => { events.push('message'); throw failure; }
      )).checkAsync('value').then(
        () => events.push('resolved'),
        error => events.push(error === failure ? 'caught' : 'wrong error')
      );
      setImmediate(() => console.log(JSON.stringify(events)));
    `
      ],
      { encoding: 'utf8' }
    );
    assert.deepEqual(JSON.parse(output), ['rule', 'message', 'caught']);
  });

  it('keeps required and optional empty-value decisions on the selected type', async () => {
    let calls = 0;
    const rule = async () => {
      calls++;
      return false;
    };
    const required = StringType().when(() =>
      StringType().isRequired('Required').addAsyncRule(rule)
    );
    const optional = StringType().when(() => StringType().addAsyncRule(rule));
    assert.deepEqual(await required.checkAsync(''), { hasError: true, errorMessage: 'Required' });
    assert.deepEqual(await optional.checkAsync(''), { hasError: false });
    assert.equal(calls, 0);
  });

  it('stops outer regular rules after a selected priority rule fails', async () => {
    let regularCalls = 0;
    const type = StringType()
      .when(() =>
        StringType()
          .addAsyncRule(async () => false, 'Priority', true)
          .addAsyncRule(async () => {
            regularCalls++;
            return true;
          })
      )
      .addAsyncRule(async () => {
        regularCalls++;
        return true;
      });
    assert.deepEqual(await type.checkAsync('value'), { hasError: true, errorMessage: 'Priority' });
    assert.equal(regularCalls, 0);
  });

  it('keeps synchronous validation synchronous and skips selected async rules', () => {
    let calls = 0;
    const type = StringType().when(() =>
      StringType()
        .addAsyncRule(async () => {
          calls++;
          return false;
        })
        .addRule(() => false, 'Synchronous error')
    );
    assert.deepEqual(type.check('value'), { hasError: true, errorMessage: 'Synchronous error' });
    assert.equal(calls, 0);
  });
  it('continues with outer regular rules after the selected async rule succeeds', async () => {
    const calls = [];
    const type = StringType()
      .when(() =>
        StringType().addAsyncRule(async () => {
          calls.push('selected');
          return true;
        })
      )
      .addAsyncRule(async () => {
        calls.push('outer');
        return true;
      });
    assert.deepEqual(await type.checkAsync('value'), { hasError: false });
    assert.deepEqual(calls, ['selected', 'outer']);
  });

  it('reselects the branch when a model instance is checked with new data', async () => {
    const calls = [];
    const model = SchemaModel({
      enabled: BooleanType(),
      name: StringType().when(schema => {
        const enabled = schema.enabled.value;
        return StringType().addAsyncRule(async () => {
          calls.push(enabled);
          return enabled;
        }, 'Disabled');
      })
    });
    assert.deepEqual((await model.checkAsync({ enabled: true, name: 'first' })).name, {
      hasError: false
    });
    assert.deepEqual((await model.checkAsync({ enabled: false, name: 'second' })).name, {
      hasError: true,
      errorMessage: 'Disabled'
    });
    assert.deepEqual(calls, [true, false]);
  });
});
