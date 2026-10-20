class InventoryService {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  decreaseStock(order) {
    for (const item of order.items) {
      this.productRepository.updateStock(item.getProductId(), item.quantity);
    }
  }
}

module.exports = InventoryService;
