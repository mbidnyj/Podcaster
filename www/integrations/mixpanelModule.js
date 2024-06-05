const Mixpanel = require("mixpanel");
const mixpanel_project_token = process.env.mixpanel_project_token;
const mixpanel = mixpanel_project_token ? Mixpanel.init(mixpanel_project_token) : null;

function trackEvent(event, properties) {
    if (mixpanel) {
        mixpanel.track(event, properties);
    }
}

module.exports = trackEvent;
