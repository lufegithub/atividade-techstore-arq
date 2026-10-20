const PaymentMethod = require("../../domain/PaymentMethod");
const PaymentStatus = require("../../domain/PaymentStatus");

class CreditCardPayment {
  constructor(installmentFeeRate) {
    this.method = PaymentMethod.CREDIT_CARD;
    this.installmentFeeRate = installmentFeeRate;
  }

  process(order, subtotal) {
    const fee = order.installments > 1 ? subtotal * this.installmentFeeRate : 0;

    return {
      status: PaymentStatus.APPROVED,
      discount: 0,
      fee
    };
  }
}

module.exports = CreditCardPayment;
