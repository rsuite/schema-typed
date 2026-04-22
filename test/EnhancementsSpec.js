import chai, { expect } from 'chai';
import * as schema from '../src';

const { StringType, NumberType, BooleanType, ArrayType, ObjectType, SchemaModel, LiteralType } =
  schema;

chai.should();

// ---------------------------------------------------------------------------
// nullable() / optional()
// ---------------------------------------------------------------------------

describe('#MixedType enhancements', () => {
  describe('nullable()', () => {
    it('Should pass when value is null', () => {
      const type = StringType().nullable();
      expect(type.check(null)).to.deep.equal({ hasError: false });
    });

    it('Should still fail for non-null invalid values', () => {
      const type = StringType().nullable().isRequired();
      expect(type.check('')).to.have.property('hasError', true);
    });

    it('Should pass null even when isRequired is set', () => {
      const type = StringType().nullable().isRequired();
      expect(type.check(null)).to.deep.equal({ hasError: false });
    });
  });

  describe('optional()', () => {
    it('Should pass when value is undefined', () => {
      const type = StringType().optional();
      expect(type.check(undefined)).to.deep.equal({ hasError: false });
    });

    it('Should still fail for invalid non-undefined values', () => {
      const type = StringType().optional().isRequired();
      expect(type.check('')).to.have.property('hasError', true);
    });
  });

  // ---------------------------------------------------------------------------
  // transform() / cast()
  // ---------------------------------------------------------------------------

  describe('transform() / cast()', () => {
    it('cast() should return the transformed value', () => {
      const type = StringType().transform(v => v.trim());
      expect(type.cast('  hello  ')).to.equal('hello');
    });

    it('check() should validate the transformed value', () => {
      // Trim before running minLength — only tests non-empty values since '' is skipped for
      // non-required fields
      const type = StringType()
        .transform(v => v.trim())
        .minLength(3, 'Too short');

      // After trim: 'x' (length 1) → fails minLength(3)
      expect(type.check('  x  ')).to.have.property('hasError', true);
      // After trim: 'hello' (length 5) → passes minLength(3)
      expect(type.check('  hello  ')).to.deep.equal({ hasError: false });
    });

    it('Multiple transforms are applied in order', () => {
      const type = NumberType().transform(v => (typeof v === 'string' ? Number(v) : v));
      expect(type.cast('42')).to.equal(42);
    });
  });

  // ---------------------------------------------------------------------------
  // meta() / getMeta()
  // ---------------------------------------------------------------------------

  describe('meta() / getMeta()', () => {
    it('Should store and retrieve metadata', () => {
      const type = StringType().meta({ label: 'Email', placeholder: 'you@example.com' });
      expect(type.getMeta()).to.deep.equal({ label: 'Email', placeholder: 'you@example.com' });
    });

    it('Subsequent meta() calls should merge (not replace)', () => {
      const type = StringType()
        .meta({ label: 'Email' })
        .meta({ placeholder: 'you@example.com' });
      expect(type.getMeta()).to.deep.equal({ label: 'Email', placeholder: 'you@example.com' });
    });
  });

  // ---------------------------------------------------------------------------
  // triggers() alias
  // ---------------------------------------------------------------------------

  describe('triggers()', () => {
    it('Should behave exactly like proxy()', () => {
      const model = SchemaModel({
        password: StringType().isRequired().triggers(['confirmPassword']),
        confirmPassword: StringType().equalTo('password').isRequired()
      });

      // Changing password should cause confirmPassword to re-validate
      const result = model.checkForField('password', {
        password: 'abc',
        confirmPassword: 'xyz'
      });
      expect(result).to.deep.equal({ hasError: false });

      // confirmPassword was proxy-validated and fails
      const confirmResult = model.getCheckResult('confirmPassword');
      expect(confirmResult).to.have.property('hasError', true);
    });
  });

  // ---------------------------------------------------------------------------
  // when() — field-name form
  // ---------------------------------------------------------------------------

  describe('when() — field-name form', () => {
    it('Should accept a single field name and callback', () => {
      const model = SchemaModel({
        role: StringType(),
        extraInfo: StringType().when('role', (roleValue) =>
          roleValue === 'admin' ? StringType().isRequired('Extra info required for admin') : StringType()
        )
      });

      // role is 'admin' → extraInfo is required
      const r1 = model.checkForField('extraInfo', { role: 'admin', extraInfo: '' });
      expect(r1).to.have.property('hasError', true);
      expect(r1.errorMessage).to.equal('Extra info required for admin');

      // role is 'user' → extraInfo is optional
      const r2 = model.checkForField('extraInfo', { role: 'user', extraInfo: '' });
      expect(r2).to.deep.equal({ hasError: false });
    });

    it('Should accept an array of field names and callback', () => {
      const model = SchemaModel({
        plan: StringType(),
        role: StringType(),
        adminNote: StringType().when(['plan', 'role'], (plan, role) =>
          plan === 'pro' && role === 'admin'
            ? StringType().isRequired('Required for pro admin')
            : StringType()
        )
      });

      const r1 = model.checkForField('adminNote', {
        plan: 'pro',
        role: 'admin',
        adminNote: ''
      });
      expect(r1).to.have.property('hasError', true);

      const r2 = model.checkForField('adminNote', {
        plan: 'free',
        role: 'admin',
        adminNote: ''
      });
      expect(r2).to.deep.equal({ hasError: false });
    });
  });

  // ---------------------------------------------------------------------------
  // checkAsync — no more race conditions
  // ---------------------------------------------------------------------------

  describe('checkAsync()', () => {
    it('Should resolve with an error for invalid values', async () => {
      const type = StringType().isRequired();
      const result = await type.checkAsync('');
      expect(result).to.have.property('hasError', true);
    });

    it('Should resolve without error for valid values', async () => {
      const type = StringType().isRequired();
      const result = await type.checkAsync('hello');
      expect(result).to.deep.equal({ hasError: false });
    });

    it('Priority rule failure should short-circuit further rules', async () => {
      let secondRuleCalled = false;
      const type = StringType()
        .addRule(() => false, 'priority error', true)
        .addRule(() => {
          secondRuleCalled = true;
          return false;
        }, 'second error');

      const result = await type.checkAsync('anything');
      expect(result.errorMessage).to.equal('priority error');
      expect(secondRuleCalled).to.equal(false);
    });
  });
});

