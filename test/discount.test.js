const test = require("node:test");
const assert = require("node:assert/strict");
const DiscountCalculator = require("../src/pricing/discount/DiscountCalculator");
const CustomerTypeDiscount = require("../src/pricing/discount/CustomerTypeDiscount");
const CouponDiscount = require("../src/pricing/discount/CouponDiscount");
const HighValueOrderDiscount = require("../src/pricing/discount/HighValueOrderDiscount");
const pricingConfig = require("../src/config/pricingConfig");
const { buildCustomer, buildOrder } = require("./support/builders");

const customerDiscount = () => new CustomerTypeDiscount(pricingConfig.customerDiscountRates);
const couponDiscount = () => new CouponDiscount(pricingConfig.couponDiscountRates);
const highValueDiscount = () => new HighValueOrderDiscount(8000, 250);

test("CustomerTypeDiscount aplica 8% para vip", () => {
  const order = buildOrder({ customer: buildCustomer({ type: "vip" }) });
  assert.equal(customerDiscount().calculate(order, 1000), 80);
});

test("CustomerTypeDiscount aplica 15% para employee", () => {
  const order = buildOrder({ customer: buildCustomer({ type: "employee" }) });
  assert.equal(customerDiscount().calculate(order, 1000), 150);
});

test("CustomerTypeDiscount nao aplica desconto para outros tipos", () => {
  const order = buildOrder({ customer: buildCustomer({ type: "regular" }) });
  assert.equal(customerDiscount().calculate(order, 1000), 0);
});

test("CouponDiscount aplica 10% para TECH10", () => {
  assert.equal(couponDiscount().calculate(buildOrder({ couponCode: "TECH10" }), 1000), 100);
});

test("CouponDiscount nao gera desconto para FRETEGRATIS nem cupom desconhecido", () => {
  assert.equal(couponDiscount().calculate(buildOrder({ couponCode: "FRETEGRATIS" }), 1000), 0);
  assert.equal(couponDiscount().calculate(buildOrder({ couponCode: "XYZ" }), 1000), 0);
  assert.equal(couponDiscount().calculate(buildOrder(), 1000), 0);
});

test("HighValueOrderDiscount aplica 250 apenas acima de 8000", () => {
  const order = buildOrder();
  assert.equal(highValueDiscount().calculate(order, 8000), 0);
  assert.equal(highValueDiscount().calculate(order, 8000.01), 250);
});

test("DiscountCalculator soma as regras configuradas", () => {
  const calculator = new DiscountCalculator([
    customerDiscount(),
    couponDiscount(),
    highValueDiscount()
  ]);
  const order = buildOrder({
    customer: buildCustomer({ type: "vip" }),
    couponCode: "TECH10"
  });

  assert.equal(calculator.calculate(order, 10000), 800 + 1000 + 250);
});

test("DiscountCalculator aceita novas regras sem modificacao (OCP)", () => {
  const fixedDiscount = { calculate: () => 7 };
  const calculator = new DiscountCalculator([fixedDiscount, fixedDiscount]);

  assert.equal(calculator.calculate(buildOrder(), 100), 14);
});

test("DiscountCalculator sem regras retorna zero", () => {
  assert.equal(new DiscountCalculator([]).calculate(buildOrder(), 100), 0);
});
