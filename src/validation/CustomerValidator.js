class CustomerValidator {
  validate(order) {
    if (!order.hasCustomer()) {
      throw new Error("Cliente obrigatorio.");
    }

    if (!order.hasValidCustomerEmail()) {
      throw new Error("E-mail do cliente invalido.");
    }
  }
}

module.exports = CustomerValidator;
