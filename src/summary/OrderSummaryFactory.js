class OrderSummaryFactory {
  create(order, pricing) {
    return {
      id: order.id,
      customerName: order.getCustomerName(),
      customerEmail: order.getCustomerEmail(),
      city: order.getShippingCity(),
      state: order.getShippingState(),
      items: order.items.map((item) => ({
        productId: item.getProductId(),
        name: item.getProductName(),
        quantity: item.quantity,
        subtotal: item.getSubtotal()
      })),
      subtotal: pricing.subtotal,
      discount: Number(pricing.discount.toFixed(2)),
      freight: Number(pricing.freight.toFixed(2)),
      paymentFee: Number(pricing.paymentFee.toFixed(2)),
      total: pricing.total,
      paymentMethod: order.paymentMethod,
      status: order.status,
      createdAt: order.createdAt
    };
  }
}

module.exports = OrderSummaryFactory;
