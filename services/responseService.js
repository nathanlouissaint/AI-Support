export default function generateResponse(intent, data = {}) {
  switch (intent) {
    case "order_tracking":
      if (data.status === "not_found") {
        return "No order found for this email.";
      }
      return `Your order is currently ${data.status}`;

    case "refund_status":
      return "Refunds take 5–7 business days.";

    case "faq_shipping":
      return "Shipping takes 3–5 business days.";

    default:
      return "I'm not sure. Let me connect you to support.";
  }
}