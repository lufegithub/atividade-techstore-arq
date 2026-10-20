class CouponDiscount {
  constructor(ratesByCoupon) {
    this.ratesByCoupon = ratesByCoupon;
  }

  calculate(order, subtotal) {
    const rate = this.ratesByCoupon.get(order.couponCode);
    return rate ? subtotal * rate : 0;
  }
}

module.exports = CouponDiscount;
