import Type from './Type';

class NumberType extends Type {
    static from(n) {
        return +n;
    }

    constructor(errorMessage = 'no error message') {
        super('number');
        super.addValidator(value => /^[0-9]+.?[0-9]*$/.test(value), errorMessage);
    }

    pattern(regexp, errorMessage) {
        super.addValidator(value => regexp.test(value), errorMessage);
        return this;
    }

    isOneOf(numLst, errorMessage) {
        super.addValidator(value => value in numLst, errorMessage);
        return this;
    }

    range(min, max, errorMessage) {
        super.addValidator(value => value >= min && value <= max, errorMessage);
        return this;
    }

    min(min, errorMessage) {
        super.addValidator(value => value >= min, errorMessage);
        return this;
    }

    max(max, errorMessage) {
        super.addValidator(value => value <= max, errorMessage);
        return this;
    }
}

export default (errorMessage) => new NumberType(errorMessage);
