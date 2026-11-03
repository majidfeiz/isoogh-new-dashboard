export const customInvoiceTotals = (items, discount) => {
  const subtotal = (items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitAmount) || 0), 0);
  return { subtotal, total: Math.max(0, subtotal - (Number(discount) || 0)) };
};

