import detectIntent from "../services/intentService.js";
import generateResponse from "../services/responseService.js";
import { getOrderStatus } from "../services/orderService.js";
import { saveConversation } from "../services/conversationService.js";

export function handleChat(req, res) {
  try {
    console.log("✅ Controller hit");

    const { message, email } = req.body;
    console.log("📩 Message:", message);

    // Validation
    if (!message) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Message is required"
      });
    }

    // Intent detection
    console.log("➡️ Running intent detection...");
    const intent = detectIntent(message);
    console.log("🎯 Intent:", intent);

    let data = {};

    // Order tracking logic
    if (intent === "order_tracking") {
      console.log("📦 Fetching order...");
      data = getOrderStatus(email);
      console.log("📦 Order data:", data);
    }

    // Response generation
    console.log("💬 Generating response...");
    const responseText = generateResponse(intent, data);

    // 🔴 Conversation logging (CORE ADDITION)
    const conversation = saveConversation({
      email,
      message,
      response: responseText,
      intent,
      data
    });

    console.log("🧠 Conversation saved:", conversation.id);

    console.log("✅ Sending response");

    // Standardized response
    res.json({
      success: true,
      data: {
        intent,
        response: responseText,
        requires_human: intent === "fallback",
        conversationId: conversation.id
      },
      error: null
    });

  } catch (err) {
    console.error("🔥 CONTROLLER ERROR:", err);

    res.status(500).json({
      success: false,
      data: null,
      error: "Internal server error"
    });
  }
}