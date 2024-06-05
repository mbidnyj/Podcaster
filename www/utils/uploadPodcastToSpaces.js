const s3 = require("../integrations/awsModule");

async function uploadPodcastToSpaces(audioStream, topicId) {
    const bucketName = "podcaster";
    const remoteFileName = `${topicId}.mp3`;

    // Setting up S3 upload parameters
    const params = {
        Bucket: bucketName,
        Key: remoteFileName,
        Body: audioStream,
        ACL: "public-read",
        ContentType: "audio/mpeg",
    };

    // Uploading files to the bucket
    try {
        const data = await s3.upload(params).promise();
        console.log(`File uploaded successfully at ${data.Location}`);
        return data.Location;
    } catch (error) {
        console.error("Error uploading file:", error);
    }
}

module.exports = uploadPodcastToSpaces;
