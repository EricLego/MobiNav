import React from 'react';
import { Link } from 'react-router-dom';
import HowItWorks from './HowItWorks';
import '../styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Find Your Way Around <span>KSU</span>, Hassle-Free!</h1>
          <p>MobiNav helps students with mobility needs navigate the Kennesaw State University campus efficiently with real-time accessible routing and obstacle reports.</p>
          <div className="cta-buttons">
            <Link to="/map" className="btn btn-primary">Plan Your Route</Link>
            <Link to="/report" className="btn btn-secondary">Report an Obstacle</Link>
            <Link to="/about" className="btn btn-secondary">About MobiNav</Link>
          </div>
        </div>
        <div className="hero-background" aria-hidden="true">
          {/* Animated map background implemented with CSS */}
        </div>
      </section>
      
      {/* Features Overview */}
      <section className="features-section">
        <div className="container">
          <h2>Accessible Navigation for Everyone</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🗺️</div>
              <h3>Accessible Routing</h3>
              <p>Custom routes that consider mobility needs, accessible entrances, and elevation changes.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Real-time Updates</h3>
              <p>Stay informed about campus obstacles, construction, and accessibility changes.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">♿</div>
              <h3>Accessibility Features</h3>
              <p>Locate ramps, elevators, accessible entrances, and other essential facilities.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Community Reports</h3>
              <p>Contribute and benefit from crowd-sourced obstacle reporting and verification.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="how-it-works-section">
        <div className="container">
          <h2>How It Works</h2>
          <HowItWorks />
          <div className="action-center">
            <Link to="/map" className="btn btn-primary">Get Started Now</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;