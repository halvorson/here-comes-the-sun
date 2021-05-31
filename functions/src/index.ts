import * as functions from 'firebase-functions';
import axios from 'axios';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.itsalwayssunnysomewhere = functions.https.onRequest((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).write(`<!doctype html>
    <head>
      <title>It's Always Sunny Somewhere</title>
    </head>
    <body>
      Loading<br>`);
  axios.get('https://api.weather.gov/points/37.793792,-122.475396').then((axiosRes) => {
    res.write(`
            ${axiosRes.data.properties.forecastGridData}
          </body>
        </html>
          `);
    res.end();
  });
});
