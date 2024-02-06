const mongoose = require('mongoose');
const trackEvent = require("../clients/mixpanelClient");
const getScript = require("../express/getScript");

const Podcast_schema = new mongoose.Schema({
    userId: {type: String, unique: true},
    podcastId: String,
    threadId: String,
    adultAssistantId: String,
    teenagerAssistantId: String,
    currentAssistant: String,
    totalWords: { type: Number, default: 0 },
    script: { type: Array, default: [] },
    isScriptCreated: { type: Boolean, default: false }
}, {timestamps: true});

Podcast_schema.index({userId: 1});

Podcast_schema.methods.trackEvent = function(event, extraProperties = {}){
    trackEvent(event, {
        distinct_id: this.userId,
        podcastId: this.podcastId,
        ...extraProperties,
    });
};

Podcast_schema.methods.createScript = function(topic) {
    return new Promise((resolve, reject) => {
        getScript(topic)
            .then(script => {
                this.script = script;
                console.log("inside of podcast.js: ", script);
                this.isScriptCreated = true;
                resolve(script); // Resolve the promise with the script
            })
            .catch(error => {
                this.isScriptCreated = false;
                console.error('Error in script creation:', error);
                reject(error); // Reject the promise with the error
            });
    });
};


module.exports = mongoose.model('Podcast', Podcast_schema, 'UserPodcast');