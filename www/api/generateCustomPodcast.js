const fs = require("fs");
const path = require("path");
const podcastService = require("../services/podcastService");
const logManager = require("../utils/logManager");

// Object to store audio stream for session IDs that have already been served
let activeStreams = {};

module.exports = async (req, res) => {
    // extract "text" and sessionId
    const text = req.query.text;
    const sessionId = req.headers["x-playback-session-id"];
    console.log("text received:", text);

    res.set({
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked",
    });

    // separating metadata
    if (req.headers.range == "bytes=0-1" || req.headers["sec-fetch-dest"] === "document") {
        console.log("---Metadata serve funciton---");
        const filePath = path.join(__dirname, "..", "public", "sounds", "start.mp3");
        const stream = fs.createReadStream(filePath);
        stream.pipe(res, { end: false });
        return;
    } else {
        console.log("---Podcast serve function---");
    }

    if (activeStreams[sessionId]) {
        // If a stream already exists, pipe the existing stream to the response
        activeStreams[sessionId].pipe(res);
    } else {
        // If there's no stream, generate a new one and store it in the activeStreams cache
        try {
            const podcastStream = podcastService.createPodcastForText(text, () => {});
            // check if logAudio doesnt consume the stream
            // if it does - duplicate the stream for each consumer
            // 1 - for telegram
            // 2 - for application user
            logManager.logAudio(podcastStream, text);
            activeStreams[sessionId] = podcastStream;
            podcastStream.pipe(res);
        } catch (error) {
            console.error("Error starting podcast stream:", error);
            res.status(500).send("Failed to start podcast stream.");
        }
    }
};
