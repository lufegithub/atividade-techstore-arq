const test = require("node:test");
const assert = require("node:assert/strict");
const OrderPricingCalculator = require("../src/pricing/OrderPricingCalculator");
const OrderItem = require("../src/domain/OrderItem");
const PaymentStatus = require("../src/domain/PaymentStatus");
const buildOrderService = require("../src/config/buildOrderService");
const { buildCustomer, buildProduct, buildOrder } = require("./support/builders");

function buildRealCalculator() {
  const service = buildOrderService({ output: { log() {} } });
  return service.pricingCalculator;
}

test("OrderPricingCalculator compoe desconto, frete e pagamento (vip + TECH10 + cartao 3x)", () => {
  const order = buildOrder({
    customer: buildCustomer({ type: "vip", region: "sudeste" }),
    items: [
      new OrderItem(buildProduct({ id: "p1", price: 6200, weight: 2.1 }), 1),
      new OrderItem(buildProduct({ id: "p2", price: 120, weight: 0.2 }), 2)
    ],
    couponCode: "TECH10",
    paymentMethod: "credit_card",
    installments: 3
  });

  const pricing = buildRealCalculator().calculate(order);

  assert.equal(pricing.subtotal, 6440);
  assert.equal(Number(pricing.discount.toFixed(2)), 1159.2);
  assert.equal(pricing.freight, 30);
  assert.equal(pricing.paymentFee, 161);
  assert.equal(pricing.paymentStatus, PaymentStatus.APPROVED);
  assert.equal(pricing.total, 5471.8);
});

test("OrderPricingCalculator soma desconto do pix ao desconto do pedido", () => {
  const order = buildOrder({
    customer: buildCustomer({ type: "employee", region: "sul" }),
    items: [new OrderItem(buildProduct({ price: 1000, weight: 1 }), 1)],
    paymentMethod: "pix"
  });

  const pricing = buildRealCalculator().calculate(order);

  assert.equal(Number(pricing.discount.toFixed(2)), 180);
  assert.equal(pricing.freight, 33);
  assert.equal(pricing.total, 853);
});

test("OrderPricingCalculator aplica bonus de pedido acima de 8000", () => {
  const order = buildOrder({
    items: [new OrderItem(buildProduct({ price: 9000, weight: 1 }), 1)],
    paymentMethod: "boleto"
  });

  const pricing = buildRealCalculator().calculate(order);

  assert.equal(pricing.discount, 250);
  assert.equal(pricing.paymentStatus, PaymentStatus.WAITING_PAYMENT);
});

test("OrderPricingCalculator rejeita total menor ou igual a zero", () => {
  const calculator = new OrderPricingCalculator(
    { calculate: () => 1000 },
    { calculate: () => 0 },
    { process: () => ({ status: PaymentStatus.APPROVED, discount: 0, fee: 0 }) }
  );

  assert.throws(() => calculator.calculate(buildOrder()), { message: "Total do pedido invalido." });
});

test("OrderPricingCalculator rejeita forma de pagamento invalida", () => {
  const order = buildOrder({ paymentMethod: "dinheiro" });

  assert.throws(() => buildRealCalculator().calculate(order), {
    message: "Forma de pagamento invalida."
  });
});

test("OrderPricingCalculator depende apenas de colaboradores substituiveis (DIP)", () => {
  const calculator = new OrderPricingCalculator(
    { calculate: () => 10 },
    { calculate: () => 20 },
    { process: () => ({ status: PaymentStatus.APPROVED, discount: 5, fee: 3 }) }
  );

  const pricing = calculator.calculate(buildOrder());

  assert.equal(pricing.discount, 15);
  assert.equal(pricing.total, 108);
});
