import React from "react";

function Geolocator() {
  console.log("I'm alive");

  var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  function success(pos: any) {
    var crd = pos.coords;

    console.log("Your current position is:");
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);
  }

  function errors(err: any) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  if (navigator.geolocation) {
    navigator.permissions
      .query({ name: "geolocation" })
      .then(function (result) {
        navigator.geolocation.getCurrentPosition(success, errors, options)
        if (result.state === "granted") {
          console.log(result.state);
          //If granted then you can directly call your function here
        } else if (result.state === "prompt") {
          console.log(result.state);
        } else if (result.state === "denied") {
          //If denied then you have to show instructions to enable location
        }
        result.onchange = function () {
          console.log(result.state);
        };
      });
  } else {
    alert("Sorry Not available!");
  }

  return <div>"This is text"</div>;
}

export default Geolocator;
