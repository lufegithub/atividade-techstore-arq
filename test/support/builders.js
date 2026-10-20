const Address = require("../../src/domain/Address");
const Customer = require("../../src/domain/Customer");
const Order = require("../../src/domain/Order");
const OrderItem = require("../../src/domain/OrderItem");
const Product = require("../../src/domain/Product");

function buildCustomer({ type = "regular", region = "sudeste", email = "ana@example.com" } = {}) {
  const address = new Address("Rua A", "10", "Presidente Prudente", "SP", "19000-000", region);
  return new Customer("c1", "Ana Souza", email, "18999990000", type, address);
}

function buildProduct({ id = "p1", price = 100, weight = 1, stock = 10 } = {}) {
  return new Product(id, `Produto ${id}`, "geral", price, weight, stock);
}

function buildOrder({
  customer = buildCustomer(),
  items = [new OrderItem(buildProduct(), 1)],
  couponCode,
  paymentMethod = "pix",
  installments = 1
} = {}) {
  return new Order("o1", customer, items, couponCode, paymentMethod, installments);
}

function buildOutputRecorder() {
  const lines = [];
  return { lines, log: (message) => lines.push(message) };
}

module.exports = { buildCustomer, buildProduct, buildOrder, buildOutputRecorder, OrderItem };
