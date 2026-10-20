const test = require("node:test");
const assert = require("node:assert/strict");
const FreightCalculator = require("../src/pricing/freight/FreightCalculator");
const FreeShippingPolicy = require("../src/pricing/freight/FreeShippingPolicy");
const OrderItem = require("../src/domain/OrderItem");
const pricingConfig = require("../src/config/pricingConfig");
const { buildCustomer, buildProduct, buildOrder } = require("./support/builders");

function buildCalculator() {
  return new FreightCalculator(
    pricingConfig.freightRatesByRegion,
    pricingConfig.defaultFreightRate,
    new FreeShippingPolicy(pricingConfig.freeShippingCoupons)
  );
}

function orderFor(region, couponCode) {
  return buildOrder({
    customer: buildCustomer({ region }),
    items: [new OrderItem(buildProduct({ weight: 2 }), 2)],
    couponCode
  });
}

const expectedByRegion = [
  ["sudeste", 20 + 4 * 4],
  ["sul", 28 + 4 * 5],
  ["centro-oeste", 35 + 4 * 6],
  ["nordeste", 45 + 4 * 7],
  ["norte", 60 + 4 * 9],
  ["exterior", 50 + 4 * 8]
];

for (const [region, expected] of expectedByRegion) {
  test(`FreightCalculator calcula frete para a regiao ${region}`, () => {
    assert.equal(buildCalculator().calculate(orderFor(region)), expected);
  });
}

test("FreightCalculator zera o frete com cupom FRETEGRATIS", () => {
  assert.equal(buildCalculator().calculate(orderFor("norte", "FRETEGRATIS")), 0);
});

test("FreightCalculator nao zera o frete com outros cupons", () => {
  assert.equal(buildCalculator().calculate(orderFor("sul", "TECH10")), 28 + 4 * 5);
});

test("FreightCalculator permite nova regiao apenas por configuracao (OCP)", () => {
  const rates = new Map([["lua", { base: 1000, perKg: 100 }]]);
  const calculator = new FreightCalculator(rates, { base: 0, perKg: 0 }, new FreeShippingPolicy([]));

  assert.equal(calculator.calculate(orderFor("lua")), 1000 + 4 * 100);
});

test("FreeShippingPolicy identifica cupons de frete gratis", () => {
  const policy = new FreeShippingPolicy(["FRETEGRATIS"]);

  assert.equal(policy.appliesTo(buildOrder({ couponCode: "FRETEGRATIS" })), true);
  assert.equal(policy.appliesTo(buildOrder({ couponCode: "OUTRO" })), false);
  assert.equal(policy.appliesTo(buildOrder()), false);
});
