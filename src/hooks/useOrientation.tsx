import { useState, useEffect } from "react";

const useOrientation = (requestedOrientationPermission?: boolean) => {
  // store location in state
  const [orientation, setOrientation] = useState<number | undefined>();
  const [orientationError, setOrientationError] = useState<string>("");

  useEffect(() => {
    if (requestedOrientationPermission) {
      
      const handleSuccess = (e: any) => {
        const orientationNum =
          e.webkitCompassHeading || Math.abs(e.alpha - 360);
        if (!e.webkitCompassHeading && !e.alpha) {
          setOrientation(343.7087120027676);
          setOrientationError("Browser not supported. We're headed North!");
        } else {
          setOrientation(orientationNum);
        }
      };

      const isIOS =
        navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
        navigator.userAgent.match(/AppleWebKit/);

      if (!isIOS) {
        window.addEventListener(
          "deviceorientationabsolute",
          handleSuccess,
          true
        );
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
          .catch(() => alert("not supported"));
      }
    }
  }, [requestedOrientationPermission]);

  return { orientation, orientationError };
};

export default useOrientation;