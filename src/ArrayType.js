import Type from './Type';

class ArrayType extends Type {
    static from(n) {
        return n;
    }

    constructor(errorMessage = 'no error message') {
        super('array');
        super.addRule(v => Array.isArray(v), errorMessage);
    }

    rangeLength(minLength, maxLength, errorMessage) {
        super.addRule(value => value.length >= minLength && value.length <= maxLength, errorMessage);
        return this;
    }

    minLength(minLength, errorMessage) {
        super.addRule(value => value.length >= minLength, errorMessage);
        return this;
    }

    maxLength(maxLength, errorMessage) {
        super.addRule(value => value.length <= maxLength, errorMessage);
        return this;
    }

    unrepeatable(errorMessage) {
        super.addRule((items) => {
            let hash = {};
            for (let i in items) {
                if (hash[items[i]]) {
                    return false;
                }
                hash[items[i]] = true;
            }
            return true;
        }, errorMessage);
        return this;
    }

    /**
     * @example
     * ArrayType('这是一个数组').shape(
     *      StringType().isOneOf(['数码','体育','游戏','旅途','其他'],
     *      '只能是选择中的值'
     * )
     */
    shape(type, errorMessage) {

        super.addRule((items) => {
            let valids = items.map((value) => {
                return type.check(value)
            });
            return valids.reduce((previousValue, currentValue) => {
                return !previousValue.hasError && !currentValue.hasError
            })
        }, errorMessage);

        return this;
    }
}

export default (errorMessage) => new ArrayType(errorMessage);
