class Product {
  constructor(id, name, category, price, weight, stock) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.price = price;
    this.weight = weight;
    this.stock = stock;
  }

  hasInsufficientStock(quantity) {
    return this.stock < quantity;
  }

  decreaseStock(quantity) {
    this.stock -= quantity;
  }
}

module.exports = Product;
