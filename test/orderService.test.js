const test = require("node:test");
const assert = require("node:assert/strict");
const OrderService = require("../src/services/OrderService");
const InventoryService = require("../src/services/InventoryService");
const NotificationService = require("../src/services/NotificationService");
const OrderRepository = require("../src/repositories/OrderRepository");
const ProductRepository = require("../src/repositories/ProductRepository");
const Logger = require("../src/utils/Logger");
const OrderItem = require("../src/domain/OrderItem");
const OrderStatus = require("../src/domain/OrderStatus");
const PaymentStatus = require("../src/domain/PaymentStatus");
const buildOrderService = require("../src/config/buildOrderService");
const { buildCustomer, buildOrder, buildOutputRecorder } = require("./support/builders");

function buildScenario({ customerType = "vip", couponCode = "TECH10", paymentMethod = "credit_card", installments = 3, region = "sudeste", notebookQty = 1, mouseQty = 2 } = {}) {
  const productRepository = new ProductRepository();
  const orderRepository = new OrderRepository();
  const output = buildOutputRecorder();
  const service = buildOrderService({ productRepository, orderRepository, output });
  const order = buildOrder({
    customer: buildCustomer({ type: customerType, region }),
    items: [
      new OrderItem(productRepository.findById("p1"), notebookQty),
      new OrderItem(productRepository.findById("p2"), mouseQty)
    ],
    couponCode,
    paymentMethod,
    installments
  });

  return { service, order, productRepository, orderRepository, output };
}

test("processa o pedido de referencia (vip, TECH10, cartao em 3x)", () => {
  const { service, order, output } = buildScenario();

  const summary = service.process(order);

  assert.equal(summary.id, "o1");
  assert.equal(summary.customerName, "Ana Souza");
  assert.equal(summary.customerEmail, "ana@example.com");
  assert.equal(summary.city, "Presidente Prudente");
  assert.equal(summary.state, "SP");
  assert.equal(summary.subtotal, 6440);
  assert.equal(summary.discount, 1159.2);
  assert.equal(summary.freight, 30);
  assert.equal(summary.paymentFee, 161);
  assert.equal(summary.total, 5471.8);
  assert.equal(summary.paymentMethod, "credit_card");
  assert.equal(summary.status, OrderStatus.CONFIRMED);
  assert.deepEqual(summary.items, [
    { productId: "p1", name: "Notebook Pro 14", quantity: 1, subtotal: 6200 },
    { productId: "p2", name: "Mouse Sem Fio", quantity: 2, subtotal: 240 }
  ]);
  assert.deepEqual(output.lines, [
    "[INFO] Iniciando processamento do pedido o1.",
    "[INFO] Enviando confirmacao do pedido o1 para ana@example.com no valor de R$ 5471.80.",
    "Resumo do pedido",
    "Cliente: Ana Souza",
    "Cidade: Presidente Prudente/SP",
    "Itens: 3",
    "Subtotal: R$ 6440.00",
    "Desconto: R$ 1159.20",
    "Frete: R$ 30.00",
    "Taxas: R$ 161.00",
    "Total: R$ 5471.80"
  ]);
});

test("preserva a ordem das chaves do resumo do pedido", () => {
  const { service, order } = buildScenario();

  const summary = service.process(order);

  assert.deepEqual(Object.keys(summary), [
    "id",
    "customerName",
    "customerEmail",
    "city",
    "state",
    "items",
    "subtotal",
    "discount",
    "freight",
    "paymentFee",
    "total",
    "paymentMethod",
    "status",
    "createdAt"
  ]);
});

test("baixa o estoque apenas apos validar e calcular o pedido", () => {
  const { service, order, productRepository } = buildScenario({ notebookQty: 3, mouseQty: 5 });

  service.process(order);

  assert.equal(productRepository.findById("p1").stock, 5);
  assert.equal(productRepository.findById("p2").stock, 25);
});

test("persiste o resumo no repositorio de pedidos", () => {
  const { service, order, orderRepository } = buildScenario();

  const summary = service.process(order);

  assert.deepEqual(orderRepository.findAll(), [summary]);
});

test("pix confirma o pedido com desconto de 3%", () => {
  const { service, order } = buildScenario({
    customerType: "regular",
    couponCode: null,
    paymentMethod: "pix",
    installments: 1
  });

  const summary = service.process(order);

  assert.equal(summary.discount, 193.2);
  assert.equal(summary.paymentFee, 0);
  assert.equal(summary.status, OrderStatus.CONFIRMED);
});

