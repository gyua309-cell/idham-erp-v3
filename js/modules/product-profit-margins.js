// ══════════════════════════════════════════════════════════════════
// PRODUCT GROSS PROFIT MARGINS & CONTRIBUTION MATRIX
// ══════════════════════════════════════════════════════════════════

import { render as renderAnalytics } from "./reports/product-analytics.js";

export async function render(container, user) {
  return renderAnalytics(container, user);
}
