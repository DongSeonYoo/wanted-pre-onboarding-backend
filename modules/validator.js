const { BadRequestException } = require("../modules/customError");
const errorMessage = {
    invalidInput: "요청값이 잘못되었습니다",
    length: "길이가 비정상적입니다",
    regex: "정규표현식 실패",
    isNumber: "정수가 아닙니다",
    isBoolean: "true or false만 가능합니다",
    isPositive: "정수만 가능합니다"
}

function Validation(input, name) {
    this.checkInput = () => {
        if (input === undefined || input === "") this.setError(errorMessage.invalidInput);
        return this;
    }

    this.checkLength = (min, max) => {
        if (input.length < min || input.length > max) this.setError(errorMessage.length);
        return this;
    }

    this.isNumber = () => {
        if (isNaN(Number(input))) this.setError(errorMessage.isNumber);
        return this;
    }

    this.isBoolean = () => {
        if (input !== "true" && input !== "false") this.setError(errorMessage.isBoolean);
        return this;
    }

    this.isPositive = () => {
        if (Number(input) < 1) this.setError(errorMessage.isPositive);
        return this;
    }

    this.checkRegex = (regex) => {
        if (!regex.test(input)) this.setError(errorMessage.regex);
        return this;
    }

    this.setError = (message) => {
        const error = new BadRequestException(`${name}: ${message}`);
        throw error;
    }
}

const validate = (input, name) => {
    const res = new Validation(input, name);
    return res;
}

module.exports = validate;
