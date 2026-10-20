class OrderService {
  constructor({
    validator,
    pricingCalculator,
    inventoryService,
    orderRepository,
    summaryFactory,
    summaryPrinter,
    notificationService,
    logger
  }) {
    this.validator = validator;
    this.pricingCalculator = pricingCalculator;
    this.inventoryService = inventoryService;
    this.orderRepository = orderRepository;
    this.summaryFactory = summaryFactory;
    this.summaryPrinter = summaryPrinter;
    this.notificationService = notificationService;
    this.logger = logger;
  }

  process(order) {
    this.logger.info(`Iniciando processamento do pedido ${order.id}.`);

    this.validator.validate(order);

    const pricing = this.pricingCalculator.calculate(order);

    this.inventoryService.decreaseStock(order);

    order.applyPaymentStatus(pricing.paymentStatus);

    const orderSummary = this.summaryFactory.create(order, pricing);
    this.orderRepository.save(orderSummary);

    this.notifyCustomer(order, pricing.total);

    this.summaryPrinter.print(order, pricing);

    return orderSummary;
  }

  notifyCustomer(order, total) {
    if (order.isConfirmed()) {
      this.notificationService.sendOrderConfirmation(order.customer, order.id, total);
      return;
    }

    this.logger.warn(`Pedido ${order.id} aguardando pagamento.`);
  }
}

module.exports = OrderService;
