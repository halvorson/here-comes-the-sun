import React from "react";
import PropTypes from "prop-types";

type LocationType = {
  longitude: number;
  latitude: number;
}

type ClosestSunType = {
  closestSun?: LocationType
}

/*
type QueriedLocationType = [LocationType, number];


type ClosestSunType = {
  closestSun: LocationType;
  testedArray: QueriedLocationType; 
}
*/

const ClosestSun = ({ closestSun }: ClosestSunType ) => {

  console.log("closestSun from functional component: ");
  console.log(closestSun);

  return (
    <div>
      {(closestSun) ? (
        <>
          <br />
          <code>
            Closest Sun: <br />
            Latitude: {closestSun.latitude}, Longitude: {closestSun.longitude}
          </code>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

ClosestSun.propTypes = {
  closestSun: PropTypes.object,
  testedArray: PropTypes.array,
};

export default ClosestSun;
