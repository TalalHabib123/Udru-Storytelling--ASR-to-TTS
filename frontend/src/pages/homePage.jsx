import React from "react";
import Background from "../components/background";
import Recording from "../components/recording";

const HomePage = () => {
  return (
    <div className="homepage">
      <Background />
      <div className="content">
        <h1>Creatially</h1>
        <p>Where stories come to life</p>
        <Recording />
      </div>
    </div>
  );
};

export default HomePage;
