require('dotenv').config({ path: '../config/config.env' });
const axios = require('axios');


async function getPodcastCover (topic){
	try {
        const openAIKey = process.env.open_ai_token;

        // API endpoint
        const endpoint = 'https://api.openai.com/v1/images/generations';

        // Request headers
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAIKey}`
        };

        // Request data
        const promptTopic = "Create a cover for the podcast with topic: " + topic;
        const data = {
            model: "dall-e-3",
            prompt: promptTopic,
            n: 1,
            size: "1024x1024"
        };

        // Making the POST request
        const response = await axios.post(endpoint, data, { headers: headers });

        // The response from the API
		//console.log(response.data.data[0].url);
        return response.data.data[0].url;
    } catch (error) {
        console.error('Error in generating image:', error);
        return null;
    }
}

module.exports = getPodcastCover;