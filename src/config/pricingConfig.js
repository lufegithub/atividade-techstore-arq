module.exports = {
  customerDiscountRates: new Map([
    ["vip", 0.08],
    ["employee", 0.15]
  ]),
  couponDiscountRates: new Map([
    ["TECH10", 0.1],
    ["FRETEGRATIS", 0]
  ]),
  highValueDiscount: {
    threshold: 8000,
    amount: 250
  },
  freeShippingCoupons: ["FRETEGRATIS"],
  freightRatesByRegion: new Map([
    ["sudeste", { base: 20, perKg: 4 }],
    ["sul", { base: 28, perKg: 5 }],
    ["centro-oeste", { base: 35, perKg: 6 }],
    ["nordeste", { base: 45, perKg: 7 }],
    ["norte", { base: 60, perKg: 9 }]
  ]),
  defaultFreightRate: { base: 50, perKg: 8 },
  pixDiscountRate: 0.03,
  creditCardInstallmentFeeRate: 0.025
};
