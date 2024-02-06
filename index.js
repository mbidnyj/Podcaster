require('dotenv').config({ path: './config/config.env' });
const mongodb = require("./clients/mongodbClient");
const startServer = require("./api/startServer");

const main = async ()=>{
    console.time('mongodb connected');
    await mongodb.init();
    console.timeEnd('mongodb connected');
    startServer();
}

main();