const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Generate a DSA coding problem
// @route   GET /api/practice/coding
const generateCodingProblem = async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Generate a Data Structures and Algorithms (DSA) coding problem for interview practice.
    Return ONLY a valid JSON object strictly matching this schema:
    {
      "title": "String",
      "difficulty": "Easy/Medium/Hard",
      "problemStatement": "String",
      "inputOutput": "String",
      "constraints": "String",
      "solution": "String (Python or JS format)",
      "explanation": "String"
    }`;

    const result = await model.generateContent(prompt);
    let outputText = result.response.text();
    outputText = outputText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(outputText);
    
    res.json(parsedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate problem.' });
  }
};

// @desc    Analyze interview voice transcript
// @route   POST /api/practice/interview/analyze
const analyzeInterview = async (req, res) => {
  const { question, transcript } = req.body;

  if (!transcript) {
    return res.status(400).json({ message: 'No transcript provided.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are an expert HR interviewer. Evaluate this candidate's verbal response based on their Speech-to-Text transcript.
    
    Question asked: "${question}"
    Candidate's transcript: "${transcript}"
    
    Evaluate and return ONLY a valid JSON object matching this schema exactly:
    {
      "clarity": "Number (1-10)",
      "grammar": "Number (1-10)",
      "confidence": "Number (1-10)",
      "score": "Number (overall 1-100)",
      "feedback": "String (Constructive feedback on what they did well and how to improve)"
    }`;

    const result = await model.generateContent(prompt);
    let outputText = result.response.text();
    outputText = outputText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(outputText);
    
    res.json(parsedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to analyze transcript.' });
  }
};

module.exports = {
  generateCodingProblem,
  analyzeInterview,
};