test("boleto deixa o pedido aguardando pagamento e nao envia notificacao", () => {
  const { service, order, output } = buildScenario({
    customerType: "regular",
    couponCode: null,
    paymentMethod: "boleto"
  });

  const summary = service.process(order);

  assert.equal(summary.status, OrderStatus.WAITING_PAYMENT);
  assert.ok(output.lines.includes("[WARN] Pedido o1 aguardando pagamento."));
  assert.ok(!output.lines.some((line) => line.includes("Enviando confirmacao")));
});

test("cupom FRETEGRATIS zera o frete", () => {
  const { service, order } = buildScenario({ couponCode: "FRETEGRATIS", region: "norte" });

  assert.equal(service.process(order).freight, 0);
});

test("nao altera estoque nem persiste quando a forma de pagamento e invalida", () => {
  const { service, order, productRepository, orderRepository } = buildScenario({
    paymentMethod: "dinheiro"
  });

  assert.throws(() => service.process(order), { message: "Forma de pagamento invalida." });
  assert.equal(productRepository.findById("p1").stock, 8);
  assert.deepEqual(orderRepository.findAll(), []);
});

test("nao altera estoque quando o pedido e invalido", () => {
  const { service, order, productRepository } = buildScenario({ notebookQty: 9 });

  assert.throws(() => service.process(order), { message: "Estoque insuficiente para Notebook Pro 14." });
  assert.equal(productRepository.findById("p1").stock, 8);
  assert.equal(productRepository.findById("p2").stock, 30);
});

test("OrderService orquestra colaboradores substituiveis (DIP)", () => {
  const calls = [];
  const order = buildOrder();
  const pricing = {
    subtotal: 100,
    discount: 0,
    freight: 0,
    paymentFee: 0,
    paymentStatus: PaymentStatus.APPROVED,
    total: 100
  };

  const service = new OrderService({
    validator: { validate: () => calls.push("validate") },
    pricingCalculator: { calculate: () => (calls.push("price"), pricing) },
    inventoryService: { decreaseStock: () => calls.push("stock") },
    orderRepository: { save: () => calls.push("save") },
    summaryFactory: { create: () => (calls.push("summary"), { id: "o1" }) },
    summaryPrinter: { print: () => calls.push("print") },
    notificationService: { sendOrderConfirmation: () => calls.push("notify") },
    logger: { info: () => calls.push("log"), warn: () => calls.push("warn") }
  });

  const result = service.process(order);

  assert.deepEqual(result, { id: "o1" });
  assert.deepEqual(calls, ["log", "validate", "price", "stock", "summary", "save", "notify", "print"]);
});

test("OrderService nao calcula nem baixa estoque quando a validacao falha", () => {
  const calls = [];
  const service = new OrderService({
    validator: {
      validate: () => {
        throw new Error("invalido");
      }
    },
    pricingCalculator: { calculate: () => calls.push("price") },
    inventoryService: { decreaseStock: () => calls.push("stock") },
    orderRepository: { save: () => calls.push("save") },
    summaryFactory: { create: () => calls.push("summary") },
    summaryPrinter: { print: () => calls.push("print") },
    notificationService: { sendOrderConfirmation: () => calls.push("notify") },
    logger: { info: () => {}, warn: () => {} }
  });

  assert.throws(() => service.process(buildOrder()), { message: "invalido" });
  assert.deepEqual(calls, []);
});

test("InventoryService baixa o estoque de todos os itens", () => {
  const repository = new ProductRepository();
  const order = buildOrder({
    items: [
      new OrderItem(repository.findById("p3"), 2),
      new OrderItem(repository.findById("p4"), 1)
    ]
  });

  new InventoryService(repository).decreaseStock(order);

  assert.equal(repository.findById("p3").stock, 10);
  assert.equal(repository.findById("p4").stock, 14);
});

test("ProductRepository rejeita atualizacao de produto inexistente", () => {
  assert.throws(() => new ProductRepository().updateStock("p99", 1), {
    message: "Produto nao encontrado."
  });
});

test("NotificationService registra a confirmacao usando o logger recebido", () => {
  const output = buildOutputRecorder();

  new NotificationService(new Logger(output)).sendOrderConfirmation(buildCustomer(), "o7", 10);

  assert.deepEqual(output.lines, [
    "[INFO] Enviando confirmacao do pedido o7 para ana@example.com no valor de R$ 10.00."
  ]);
});

test("Logger escreve com prefixo por nivel", () => {
  const output = buildOutputRecorder();
  const logger = new Logger(output);

  logger.info("a");
  logger.warn("b");
  logger.error("c");

  assert.deepEqual(output.lines, ["[INFO] a", "[WARN] b", "[ERROR] c"]);
});