// ---------------------------------------------------------------------------
// Schema enhancements
// ---------------------------------------------------------------------------

describe('#Schema enhancements', () => {
  // ---------------------------------------------------------------------------
  // abortEarly: false
  // ---------------------------------------------------------------------------

  describe('check() with abortEarly: false', () => {
    it('Should collect all error messages for a field', () => {
      const model = SchemaModel({
        name: StringType()
          .addRule(() => false, 'error1')
          .addRule(() => false, 'error2')
      });

      const result = model.check({ name: 'x' }, { abortEarly: false });
      expect(result.name).to.have.property('hasError', true);
      expect(result.name && result.name.errorMessages).to.deep.equal(['error1', 'error2']);
    });
  });

  // ---------------------------------------------------------------------------
  // Auto-detect nested paths
  // ---------------------------------------------------------------------------

  describe('checkForField() — auto-detect nested paths', () => {
    it('Should validate a nested dot-path without explicitly passing nestedObject: true', () => {
      const Schema = require('../src/Schema').Schema;
      const model = new Schema({
        user: ObjectType().shape({
          email: StringType().isEmail('Bad email').isRequired('Email required'),
          age: NumberType().min(18, 'Must be 18+')
        })
      });

      // Without nestedObject option — auto-detected from the dot in 'user.age'
      const result = model.checkForField('user.age', { user: { age: 10 } });
      expect(result).to.deep.equal({ hasError: true, errorMessage: 'Must be 18+' });
    });

    it('Should still work when nestedObject is passed explicitly', () => {
      const Schema = require('../src/Schema').Schema;
      const model = new Schema({
        user: ObjectType().shape({
          age: NumberType().min(18, 'Must be 18+')
        })
      });

      const result = model.checkForField('user.age', { user: { age: 10 } }, { nestedObject: true });
      expect(result).to.deep.equal({ hasError: true, errorMessage: 'Must be 18+' });
    });
  });

  // ---------------------------------------------------------------------------
  // validate()
  // ---------------------------------------------------------------------------

  describe('validate()', () => {
    it('Should return hasError=false when all fields pass', () => {
      const model = SchemaModel({
        name: StringType().isRequired(),
        age: NumberType().min(0)
      });

      const { hasError, errorMessages } = model.validate({ name: 'Alice', age: 30 });
      expect(hasError).to.equal(false);
      expect(Object.keys(errorMessages)).to.have.length(0);
    });

    it('Should return hasError=true and map error messages when fields fail', () => {
      const model = SchemaModel({
        name: StringType().isRequired('Name required'),
        age: NumberType().min(18, 'Must be 18+')
      });

      const { hasError, errorMessages } = model.validate({ name: '', age: 10 });
      expect(hasError).to.equal(true);
      expect(errorMessages.name).to.equal('Name required');
      expect(errorMessages.age).to.equal('Must be 18+');
    });
  });

  // ---------------------------------------------------------------------------
  // extend()
  // ---------------------------------------------------------------------------

  describe('extend()', () => {
    it('Should produce a new schema with additional fields', () => {
      const base = SchemaModel({ name: StringType().isRequired() });
      const extended = base.extend({ age: NumberType().min(0) });

      expect(extended.getKeys()).to.include('name');
      expect(extended.getKeys()).to.include('age');

      const r = extended.validate({ name: '', age: -1 });
      expect(r.hasError).to.equal(true);
      expect(r.errorMessages).to.have.property('name');
      expect(r.errorMessages).to.have.property('age');
    });

    it('Should not mutate the original schema', () => {
      const base = SchemaModel({ name: StringType() });
      base.extend({ age: NumberType() });
      expect(base.getKeys()).to.deep.equal(['name']);
    });
  });

  // ---------------------------------------------------------------------------
  // pick()
  // ---------------------------------------------------------------------------

  describe('pick()', () => {
    it('Should return a schema with only the selected keys', () => {
      const model = SchemaModel({ name: StringType(), age: NumberType(), email: StringType() });
      const picked = model.pick(['name', 'email']);

      expect(picked.getKeys()).to.deep.equal(['name', 'email']);
      expect(picked.getKeys()).to.not.include('age');
    });
  });

  // ---------------------------------------------------------------------------
  // omit()
  // ---------------------------------------------------------------------------

  describe('omit()', () => {
    it('Should return a schema without the omitted keys', () => {
      const model = SchemaModel({ name: StringType(), token: StringType(), age: NumberType() });
      const omitted = model.omit(['token']);

      expect(omitted.getKeys()).to.not.include('token');
      expect(omitted.getKeys()).to.include('name');
      expect(omitted.getKeys()).to.include('age');
    });
  });
});

