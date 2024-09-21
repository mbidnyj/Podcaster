const { OpenAIStream } = require("ai");
const { AnthropicStream } = require("ai");
const openai = require("../integrations/openaiModule");
const anthropic = require("../integrations/anthropicModule");
const perplexity = require("../integrations/perplexityModule");
const MODELS = {
    gpt_4: "gpt-4-turbo-2024-04-09",
    gpt_4o: "gpt-4o",
    gpt_3_5: "gpt-3.5-turbo",
    claude_3: "claude-3-5-sonnet-20240620",
    perplexity_large: "llama-3.1-sonar-large-128k-online",
    perplexity_small: "llama-3.1-sonar-small-128k-online",
};

async function jsonCompletion(instruction, prompt, useLargerModel) {
    let completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: instruction },
            { role: "user", content: prompt },
        ],
        model: useLargerModel ? MODELS.gpt_4 : MODELS.gpt_3_5,
        response_format: { type: "json_object" },
    });
    console.log("json completion instruction:", instruction);
    console.log("json completion prompt:", prompt);
    console.log("json completion result:", completion.choices[0].message.content);
    return JSON.parse(completion.choices[0].message.content);
}

// UNIVERSAL IMPLEMENTATION FOR ALL AI MODELS
async function textCompletion(model, instruction, prompt) {
    console.log("textCompletion", model, instruction, prompt);
    const stream = await streamCompletion(model, instruction, prompt);

    const decoder = new TextDecoder();

    let result = "";
    for await (const chunk of stream) {
        const decodedChunk = decoder.decode(chunk);
        result += decodedChunk;
        // console.log(decodedChunk);
    }

    // console.log(result);
    return result;
}

// UNIVERSAL IMPLEMENTATION FOR ALL AI MODELS
async function streamCompletion(model, instruction, prompt) {
    let response;
    let stream;

    if (model === MODELS.gpt_4 || model === MODELS.gpt_4o || model === MODELS.gpt_3_5) {
        response = await openai.chat.completions.create({
            model: model,
            stream: true,
            messages: [
                {
                    role: "system",
                    content: instruction,
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });
        stream = OpenAIStream(response);
    } else if (model === MODELS.claude_3) {
        response = await anthropic.messages.stream({
            messages: [{ role: "user", content: prompt }],
            model: model,
            max_tokens: 4096,
            system: instruction,
        });
        stream = AnthropicStream(response);
    } else if (model === MODELS.perplexity_large || model === MODELS.perplexity_small) {
        response = await perplexity.chat.completions.create({
            model: model,
            stream: true,
            messages: [
                {
                    role: "system",
                    content: instruction,
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });
        stream = OpenAIStream(response);
    }

    return stream;
}

exports.jsonCompletion = jsonCompletion;
exports.textCompletion = textCompletion;
exports.streamCompletion = streamCompletion;
exports.MODELS = MODELS;
