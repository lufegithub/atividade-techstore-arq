const PaymentMethod = require("../../domain/PaymentMethod");
const PaymentStatus = require("../../domain/PaymentStatus");

class PixPayment {
  constructor(discountRate) {
    this.method = PaymentMethod.PIX;
    this.discountRate = discountRate;
  }

  process(order, subtotal) {
    return {
      status: PaymentStatus.APPROVED,
      discount: subtotal * this.discountRate,
      fee: 0
    };
  }
}

module.exports = PixPayment;
