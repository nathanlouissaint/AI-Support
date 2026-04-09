import detectIntent from "../services/intentService.js";
import generateResponse from "../services/responseService.js";
import { getOrderStatus } from "../services/orderService.js";
import {
  saveConversation,
  getRecentConversations
} from "../services/conversationService.js";

export async function handleChat(req, res) {
  const startTime = Date.now();

  try {
    console.log("🚀 Chat request received");

    const { message, email } = req.body;

    // ======================
    // VALIDATION
    // ======================
    if (!message || typeof message !== "string") {
      console.warn("❌ Invalid message input");
      return res.status(400).json({
        success: false,
        data: null,
        error: "Valid message is required"
      });
    }

    const cleanMessage = message.trim();
    const lowerMessage = cleanMessage.toLowerCase();

    console.log("📩 Message:", cleanMessage);
    console.log("👤 Email:", email || "anonymous");

    // ======================
    // INTENT DETECTION
    // ======================
    let intent = "fallback";

    try {
      console.log("🧠 Running intent detection...");
      intent = await detectIntent(cleanMessage);

      if (!intent || typeof intent !== "string") {
        console.warn("⚠️ Invalid intent returned, forcing fallback");
        intent = "fallback";
      }
    } catch (error) {
      console.error("❌ Intent detection failed:", error.message);
    }

    console.log("🎯 Intent:", intent);

    // ======================
    // BUSINESS LOGIC (ORDER)
    // ======================
    let data = {};

    if (intent === "order_tracking") {
      try {
        console.log("📦 Fetching order data...");
        data = await getOrderStatus(email);

        if (!data) {
          console.warn("⚠️ No order data found");
          data = {};
        }
      } catch (error) {
        console.error("❌ Order fetch failed:", error.message);
      }
    }

    // ======================
    // FETCH MEMORY
    // ======================
    let history = [];

    try {
      console.log("📚 Fetching conversation history...");
      history = await getRecentConversations(email);

      if (!Array.isArray(history)) {
        console.warn("⚠️ History is not an array, resetting");
        history = [];
      }
    } catch (error) {
      console.error("❌ Failed to fetch history:", error.message);
    }

    // ======================
    // AI RESPONSE
    // ======================
    let responseText = null;

    try {
      console.log("🤖 Generating AI response...");
      responseText = await generateResponse({
        intent,
        message: cleanMessage,
        data,
        history
      });

      if (!responseText || typeof responseText !== "string") {
        console.warn("⚠️ Invalid AI response, using fallback");
        responseText = null;
      }

    } catch (error) {
      console.error("❌ Response generation failed:", error.message);
    }

    // HARD FALLBACK (ONLY if AI truly failed)
    if (!responseText) {
      responseText =
        "I'm having trouble processing that right now. Let me connect you to support.";
      intent = "fallback";
    }

    // ======================
    // SAVE CONVERSATION
    // ======================
    let conversationId = null;

    try {
      console.log("💾 Saving conversation...");
      const conversation = await saveConversation({
        email,
        message: cleanMessage,
        response: responseText,
        intent,
        data
      });

      conversationId = conversation?.id || null;
    } catch (error) {
      console.error("❌ Conversation save failed:", error.message);
    }

    // ======================
    // HUMAN ESCALATION LOGIC
    // ======================
    const requiresHuman =
      intent === "fallback" ||
      lowerMessage.includes("refund") ||
      lowerMessage.includes("angry") ||
      lowerMessage.includes("this is ridiculous") ||
      lowerMessage.includes("human") ||
      lowerMessage.includes("agent");

    // ======================
    // RESPONSE
    // ======================
    const duration = Date.now() - startTime;

    console.log(`✅ Response sent in ${duration}ms`);

    return res.json({
      success: true,
      data: {
        intent,
        response: responseText,
        requires_human: requiresHuman,
        conversationId
      },
      error: null
    });

  } catch (err) {
    console.error("🔥 CONTROLLER CRASH:", err);

    return res.status(500).json({
      success: false,
      data: null,
      error: "Internal server error"
    });
  }
}