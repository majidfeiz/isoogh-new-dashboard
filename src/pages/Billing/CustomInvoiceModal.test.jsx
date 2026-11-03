import { customInvoiceTotals } from "./billingAdvancedUtils.js";

test("custom invoice requires line math with quantity, unit amount and discount", () => {
  expect(customInvoiceTotals([{ quantity: 2, unitAmount: 500000 }, { quantity: 1, unitAmount: 250000 }], 100000)).toEqual({ subtotal: 1250000, total: 1150000 });
  expect(customInvoiceTotals([], 0)).toEqual({ subtotal: 0, total: 0 });
});

