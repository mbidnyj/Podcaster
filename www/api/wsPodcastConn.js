const podcastService = require("../services/podcastService");
const streamSessions = require("../services/streamSessions");
const logManager = require("../utils/logManager");
const crypto = require("crypto");

function hash(string) {
    return crypto.createHash("md5").update(string).digest("hex");
}

const sendJson = (ws, command, payload) => {
    ws.send(JSON.stringify({ command, payload }));
};

module.exports = (ws) => {
    console.log("Client connected");
    sendJson(ws, "status_update", { status: "connected" });
    ws.on("message", (message) => {
        console.log(`Received message: ${message}`);
        const commandMatch = message
            .toString()
            .trim()
            .match(/^(\w+):(.*)$/);
        if (!commandMatch) {
            console.log("wrong message", message.toString());
            return;
        }
        const [, command, body] = commandMatch;
        if (command === "prompt") {
            const prompt = body;
            const sessionId = hash(prompt); // same prompt text gets the same sessionId
            console.log("prompt received:", sessionId, prompt);
            const podcastStream = podcastService.createPodcastForText(prompt, (status, infoUpdate) => {
                if (status) {
                    sendJson(ws, "status_update", { status });
                }
                if (infoUpdate) {
                    sendJson(ws, "update_info", infoUpdate);
                }
                if (status === podcastService.STATUS.READY) {
                    const podcastUrl = `${process.env.server_url}/api/streamReadyPodcast?id=${sessionId}`;
                    sendJson(ws, "podcast_ready", { url: podcastUrl });
                }
            });
            streamSessions.registerStream(sessionId, podcastStream);
            logManager.logAudio(podcastStream, prompt);
        }
    });
    ws.on("close", () => {
        console.log("Client disconnected");
    });
};
