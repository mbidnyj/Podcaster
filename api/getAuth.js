const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// response: user identifier
router.get('/api/getAuth', (req, res) => {
    console.log("getAuth api fired")
    const userIdentifier = uuidv4();
    res.send(userIdentifier);
});

module.exports = router;
