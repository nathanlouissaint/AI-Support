import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// 🔥 Shopify Config (DO NOT hardcode in production)
const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const SHOPIFY_TOKEN = process.env.SHOPIFY_TOKEN;

// 🔥 FAQ data
const FAQs = [
  { q: "shipping", a: "Shipping takes 3–5 business days." },
  { q: "return", a: "Returns accepted within 14 days." }
];

// 🔥 Improved Intent detection (UPDATED)
function detectIntent(message) {
  const msg = message.toLowerCase();

  const orderKeywords = ["order", "package", "delivery", "track", "tracking"];
  const refundKeywords = ["refund", "return", "money back"];
  const shippingKeywords = ["shipping", "ship", "delivery time"];

  if (orderKeywords.some(word => msg.includes(word))) {
    return "order_status";
  }

  if (refundKeywords.some(word => msg.includes(word))) {
    return "refund";
  }

  if (shippingKeywords.some(word => msg.includes(word))) {
    return "shipping";
  }

  return "unknown";
}

// 🔥 Shopify order lookup
async function getOrderByEmail(email) {
  try {
    console.log("Fetching order for:", email);

    const res = await axios.get(
      `https://${SHOPIFY_STORE}/admin/api/2023-10/orders.json?email=${email}`,
      {
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_TOKEN,
          "Content-Type": "application/json"
        }
      }
    );

    return res.data.orders?.[0] || null;
  } catch (error) {
    console.error("Shopify error:", error.response?.data || error.message);
    return null;
  }
}

// 🔥 Main route
app.post("/chat", async (req, res) => {
  console.log("HIT /chat");
  console.log("BODY:", req.body);

  try {
    const { message, email } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Message is required." });
    }

    const lowerMessage = message.toLowerCase();

    // ✅ Step 1: FAQ
    const match = FAQs.find(f => lowerMessage.includes(f.q));
    if (match) {
      console.log("FAQ matched");
      return res.json({ reply: match.a });
    }

    // ✅ Step 2: Intent system
    const intent = detectIntent(message);
    console.log("DETECTED INTENT:", intent); // 🔥 Debugging

    switch (intent) {
      case "order_status":
        console.log("Order flow triggered");

        if (!email) {
          return res.json({
            reply: "Please provide your email to check your order."
          });
        }

        const order = await getOrderByEmail(email);

        if (order) {
          const tracking =
            order.fulfillments?.[0]?.tracking_number || "Not available yet";

          return res.json({
            reply: `Here’s your order update:

• Status: ${order.fulfillment_status || "Processing"}
• Payment: ${order.financial_status}
• Tracking: ${tracking}

If you need anything else, I can help.`
          });
        } else {
          return res.json({
            reply: "No order found for this email."
          });
        }

      case "refund":
        return res.json({
          reply: "Refunds are processed within 5–7 business days."
        });

      case "shipping":
        return res.json({
          reply: "Shipping takes 3–5 business days."
        });

      default:
        console.log("Fallback triggered");

        return res.json({
          reply:
            "I’m not sure. Let me connect you to a support agent."
        });
    }

  } catch (err) {
    console.error("Route error:", err);
    return res.status(500).json({ reply: "Server error" });
  }
});

// 🔥 Health check
app.get("/", (req, res) => {
  res.json({ status: "server alive" });
});

// ✅ PORT
const PORT = 8000;

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});