import client from "./openaiService.js";

// 🔴 CLEAN RESPONSE FUNCTION (critical)
function cleanResponse(text) {
  if (!text) return "";

  return text
    .replace(/\\u0020/g, " ") // fix unicode spaces
    .replace(/\s+/g, " ") // normalize spacing
    .replace(/^"+|"+$/g, "") // remove wrapping quotes
    .trim();
}

export default async function generateResponse({
  intent,
  message,
  data = {},
  history = []
}) {
  try {
    // 🔴 1. HARD LOGIC (NO AI) — PRIMARY CONTROL LAYER

    if (intent === "order_tracking") {
      if (!data?.found) {
        return "I couldn’t find an order with that email. Can you double check it?";
      }

      return cleanResponse(
        `Your order ${data.orderId} is currently ${data.status}. Expected delivery: ${data.eta}.${data.trackingUrl ? ` Track it here: ${data.trackingUrl}` : ""}`
      );
    }

    if (intent === "refund_request") {
      return "I can help with that. Could you share your order number so I can process the refund?";
    }

    if (intent === "greeting") {
      return "Hey! How can I help you today?";
    }

    // 🔴 2. FORMAT HISTORY FOR AI
    const historyText = history
      .map(h => `User: ${h.message}\nAssistant: ${h.response}`)
      .join("\n\n");

    // 🔴 3. AI FALLBACK (CONTROLLED)
    const completion = await client.chat.completions.create({
      model: "openrouter/free",
      messages: [
        {
          role: "system",
          content: `
You are a Shopify customer support assistant.

CRITICAL RULES:
- You MUST use conversation history
- If the user already provided their email → DO NOT ask again
- If the user references prior info → acknowledge it
- Only ask for order number if absolutely necessary

Behavior:
- Move the conversation forward
- Do NOT restart context
- Do NOT repeat questions

Style:
- Max 2 sentences
- Clear, confident, human

DO NOT hallucinate order data.
          `.trim()
        },
        {
          role: "user",
          content: `
Conversation history:
${historyText || "No previous messages"}

Current message:
${message}

Intent: ${intent}
Data: ${JSON.stringify(data)}
          `.trim()
        }
      ],
      temperature: 0.3
    });

    const raw = completion.choices?.[0]?.message?.content || "";
    const cleaned = cleanResponse(raw);

    // 🔴 4. FINAL SAFETY FALLBACK
    if (!cleaned) {
      return "I'm not sure. Let me connect you to support.";
    }

    return cleaned;

  } catch (error) {
    console.error("❌ Response service error:", error.message);

    return "Something went wrong. Let me connect you to support.";
  }
}