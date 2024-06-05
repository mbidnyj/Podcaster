const categories = require("../utils/categories");
const Topic = require("../schemas/topic");

module.exports = async (req, res) => {
    const categorizedTopics = {};
    const queries = Object.keys(categories).map(async (category) => {
        let categoryTitle = categories[category].title;
        categorizedTopics[category] = { title: categoryTitle, topics: [] };
        const topics = await Topic.find({ category, podcastCdnUrl: { $exists: true } })
            .sort({ _id: -1 })
            .limit(10);
        categorizedTopics[category].topics = topics
            .map(({ _id, title, emoji, podcastCdnUrl }) => ({
                _id,
                title,
                emoji,
                category,
                podcastCdnUrl,
            }))
            .reverse();
    });

    await Promise.all(queries);
    res.json(categorizedTopics);
};
