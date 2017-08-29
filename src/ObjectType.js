import Type from './Type';

class ObjectType extends Type {
  static from(n) {
    return n;
  }

  constructor(errorMessage = 'Please enter a valid `object`') {
    super('object');
    super.addRule(v => typeof v === 'object', errorMessage);
  }

  /**
   * @example
   * ObjectType('这是一个对象').shape({
   *  name: StringType(),
   *  age: NumberType()
   * })
   */
  shape(types) {

    super.addRule((values) => {

      let valids = Object.entries(types).map((item) => {
        let key = item[0];
        let type = item[1];
        return type.check(values[key]);
      });

      let errors = valids.filter(item => item.hasError) || [];

      if (errors.length) {
        return errors[0];
      }

      return errors.length === 0;

    }, null);

    return this;
  }
}

export default errorMessage => new ObjectType(errorMessage);
