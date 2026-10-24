import { strict as assert } from 'assert';
import { execFileSync } from 'child_process';
import { ArrayType, NumberType, ObjectType, SchemaModel, StringType } from '../src';

const shapes = [
  {
    name: 'scalar array',
    create: leaf => ArrayType().of(leaf),
    value: ['bad', 'good'],
    result: {
      hasError: true,
      array: [{ hasError: true, errorMessage: 'Invalid name' }, { hasError: false }]
    },
    calls: 2
  },
  {
    name: 'tuple',
    create: leaf => ArrayType().of(leaf, NumberType().min(1)),
    value: ['bad', 2],
    result: {
      hasError: true,
      array: [{ hasError: true, errorMessage: 'Invalid name' }, { hasError: false }]
    },
    calls: 1
  },
  {
    name: 'array of shaped objects',
    create: leaf => ArrayType().of(ObjectType().shape({ name: leaf })),
    value: [{ name: 'bad' }, { name: 'good' }],
    result: {
      hasError: true,
      array: [
        { hasError: true, object: { name: { hasError: true, errorMessage: 'Invalid name' } } },
        { hasError: false, object: { name: { hasError: false } } }
      ]
    },
    calls: 2
  },
  {
    name: 'nested arrays',
    create: leaf => ArrayType().of(ArrayType().of(leaf)),
    value: [['bad', 'good']],
    result: {
      hasError: true,
      array: [
        {
          hasError: true,
          array: [{ hasError: true, errorMessage: 'Invalid name' }, { hasError: false }]
        }
      ]
    },
    calls: 2
  }
];

