import React from "react";
import logo from "./logo.svg";
import "./App.css";
import useCurrentLocation from "./hooks/useCurrentLocation";
import { geolocationOptions } from "./constants/geolocationOptions";
import Location from "./components/Location";

function App() {

  const { location: currentLocation, error: currentError } = useCurrentLocation(geolocationOptions);

  return (
    <div className='App'>
      <header className='App-header'>
        <img src={logo} className='App-logo' alt='logo' />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className='App-link'
          href='https://reactjs.org'
          target='_blank'
          rel='noopener noreferrer'
        >
          Learn React
        </a>
        <Location location={currentLocation} error={currentError} />
      </header>
    </div>
  );
}

export default App;
