// const fs = require('fs');
// const http = require('http');
// const https = require('https');
const mongoose = require('mongoose');
const app = require('./src/app');

// const privateKey = fs.readFileSync('config/ssl.key');
// const certificate = fs.readFileSync('config/ssl.crt');

const { MONGO_URL } = process.env;

async function run() {
  console.log({
    MONGO_URL,
  });
  await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

  // const credentials = { key: privateKey, certificate };
  // const httpServer = http.createServer(app);
  // const httpsServer = https.createServer(credentials, app);

  // httpServer.listen(8080, () => console.log('HTTP Listening'));
  // httpsServer.listen(8443, () => console.log('HTTPS Listening'));
  app.listen(process.env.PORT || 80, () => console.log(`Listening on ${process.env.PORT}`));
}

run().then(() => console.log('Deployment Complete'));

