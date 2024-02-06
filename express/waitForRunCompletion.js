const openai = require("../clients/openaiClient");

async function waitForRunCompletion(threadId, runId) {
    return new Promise((resolve, reject) => {
      // Check the status every 0.5 seconds
      console.log("Checking run status: in_progress");
      const intervalId = setInterval(async () => {
        try {
          const retrieve_run = await openai.beta.threads.runs.retrieve(threadId, runId);
          // console.log('Checking run status:', retrieve_run.status);
          
          // Check if the status is 'succeeded' or 'failed'
          if (retrieve_run.status === 'completed' || retrieve_run.status === 'failed') {
            clearInterval(intervalId);
            resolve(retrieve_run);
          }
        } catch (error) {
          console.error('Error retrieving run:', error);
          clearInterval(intervalId);
          reject(error);
        }
      }, 500);
    });
  }
  
module.exports = waitForRunCompletion;