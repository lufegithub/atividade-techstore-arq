class PaymentProcessor {
  constructor(paymentMethods) {
    this.paymentMethods = new Map(
      paymentMethods.map((paymentMethod) => [paymentMethod.method, paymentMethod])
    );
  }

  process(order, subtotal) {
    const paymentMethod = this.paymentMethods.get(order.paymentMethod);

    if (!paymentMethod) {
      throw new Error("Forma de pagamento invalida.");
    }

    return paymentMethod.process(order, subtotal);
  }
}

module.exports = PaymentProcessor;
