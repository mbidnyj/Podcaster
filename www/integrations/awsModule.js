const AWS = require("aws-sdk");

// Configure the AWS SDK to use DigitalOcean Spaces
const spacesEndpoint = new AWS.Endpoint("nyc3.digitaloceanspaces.com");
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.spaces_access_key,
    secretAccessKey: process.env.spaces_secret_access_key,
});

module.exports = s3;
