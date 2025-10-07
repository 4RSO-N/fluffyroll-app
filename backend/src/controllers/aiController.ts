import { Request, Response } from 'express';
import db from '../config/database';

// Create new conversation
export const createConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { conversationType } = req.body;

    const result = await db.query(
      `INSERT INTO ai_conversations (user_id, conversation_type)
      VALUES ($1, $2)
      RETURNING *`,
      [userId, conversationType || 'check_in']
    );

    res.status(201).json({ conversation: result.rows[0] });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
};

// Get conversation with messages
export const getConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { conversationId } = req.params;

    // Verify conversation belongs to user
    const convResult = await db.query(
      'SELECT * FROM ai_conversations WHERE conversation_id = $1 AND user_id = $2',
      [conversationId, userId]
    );

    if (convResult.rows.length === 0) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    // Get messages
    const messagesResult = await db.query(
      `SELECT * FROM ai_messages 
      WHERE conversation_id = $1 
      ORDER BY sent_at ASC`,
      [conversationId]
    );

    res.json({
      conversation: convResult.rows[0],
      messages: messagesResult.rows
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
};

// Send message and get AI response
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { conversationId } = req.params;
    const { messageText, messageType, metadata } = req.body;

    // Verify conversation
    const convCheck = await db.query(
      'SELECT conversation_id FROM ai_conversations WHERE conversation_id = $1 AND user_id = $2',
      [conversationId, userId]
    );

    if (convCheck.rows.length === 0) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    // Insert user message
    const userMessageResult = await db.query(
      `INSERT INTO ai_messages (conversation_id, sender, message_text, message_type, metadata)
      VALUES ($1, 'user', $2, $3, $4)
      RETURNING *`,
      [conversationId, messageText, messageType || 'text', metadata || {}]
    );

    // Generate AI response (simplified - in production, call actual AI service)
    const aiResponse = generateAIResponse(messageText);

    // Insert AI message
    const aiMessageResult = await db.query(
      `INSERT INTO ai_messages (conversation_id, sender, message_text, message_type)
      VALUES ($1, 'ai', $2, 'text')
      RETURNING *`,
      [conversationId, aiResponse]
    );

    // Update conversation last_message_at
    await db.query(
      'UPDATE ai_conversations SET last_message_at = CURRENT_TIMESTAMP WHERE conversation_id = $1',
      [conversationId]
    );

    res.json({
      userMessage: userMessageResult.rows[0],
      aiResponse: aiMessageResult.rows[0]
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Start daily check-in
export const startCheckIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    // Create new conversation
    const convResult = await db.query(
      `INSERT INTO ai_conversations (user_id, conversation_type)
      VALUES ($1, 'check_in')
      RETURNING *`,
      [userId]
    );

    const conversationId = convResult.rows[0].conversation_id;

    // Get user's name
    const userResult = await db.query(
      'SELECT display_name FROM users WHERE user_id = $1',
      [userId]
    );

    const userName = userResult.rows[0]?.display_name || 'there';

    // Send initial greeting
    const greeting = `Hey ${userName}! Ready for your daily check-in? 👋`;
    
    const messageResult = await db.query(
      `INSERT INTO ai_messages (conversation_id, sender, message_text, message_type)
      VALUES ($1, 'ai', $2, 'text')
      RETURNING *`,
      [conversationId, greeting]
    );

    res.json({
      conversation: convResult.rows[0],
      initialMessage: messageResult.rows[0]
    });
  } catch (error) {
    console.error('Start check-in error:', error);
    res.status(500).json({ error: 'Failed to start check-in' });
  }
};

// Simple AI response generator (placeholder - replace with actual AI in production)
function generateAIResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
    return "Great job on staying active! 💪 Did you track your workout? I can help you log it if you'd like.";
  } else if (lowerMessage.includes('meal') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
    return "Nutrition is so important! 🍎 Would you like to log what you ate?";
  } else if (lowerMessage.includes('water')) {
    return "Staying hydrated is key! 💧 How many glasses of water have you had today?";
  } else if (lowerMessage.includes('tired') || lowerMessage.includes('sleep')) {
    return "Rest is just as important as activity. 😴 Make sure you're getting enough sleep. How are you feeling overall?";
  } else if (lowerMessage.includes('stress') || lowerMessage.includes('anxious')) {
    return "I hear you. Taking a moment to breathe can help. 🧘 Have you tried journaling about how you're feeling?";
  } else if (lowerMessage.includes('yes') || lowerMessage.includes('yeah') || lowerMessage.includes('sure')) {
    return "Awesome! Let's keep building those healthy habits together. What would you like to focus on today?";
  } else if (lowerMessage.includes('no') || lowerMessage.includes('not really')) {
    return "That's okay! Every day is different. What can I help you with today?";
  } else {
    return "I'm here to support your wellness journey! Tell me more about your day. 🌟";
  }
}
