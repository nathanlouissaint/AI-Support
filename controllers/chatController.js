import detectIntent from "../services/intentService.js";
import generateResponse from "../services/responseService.js";
import { getOrderStatus } from "../services/orderService.js";
import { 
  saveConversation, 
  getRecentConversations 
} from "../services/conversationService.js";

export async function handleChat(req, res) {
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

    const lowerMessage = message.toLowerCase();

    // 🔴 INTENT DETECTION
    console.log("➡️ Running intent detection...");
    let intent = "fallback";

    try {
      intent = await detectIntent(message);
    } catch (error) {
      console.error("❌ Intent detection failed:", error.message);
    }

    console.log("🎯 Intent:", intent);

    let data = {};

    // Order tracking logic
    if (intent === "order_tracking") {
      try {
        console.log("📦 Fetching order...");
        data = getOrderStatus(email);
        console.log("📦 Order data:", data);
      } catch (error) {
        console.error("❌ Order fetch failed:", error.message);
      }
    }

    // 🔴 FETCH MEMORY (CRITICAL)
    let history = [];

    try {
      history = await getRecentConversations(email);
      console.log("📚 History:", history);
    } catch (error) {
      console.error("❌ Failed to fetch history:", error.message);
    }

    // 🔴 AI RESPONSE WITH MEMORY
    console.log("💬 Generating response...");
    let responseText = "I'm not sure. Let me connect you to support.";

    try {
      responseText = await generateResponse({
        intent,
        message,
        data,
        history
      });
    } catch (error) {
      console.error("❌ Response generation failed:", error.message);
    }

    // 🔴 SAVE CONVERSATION (await required for DB)
    let conversationId = null;

    try {
      const conversation = await saveConversation({
        email,
        message,
        response: responseText,
        intent,
        data
      });

      conversationId = conversation?.id;
      console.log("🧠 Conversation saved:", conversationId);
    } catch (error) {
      console.error("❌ Conversation save failed:", error.message);
    }

    console.log("✅ Sending response");

    res.json({
      success: true,
      data: {
        intent,
        response: responseText,
        requires_human:
          intent === "fallback" ||
          lowerMessage.includes("refund now") ||
          lowerMessage.includes("this is ridiculous") ||
          lowerMessage.includes("angry"),
        conversationId
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