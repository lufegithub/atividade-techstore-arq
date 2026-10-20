class OrderPricingCalculator {
  constructor(discountCalculator, freightCalculator, paymentProcessor) {
    this.discountCalculator = discountCalculator;
    this.freightCalculator = freightCalculator;
    this.paymentProcessor = paymentProcessor;
  }

  calculate(order) {
    const subtotal = order.getSubtotal();
    const orderDiscount = this.discountCalculator.calculate(order, subtotal);
    const freight = this.freightCalculator.calculate(order);
    const payment = this.paymentProcessor.process(order, subtotal);

    const discount = orderDiscount + payment.discount;
    const total = Number((subtotal - discount + freight + payment.fee).toFixed(2));

    if (total <= 0) {
      throw new Error("Total do pedido invalido.");
    }

    return {
      subtotal,
      discount,
      freight,
      paymentFee: payment.fee,
      paymentStatus: payment.status,
      total
    };
  }
}

module.exports = OrderPricingCalculator;
