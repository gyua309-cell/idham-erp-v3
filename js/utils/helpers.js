// ============================================================
// IDHAM ERP — Universal Helpers & Re-exports
// ============================================================
export * from "./formatters.js";

export async function showConfirm(message, title = "تأكيد") {
  if (typeof window !== "undefined" && typeof window.showConfirm === "function") {
    return await window.showConfirm(message, title);
  }
  return typeof window !== "undefined" ? window.confirm(message) : true;
}