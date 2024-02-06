const express = require('express');
const router = express.Router();
const Person = require("../schemas/podcast");

// "userId" parameter
router.get('/api/getTotalWords', async (req, res) => {
    const userId = req.query.userId;
    // For 1 minute of audio, you might expect approximately 150 words
    // For 1 hour of audio, you might expect approximately 150 words * 60 minutes = 9,000 words
    
    const podcast = await Person.findOne({userId});
    res.json( {totalWords: podcast.totalWords} );
});

module.exports = router;