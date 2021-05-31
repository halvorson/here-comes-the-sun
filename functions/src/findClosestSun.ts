import axios from 'axios';
import {
  getRhumbLineBearing,
  getCenter,
  computeDestinationPoint,
} from 'geolib';
import { exponentialDelay } from 'axios-retry';
/* eslint-disable */
const axiosRetry = require('axios-retry');

const skyCoverThreshold = 35;
const testedArray: any[][] = [];

type GeolibCoordinates = {
  latitude: number;
  longitude: number;
};

type exponentialOutputType = {
  cloudyCoords?: GeolibCoordinates;
  sunnyCoords: GeolibCoordinates;
  dist?: number;
};

type findClosestSunType = {
  closestSun: GeolibCoordinates;
  testedArray: any[][];
};

axiosRetry(axios, { retryDelay: exponentialDelay });

const getSkyCoverByLatLong = (coords: GeolibCoordinates) => {
  return new Promise<number>(function (resolve, reject) {
    const url =
      'https://api.weather.gov/points/' +
      coords.latitude.toString() +
      ',' +
      coords.longitude.toString();

    // console.log(url);

    axios
      .get(url)
      .then((res) => {
        // console.log(res);
        // let gridId;
        let forecastUrl;
        try {
          // gridId = res.data.properties.gridId;
          forecastUrl = res.data.properties.forecastGridData;
          // console.log(forecastUrl);
        } catch {
          console.log('Error finding grid location');
          console.log(Error);
          reject(Error);
        }
        // console.log("gridX = ", gridX);

        axios
          .get(forecastUrl)
          .then((res) => {
            // console.log(res);
            // console.log(res.data.properties.skyCover.values[0].value);
            const skyCover = res.data.properties.skyCover.values[0].value;
            testedArray.push([coords, skyCover]);
            resolve(skyCover);
          })
          .catch((err) => {
            console.log('Error finding skyCover: ', err.message);
            reject(err);
          });
      })
      .catch((err) => {
        console.log('Error getting response from weather.gov: ', err.message);
        reject(err);
      });
  });
};

// Typescript!!

// This function should recursively find sun relatively nearby
// To minimize searches, it doubles the difference each time (a la Gmail timeout refresh)
// Variable naming follows a "next", "curr(ent)", "prev" pattern

const findSunExponential = (
  currCoords: GeolibCoordinates,
  currBearing: number,
  prevCoords?: GeolibCoordinates,
  prevDist?: number,
) => {
  return new Promise<exponentialOutputType>(function (resolve, reject) {
    getSkyCoverByLatLong(currCoords).then((skyCover) => {
      if (skyCover < skyCoverThreshold && prevCoords == null) {
        console.log(
          "It's sunny at your start location: " +
            currCoords.latitude.toString() +
            ', ' +
            currCoords.longitude.toString(),
        );
        resolve({
          cloudyCoords: prevCoords,
          sunnyCoords: currCoords,
          dist: prevDist,
        });
      } else if (skyCover < skyCoverThreshold && prevCoords != null) {
        console.log(
          'I found sun at ' +
            currCoords.latitude.toString() +
            ', ' +
            currCoords.longitude.toString(),
        );
        console.log(
          'Last search (cloudy) was ' +
            prevCoords.latitude.toString() +
            ', ' +
            prevCoords.longitude.toString(),
        );

        // Rename the variables on return to reflect what they mean
        resolve({
          cloudyCoords: prevCoords,
          sunnyCoords: currCoords,
          dist: prevDist,
        });
      } else {
        // This should use 2.5 as prevDist if previously undefined
        const currDist = (prevDist || 2.5) * 2;

        console.log(
          'Not sunny enough, trying ' +
            (currDist == 5 ? '' : 'another ') +
            currDist +
            ' miles away',
        );

        const nextCoords = computeDestinationPoint(
          currCoords,
          currDist * 1609,
          currBearing,
        );

        // In theory this isn't straight, and more advanced functions might return a new bearing.
        const nextBearing = currBearing;

        // console.log(nextLat, nextLong, nextBearing);

        resolve(
          findSunExponential(nextCoords, nextBearing, currCoords, currDist),
        );
      }
    });
  });
};

// This function recursively checks weather at midpoints between the last non-sunny spot and the last sunny spot
// until the two points are within 2 miles of each other, where it just returns the sunny spot. This overestimates
// distance til sun a little bit, but that's probably fine.

const narrowTheSearch = (
  cloudyCoords: GeolibCoordinates,
  sunnyCoords: GeolibCoordinates,
  distance: number,
) => {
  return new Promise<GeolibCoordinates>(function (resolve, reject) {
    // If distance is <2 miles, just return the sunny spot
    if (distance < 2) {
      console.log(
        'Coordinates are within 2 miles. Good enough for government work. Returning closestSunnyCoords...',
      );
      resolve(sunnyCoords);
      // If this "else" is removed, the "resolve" doesn't kick it out of the recursive loop.
      // Honestly, I don't know why
    } else {
      // Honestly, I could probably take the average here, but this is slightly more accurate.
      const midCoords = getCenter([
        cloudyCoords,
        sunnyCoords,
      ]) as GeolibCoordinates;

      const midDist = distance / 2.0;

      getSkyCoverByLatLong(midCoords).then((skyCover) => {
        console.log('SkyCover at midpoint is ' + skyCover);
        if (skyCover < skyCoverThreshold) {
          console.log(
            'Midpoint is sunny, narrowing search to between known clouds and midpoint',
          );
          resolve(narrowTheSearch(cloudyCoords, midCoords, midDist));
        } else {
          console.log(
            'Midpoint is cloudy, narrowing search to between midpoint and known sun',
          );
          resolve(narrowTheSearch(midCoords, sunnyCoords, midDist));
        }
      });
    }
  });
};

const findClosestSun = (startCoords: GeolibCoordinates, bearing: number) => {
  return new Promise<findClosestSunType>(function (resolve, reject) {
    findSunExponential(startCoords, bearing).then((exponentialOutput) => {
      if (exponentialOutput.cloudyCoords == null) {
        resolve({
          closestSun: exponentialOutput.sunnyCoords,
          testedArray: testedArray,
        });
      } else {
        narrowTheSearch(
          exponentialOutput.cloudyCoords || {},
          exponentialOutput.sunnyCoords,
          exponentialOutput.dist || 0,
        ).then((closestSunnyCoords) => {
          console.log(closestSunnyCoords);

          // console.log('Here are all the tested points (lat, long, skyCover)');
          // console.log(testedArray.join('\r\n'));
          resolve({ closestSun: closestSunnyCoords, testedArray: testedArray });
        });
      }
    });
  });
};

// tslint:disable:no-unused-variable
const main = () => {
  // console.log("Main running");

  // Starting location

  const startCoords = {
    latitude: 37.793792,
    longitude: -122.475396,
  };

  // Direction to aim towards. Should calculate along a great circle
  const destCoords = {
    latitude: 38.436336,
    longitude: -122.71522,
  };

  const bearing = getRhumbLineBearing(startCoords, destCoords);
  // console.log(bearing);

  findClosestSun(startCoords, bearing);
};

// main();

export default findClosestSun;
