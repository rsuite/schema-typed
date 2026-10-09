import { strict as assert } from 'assert';
import { execFileSync } from 'child_process';
import { MixedType, ObjectType, StringType, SchemaModel } from '../src';

describe('asynchronous validation failures', () => {
  for (const priority of [false, true]) {
    for (const boundary of ['rule', 'message']) {
      it(`handles every rejection when a later ${
        priority ? 'priority' : 'regular'
      } ${boundary} throws`, () => {
        // A child process exposes detached rejections without altering Mocha's error handlers.
        const output = execFileSync(
          process.execPath,
          [
            '-r',
            'ts-node/register',
            '-e',
            `
              const { MixedType } = require('./src');
              const first = new Error('First failure');
              const second = new Error('Second failure');
              const events = [];
              process.on('unhandledRejection', () => events.push('unhandled'));
              const fail = () => { throw second; };
              const type = MixedType()
                .addAsyncRule(() => Promise.reject(first), 'Invalid', ${priority})
                .addRule(${boundary === 'rule' ? 'fail' : '() => true'},
                  ${boundary === 'message' ? 'fail' : "'Invalid'"}, ${priority});
              type.checkAsync('value').then(
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
    }
  }

  for (const [name, createType, value] of [
    ['mixed', MixedType, 'value'],
    ['object', ObjectType, {}]
  ]) {
    describe(name, () => {
      for (const priority of [false, true]) {
        for (const failureMode of ['reject', 'throw']) {
          it(`propagates ${failureMode} from a ${
            priority ? 'priority' : 'regular'
          } rule`, async () => {
            const failure = new Error('Validation unavailable');
            const type = createType().addAsyncRule(
              () => {
                if (failureMode === 'throw') throw failure;
                return Promise.reject(failure);
              },
              'Invalid',
              priority
            );

            await assert.rejects(type.checkAsync(value), error => error === failure);
          });
        }
      }

      it('does not start regular rules after a priority failure', async () => {
        let calls = 0;
        const type = createType()
          .addAsyncRule(() => Promise.resolve(false), 'Priority failed', true)
          .addAsyncRule(() => {
            calls++;
            return Promise.resolve(true);
          });

        assert.deepEqual(await type.checkAsync(value), {
          hasError: true,
          errorMessage: 'Priority failed'
        });
        // Let any mistakenly detached continuation run before checking side effects.
        await new Promise(resolve => setImmediate(resolve));
        assert.equal(calls, 0);
      });

      it('does not start regular rules for an optional empty value', async () => {
        let calls = 0;
        const type = createType().addAsyncRule(() => {
          calls++;
          return Promise.resolve(false);
        });

        assert.deepEqual(await type.checkAsync(null), { hasError: false });
        await new Promise(resolve => setImmediate(resolve));
        assert.equal(calls, 0);
      });

      it('keeps required validation ahead of user rules', async () => {
        let calls = 0;
        const type = createType()
          .isRequired('Required')
          .addAsyncRule(
            () => {
              calls++;
              return Promise.resolve(true);
            },
            'Invalid',
            true
          );

        assert.deepEqual(await type.checkAsync(null), {
          hasError: true,
          errorMessage: 'Required'
        });
        assert.equal(calls, 0);
      });

      it('waits for successful priority rules before evaluating regular rules', async () => {
        const calls = [];
        let release;
        const type = createType()
          .addAsyncRule(
            () => {
              calls.push('priority');
              return new Promise(resolve => (release = resolve));
            },
            'Priority failed',
            true
          )
          .addAsyncRule(() => {
            calls.push('regular');
            return Promise.resolve(false);
          }, 'Regular failed');

        const pending = type.checkAsync(value);
        assert.deepEqual(calls, ['priority']);
        release(true);
        assert.deepEqual(await pending, { hasError: true, errorMessage: 'Regular failed' });
        assert.deepEqual(calls, ['priority', 'regular']);
      });
    });
  }

  for (const entry of ['field', 'whole form', 'proxy field', 'nested object']) {
    for (const failureMode of ['reject', 'throw']) {
      it(`propagates ${failureMode} through ${entry} validation`, async () => {
        const failure = new Error('Validation unavailable');
        const type = StringType().addAsyncRule(() => {
          if (failureMode === 'throw') throw failure;
          return Promise.reject(failure);
        });
        const model = SchemaModel(
          entry === 'nested object'
            ? { user: ObjectType().shape({ name: type }) }
            : { name: type, trigger: StringType().proxy(['name']) }
        );
        const value = { name: 'name', trigger: 'trigger', user: { name: 'name' } };
        const pending =
          entry === 'whole form'
            ? model.checkAsync(value)
            : model.checkForFieldAsync(
                entry === 'nested object' ? 'user' : entry === 'proxy field' ? 'trigger' : 'name',
                value
              );

        await assert.rejects(pending, error => error === failure);
      });
    }
  }
});
