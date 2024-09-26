const PodcastService = require("../services/podcastService");

module.exports = function modifyPrompt(req, res) {
    if (req.method === "GET") {
        try {
            const promptInstruction = PodcastService.getPromptInstruction();
            res.status(200).json(promptInstruction);
        } catch (error) {
            res.status(500).json({ error: "Failed to retrieve prompt instruction" });
        }
    } else if (req.method === "POST") {
        try {
            const { promptInstruction } = req.body;
            PodcastService.setPromptInstruction(promptInstruction);
            res.status(200).json({ message: "Prompt instruction updated successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to update prompt instruction" });
        }
    } else {
        res.status(405).send("Method Not Allowed");
    }
};
