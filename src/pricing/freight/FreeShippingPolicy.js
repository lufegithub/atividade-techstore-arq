class FreeShippingPolicy {
  constructor(couponCodes) {
    this.couponCodes = new Set(couponCodes);
  }

  appliesTo(order) {
    return this.couponCodes.has(order.couponCode);
  }
}

module.exports = FreeShippingPolicy;
