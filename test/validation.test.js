const test = require("node:test");
const assert = require("node:assert/strict");
const CustomerValidator = require("../src/validation/CustomerValidator");
const OrderItemsValidator = require("../src/validation/OrderItemsValidator");
const OrderValidator = require("../src/validation/OrderValidator");
const Order = require("../src/domain/Order");
const OrderItem = require("../src/domain/OrderItem");
const ProductRepository = require("../src/repositories/ProductRepository");
const { buildCustomer, buildOrder } = require("./support/builders");

test("CustomerValidator exige cliente", () => {
  const order = new Order("o1", null, [], null, "pix", 1);

  assert.throws(() => new CustomerValidator().validate(order), { message: "Cliente obrigatorio." });
});

test("CustomerValidator exige e-mail valido", () => {
  const order = buildOrder({ customer: buildCustomer({ email: "invalido" }) });

  assert.throws(() => new CustomerValidator().validate(order), {
    message: "E-mail do cliente invalido."
  });
});

test("CustomerValidator aceita cliente valido", () => {
  assert.doesNotThrow(() => new CustomerValidator().validate(buildOrder()));
});

test("OrderItemsValidator exige ao menos um item", () => {
  const validator = new OrderItemsValidator(new ProductRepository());

  assert.throws(() => validator.validate(buildOrder({ items: [] })), {
    message: "Pedido sem itens."
  });
});

test("OrderItemsValidator exige produto no item", () => {
  const validator = new OrderItemsValidator(new ProductRepository());
  const order = buildOrder({ items: [new OrderItem(null, 1)] });

  assert.throws(() => validator.validate(order), { message: "Item sem produto." });
});

test("OrderItemsValidator rejeita quantidade invalida", () => {
  const repository = new ProductRepository();
  const validator = new OrderItemsValidator(repository);

  for (const quantity of [0, -3]) {
    const order = buildOrder({ items: [new OrderItem(repository.findById("p1"), quantity)] });
    assert.throws(() => validator.validate(order), { message: "Quantidade invalida." });
  }
});

test("OrderItemsValidator rejeita produto inexistente no repositorio", () => {
  const validator = new OrderItemsValidator(new ProductRepository());
  const ghost = { id: "p99", name: "Fantasma", price: 1, weight: 1, stock: 1 };
  const order = buildOrder({ items: [new OrderItem(ghost, 1)] });

  assert.throws(() => validator.validate(order), { message: "Produto p99 nao encontrado." });
});

test("OrderItemsValidator rejeita estoque insuficiente", () => {
  const repository = new ProductRepository();
  const validator = new OrderItemsValidator(repository);
  const order = buildOrder({ items: [new OrderItem(repository.findById("p1"), 9)] });

  assert.throws(() => validator.validate(order), {
    message: "Estoque insuficiente para Notebook Pro 14."
  });
});

test("OrderValidator executa os validadores na ordem recebida", () => {
  const calls = [];
  const validator = new OrderValidator([
    { validate: () => calls.push("primeiro") },
    { validate: () => calls.push("segundo") }
  ]);

  validator.validate(buildOrder());

  assert.deepEqual(calls, ["primeiro", "segundo"]);
});

test("OrderValidator interrompe no primeiro validador que falha", () => {
  const calls = [];
  const validator = new OrderValidator([
    {
      validate: () => {
        throw new Error("falhou");
      }
    },
    { validate: () => calls.push("nunca") }
  ]);

  assert.throws(() => validator.validate(buildOrder()), { message: "falhou" });
  assert.deepEqual(calls, []);
});
