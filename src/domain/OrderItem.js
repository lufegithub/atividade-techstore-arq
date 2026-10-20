class OrderItem {
  constructor(product, quantity) {
    this.product = product;
    this.quantity = quantity;
  }

  hasProduct() {
    return Boolean(this.product);
  }

  hasInvalidQuantity() {
    return this.quantity <= 0;
  }

  getProductId() {
    return this.product.id;
  }

  getProductName() {
    return this.product.name;
  }

  getSubtotal() {
    return this.product.price * this.quantity;
  }

  getTotalWeight() {
    return this.product.weight * this.quantity;
  }
}

module.exports = OrderItem;
