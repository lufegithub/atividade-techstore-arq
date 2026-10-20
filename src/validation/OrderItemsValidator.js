class OrderItemsValidator {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  validate(order) {
    if (!order.hasItems()) {
      throw new Error("Pedido sem itens.");
    }

    for (const item of order.items) {
      this.validateItem(item);
    }
  }

  validateItem(item) {
    if (!item.hasProduct()) {
      throw new Error("Item sem produto.");
    }

    if (item.hasInvalidQuantity()) {
      throw new Error("Quantidade invalida.");
    }

    const product = this.productRepository.findById(item.getProductId());

    if (!product) {
      throw new Error(`Produto ${item.getProductId()} nao encontrado.`);
    }

    if (product.hasInsufficientStock(item.quantity)) {
      throw new Error(`Estoque insuficiente para ${product.name}.`);
    }
  }
}

module.exports = OrderItemsValidator;
