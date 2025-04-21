import React, { useState, useEffect } from 'react'; // Import useState, useEffect, useContext
import { Link } from 'react-router-dom';
import Header from '../features/layout/Header';
import Footer from '../features/layout/Footer';
import GoogleMapCore from '../features/map/GoogleMapCore';
import ObstacleReports from '../features/data/components/ObstacleReports';
import HowItWorks from '../features/layout/HowItWorks';
import './HomePage.css';
import useIsMobile from '../hooks/useIsMobile';
import { useUserLocation } from '../features/location/UserLocationContext';
import ParkingMenu from '../features/parking/components/ParkingMenu';

const HomePage = () => {
  const isMobile = useIsMobile();
  // Get location status from context
  const { isOnCampus, isLocating, locationError } = useUserLocation();
  // State to control parking menu visibility
  const [showParkingMenu, setShowParkingMenu] = useState(false);

  // Effect to automatically show the parking menu when off-campus
  useEffect(() => {
    // Show if NOT on campus, NOT currently locating, and NO location error
    if (!isOnCampus && !isLocating && !locationError) {
      console.log("User is off-campus, showing parking menu.");
      setShowParkingMenu(true);
    } else {
      // Optionally hide if user location changes to on-campus later
      // setShowParkingMenu(false);
    }
    // Dependencies: Run when these states change
  }, [isOnCampus, isLocating, locationError]);


    
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
      
        {/* Add position: relative to the map section */}
        <section className="map-section" style={{ position: 'relative' }}>
          {/* Conditionally render ParkingMenu INSIDE the map section */}
          {/* Pass isOpen prop */}
          <ParkingMenu isOpen={showParkingMenu} onClose={() => setShowParkingMenu(false)} />

          <GoogleMapCore />
        
        </section>
      
      {/* Obstacle Reports Section */}
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