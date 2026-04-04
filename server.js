import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
console.log("🔥 CORRECT SERVER FILE RUNNING");
const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());


// 🔥 Conversation Logging Layer
const conversations = [];

function logConversation({ message, email, intent, reply }) {
  const entry = {
    message,
    email: email || null,
    intent,
    reply,
    timestamp: new Date().toISOString()
  };

  conversations.push(entry);

  console.log("📊 Conversation Logged:", entry);
}


// 🔥 Shopify Config
const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const SHOPIFY_TOKEN = process.env.SHOPIFY_TOKEN;

// 🔥 FAQ data
const FAQs = [
  { q: "shipping", a: "Shipping takes 3–5 business days." },
  { q: "return", a: "Returns accepted within 14 days." }
];

// 🔥 Intent detection
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

    const orders = res.data.orders;

    if (!orders || orders.length === 0) return null;

    return orders.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )[0];

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
      const reply = "Message is required.";

      logConversation({ message, email, intent: "validation_error", reply });

      return res.status(400).json({ reply });
    }

    const lowerMessage = message.toLowerCase();

    // ✅ FAQ
    const match = FAQs.find(f => lowerMessage.includes(f.q));
    if (match) {
      const reply = match.a;

      logConversation({ message, email, intent: "faq", reply });

      return res.json({ reply });
    }

    // ✅ Intent
    const intent = detectIntent(message);
    console.log("DETECTED INTENT:", intent);

    switch (intent) {
      case "order_status":
        if (!email) {
          const reply = "Please provide your email to check your order.";

          logConversation({ message, email, intent, reply });

          return res.json({ reply });
        }

        const order = await getOrderByEmail(email);

        if (order) {
          const tracking =
            order.fulfillments?.[0]?.tracking_number || "Not available yet";

          const reply = `Here’s your order update:

• Status: ${order.fulfillment_status || "Processing"}
• Payment: ${order.financial_status}
• Tracking: ${tracking}`;

          logConversation({ message, email, intent, reply });

          return res.json({ reply });
        } else {
          const reply = "No order found for this email.";

          logConversation({ message, email, intent, reply });

          return res.json({ reply });
        }

      case "refund":
        const refundReply = "Refunds are processed within 5–7 business days.";

        logConversation({ message, email, intent, reply: refundReply });

        return res.json({ reply: refundReply });

      case "shipping":
        const shippingReply = "Shipping takes 3–5 business days.";

        logConversation({ message, email, intent, reply: shippingReply });

        return res.json({ reply: shippingReply });

      default:
        const fallbackReply =
          "I’m not sure. Let me connect you to a support agent.";

        logConversation({ message, email, intent, reply: fallbackReply });

        return res.json({ reply: fallbackReply });
    }

  } catch (err) {
    console.error("Route error:", err);

    const reply = "Server error";

    logConversation({
      message: req.body?.message,
      email: req.body?.email,
      intent: "error",
      reply
    });

    return res.status(500).json({ reply });
  }
});

// 🔥 Logs endpoint
app.get("/logs", (req, res) => {
  res.json({
    total: conversations.length,
    conversations
  });
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