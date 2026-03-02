import React from "react";

const VideoComponent = () => {
  return (
    <div>
      <video width="640" height="360" autoPlay loop muted>
        <source src="./new/loading.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoComponent;
