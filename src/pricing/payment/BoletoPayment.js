const PaymentMethod = require("../../domain/PaymentMethod");
const PaymentStatus = require("../../domain/PaymentStatus");

class BoletoPayment {
  constructor() {
    this.method = PaymentMethod.BOLETO;
  }

  process() {
    return {
      status: PaymentStatus.WAITING_PAYMENT,
      discount: 0,
      fee: 0
    };
  }
}

module.exports = BoletoPayment;
