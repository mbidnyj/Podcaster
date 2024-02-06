const OpenAI = require("openai");
const openai = new OpenAI({ apiKey : process.env.open_ai_token});

async function getScript(topic) {
	console.time("getScript time");
	const completion = await openai.chat.completions.create({
		messages: [
		{
			role: "system",
			content: "You are a helpful assistant designed to output JSON.",
		},
		{ 
            role: "user", 
            content: `'topics' property array of 10 records with structure {subtopic, content} with key topics to cover in the podcast: ${topic}` 
        },
		],
		model: "gpt-3.5-turbo-1106",
		response_format: { type: "json_object" },
	});
	console.timeEnd("getScript time");

	// Parse the string into a JSON object
    const jsonObject = JSON.parse(completion.choices[0].message.content);

    // Get the key name dynamically
    const keyName = Object.keys(jsonObject)[0];

    // Access the array using the key name
    const items = jsonObject[keyName];

	return items;
	return [
		{
		  subtopic: 'Improved Focus',
		  content: 'How meditation can help software engineers improve their ability to concentrate and stay focused on complex tasks.'
		},
		{
		  subtopic: 'Stress Reduction',
		  content: 'Exploring the ways in which meditation can help software engineers manage the high-stress nature of their work and promote mental well-being.'
		},
		{
		  subtopic: 'Enhanced Problem-Solving',
		  content: "Discussing the potential of meditation to enhance software engineers' problem-solving skills and creativity."
		},
		{
		  subtopic: 'Work-Life Balance',
		  content: 'Explaining how meditation can assist software engineers in achieving a better balance between work and personal life, leading to improved overall well-being.'
		},
		{
		  subtopic: 'Increased Productivity',
		  content: 'Examining how meditation practices can contribute to increased productivity and efficiency in software engineering tasks.'
		},
		{
		  subtopic: 'Emotional Resilience',
		  content: 'Highlighting the role of meditation in developing emotional resilience and the ability to deal with challenges in the software engineering profession.'
		},
		{
		  subtopic: 'Mindfulness in Coding',
		  content: 'Exploring how practicing mindfulness through meditation can impact coding practices and lead to better code quality and attentiveness to detail.'
		},
		{
		  subtopic: 'Collaboration and Communication',
		  content: 'How meditation can improve communication and collaboration skills, enhancing teamwork and problem-solving within software development teams.'
		},
		{
		  subtopic: 'Managing Burnout',
		  content: 'Discussing the potential benefits of meditation in preventing and managing burnout among software engineers.'
		},
		{
		  subtopic: 'Cognitive Function',
		  content: 'Examining the impact of meditation on cognitive function and its potential to enhance problem-solving and decision-making abilities in software engineering.'
		}
	]
}

module.exports = getScript;