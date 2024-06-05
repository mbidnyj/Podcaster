const { textCompletion, MODELS } = require("../utils/llm");

module.exports = async (req, res) => {
    const model = MODELS.claude_3;
    const instruction = "You are a helpful assistant.";
    const prompt = "What are some key points I should know about the Python programming language?";

    const completion = await textCompletion(model, instruction, prompt);

    res.send(completion);
};
