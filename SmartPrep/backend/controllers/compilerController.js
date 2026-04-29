const axios = require('axios');

// @desc    Execute code via Judge0 API
// @route   POST /api/compiler/execute
// @access  Private
const executeCode = async (req, res) => {
    const { language, sourceCode, input } = req.body;
    
    if (!language || !sourceCode) {
        return res.status(400).json({ message: 'Language and source code are required' });
    }

    try {
        // Map language to valid Judge0 language IDs
        const versionMap = {
            'python': 71,
            'javascript': 63,
            'java': 62,
            'c': 50,
            'cpp': 54
        };

        const langId = versionMap[language.toLowerCase()];
        if (!langId) {
            return res.status(400).json({ message: 'Unsupported language' });
        }

        const response = await axios.post('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
            source_code: sourceCode,
            language_id: langId,
            stdin: input || ""
        });
        
        const data = response.data;
        let outputText = data.stdout || "";
        let errorText = data.stderr || data.compile_output || "";
        
        if (data.status && data.status.id !== 3 && !errorText && !outputText) {
             errorText = data.status.description || "Execution failed";
        }

        res.json({
            output: outputText,
            error: errorText,
            code: data.status ? data.status.id : 0
        });
    } catch (e) {
        console.error('Compiler error:', e.response?.data || e.message);
        res.status(500).json({ message: 'Code execution failed' });
    }
};

module.exports = { executeCode };
