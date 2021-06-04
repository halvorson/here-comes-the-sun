import React, { useState } from "react";
import "./App.css";
import useCurrentLocation from "./hooks/useCurrentLocation";
import { geolocationOptions } from "./constants/geolocationOptions";
import Location from "./components/Location";

import useClosestSun from "./hooks/useClosestSun";
import ClosestSun from "./components/ClosestSun";

import Orientation from "./components/Orientation";

function App() {
  const { location: currentLocation, error: currentError } =
    useCurrentLocation(geolocationOptions);

  const [orientation, setOrientation] = useState<number>(360);

  const closestSunObject = useClosestSun(orientation);

  const [locationRequested, setLocationRequested] = useState(false);

  const requestLocation = () => {
    setLocationRequested(true);
  };

  
  const [orientationRequested, setOrientationRequested] = useState(false);

  const requestOrientation = () => {
    setOrientationRequested(true);
    //setOrientation();
  };

  const setOrientationPassthrough = (orientationNum: number) => {
    setOrientation(orientationNum);
  }

  const [closestSunRequested, setClosestSunRequested] = useState(false);

  const requestClosestSun = () => {
    setClosestSunRequested(true);
  };

  return (
    <div className='App'>
      <header className='App-header'>
        {!locationRequested && <button onClick={requestLocation}>Set current location</button>}
        {locationRequested && <Location location={currentLocation} error={currentError} />}
        <br />
        {locationRequested && <Orientation onClick={requestOrientation}  onGetOrientation={setOrientationPassthrough} />}
        <br /> 
        {locationRequested && orientationRequested && !closestSunRequested && <button onClick={requestClosestSun}>Find closest sun!</button>}
        {locationRequested && orientationRequested && closestSunRequested && <ClosestSun closestSun={closestSunObject?.closestSun}/>}
      </header>
    </div>
  );
}

export default App;
