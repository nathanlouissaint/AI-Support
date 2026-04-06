export default function detectIntent(message) {
  const msg = message.toLowerCase();

  // Order tracking
  if (
    msg.includes("order") ||
    msg.includes("where is") ||
    msg.includes("track") ||
    msg.includes("package") ||
    msg.includes("delivery") ||
    msg.includes("shipped")
  ) {
    return "order_tracking";
  }

  // Refund / returns
  if (
    msg.includes("refund") ||
    msg.includes("return") ||
    msg.includes("money back")
  ) {
    return "refund_status";
  }

  // Shipping
  if (
    msg.includes("shipping") ||
    msg.includes("how long")
  ) {
    return "faq_shipping";
  }

  // Default fallback
  return "fallback";
}