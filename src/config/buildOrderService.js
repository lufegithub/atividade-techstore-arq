const OrderRepository = require("../repositories/OrderRepository");
const ProductRepository = require("../repositories/ProductRepository");
const Logger = require("../utils/Logger");
const OrderService = require("../services/OrderService");
const InventoryService = require("../services/InventoryService");
const NotificationService = require("../services/NotificationService");
const OrderValidator = require("../validation/OrderValidator");
const CustomerValidator = require("../validation/CustomerValidator");
const OrderItemsValidator = require("../validation/OrderItemsValidator");
const OrderPricingCalculator = require("../pricing/OrderPricingCalculator");
const DiscountCalculator = require("../pricing/discount/DiscountCalculator");
const CustomerTypeDiscount = require("../pricing/discount/CustomerTypeDiscount");
const CouponDiscount = require("../pricing/discount/CouponDiscount");
const HighValueOrderDiscount = require("../pricing/discount/HighValueOrderDiscount");
const FreightCalculator = require("../pricing/freight/FreightCalculator");
const FreeShippingPolicy = require("../pricing/freight/FreeShippingPolicy");
const PaymentProcessor = require("../pricing/payment/PaymentProcessor");
const PixPayment = require("../pricing/payment/PixPayment");
const CreditCardPayment = require("../pricing/payment/CreditCardPayment");
const BoletoPayment = require("../pricing/payment/BoletoPayment");
const OrderSummaryFactory = require("../summary/OrderSummaryFactory");
const ConsoleOrderSummaryPrinter = require("../summary/ConsoleOrderSummaryPrinter");
const pricingConfig = require("./pricingConfig");

function buildPricingCalculator(config) {
  const discountCalculator = new DiscountCalculator([
    new CustomerTypeDiscount(config.customerDiscountRates),
    new CouponDiscount(config.couponDiscountRates),
    new HighValueOrderDiscount(
      config.highValueDiscount.threshold,
      config.highValueDiscount.amount
    )
  ]);

  const freightCalculator = new FreightCalculator(
    config.freightRatesByRegion,
    config.defaultFreightRate,
    new FreeShippingPolicy(config.freeShippingCoupons)
  );

  const paymentProcessor = new PaymentProcessor([
    new PixPayment(config.pixDiscountRate),
    new CreditCardPayment(config.creditCardInstallmentFeeRate),
    new BoletoPayment()
  ]);

  return new OrderPricingCalculator(discountCalculator, freightCalculator, paymentProcessor);
}

function buildOrderService({
  productRepository = new ProductRepository(),
  orderRepository = new OrderRepository(),
  output = console,
  config = pricingConfig
} = {}) {
  const logger = new Logger(output);

  return new OrderService({
    validator: new OrderValidator([
      new CustomerValidator(),
      new OrderItemsValidator(productRepository)
    ]),
    pricingCalculator: buildPricingCalculator(config),
    inventoryService: new InventoryService(productRepository),
    orderRepository,
    summaryFactory: new OrderSummaryFactory(),
    summaryPrinter: new ConsoleOrderSummaryPrinter(output),
    notificationService: new NotificationService(logger),
    logger
  });
}

module.exports = buildOrderService;
