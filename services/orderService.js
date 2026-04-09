// 🔴 MOCK DATABASE (replace with real DB later)
const orders = [
  {
    email: "test@example.com",
    orderId: "12345",
    status: "shipped",
    eta: "2 days",
    trackingUrl: "https://tracking.example.com/12345"
  },
  {
    email: "john@example.com",
    orderId: "67890",
    status: "processing",
    eta: "3-5 days",
    trackingUrl: null
  }
];

// 🔴 MAIN FUNCTION
export function getOrderStatus(email) {
  try {
    if (!email) {
      return {
        found: false,
        error: "No email provided"
      };
    }

    // Find latest order for email
    const order = orders.find(o => o.email === email);

    if (!order) {
      return {
        found: false,
        status: "not_found"
      };
    }

    return {
      found: true,
      orderId: order.orderId,
      status: order.status,
      eta: order.eta,
      trackingUrl: order.trackingUrl
    };

  } catch (error) {
    console.error("❌ Order service error:", error.message);

    return {
      found: false,
      error: "Order lookup failed"
    };
  }
}