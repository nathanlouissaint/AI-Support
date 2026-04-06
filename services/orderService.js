export function getOrderStatus(email) {
  if (email === "test@example.com") {
    return { status: "shipped and arriving in 2 days" };
  }

  return { status: "not_found" };
}