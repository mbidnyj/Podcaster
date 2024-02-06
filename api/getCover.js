const express = require('express');
const router = express.Router();
const getPodcastCover = require("../express/getPodcastCover");


// PRODUCTION IMPLEMENTATION
// router.get('/api/getCover', async (req, res) => {
//     console.log("getCover api fired with topic:", req.query.topic);
//     const imageUrl = await getPodcastCover(req.query.topic);
//     console.log("imageUrl received:", imageUrl);
//     res.send(imageUrl);
// });


// TESTING IMPLEMENTATION
router.get('/api/getCover', async (req, res) => {
    res.send(`${process.env.server_url}/images/image.png`);
    console.log("image was sent to the server");
});


module.exports = router;