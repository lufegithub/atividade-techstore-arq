class CustomerTypeDiscount {
  constructor(ratesByCustomerType) {
    this.ratesByCustomerType = ratesByCustomerType;
  }

  calculate(order, subtotal) {
    const rate = this.ratesByCustomerType.get(order.getCustomerType());
    return rate ? subtotal * rate : 0;
  }
}

module.exports = CustomerTypeDiscount;
