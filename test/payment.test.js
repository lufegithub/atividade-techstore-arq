const test = require("node:test");
const assert = require("node:assert/strict");
const PaymentProcessor = require("../src/pricing/payment/PaymentProcessor");
const PixPayment = require("../src/pricing/payment/PixPayment");
const CreditCardPayment = require("../src/pricing/payment/CreditCardPayment");
const BoletoPayment = require("../src/pricing/payment/BoletoPayment");
const PaymentStatus = require("../src/domain/PaymentStatus");
const { buildOrder } = require("./support/builders");

function buildProcessor() {
  return new PaymentProcessor([
    new PixPayment(0.03),
    new CreditCardPayment(0.025),
    new BoletoPayment()
  ]);
}

test("Pix aprova e concede 3% de desconto", () => {
  const result = buildProcessor().process(buildOrder({ paymentMethod: "pix" }), 1000);

  assert.deepEqual(result, { status: PaymentStatus.APPROVED, discount: 30, fee: 0 });
});

test("Cartao a vista aprova sem taxa", () => {
  const order = buildOrder({ paymentMethod: "credit_card", installments: 1 });
  const result = buildProcessor().process(order, 1000);

  assert.deepEqual(result, { status: PaymentStatus.APPROVED, discount: 0, fee: 0 });
});

test("Cartao parcelado aprova com taxa de 2,5%", () => {
  const order = buildOrder({ paymentMethod: "credit_card", installments: 3 });
  const result = buildProcessor().process(order, 1000);

  assert.deepEqual(result, { status: PaymentStatus.APPROVED, discount: 0, fee: 25 });
});

test("Boleto aguarda pagamento sem desconto nem taxa", () => {
  const result = buildProcessor().process(buildOrder({ paymentMethod: "boleto" }), 1000);

  assert.deepEqual(result, { status: PaymentStatus.WAITING_PAYMENT, discount: 0, fee: 0 });
});

test("PaymentProcessor rejeita forma de pagamento invalida", () => {
  assert.throws(
    () => buildProcessor().process(buildOrder({ paymentMethod: "dinheiro" }), 1000),
    { message: "Forma de pagamento invalida." }
  );
});

test("PaymentProcessor aceita nova forma de pagamento sem modificacao (OCP)", () => {
  const voucher = {
    method: "voucher",
    process: () => ({ status: PaymentStatus.APPROVED, discount: 5, fee: 0 })
  };
  const processor = new PaymentProcessor([voucher]);

  assert.equal(processor.process(buildOrder({ paymentMethod: "voucher" }), 100).discount, 5);
});
