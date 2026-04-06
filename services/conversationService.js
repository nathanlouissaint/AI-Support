const conversations = [];

export const saveConversation = ({ email, message, response }) => {
  const record = {
    id: Date.now(),
    email: email || null,
    message,
    response,
    createdAt: new Date()
  };

  conversations.push(record);

  console.log("Saved Conversation:", record); // visibility

  return record;
};

export const getConversations = () => {
  return conversations;
};