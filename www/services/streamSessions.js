const streamMap = new Map();

const E = module.exports;

// TODO add good cache and remove old streams

E.registerStream = function (sessionId, stream) {
    streamMap.set(sessionId, stream);
};

E.getStream = function (sessionId) {
    return streamMap.get(sessionId);
};
