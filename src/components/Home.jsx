import React from "react";
import { Link } from "react-router-dom";
import "../style/Home.css"; // Import the CSS

const Home = () => {
  return (
    <div className="home-container">
      <h2 className="home-title">Upload Thumbnails and Articles</h2>
      <div className="home-grid">
        <Link to="/list-images" className="home-card"> List Images</Link>
        <Link to="/add-images" className="home-card"> Add Images</Link>
        <Link to="/add-articles" className="home-card"> Add Article</Link>
        <Link to="/list-article" className="home-card"> List Articles</Link>
      </div>
    </div>
  );
};

export default Home;
