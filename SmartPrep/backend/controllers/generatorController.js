const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Generate questions based on notes
// @route   POST /api/generator
// @access  Private
const generateQuestions = async (req, res) => {
  const { text, type } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Please provide notes/text to generate questions from.' });
  }

  const questionType = type || 'mcq';

  // Define prompt based on type
  let promptInstructions = '';
  if (questionType === 'mcq') {
    promptInstructions = 'Generate 5 multiple choice questions. Each object must have: "question", an array of 4 "options", "answer" (the correct option exactly as written), and "explanation".';
  } else if (questionType === 'short') {
    promptInstructions = 'Generate 5 short answer questions. Each object must have: "question", "answer" (a brief correct answer), and "explanation" (detailed context). Do not include "options".';
  } else if (questionType === 'interview') {
    promptInstructions = 'Generate 3 tough conceptual interview questions. Each object must have: "question", "answer" (an ideal response), and "explanation" (why the interviewer is asking this). Do not include "options".';
  } else {
    return res.status(400).json({ message: 'Invalid question type' });
  }

  const prompt = `
  You are an expert tutor. I will provide you with either a specific topic OR a block of study notes.
  Your job is to generate questions about that topic or based on those notes.
  
  Follow these instructions strictly:
  ${promptInstructions}
  
  RETURN YOUR OUTPUT AS PURE JSON ONLY. It must be a valid JSON array of objects. Do not include markdown formatting like \`\`\`json or \`\`\`.
  
  Topic or Notes:
  """
  ${text}
  """
  `;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    let outputText = result.response.text();
    
    // Clean up potential markdown formatting that gemini might add
    outputText = outputText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsedData = JSON.parse(outputText);
    
    res.json(parsedData);
  } catch (error) {
    console.error('Gemini Generate Error:', error);
    res.status(500).json({ message: 'Failed to generate questions. Check API key or input.', error: error.message });
  }
};

module.exports = {
  generateQuestions,
};
