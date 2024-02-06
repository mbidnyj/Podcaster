const getApp = require('../clients/expressClient');

function startServer() {
  const app = getApp();
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`The version of Node.js is: ${process.version}`);
  });
}

module.exports = startServer;