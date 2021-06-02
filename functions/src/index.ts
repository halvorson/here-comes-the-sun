import * as functions from 'firebase-functions';
import axios from 'axios';
import findClosestSun from './findClosestSun';
import * as cors from 'cors';

const corsHandler = cors({ origin: true });

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
  corsHandler(req, res, () => {
    res.set('Content-Type', 'application/json');
    res.status(200);
    const reqQuery = req.query;

    // assigning defaults here
    let startingLat = 37.793792;
    let startingLong = -122.475396;
    let bearing = 343.7087120027676;

    if (!reqQuery) {
      console.log('No inputs, going with defaults');
    } else {
      const latQuery = reqQuery.latitude || reqQuery.lat;
      if (typeof latQuery !== 'string') {
        // Array? Object? Null?
        console.log(
          'Weirdly formatted lat (typeof == ' +
            typeof latQuery +
            '), sticking with default',
        );
      } else if (typeof latQuery === 'string') {
        startingLat = parseFloat(latQuery);
      }

      const longQuery = reqQuery.longitude || reqQuery.long;
      if (typeof longQuery !== 'string') {
        // Array? Object? Null?
        console.log(
          'Weirdly formatted long (typeof == ' +
            typeof longQuery +
            '), sticking with default',
        );
      } else if (typeof longQuery === 'string') {
        startingLong = parseFloat(longQuery);
      }

      const bearingQuery = reqQuery.bearing;
      if (typeof bearingQuery !== 'string') {
        // Array? Object? Null?
        console.log(
          'Weirdly formatted bearing (typeof == ' +
            typeof bearingQuery +
            '), sticking with default',
        );
      } else if (typeof bearingQuery === 'string') {
        bearing = parseFloat(bearingQuery);
      }
    }
    findClosestSun(
      { latitude: startingLat, longitude: startingLong },
      bearing,
    ).then((closestSunObj) => {
      res.json(closestSunObj);
    });
  });
});
