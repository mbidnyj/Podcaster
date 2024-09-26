const express = require("express");
const cors = require("cors");
const compression = require("compression");
const getCategorizedTopics = require("./getCategorizedTopics");
const sendPodcastsToTelegram = require("./sendPodcastsToTelegram");
const generateCustomPodcast = require("./generateCustomPodcast");
const githubWebhook = require("./githubWebhook");
const streamReadyPodcast = require("./streamReadyPodcast");
const modifyPrompt = require("./modifyPrompt");

function getApp() {
    const app = express();

    app.use(cors());
    app.use(compression()); // Enable gzip compression

    app.get("/", (req, res) => {
        res.send("Hello World!");
    });

    app.use(express.json());
    app.use(express.static("public"));

    app.get("/api/getCategorizedTopics", getCategorizedTopics);
    app.get("/api/sendPodcastsToTelegram", sendPodcastsToTelegram);
    app.get("/api/generateCustomPodcast", generateCustomPodcast);
    app.get("/api/streamReadyPodcast", streamReadyPodcast);
    app.post("/github-webhook", githubWebhook);
    app.route("/modifyPrompt").get(modifyPrompt).post(modifyPrompt);
    return app;
}

module.exports = getApp;
