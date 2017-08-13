import Type from './Type';

class ObjectType extends Type {
    static from(n) {
        return n;
    }

    constructor(errorMessage = 'Please enter a valid `object`') {
        super('object');
        super.addRule(v => typeof v === 'object', errorMessage);
    }
}

export default (errorMessage) => new ObjectType(errorMessage);
