const logManager = require("../utils/logManager");

module.exports = (req, res) => {
    const event = req.headers["x-github-event"]; // Identifies the type of event from GitHub
    let actionVerb;
    const pullRequest = req.body.pull_request;
    console.log("web hook", event, req.body);

    if (event === "pull_request") {
        const action = req.body.action;
        // Handle pull request opened, closed, or reopened actions
        if (["opened", "closed", "reopened"].includes(action)) {
            actionVerb = action; // Corrected to use the action variable
            if (action === "closed" && pullRequest.merged) {
                actionVerb = "merged"; // Distinguish between closed and merged
            }
        }
    } else if (event === "pull_request_review") {
        // Handle pull request review submitted, edited, or dismissed actions
        actionVerb = req.body.review.state.toLowerCase(); // Corrected to use req.body.review.state
    }
    if (actionVerb) {
        let emoji = {
            opened: "🚀",
            closed: "🔒",
            reopened: "🔓",
            merged: "🎉",
            approved: "👍",
            changes_requested: "👎",
            commented: "💬",
        }[actionVerb];
        const prLink = pullRequest.html_url;
        const notification = `${emoji} ${actionVerb} pull request #${pullRequest.number}
${pullRequest.title}
${prLink}
cc @g7tyfj27pcpk @mbidnyj`;
        logManager.logMessage(notification);
        console.log(notification);
    }

    res.status(200).send("Event received"); // Acknowledges receipt of the event
};
