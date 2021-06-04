import { useState, useEffect } from "react";

import axios from "axios";

import useCurrentLocation from "./useCurrentLocation";
import { geolocationOptions } from "../constants/geolocationOptions";

type LocationType = {
  longitude: number;
  latitude: number;
};

type QueriedLocationType = [LocationType, number];

type ClosestSunType = {
  closestSun: LocationType;
  testedArray: QueriedLocationType;
};

const useClosestSun = (options = {}) => {
  // store object in state
  const [closestSunObject, setClosestSunObject] = useState<ClosestSunType>();

  const { location: currentLocation } = useCurrentLocation(geolocationOptions);

  useEffect(() => {
    if (currentLocation) {
      const baseUrl =
        process.env.NODE_ENV === "production"
          ? "https://us-central1-its-always-sunny-somewhere.cloudfunctions.net/"
          : "http://localhost:5001/its-always-sunny-somewhere/us-central1/";
      const queryParams = new URLSearchParams();
      queryParams.set("latitude", currentLocation.latitude.toString());
      queryParams.set("longitude", currentLocation.longitude.toString());
      const fullUrl = baseUrl + "sunny?" + queryParams.toString();
      //console.log(fullUrl);
      axios.defaults.headers.post["Content-Type"] =
        "application/json;charset=utf-8";
      axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";
      axios.get(fullUrl).then(res => {
        //console.log(res.data);
        setClosestSunObject(res.data);
      });
    }
  }, [currentLocation]);

  return closestSunObject;
};

export default useClosestSun;
