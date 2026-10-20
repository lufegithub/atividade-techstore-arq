class NotificationService {
  constructor(logger) {
    this.logger = logger;
  }

  sendOrderConfirmation(customer, orderId, total) {
    this.logger.info(
      `Enviando confirmacao do pedido ${orderId} para ${customer.email} no valor de R$ ${total.toFixed(2)}.`
    );
  }
}

module.exports = NotificationService;
