const test = require("node:test");
const assert = require("node:assert/strict");
const Order = require("../src/domain/Order");
const OrderItem = require("../src/domain/OrderItem");
const OrderStatus = require("../src/domain/OrderStatus");
const PaymentStatus = require("../src/domain/PaymentStatus");
const { buildCustomer, buildProduct, buildOrder } = require("./support/builders");

test("Order calcula subtotal, peso e quantidade total", () => {
  const order = buildOrder({
    items: [
      new OrderItem(buildProduct({ id: "p1", price: 100, weight: 2 }), 2),
      new OrderItem(buildProduct({ id: "p2", price: 50, weight: 0.5 }), 4)
    ]
  });

  assert.equal(order.getSubtotal(), 400);
  assert.equal(order.getTotalWeight(), 6);
  assert.equal(order.getTotalItems(), 6);
});

test("Order expoe dados de entrega sem exigir navegacao em cadeia", () => {
  const order = buildOrder({ customer: buildCustomer({ type: "vip", region: "sul" }) });

  assert.equal(order.getShippingRegion(), "sul");
  assert.equal(order.getShippingCity(), "Presidente Prudente");
  assert.equal(order.getShippingState(), "SP");
  assert.equal(order.getCustomerName(), "Ana Souza");
  assert.equal(order.getCustomerEmail(), "ana@example.com");
  assert.equal(order.getCustomerType(), "vip");
});

test("Order inicia com status created", () => {
  assert.equal(buildOrder().status, OrderStatus.CREATED);
});

test("Order confirma pedido quando o pagamento e aprovado", () => {
  const order = buildOrder();

  order.applyPaymentStatus(PaymentStatus.APPROVED);

  assert.equal(order.status, OrderStatus.CONFIRMED);
  assert.equal(order.isConfirmed(), true);
});

test("Order aguarda pagamento quando o pagamento nao e aprovado", () => {
  const order = buildOrder();

  order.applyPaymentStatus(PaymentStatus.WAITING_PAYMENT);

  assert.equal(order.status, OrderStatus.WAITING_PAYMENT);
  assert.equal(order.isConfirmed(), false);
});

test("Order informa presenca de cliente e de itens", () => {
  assert.equal(new Order("o", null, [], null, "pix", 1).hasCustomer(), false);
  assert.equal(new Order("o", null, [], null, "pix", 1).hasItems(), false);
  assert.equal(new Order("o", null, undefined, null, "pix", 1).hasItems(), false);
  assert.equal(buildOrder().hasCustomer(), true);
  assert.equal(buildOrder().hasItems(), true);
});

test("Customer valida e-mail", () => {
  assert.equal(buildCustomer({ email: "a@b.com" }).hasValidEmail(), true);
  assert.equal(buildCustomer({ email: "sem-arroba" }).hasValidEmail(), false);
  assert.equal(buildCustomer({ email: "" }).hasValidEmail(), false);
  assert.equal(buildCustomer({ email: null }).hasValidEmail(), false);
});

test("Product controla estoque", () => {
  const product = buildProduct({ stock: 3 });

  assert.equal(product.hasInsufficientStock(3), false);
  assert.equal(product.hasInsufficientStock(4), true);

  product.decreaseStock(2);

  assert.equal(product.stock, 1);
});
