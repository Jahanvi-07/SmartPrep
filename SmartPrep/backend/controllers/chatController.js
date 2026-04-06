const Conversation = require('../models/Conversation');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const sendMessage = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    
    // Find or create conversation
    let conv = conversationId 
      ? await Conversation.findById(conversationId)
      : new Conversation({ userId: req.user._id });

    // Ensure user is authorized for this conversation
    if (conv.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized access to conversation' });
    }

    conv.messages.push({ role: 'user', content: message });
    
    // Build context window
    const historyText = conv.messages.slice(-10).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
    const prompt = `You are an expert AI tutor helping a student.\n\nContext:\n${historyText}\n\nAssistant:`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const aiResponseRaw = await model.generateContent(prompt);
    const aiResponse = aiResponseRaw.response.text();
    
    conv.messages.push({ role: 'model', content: aiResponse });
    conv.updatedAt = Date.now();
    await conv.save();

    res.json({ success: true, conversationId: conv._id, response: aiResponse });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat failed' });
  }
};

const getHistory = async (req, res) => {
    try {
        const conv = await Conversation.findOne({ userId: req.user._id }).sort({ updatedAt: -1 });
        res.json(conv || { messages: [] });
    } catch (e) {
        res.status(500).json({ error: 'Could not fetch history' });
    }
};

module.exports = { sendMessage, getHistory };
