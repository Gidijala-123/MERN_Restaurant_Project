import React from "react";
import "./Footer.css";

function Footer() {
  const partnerImages = [
    "kfc.png",
    "applebees2.png",
    "dominos2.png",
    "dunkindonuts.png",
    "innout.png",
    "dq.png",
    "pizzahut.png",
    "mcdonals.png",
    "starbucks.png",
    "burgerking.png",
    "subway.png",
    "peppers.png",
  ];

  return (
    <div className="footer-section">
      <div className="container-fluid footer-cont pt-md-2 bg-dark">
        <div className="row p-2 pb-md-4">
          <div className="col-12 col-md-4 mt-4 mt-md-0 icon-div d-flex flex-row justify-content-md-center justify-content-start">
            <div className="footer-icon mr-3">
              <i className="fas fa-map-marker-alt" />
            </div>
            <div className="footer-icon-decp">
              <b className="icon-div-heading">Find us</b>
              <p className="icon-div-decp">7-7-9, KKD</p>
            </div>
          </div>
          <div className="col-12 col-md-4 icon-div d-flex flex-row justify-content-md-center justify-content-start">
            <div className="footer-icon mr-3">
              <i className="fal fa-phone-alt" />
            </div>
            <div className="footer-icon-decp">
              <b className="icon-div-heading">Call us</b>
              <p className="icon-div-decp">949xxxxx56</p>
            </div>
          </div>
          <div className="col-12 col-md-4 icon-div d-flex flex-row justify-content-md-center justify-content-start">
            <div className="footer-icon mr-3">
              <i className="fal fa-envelope-open-text" />
            </div>
            <div className="footer-icon-decp">
              <b className="icon-div-heading">Mail us</b>
              <p className="icon-div-decp">Bhargava-123@gmail.com</p>
            </div>
          </div>
        </div>
        <hr className="footer-hr" />
        <div className="row pl-2 pr-2 pb-5 mt-md-5 pl-md-3 pr-md-3">
          <div className="col-12 col-md-4">
            <div className="icon-div d-flex flex-row justify-content-center">
              <div className="footer-icon mr-2">
                <p className="dropcap">BG</p>
              </div>
              <div className="footer-icon-decp text-center">
                <b className="icon-div-heading">About Me</b>
                <p
                  className="icon-div-decp"
                  style={{
                    color: "#ff5e14",
                    borderTop: "1px solid #ff5e14",
                    fontSize: "0.8rem",
                  }}
                >
                  FULL-STACK DEVELOPER
                </p>
              </div>
            </div>
            <div className="icon-div-decp text-justify">
              <p>
                <span style={{ color: "white" }}>B</span>hargava_
                <span style={{ color: "#ff5e14" }}>G</span>idijala is a Full
                stack Web-Developer He is from Kakinada, Andhra Pradesh. He
                completed Post Graduation in "Master of Computer Applications"
                from JNTUK Universtiy. He likes pencil arts which make him
                passionate towards web designing. His hobbies are listening
                music, Designing web apps, Reading technology realted articles
                and Probably hanging out with his friends 😁
              </p>
            </div>
          </div>
          <hr className="footer-hr d-md-none" />
          <div className="col-12 col-md-4">
            <div className="footer-icon-decp text-center">
              <b
                className="icon-div-heading text-center"
                style={{ borderBottom: "2px solid#ff5e14", width: "8rem" }}
              >
                Our Partners
              </b>
            </div>
            <div className="row icon-div-decp text-center">
              {partnerImages.map((imageName, index) => (
                <div key={index} className="col-4 col-md-3 p-3 pb-md-1">
                  <img
                    className="partner-icon"
                    src={`./footer-images/${imageName}`}
                    alt={`Partner ${index}`}
                  />
                </div>
              ))}
            </div>
          </div>
          <hr className="footer-hr d-md-none" />
          <div className="col-12 col-md-4 text-center">
            <b
              className="icon-div-heading"
              style={{ borderBottom: "2px solid#ff5e14", width: "8rem" }}
            >
              Subscriptions
            </b>
            <p
              className="icon-div-decp text-justify"
              style={{ paddingTop: "2.3rem" }}
            >
              For latest updates and information please don't forget to
              subscribe to our news feeds, Kindly fill the form below by
              entering your email id
            </p>
            <div className="d-flex flex-row justify-content-start text-center mt-md-4">
              <input
                className="w-100"
                type="text"
                placeholder="Enter  your E-mail address"
                style={{
                  backgroundColor: "#2e2e2e",
                  border: "none",
                  padding: "0.9rem",
                }}
              />
              <i
                className="fad fa-envelope-open-text"
                style={{
                  backgroundColor: "#ff5e14",
                  padding: "0.8rem",
                  fontSize: "1.5rem",
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        className="copyright-div pt-3 pb-1 pl-3 pr-3 pt-md-3 pb-md-1"
        style={{ backgroundColor: "#ff5e14" }}
      >
        <p className="icon-div-decp mt-md-2" style={{ color: "white" }}>
          Copyrights© 2021,All Rights Reserved by{" "}
          <b style={{ color: "#000" }}>"BhargavaG"</b>
        </p>
      </div>
    </div>
  );
}

export default Footer;
