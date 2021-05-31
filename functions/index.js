const functions = require("firebase-functions");
const axios = require("axios");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.bigben = functions.https.onRequest((req, res) => {
  const hours = (new Date().getHours() % 12) + 1;
  // London is UTC + 1hr;
  res.status(200).send(`<!doctype html>
    <head>
      <title>Time</title>
    </head>
    <body>
      ${"BONG ".repeat(hours)}
    </body>
  </html>`);
});

exports.itsalwayssunnysomewhere = functions.https.onRequest((req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.status(200).write(`<!doctype html>
  <head>
    <title>It's Always Sunny Somewhere</title>
  </head>
  <body>
    Loading<br>`)
  axios
    .get("https://api.weather.gov/points/37.793792,-122.475396")
    .then(axiosRes => {
      res.write(`
          ${axiosRes.data.properties.forecastGridData}
        </body>
      </html>
        `);
      res.end();
    });
});
