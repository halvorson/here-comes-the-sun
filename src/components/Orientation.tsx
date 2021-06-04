import React, { useState } from "react";
import PropTypes from "prop-types";

const Orientation = (props: {
  onClick: () => void;
  onGetOrientation: (orientationNum: number) => void;
}) => {
  //let orientationObject: OrientationType = {};
  const [requestedOrientationPermission, setRequestedOrientationPermission] =
    useState<boolean>(false);

  const [orientation, setOrientation] = useState<number | undefined>();
  const [orientationError, setOrientationError] = useState<string>("");

  const clickForOrientation = () => {
    const handleSuccess = (e: any) => {
      const orientationNum = e.webkitCompassHeading || Math.abs(e.alpha - 360);
      if (!e.webkitCompassHeading && !e.alpha) {
        setOrientation(343.7087120027676);
        setOrientationError("Browser not supported. We're headed North!");
      } else {
        setOrientation(orientationNum);
      }
      props?.onGetOrientation(orientationNum);  
    };

    const isIOS =
      navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
      navigator.userAgent.match(/AppleWebKit/);

    if (!isIOS) {
      window.addEventListener("deviceorientationabsolute", handleSuccess, true);
    }

    if (
      isIOS &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === "granted") {
            window.addEventListener("deviceorientation", handleSuccess, true);
          } else {
            alert("Has to be allowed!");
          }
        })
        .catch(err => alert(err));
    }
    if (typeof props.onClick === "function") {
      props.onClick();
    }
    setRequestedOrientationPermission(true);
  };

  return (
    <div>
      {!orientation && !orientationError && (
        <button onClick={clickForOrientation}>Get device orientation</button>
      )}
      {requestedOrientationPermission &&
        (orientation ? (
          <>
            <br />
            {orientationError || (
              <code>
                Orientation: <br />
                {orientation}
              </code>
            )}
          </>
        ) : (
          <p>Loading...</p>
        ))}
    </div>
  );
};

Orientation.propTypes = {
  orientation: PropTypes.any,
};

export default Orientation;
