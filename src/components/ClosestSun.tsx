import React from "react";
import PropTypes from "prop-types";

type LocationType = {
  longitude?: number;
  latitude?: number;
};

/*
type QueriedLocationType = [LocationType, number];
*/

type ClosestSunType = {
  closestSun?: LocationType;
  distanceToSun?: number;
};

const ClosestSun = (props: ClosestSunType) => {
  //console.log(props);
  return (
    <div>
      { !(props.distanceToSun == null)  ? (
        <>
          <br />
          Closest Sun: <br />
          Lat: {props.closestSun?.latitude?.toFixed(5)}, Long:{" "}
          {props.closestSun?.longitude?.toFixed(5)}
          <br />
          {props?.distanceToSun === 0 ? "It's sunny where you are!" : ("It's sunny " + 
          (typeof props?.distanceToSun === "number"
            ? props?.distanceToSun.toFixed(1)
            : null) + 
          "miles away.")}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

ClosestSun.propTypes = {
  closestSun: PropTypes.object,
  distanceToSun: PropTypes.number,
};

export default ClosestSun;
