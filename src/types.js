class Type {
    constructor(name) {
        this.name = name;
        this.validators = [];
    }

    check(v) {
        for(let i = 0, len = this.validators.length; i < len; i++) {
            let { vd, msg } = this.validators[i];
            if(!vd(v)) {
                return { err: true, msg };
            }
        }
        return { err: false };
    }

    addValidator(vd, msg) {
        msg = msg || this.validators[0].msg;
        this.validators.push({ vd, msg });
    }
}

class Str extends Type {
    static from(s) {
        return s + '';
    }

    constructor(msg = 'no error message') {
        super('string');
        super.addValidator( v => typeof v === 'string', msg);
    }

    isLongerThan(n, msg) {
        super.addValidator( v => v.length > n, msg );
        return this;
    }

    containsLetter(msg) {
        super.addValidator( v => /[a-zA-Z]/.test(v), msg );
        return this;
    }

    containsUppercaseLetter(msg) {
        super.addValidator( v => /[A-Z]/.test(v), msg );
        return this;
    }

    containsLowercaseLetter(msg) {
        super.addValidator( v => /[a-z]/.test(v), msg );
        return this;
    }

    containsLetterOnly(msg) {
        super.addValidator( v => /^[a-zA-Z]+$/.test(v), msg );
        return this;
    }

    containsNumber(msg) {
        super.addValidator( v => /[0-9]/.test(v), msg );
        return this;
    }

    isOneOf(strArr, msg) {
        super.addValidator( v => strArr.includes(v), msg);
        return this;
    }

    isValidEmail(msg) {
        let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        super.addValidator( v => re.test(v), msg);
        return this;
    }
}

class Num extends Type {
    static from(n) {
        return +n;
    }

    constructor(msg = 'no error message') {
        super('number');
        super.addValidator( v => typeof v === 'number' && !isNaN(v), msg );
    }

    isOneOf(numLst, msg) {
        super.addValidator( v => v in numLst, msg);
        return this;
    }
}

export const StringType = msg => new Str(msg);
export const NumberType = msg => new Num(msg);
