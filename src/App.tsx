import React, { useEffect, useState } from "react";
import axios from "axios";
import { getDistance } from "geolib";

import "./App.css";
import useCurrentLocation from "./hooks/useCurrentLocation";
import { geolocationOptions } from "./constants/geolocationOptions";
import Location from "./components/Location";

import ClosestSun from "./components/ClosestSun";

import Orientation from "./components/Orientation";

type LocationType = {
  longitude: number;
  latitude: number;
};

type ClosestSunType = {
  closestSun: LocationType;
};


function App() {
  const { location: currentLocation, error: currentError } =
    useCurrentLocation(geolocationOptions);

  const [orientation, setOrientation] = useState<number>(360);

  const getClosestSun = (orientation: number) => {
    return new Promise<ClosestSunType>(function (resolve, reject) {
      if (currentLocation) {
        const baseUrl =
          process.env.NODE_ENV === "production"
            ? "https://us-central1-its-always-sunny-somewhere.cloudfunctions.net/"
            : "http://localhost:5001/its-always-sunny-somewhere/us-central1/";
        const queryParams = new URLSearchParams();
        queryParams.set("latitude", currentLocation.latitude.toString());
        queryParams.set("longitude", currentLocation.longitude.toString());
        queryParams.set("bearing", orientation.toString());
        const fullUrl = baseUrl + "sunny?" + queryParams.toString();
        //console.log(fullUrl);
        axios.defaults.headers.post["Content-Type"] =
          "application/json;charset=utf-8";
        axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";
        axios.get(fullUrl).then(res => {
          //console.log(res.data);
          resolve(res.data);
        });
      } else {
        reject("need current location");
      }
    });
  };

  const [locationRequested, setLocationRequested] = useState<boolean>(false);
  const [orientationRequested, setOrientationRequested] =
    useState<boolean>(false);
  const [closestSunRequested, setClosestSunRequested] =
    useState<boolean>(false);
  const [closestSunObject, setClosestSunObject] = useState<ClosestSunType>();
  const [distToSun, setDistToSun] = useState<number>();

  const setOrientationPassthrough = (orientationNum: number) => {
    setOrientation(orientationNum);
  };

  const sunRequested = () => {
    setClosestSunRequested(true);
    getClosestSun(orientation).then(closestSun => {
      //console.log(closestSun);
      setClosestSunObject(closestSun);
      const distToSun = currentLocation && closestSun?.closestSun && getDistance(currentLocation, closestSun?.closestSun)/1609.34;
      //console.log("distToSun: " + distToSun);
      setDistToSun(distToSun);
    });
  };

  useEffect(() => {}, [orientation]);

  return (
    <div className='App'>
      <header className='App-header'>
        {!locationRequested && (
          <button
            onClick={() => {
              setLocationRequested(true);
            }}
          >
            Set current location
          </button>
        )}
        {locationRequested && (
          <Location location={currentLocation} error={currentError} />
        )}
        <br />
        {locationRequested && (
          <Orientation
            onClick={() => {
              setOrientationRequested(true);
            }}
            onGetOrientation={setOrientationPassthrough}
          />
        )}
        <br />
        {locationRequested && orientationRequested && !closestSunRequested && (
          <button onClick={sunRequested}>Find closest sun!</button>
        )}
        {locationRequested && orientationRequested && closestSunRequested && (
          <>
            <ClosestSun closestSun={closestSunObject?.closestSun} distanceToSun={distToSun}  />
            <br />
            <button onClick={sunRequested}>Try again!</button>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
