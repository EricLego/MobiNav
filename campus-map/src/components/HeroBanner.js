import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HeroBanner.css';

const HeroBanner = () => {
  // Always show the banner
  const currentPath = window.location.pathname;
  
  return (
    <div className="hero-banner">
      <div className="banner-logo">
        <Link to="/">
          <span>MobiNav</span>
        </Link>
      </div>
      <div className="banner-content">
        <span className="badge">KSU Campus Navigation</span>
        <h1>Plan Accessible Routes</h1>
        <p>Find wheelchair-friendly paths, avoid obstacles, and navigate campus with confidence</p>
        <div className="hero-actions">
          <Link to="/route" className="cta-button primary">Find Your Path</Link>
          <Link to="/map" className="cta-button secondary">Explore Map</Link>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;