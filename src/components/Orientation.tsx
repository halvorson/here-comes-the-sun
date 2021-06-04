import React, { useState } from "react";
import PropTypes from "prop-types";

import useOrientation from "../hooks/useOrientation";

const Orientation = (props: { onClick: () => void }) => {
  //let orientationObject: OrientationType = {};
  const [requestedOrientationPermission, setRequestedOrientationPermission] =
    useState<boolean>(false);

  const { orientation, orientationError } = useOrientation(
    requestedOrientationPermission
  );

  const clickForOrientation = () => {
    setRequestedOrientationPermission(true);
    if (typeof props.onClick === "function") {
      props.onClick();
    }
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
