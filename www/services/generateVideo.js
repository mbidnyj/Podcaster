const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const { convertToObjects } = require("./podcastService");
const textToSpeech = require("../utils/textToSpeech");
const uploadPodcastToSpaces = require("../utils/uploadPodcastToSpaces");
const logManager = require("../utils/logManager");

async function generateVideo(podcastText) {
    try {
        const podcastId = uuidv4();
        const podcastObject = convertToObjects(podcastText);
        const videosUrl = [];
        let pieceCounter = 1;
        for (const attribution of podcastObject) {
            const attributionStream = await textToSpeech(attribution.text, attribution.role);
            const audioUrl = await uploadPodcastToSpaces(attributionStream, `${podcastId}_${pieceCounter}`);
            const photoUrl = `${process.env.cdn_url}/${attribution.role.toLowerCase()}.jpg`;
            const faceBox = await faceDetection(photoUrl);
            const projectID = await createTask(photoUrl, audioUrl, faceBox);
            const videoUrl = await waitForVideoUrl(projectID);
            videosUrl.push(videoUrl);
            await logManager.logMessage(`Generated Piece #${pieceCounter}: ${videoUrl}`);
            pieceCounter++;
        }
        await logManager.logMessage(`Generated Videos:\n${videosUrl.join("\n")}`);
    } catch (error) {
        console.error(error);
        await logManager.logMessage(`Error in generateAIVideoForTopic: ${error}`);
    }
}

module.exports = generateVideo;

async function waitForVideoUrl(projectID) {
    while (true) {
        const result = await checkTaskProgress(projectID);
        if (result) {
            return result;
        }
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }
}

async function faceDetection(photoUrl) {
    const url = "https://moyin-gateway.dupdub.com/tts/v1/photoProject/detectAvatar";
    const headers = {
        dupdub_token: process.env.dupdub_api_key,
        "Content-Type": "application/json",
    };
    const body = {
        photoUrl: photoUrl,
    };

    try {
        const response = await axios.post(url, body, { headers: headers });
        // console.log("faceDetection API Response:", response.data);
        console.log("faceDetection Detected Faces:", response.data.data.boxes[0]);
        return response.data.data.boxes[0];
    } catch (error) {
        console.error("faceDetection Failed:", error);
        throw new Error(error);
    }
}

async function createTask(photoUrl, audioUrl, faceBox) {
    const url = "https://moyin-gateway.dupdub.com/tts/v1/photoProject/createMulti";
    const headers = {
        dupdub_token: process.env.dupdub_api_key,
        "Content-Type": "application/json",
    };
    const body = {
        photoUrl: photoUrl,
        watermark: 0,
        info: [
            {
                audioUrl: audioUrl,
                box: faceBox,
            },
        ],
        useSr: false,
    };

    try {
        const response = await axios.post(url, body, { headers: headers });
        // console.log("createTask API Response:", response.data);
        console.log("createTask Project Identifier:", response.data.data.id);
        return response.data.data.id;
    } catch (error) {
        console.error("createTask Failed:", error);
        throw new Error(error);
    }
}

async function checkTaskProgress(projectID) {
    const url = `https://moyin-gateway.dupdub.com/tts/v1/photoProject/${projectID}`;
    const headers = {
        dupdub_token: process.env.dupdub_api_key,
        "Content-Type": "application/json",
    };

    try {
        const response = await axios.get(url, { headers: headers });
        // console.log("checkTaskProgress API Response:", response.data);
        console.log("checkTaskProgress Video URL:", response.data.data.videoUrl);
        return response.data.data.videoUrl;
    } catch (error) {
        console.error("checkTaskProgress Failed:", error);
        throw new Error(error);
    }
}
