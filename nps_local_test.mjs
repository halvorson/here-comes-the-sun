import axios from "axios";
import LatLon from "geodesy/latlon-spherical.js";
import axiosRetry from "axios-retry";

axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay });

const skyCoverThreshold = 35;
const testedArray = [];

const getSkyCoverByLatLong = (lat, long) => {
  return new Promise(function (resolve, reject) {
    const url = "https://api.weather.gov/points/" + lat + "," + long;

    //console.log(url);

    axios
      .get(url)
      .then(res => {
        //console.log(res);
        let gridX, gridY, gridId, forecastUrl;
        try {
          gridX = res.data.properties.gridX;
          gridY = res.data.properties.gridY;
          gridId = res.data.properties.gridId;
          forecastUrl = res.data.properties.forecastGridData;
          //console.log(forecastUrl);
        } catch {
          console.log("Error finding grid location");
          console.log(error);
          reject(error);
        }
        //console.log("gridX = ", gridX);

        axios
          .get(forecastUrl)
          .then(res => {
            //console.log(res);
            //console.log(res.data.properties.skyCover.values[0].value);
            const skyCover = res.data.properties.skyCover.values[0].value;
            testedArray.push([lat, long, skyCover]);
            resolve(skyCover);
          })
          .catch(err => {
            console.log("Error finding skyCover: ", err.message);
            reject(err);
          });
      })
      .catch(err => {
        console.log("Error getting response from weather.gov: ", err.message);
        reject(err);
      });
  });
};

//This function should recursively find sun relatively nearby
//To minimize searches, it doubles the difference each time (a la Gmail timeout refresh)
//Variable naming follows a "next", "curr(ent)", "prev" pattern

const findSunExponential = (
  currLat,
  currLong,
  currBearing,
  prevLat,
  prevLong,
  prevDist
) => {
  return new Promise(function (resolve, reject) {
    getSkyCoverByLatLong(currLat, currLong).then(skyCover => {
      if (skyCover < skyCoverThreshold) {
        console.log("I found sun at " + currLat + ", " + currLong);
        console.log("Last search (cloudy) was " + prevLat + ", " + prevLong);

        //Rename the variables on return to reflect what they mean
        resolve({
          cloudyLat: prevLat,
          cloudyLong: prevLong,
          sunnyLat: currLat,
          sunnyLong: currLong,
          dist: prevDist,
        });
      } else {
        //This should use 2.5 as prevDist if previously undefined
        const currDist = (prevDist || 2.5) * 2;

        console.log(
          "Not sunny enough, trying " +
            (currDist == 5 ? "" : "another ") +
            currDist +
            " miles away"
        );

        const currP = new LatLon(parseFloat(currLat), parseFloat(currLong));

        const nextP = currP.destinationPoint(currDist * 1609, currBearing);

        const nextLat = nextP._lat,
          nextLong = nextP._lon,
          nextBearing = currBearing;

        //console.log(nextLat, nextLong, nextBearing);

        resolve(
          findSunExponential(
            nextLat,
            nextLong,
            nextBearing,
            currLat,
            currLong,
            currDist
          )
        );
      }
    });
  });
};

// This function recursively checks weather at midpoints between the last non-sunny spot and the last sunny spot
// until the two points are within 2 miles of each other, where it just returns the sunny spot. This overestimates
// distance til sun a little bit, but that's probably fine.

const narrowTheSearch = (
  cloudyLat,
  cloudyLong,
  sunnyLat,
  sunnyLong,
  distance
) => {
  return new Promise(function (resolve, reject) {
    // If distance is <2 miles, just return the sunny spot
    if (distance < 2) {
      console.log(
        "Coordinates are within 2 miles. Good enough for government work. Returning closestSunnyCoords..."
      );
      resolve({
        sunnyLat: sunnyLat,
        sunnyLong: sunnyLong,
      });
      // If this "else" is removed, the "resolve" doesn't kick it out of the recursive loop.
      // Honestly, I don't know why
    } else {
      const cloudyP = new LatLon(parseFloat(cloudyLat), parseFloat(cloudyLong));
      const sunnyP = new LatLon(parseFloat(sunnyLat), parseFloat(sunnyLong));

      // Honestly, I could probably take the average here, but this is slightly more accurate.
      // The library used is stupid though, since it has functions that are available in the spherical projection
      // (latlon-spherical) that aren't available in the vincenty projection (latlon-ellipsoidal-vincenty) AND vice
      // versa. By switching to spherical, I lost the LatLon.direct (replaced with LatLon.destinationPoint), so I
      // lost my "final_bearing" param output.
      const midP = cloudyP.midpointTo(sunnyP);

      const midLat = midP._lat.toString();
      const midLong = midP._lon.toString();
      const midDist = distance / 2.0;

      /*
      // This bit existed for debugging. Turns out I swapped the variables in the other function's return...
      console.log("Latitutes:")
      console.log(cloudyLat, midLat, sunnyLat);

      console.log("Longitudes:")
      console.log(cloudyLong, midLong, sunnyLong);
      */

      getSkyCoverByLatLong(midLat, midLong).then(skyCover => {
        console.log("SkyCover at midpoint is " + skyCover);
        if (skyCover < skyCoverThreshold) {
          console.log(
            "Midpoint is sunny, narrowing search to between known clouds and midpoint"
          );
          resolve(
            narrowTheSearch(cloudyLat, cloudyLong, midLat, midLong, midDist)
          );
        } else {
          console.log(
            "Midpoint is cloudy, narrowing search to between midpoint and known sun"
          );
          resolve(
            narrowTheSearch(midLat, midLong, sunnyLat, sunnyLong, midDist)
          );
        }
      });
    }
  });
};

const findClosestSun = (startLat, startLong, bearing) => {
  findSunExponential(startLat, startLong, bearing).then(exponentialOutput => {
    narrowTheSearch(
      exponentialOutput.cloudyLat,
      exponentialOutput.cloudyLong,
      exponentialOutput.sunnyLat,
      exponentialOutput.sunnyLong,
      exponentialOutput.dist
    ).then(closestSunnyCoords => {
      console.log(closestSunnyCoords);

      console.log("Here are all the tested points (lat, long, skyCover)");
      console.log(testedArray.join("\r\n"));
    });
  });
};

const main = () => {
  //console.log("Main running");

  //Starting location

  const startLat = "37.793792";
  const startLong = "-122.475396";
  const startP = new LatLon(parseFloat(startLat), parseFloat(startLong));

  //Direction to aim towards. Should calculate along a great circle
  const destLat = "38.436336";
  const destLong = "-122.715220";
  const destP = new LatLon(parseFloat(destLat), parseFloat(destLong));

  const bearing = startP.initialBearingTo(destP);
  //console.log(startP.distanceTo(destP)/1609);
  //console.log(bearing);

  findClosestSun(startLat, startLong, bearing);
};

main();