describe('whole-array asynchronous child validation', () => {
  for (const shape of shapes) {
    it(`runs async children in a ${shape.name} while retaining synchronous checks`, async () => {
      let calls = 0;
      const leaf = StringType().addAsyncRule(value => {
        calls++;
        return Promise.resolve(value === 'good');
      }, 'Invalid name');
      // Nesting under ObjectType exercises its recursive validation dispatcher too.
      const model = SchemaModel({ group: ObjectType().shape({ items: shape.create(leaf) }) });
      const value = { group: { items: shape.value } };

      assert.equal(model.check(value).group.hasError, false);
      assert.equal(calls, 0);
      assert.deepEqual(await model.checkAsync(value), {
        group: { hasError: true, object: { items: shape.result } }
      });
      assert.equal(calls, shape.calls);
    });

    for (const priority of [false, true]) {
      for (const mode of ['reject', 'throw']) {
        it(`propagates ${mode} from a ${priority ? 'priority' : 'regular'} child in a ${
          shape.name
        }`, async () => {
          const failure = new Error('Validation unavailable');
          const leaf = StringType().addAsyncRule(
            () => {
              if (mode === 'throw') throw failure;
              return Promise.reject(failure);
            },
            'Invalid name',
            priority
          );
          const model = SchemaModel({ items: shape.create(leaf) });

          await assert.rejects(
            model.checkAsync({ items: shape.value }),
            error => error === failure
          );
        });
      }
    }
  }

  for (const guard of ['priority', 'required', 'optional empty']) {
    it(`keeps the ${guard} array guard ahead of child rules`, async () => {
      let calls = 0;
      const type = ArrayType().of(
        StringType().addAsyncRule(() => {
          calls++;
          return Promise.resolve(false);
        })
      );
      if (guard === 'priority') type.addAsyncRule(() => false, 'Array rejected', true);
      if (guard === 'required') type.isRequired('Required');

      const result = await type.checkAsync(guard === 'priority' ? ['value'] : undefined);
      assert.deepEqual(
        result,
        guard === 'optional empty'
          ? { hasError: false }
          : { hasError: true, errorMessage: guard === 'required' ? 'Required' : 'Array rejected' }
      );
      assert.equal(calls, 0);
    });
  }

  it('does not call child rules for an invalid non-array value', async () => {
    let calls = 0;
    const type = ArrayType().of(
      StringType().addAsyncRule(() => {
        calls++;
        return Promise.resolve(false);
      })
    );
    assert.equal((await type.checkAsync({})).hasError, true);
    assert.equal(calls, 0);
  });

  it('passes the original data and indexed field path to scalar child rules', async () => {
    const calls = [];
    const model = SchemaModel({
      items: ArrayType().of(
        StringType().addAsyncRule((...args) => {
          calls.push(args);
          return Promise.resolve(true);
        })
      )
    });
    const data = { items: ['first', 'second'] };
    assert.equal((await model.checkForFieldAsync('items', data)).hasError, false);
    assert.deepEqual(calls, [
      ['first', data, ['items', '[0]']],
      ['second', data, ['items', '[1]']]
    ]);
    assert.equal(calls[0][1], data);
  });

  it('waits for all children and keeps input order when promises settle out of order', async () => {
    const release = [];
    const type = ArrayType().of(
      StringType().addAsyncRule(() => new Promise(resolve => release.push(resolve)), 'Invalid')
    );
    let settled = false;
    const pending = type.checkAsync(['first', 'second']).then(result => {
      settled = true;
      return result;
    });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(release.length, 2);
    release[1](false);
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(settled, false);
    release[0](true);
    assert.deepEqual(await pending, {
      hasError: true,
      array: [{ hasError: false }, { hasError: true, errorMessage: 'Invalid' }]
    });
  });

  it('handles every child rejection when a later child checker throws synchronously', () => {
    const output = execFileSync(
      process.execPath,
      [
        '-r',
        'ts-node/register/transpile-only',
        '-e',
        `
          const { ArrayType, StringType } = require('./src');
          const first = new Error('First failure');
          const second = new Error('Second failure');
          const events = [];
          process.on('unhandledRejection', () => events.push('unhandled'));
          const child = StringType();
          child.checkAsync = value => {
            if (value === 'first') return Promise.reject(first);
            throw second;
          };
          ArrayType().of(child).checkAsync(['first', 'second']).then(
            () => events.push('resolved'),
            error => events.push(error === first || error === second ? 'caught' : 'wrong error')
          );
          setImmediate(() => console.log(JSON.stringify(events)));
        `
      ],
      { encoding: 'utf8' }
    );
    assert.deepEqual(JSON.parse(output), ['caught']);
  });

  it('keeps synchronous rule-dependent message factories aligned with each array item', async () => {
    let message = '';
    const type = ArrayType().of(
      StringType().addRule(
        value => {
          message = value === 'later' ? 'Later invalid' : '';
          return value === 'valid';
        },
        () => message
      )
    );
    const expected = {
      hasError: true,
      array: [
        { hasError: true, errorMessage: '' },
        { hasError: true, errorMessage: 'Later invalid' },
        { hasError: false }
      ]
    };
    assert.deepEqual(type.check(['blank', 'later', 'valid']), expected);
    assert.deepEqual(await type.checkAsync(['blank', 'later', 'valid']), expected);
  });

  it('handles a child rule rejection when its own message factory throws', () => {
    const output = execFileSync(
      process.execPath,
      [
        '-r',
        'ts-node/register/transpile-only',
        '-e',
        `
          const { ArrayType, StringType } = require('./src');
          const failure = new Error('Rule failure');
          const messageFailure = new Error('Message failure');
          const events = [];
          process.on('unhandledRejection', () => events.push('unhandled'));
          ArrayType().of(StringType().addRule(
            () => { events.push('rule'); return Promise.reject(failure); },
            () => { events.push('message'); throw messageFailure; }
          )).checkAsync(['value']).then(
            () => events.push('resolved'),
            error => events.push(error === messageFailure ? 'caught' : 'wrong error')
          );
          setImmediate(() => console.log(JSON.stringify(events)));
        `
      ],
      { encoding: 'utf8' }
    );
    assert.deepEqual(JSON.parse(output), ['rule', 'message', 'caught']);
  });

  it('retains per-item synchronous message values through shaped object recursion', async () => {
    let message = '';
    const type = ArrayType().of(
      ObjectType().shape({
        name: StringType().addRule(
          value => {
            message = value;
            return false;
          },
          () => message
        )
      })
    );
    assert.deepEqual(await type.checkAsync([{ name: 'first' }, { name: 'second' }]), {
      hasError: true,
      array: [
        { hasError: true, object: { name: { hasError: true, errorMessage: 'first' } } },
        { hasError: true, object: { name: { hasError: true, errorMessage: 'second' } } }
      ]
    });
  });

  it('retains existing factory-before-rule order for direct asynchronous field checks', async () => {
    const order = [];
    const type = StringType().addRule(
      () => {
        order.push('rule');
        return false;
      },
      () => {
        order.push('factory');
        return '';
      }
    );
    assert.deepEqual(await type.checkAsync('value'), { hasError: true, errorMessage: '' });
    assert.deepEqual(order, ['factory', 'rule']);
  });
});
