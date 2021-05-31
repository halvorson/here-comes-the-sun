import * as functions from 'firebase-functions';
import axios from 'axios';
import findClosestSun from './findClosestSun';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.testAPICall = functions.https.onRequest((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).write(`<!doctype html>
    <head>
      <title>It's Always Sunny Somewhere</title>
    </head>
    <body>
      Loading<br>`);
  axios
    .get('https://api.weather.gov/points/37.793792,-122.475396')
    .then((axiosRes) => {
      res.write(`
            ${axiosRes.data.properties.forecastGridData}
          </body>
        </html>
          `);
      res.end();
    });
});

exports.urlparsing = functions.https.onRequest((req, res) => {
  const reqQuery = req.query;
  res.setHeader('Content-Type', 'text/html');
  res.status(200).write(`<!doctype html>
      <head>
        <title>It's Always Sunny Somewhere</title>
      </head>
      <body>
        ${JSON.stringify(reqQuery)}
        <br>
      </body>
    </html>
    `);
  res.end();
});

/*
exports.sunny = functions.https.onRequest((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).write(`<!doctype html>
      <head>
        <title>It's Always Sunny Somewhere</title>
      </head>
      <body>
        Loading<br>`);
  findClosestSun(
    { latitude: 37.793792, longitude: -122.475396 },
    343.7087120027676,
  ).then((closestSunObj) => {
    res.write(`
        ${JSON.stringify(closestSunObj)}
      </body>
    </html>
      `);
    res.end();
  });
});
*/

exports.sunny = functions.https.onRequest((req, res) => {
  res.set('Content-Type', 'json').status(200);
  findClosestSun(
    { latitude: 37.793792, longitude: -122.475396 },
    343.7087120027676,
  ).then((closestSunObj) => {
    res.send(closestSunObj);
  });
});
