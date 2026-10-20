class HighValueOrderDiscount {
  constructor(threshold, discountAmount) {
    this.threshold = threshold;
    this.discountAmount = discountAmount;
  }

  calculate(order, subtotal) {
    return subtotal > this.threshold ? this.discountAmount : 0;
  }
}

module.exports = HighValueOrderDiscount;
