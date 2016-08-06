class Type {
    constructor(name) {
        this.name = name;
        this.required = false;
        this.validators = [];
    }

    check(v) {
        for (let i = this.validators.length; i > 0; i--) {
            let { onValid, errorMessage } = this.validators[i - 1];

            if (!this.required && (typeof v === 'undefined' || v.length === 0)) {
                return { hasError: false };
            }

            if (!onValid(v)) {
                return { hasError: true, errorMessage };
            }
        }
        return { hasError: false };
    }

    addValidator(onValid, errorMessage) {
        errorMessage = errorMessage || this.validators[0].errorMessage;
        this.validators.push({ onValid, errorMessage });
    }
    isRequired(errorMessage) {
        this.required = true;
        this.addValidator(v => typeof v !== 'undefined' && v.length > 0, errorMessage);
        return this;
    }
}

export default Type;
