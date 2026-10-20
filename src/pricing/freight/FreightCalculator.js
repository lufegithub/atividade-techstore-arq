class FreightCalculator {
  constructor(ratesByRegion, defaultRate, freeShippingPolicy) {
    this.ratesByRegion = ratesByRegion;
    this.defaultRate = defaultRate;
    this.freeShippingPolicy = freeShippingPolicy;
  }

  calculate(order) {
    if (this.freeShippingPolicy.appliesTo(order)) {
      return 0;
    }

    const rate = this.ratesByRegion.get(order.getShippingRegion()) || this.defaultRate;
    return rate.base + order.getTotalWeight() * rate.perKg;
  }
}

module.exports = FreightCalculator;
