import React from "react";
import "./homePage.css";
import Recording from "../components/recording";

const HomePage = () => {
  return (
    <div className="homepage">
      <div className="content">
        <h1>Creatially</h1>
        <p>Where stories come to life</p>
        <div>
          <Recording />
        </div>
      </div>
    </div>
  );
};

export default HomePage;