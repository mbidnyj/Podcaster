const express = require('express');
const router = express.Router();
const fs = require("fs");
const path = require('path');
var Throttle = require('throttle');
const { PassThrough } = require('stream');

const getPodcastEpisode = require("../express/getPodcastEpisode");

let usersRunFinished = {};
let podcastTopicsListening = {};
let usersTopic = {};
let podcastsLive = {};


const launchPodcast = (userId, podcastId, topic) => {    
    const stream = PassThrough();

    (async ()=>{
        for (let episodeNumber=0; podcastTopicsListening[podcastId][topic]; episodeNumber++){
            console.log("Loop iteration: # ", episodeNumber);

            console.time("getPodcastEpisode time");
            usersRunFinished[podcastId] = false;

            // pass topic parameter only for the first episode
            let podcastEpisodeStream;
            if (episodeNumber==0){
                podcastEpisodeStream = await getPodcastEpisode(userId, podcastId, topic);
            } else {
                podcastEpisodeStream = await getPodcastEpisode(userId, podcastId);
            }
            usersRunFinished[podcastId] = true;
            console.timeEnd("getPodcastEpisode time");

            // send response without throttling
            if (episodeNumber==0){
                await new Promise((resolve, reject) => {
                    podcastEpisodeStream.pipe(stream, { end: false });

                    podcastEpisodeStream.on('readable', () => {
                        // console.log('podcastEpisodeStream is readable.');
                        let data;
                        while (null !== (data = podcastEpisodeStream.read())) {
                            // console.log(`Read ${data.length} bytes of data.`);
                        }
                    });
                    
                    podcastEpisodeStream.on('data', (chunk) => {
                        console.log(`Chunk size: ${chunk.length} bytes`);
                    });

                    podcastEpisodeStream.on('end', () => {
                        console.log('"throttleStream" ended, restarting...');
                        resolve();
                    });

                    podcastEpisodeStream.on('error', (error) => {
                        console.log('Error in podcastEpisodeStream:', error);
                    });
                });
            } else {
                const bitrateKbps = 220;
                const throttleRate = (bitrateKbps * 1024) / 8;
                const throttleStream = new Throttle(throttleRate);
                await new Promise((resolve, reject) => {
                    podcastEpisodeStream.pipe(throttleStream).pipe(stream, { end: false });

                    podcastEpisodeStream.on('readable', () => {
                        // console.log('podcastEpisodeStream is readable.');
                        let data;
                        while (null !== (data = podcastEpisodeStream.read())) {
                            // console.log(`Read ${data.length} bytes of data.`);
                        }
                    });

                    throttleStream.on('data', (chunk) => {
                        console.log(`Chunk size: ${chunk.length} bytes`);
                    });

                    throttleStream.on('end', () => {
                        console.log('"throttleStream" ended, restarting...');
                        resolve();
                    });

                    throttleStream.on('error', (error) => {
                        console.log('Error in throttleStream:', error);
                        reject(error);
                    });
                });
            }
            console.log(episodeNumber, "finished, next cycle iteration...");
        }
    })();
    return stream;
};


// "userId", "topic" parameters
router.get('/api/getAudioStream', async (req, res) => {
    const userId = req.query.userId;
    const podcastId = req.query.podcastId;
    const topic = req.query.topic;
    console.log(`getAudioStream api fired with parameters: userId: ${userId}, podcastId: ${podcastId}, topic: ${topic}`);

    res.set({
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked'
    });

    // return if new podcast was started with empty topic
    if (!podcastsLive[podcastId] && !topic){
        console.log("skipping the function");
        return;
    }

    if (req.headers.range=='bytes=0-1' || req.headers['sec-fetch-dest']==='document'){
        console.log("---Metadata serve funciton---");
        const filePath = path.join(__dirname, '/episodes/start.mp3');
        const stream = fs.createReadStream(filePath);
        stream.pipe(res, {end: false});
        return;
    } else {
        console.log("---Podcast serve function---");
    }

    if (usersTopic[podcastId] && topic){
        if (usersTopic[podcastId] != topic){
            const userPreviousTopic = usersTopic[podcastId];
            podcastTopicsListening[podcastId][userPreviousTopic] = false;
            podcastTopicsListening[podcastId][topic] = true;
            usersTopic[podcastId] = topic;
            podcastsLive[podcastId].stream.removeAllListeners();
            // If the stream is a Readable stream from a file, close it
            if (typeof podcastsLive[podcastId].stream.close === 'function') {
                podcastsLive[podcastId].stream.close();
                console.log("stream.close()");
            }
            // If the stream is writable, end it
            if (typeof podcastsLive[podcastId].stream.end === 'function') {
                podcastsLive[podcastId].stream.end();
                console.log("stream.end()");
            }
            // If the stream is a PassThrough or Transform, destroy it
            if (typeof podcastsLive[podcastId].stream.destroy === 'function') {
                podcastsLive[podcastId].stream.destroy();
                console.log("stream.destroy()");
            }

            delete podcastsLive[podcastId];
            console.log("DELETED PREVIOUS STREAM");
        }
    } else{
        podcastTopicsListening[podcastId] = {};
        podcastTopicsListening[podcastId][topic] = true;
        usersTopic[podcastId] = topic;
        usersRunFinished[podcastId] = true;
    }

    if (!podcastsLive[podcastId] && topic){
        await waitForRunToFinish(podcastId);
        const stream = launchPodcast(userId, podcastId, topic);
        podcastsLive[podcastId] = {
            stream: stream
        };
        console.log("usersRunFinished");
    }

    const stream = podcastsLive[podcastId].stream;
    stream.pipe(res, {end: false});

    res.on('close', ()=>{
        console.log(`podcast ${podcastId} offline`);
    });
})

async function waitForRunToFinish(podcastId) {
    while (!usersRunFinished[podcastId]) {
        await wait(500);
    }
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


module.exports = router;