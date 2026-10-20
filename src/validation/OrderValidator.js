class OrderValidator {
  constructor(validators) {
    this.validators = validators;
  }

  validate(order) {
    for (const validator of this.validators) {
      validator.validate(order);
    }
  }
}

module.exports = OrderValidator;
