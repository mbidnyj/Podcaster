const mongoose = require("mongoose");

const TopicSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        emoji: { type: String, required: true },
        category: { type: String, required: true },
        podcastCdnUrl: { type: String, required: false },
        podcast: { type: String, required: false },
        tag: { type: String, default: "other" },
    },
    { timestamps: true }
);

// Adding an index for the created timestamp
TopicSchema.index({ createdAt: 1 });

// Adding a compound index for category and createdAt to make the query efficient
TopicSchema.index({ category: 1, createdAt: -1 });

// Compound index for category and podcastCdnUrl to optimize queries filtering by category and checking for the existence of podcastCdnUrl
TopicSchema.index({ category: 1, podcastCdnUrl: 1 });

module.exports = mongoose.model("Topic", TopicSchema);
