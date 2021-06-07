import React from "react";
import PropTypes from "prop-types";

type LocationType = {
  longitude: number;
  latitude: number;
};

type LocationInputType = {
  location?: LocationType;
  error?: String;
};

const Location = ({ location, error }: LocationInputType) => {
  return (
    <div>
      {location ? (
        <>
          <br />
          Current location: <br />
          Lat: {location.latitude.toFixed(5)}, Long: {location.longitude.toFixed(5)}
        </>
      ) : (
        <p>Loading...</p>
      )}
      {error && <p className='errorMessage'>Location Error: {error}</p>}
    </div>
  );
};

Location.propTypes = {
  location: PropTypes.object,
  error: PropTypes.string,
};

export default Location;
