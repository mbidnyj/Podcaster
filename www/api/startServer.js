const getApp = require("./expressApp");
const wsPodcastConn = require("./wsPodcastConn");
const http = require("http");
const WebSocket = require("ws");

function startServer() {
    const app = getApp();
    const PORT = process.env.PORT || 3000;

    const server = http.createServer(app);

    const wss = new WebSocket.Server({ server, path: "/api/websocket" });
    wss.on("connection", wsPodcastConn);

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`The version of Node.js is: ${process.version}`);
    });
}

module.exports = startServer;
