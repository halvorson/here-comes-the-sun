import React from "react";
import PropTypes from "prop-types";
import axios from "axios";

type LocationType = {
  longitude: number;
  latitude: number;
};

type LocationInputType = {
  location?: LocationType;
  error?: String;
};

const Location = ({ location, error }: LocationInputType) => {
  if (location) {
    const baseUrl =
      "http://localhost:5001/its-always-sunny-somewhere/us-central1/";
    const queryParams = new URLSearchParams();
    queryParams.set("latitude", location.latitude.toString());
    queryParams.set("longitude", location.longitude.toString());
    const fullUrl = baseUrl + "sunny?" + queryParams.toString();
    console.log(fullUrl);
    axios.defaults.headers.post['Content-Type'] ='application/json;charset=utf-8';
    axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
    axios.get(fullUrl).then(res => {
      console.log(res);
    });
  }

  return (
    <div>
      {location ? (
        <code>
          Latitude: {location.latitude}, Longitude: {location.longitude}
        </code>
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
