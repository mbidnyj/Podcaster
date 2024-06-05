const mongoose = require("mongoose");

let inited;

exports.init = async () => {
    if (inited) return;
    inited = true;
    const DB_URI = process.env.mongodb_connection_url;
    if (!DB_URI) throw "Missing process.env.mongodb_connection_url";
    await mongoose.connect(DB_URI, {
        connectTimeoutMS: 30000, // Connection timeout (30 seconds)
    });
};
