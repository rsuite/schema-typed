import Type from './Type';

function _f(value) {
    return +value;
}

class NumberType extends Type {
    static from(n) {
        return n;
    }

    constructor(errorMessage = 'no error message') {
        super('number');
        super.addValidator(value => /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value), errorMessage);
    }

    isInteger(){
         super.addValidator(value => /^-?\d+$/.test(value), errorMessage);
    }

    pattern(regexp, errorMessage) {
        super.addValidator(value => regexp.test(value), errorMessage);
        return this;
    }

    isOneOf(numLst, errorMessage) {
        super.addValidator(value => _f(value) in numLst, errorMessage);
        return this;
    }

    range(min, max, errorMessage) {
        super.addValidator(value => _f(value) >= min && _f(value) <= max, errorMessage);
        return this;
    }

    min(min, errorMessage) {
        super.addValidator(value => _f(value) >= min, errorMessage);
        return this;
    }

    max(max, errorMessage) {
        super.addValidator(value => _f(value) <= max, errorMessage);
        return this;
    }
}

export default (errorMessage) => new NumberType(errorMessage);
