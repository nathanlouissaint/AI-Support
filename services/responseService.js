import client from "./openaiService.js";

export default async function generateResponse({
  intent,
  message,
  data = {},
  history = []
}) {
  // 🔴 FORMAT HISTORY FOR AI
  const historyText = history
    .map(h => `User: ${h.message}\nAssistant: ${h.response}`)
    .join("\n\n");

  const completion = await client.chat.completions.create({
    model: "openrouter/free",
    messages: [
      {
        role: "system",
        content: `
You are a Shopify customer support assistant.

CRITICAL RULES:
- You MUST use conversation history
- If the user already provided their email → DO NOT ask for it again
- If the user references prior info → acknowledge it and proceed
- Only ask for order number if absolutely necessary

Behavior:
- Assume you have access to previously provided information
- Move the conversation forward (do not restart it)
- Avoid repeating questions

Style:
- Keep responses short (1–2 sentences)
- Be confident, clear, and helpful
- Sound human, not robotic

Never repeat the same request twice.
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
    temperature: 0.4
  });

  // 🔴 CLEAN RESPONSE (remove accidental quotes)
  const raw = completion.choices?.[0]?.message?.content || "";

  return (
    raw.replace(/^"+|"+$/g, "").trim() ||
    "I'm not sure. Let me connect you to support."
  );
}