class DiscountCalculator {
  constructor(rules) {
    this.rules = rules;
  }

  calculate(order, subtotal) {
    return this.rules.reduce(
      (total, rule) => total + rule.calculate(order, subtotal),
      0
    );
  }
}

module.exports = DiscountCalculator;
