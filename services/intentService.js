import client from "./openaiService.js";

export default async function detectIntent(message) {
  const completion = await client.chat.completions.create({
    model: "openrouter/free",
    messages: [
      {
        role: "system",
        content: `
Classify this Shopify support message.

Return ONLY one:
order_tracking
refund_status
faq_shipping
fallback
        `.trim()
      },
      {
        role: "user",
        content: message
      }
    ],
    temperature: 0
  });

  const text = completion.choices?.[0]?.message?.content?.trim();

  const allowed = [
    "order_tracking",
    "refund_status",
    "faq_shipping",
    "fallback"
  ];

  return allowed.includes(text) ? text : "fallback";
}