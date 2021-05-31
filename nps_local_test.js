const axios = require("axios");
import LatLon from 'geodesy/latlon-ellipsoidal-vincenty.js';

const getWeatherByLatLong = (lat, long) => {
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
            resolve(res.data.properties.skyCover.values[0].value);
          })
          .catch(err => {
            console.log("Error finding skyCover: ", err.message);
            reject(error);
          });
      })
      .catch(err => {
        console.log("Error getting response from weather.gov: ", err.message);
        reject(error);
      });
  });
};

//This function should recursively find the closest sun
//To minimize searches, it doubles the difference each time (a la Gmail timeout refresh) 
//Variable naming follows a "next", "curr(ent)", "prev" pattern
//Three variables 

const findClosestSun = (currLat, currLong, prevLat, prevLong, prevDist) => {
  getWeatherByLatLong(currLat, currLong).then(skyCover => {
    
    if(skyCover < 35) {
      console.log("I found the sun!")
      console.log("It's sunny at " + currLat + ", " + currLong);
      console.log("Last clouds were at " + prevLat + ", " + prevLong);
      return (currLat, currLong);
    } else {
      console.log("Not sunny enough, trying further north")

      //This should use 2.5 as prevDist if previously undefined
      const currDist = (prevDist || 2.5) * 2
      
      //1 degree of latitude is ~69 miles (it's not constant...) 
      const nextLat = (parseFloat(currLat) + currDist / 69).toString();
      const nextLong = currLong;

      console.log(nextLat, nextLong, currDist);
      


      return null;
    }
  })
};

const main = () => {
  //console.log("Main running");

  //Starting location
  const startLat = "37.793836";
  const startLong = "-122.475153";
  const startP = new LatLon(parseFloat(startLat), parseFloat(startLong));

  //Direction to aim towards. Should calculate along a great circle
  const destLat = "38.436336";
  const destLong = "-122.715220";
  const destP = new LatLon(parseFloat(destLat), parseFloat(destLong));

  

  console.log(startP.distanceTo(destP)); 

  //findClosestSun(lat, long, null, null, null);
};

main();
