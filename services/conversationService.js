import { query } from "../config/db.js";

// 🔴 SAVE CONVERSATION (DB)
export const saveConversation = async ({
  email,
  message,
  response,
  intent,
  data
}) => {
  const result = await query(
    `
    INSERT INTO conversations (email, message, response, intent, data)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
    `,
    [
      email || null,
      message,
      response,
      intent,
      JSON.stringify(data || {})
    ]
  );

  const record = {
    id: result.rows[0].id,
    email,
    message,
    response,
    intent,
    data,
    createdAt: new Date()
  };

  console.log("🧠 Saved Conversation:", record);

  return record;
};

// 🔴 GET RECENT CONVERSATIONS (FOR MEMORY)
export const getRecentConversations = async (email) => {
  if (!email) return [];

  const result = await query(
    `
    SELECT message, response
    FROM conversations
    WHERE email = $1
    ORDER BY created_at DESC
    LIMIT 3
    `,
    [email]
  );

  return result.rows;
};

// 🔴 OPTIONAL: GET ALL (DEBUG ONLY)
export const getConversations = async () => {
  const result = await query(
    `SELECT * FROM conversations ORDER BY created_at DESC`
  );

  return result.rows;
};