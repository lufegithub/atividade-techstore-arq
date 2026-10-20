const OrderStatus = require("./OrderStatus");
const PaymentStatus = require("./PaymentStatus");

class Order {
  constructor(id, customer, items, couponCode, paymentMethod, installments) {
    this.id = id;
    this.customer = customer;
    this.items = items;
    this.couponCode = couponCode;
    this.paymentMethod = paymentMethod;
    this.installments = installments;
    this.status = OrderStatus.CREATED;
    this.createdAt = new Date();
  }

  hasCustomer() {
    return Boolean(this.customer);
  }

  hasValidCustomerEmail() {
    return this.customer.hasValidEmail();
  }

  hasItems() {
    return Boolean(this.items) && this.items.length !== 0;
  }

  getCustomerName() {
    return this.customer.name;
  }

  getCustomerEmail() {
    return this.customer.email;
  }

  getCustomerType() {
    return this.customer.type;
  }

  getShippingRegion() {
    return this.customer.getRegion();
  }

  getShippingCity() {
    return this.customer.getCity();
  }

  getShippingState() {
    return this.customer.getState();
  }

  getTotalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal() {
    return this.items.reduce((total, item) => total + item.getSubtotal(), 0);
  }

  getTotalWeight() {
    return this.items.reduce((total, item) => total + item.getTotalWeight(), 0);
  }

  applyPaymentStatus(paymentStatus) {
    this.status =
      paymentStatus === PaymentStatus.APPROVED
        ? OrderStatus.CONFIRMED
        : OrderStatus.WAITING_PAYMENT;
  }

  isConfirmed() {
    return this.status === OrderStatus.CONFIRMED;
  }
}

module.exports = Order;
