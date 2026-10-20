class ConsoleOrderSummaryPrinter {
  constructor(output = console) {
    this.output = output;
  }

  print(order, pricing) {
    this.output.log("Resumo do pedido");
    this.output.log(`Cliente: ${order.getCustomerName()}`);
    this.output.log(`Cidade: ${order.getShippingCity()}/${order.getShippingState()}`);
    this.output.log(`Itens: ${order.getTotalItems()}`);
    this.output.log(`Subtotal: R$ ${pricing.subtotal.toFixed(2)}`);
    this.output.log(`Desconto: R$ ${pricing.discount.toFixed(2)}`);
    this.output.log(`Frete: R$ ${pricing.freight.toFixed(2)}`);
    this.output.log(`Taxas: R$ ${pricing.paymentFee.toFixed(2)}`);
    this.output.log(`Total: R$ ${pricing.total.toFixed(2)}`);
  }
}

module.exports = ConsoleOrderSummaryPrinter;
