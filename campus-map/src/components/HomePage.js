import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import InteractiveMap from './InteractiveMap';
import ObstacleReports from './ObstacleReports';
import HowItWorks from './HowItWorks';
import '../styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="page-wrapper">
      <Header />
      <div className="homepage">
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Find Your Way Around <span>KSU</span>, Hassle-Free!</h1>
          <p>MobiNav helps students with mobility needs navigate the Kennesaw State University campus efficiently with real-time accessible routing and obstacle reports.</p>
          <div className="cta-buttons">
            <Link to="/route" className="btn btn-primary">Plan Your Route</Link>
            <Link to="/map" className="btn btn-secondary">View Campus Map</Link>
            <Link to="/report" className="btn btn-secondary">Report an Obstacle</Link>
          </div>
        </div>
        <div className="hero-background" aria-hidden="true">
          {/* Animated map background implemented with CSS */}
        </div>
      </section>
      
      {/* Interactive Map Section */}
      <section className="map-section">
        <InteractiveMap />
      </section>
      
      {/* Recent Obstacle Reports */}
      <section className="obstacles-section">
        <h2>Recent Obstacle Reports</h2>
        <ObstacleReports />
      </section>
      
      {/* How It Works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <HowItWorks />
      </section>
      
      <Footer />
    </div>
    </div>
  );
};

export default HomePage;