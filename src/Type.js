class Type {
    constructor(name) {
        this.name = name;
        this.required = false;
        this.validators = [];
    }

    check(value) {
        for (let i = this.validators.length; i > 0; i--) {
            let { onValid, errorMessage } = this.validators[i - 1];

            if (!this.required && (typeof value === 'undefined' || value === null || value === '')) {
                return { hasError: false };
            }

            if (!onValid(value)) {
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
        this.addValidator((value) => {

            //String & Array
            if (value && value.length && value.length > 0) {
                return true;
            }

            return typeof value !== 'undefined' && value !== null && value !== '';

        }, errorMessage);
        return this;
    }
}

export default Type;
