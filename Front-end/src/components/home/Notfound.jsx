import React from "react";

function Notfound() {
  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh", // Full viewport height
    backgroundColor: "transparent", // Optional: background color
  };

  const notFoundStyle = {
    textAlign: "center",
  };

  const imgStyle = {
    maxWidth: "100%",
    height: "auto",
  };

  return (
    <div style={containerStyle}>
      <div style={notFoundStyle}>
        {/* <h2>404</h2>
        <h3>Page Not found</h3> */}
        <img
          src="../../../../public/footer-images/not-found.gif"
          alt="page-notfound"
          style={imgStyle}
        />
      </div>
    </div>
  );
}

export default Notfound;
