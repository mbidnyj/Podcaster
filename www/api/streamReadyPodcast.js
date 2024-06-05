const fs = require("fs");
const path = require("path");
const streamSessions = require("../services/streamSessions");

module.exports = (req, res) => {
    const sessionId = req.query.id;
    const podcastStream = streamSessions.getStream(sessionId);
    if (!podcastStream) {
        res.status(404).send("Podcast not found");
        return;
    }
    res.writeHead(200, {
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "public, max-age=3600",
    });
    podcastStream.pipe(res);
};