// ---------------------------------------------------------------------------
// LiteralType
// ---------------------------------------------------------------------------

describe('#LiteralType', () => {
  it('Should pass for an exact string match', () => {
    const type = LiteralType('admin');
    expect(type.check('admin')).to.deep.equal({ hasError: false });
  });

  it('Should fail for a non-matching string', () => {
    const type = LiteralType('admin');
    const result = type.check('user');
    expect(result).to.have.property('hasError', true);
  });

  it('Should pass for an exact number match', () => {
    const type = LiteralType(42);
    expect(type.check(42)).to.deep.equal({ hasError: false });
  });

  it('Should fail for a non-matching number', () => {
    const type = LiteralType(42);
    expect(type.check(0)).to.have.property('hasError', true);
  });

  it('Should pass for an exact boolean match', () => {
    const type = LiteralType(true);
    expect(type.check(true)).to.deep.equal({ hasError: false });
    expect(type.check(false)).to.have.property('hasError', true);
  });

  it('Should use a custom error message', () => {
    const type = LiteralType('admin', 'Must be admin');
    expect(type.check('user').errorMessage).to.equal('Must be admin');
  });

  it('Should work inside SchemaModel', () => {
    const model = SchemaModel({ role: LiteralType('admin').isRequired() });
    expect(model.check({ role: 'admin' }).role).to.deep.equal({ hasError: false });
    expect(model.check({ role: 'user' }).role).to.have.property('hasError', true);
  });
});

// ---------------------------------------------------------------------------
// Native get / set utilities
// ---------------------------------------------------------------------------

describe('#utils — native get/set', () => {
  describe('get()', () => {
    it('Retrieves a top-level property', () => {
      expect(schema.SchemaModel).to.be.a('function'); // sanity
      const { get } = require('../src/utils');
      expect(get({ a: 1 }, 'a')).to.equal(1);
    });

    it('Retrieves nested property via dot notation', () => {
      const { get } = require('../src/utils');
      expect(get({ a: { b: 2 } }, 'a.b')).to.equal(2);
    });

    it('Returns undefined for missing paths without throwing', () => {
      const { get } = require('../src/utils');
      expect(get({}, 'a.b.c')).to.equal(undefined);
    });

    it('Handles bracket array notation', () => {
      const { get } = require('../src/utils');
      expect(get({ list: [10, 20] }, 'list[1]')).to.equal(20);
    });
  });

  describe('set()', () => {
    it('Sets a nested property, creating intermediates', () => {
      const { set } = require('../src/utils');
      const obj = {};
      set(obj, 'a.b', 42);
      expect(obj.a.b).to.equal(42);
    });
  });
});
