require("dotenv").config({ path: "./config/config.env" });
const mongodb = require("./integrations/mongodbModule");
const startServer = require("./api/startServer");
const cronTasks = require("./workflows/cronTasks");
const bot = require("./services/telegrafService");
const logManager = require("./utils/logManager");

const main = async () => {
    console.time("mongodb connected");
    await mongodb.init();
    console.timeEnd("mongodb connected");
    startServer();
    cronTasks();
    bot.launch();
};

process.on("uncaughtException", async (error) => {
    console.error("Uncaught Exception:", error);
    if (process.env.NODE_ENV == "production") {
        await logManager.logMessage(`Uncaught Exception: ${error}`);
    }
    process.exit(1);
});

process.on("unhandledRejection", async (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    if (process.env.NODE_ENV == "production") {
        await logManager.logMessage(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    }
    process.exit(1);
});

main();
