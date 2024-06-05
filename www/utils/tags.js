const E = module.exports;

// "other" should be first!
const tags = ["other", "exciting", "tragedy", "controversial", "humorous", "shocking", "heartwarming"];

E.getTagsList = () => tags;

E.getTagsString = () =>
    tags
        .slice(1)
        .map((t) => `"${t}"`)
        .join(", ");
