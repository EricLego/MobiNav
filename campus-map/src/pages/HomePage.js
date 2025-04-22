import React, { useState, useEffect } from 'react'; // Import useState, useEffect, useContext
// Remove Link if no longer needed for internal navigation in this component,
// or keep it if other Links are present.
// import { Link } from 'react-router-dom';
import Header from '../features/layout/Header';
import Footer from '../features/layout/Footer';
import ObstacleReports from '../features/obstacles/components/ObstacleReports'; // Adjust path if needed
import HowItWorks from '../features/layout/HowItWorks';
import './HomePage.css';
import ParkingMenu from '../features/parking/components/ParkingMenu';

const HomePage = () => {
  // const isMobile = useIsMobile();
  // const { isOnCampus, isLocating, locationError } = useUserLocation();
  // const [showParkingMenu, setShowParkingMenu] = useState(false);

  // useEffect(() => {
  //   if (!isOnCampus && !isLocating && !locationError) {
  //     console.log("User is off-campus, showing parking menu.");
  //     setShowParkingMenu(true);
  //   } else {
  //     // setShowParkingMenu(false); // Optional: hide if location changes
  //   }
  // }, [isOnCampus, isLocating, locationError]);


  // --- Define the Video URL ---
  const demoVideoUrl = "https://youtu.be/N8zvhVa96Zk"; // Video URL updated

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
              {/* Keep other links as needed */}
              {/* <Link to="/route" className="btn btn-primary">Plan Your Route</Link> */}

              {/* --- Link to Video (can keep or remove if video player is prominent) --- */}
              <a
                href={demoVideoUrl}
                className="btn btn-secondary"
                target="_blank" // Open in new tab
                rel="noopener noreferrer" // Security best practice for target="_blank"
              >
                Watch Demo Video
              </a>
              {/* --- End Link --- */}

              {/* Keep other links as needed */}
              {/* <Link to="/report" className="btn btn-secondary">Report an Obstacle</Link> */}
            </div>
          </div>
          <div className="hero-background" aria-hidden="true">
            {/* Animated map background implemented with CSS */}
          </div>
        </section>

        {/* --- Video Player Section --- */}
        <section className="video-section"> {/* Renamed class for clarity */}
          <h2>Product Demonstration</h2>
          <div className="video-player-container"> {/* Optional: Add a container for styling */}
            <video
              width="100%" // Adjust width as needed, 100% makes it responsive
              controls // Show default video controls (play, pause, volume, etc.)
              // Optional: Add a poster image shown before the video loads
              // poster="/path/to/your-video-poster.jpg"
              aria-label="MobiNav Product Demonstration Video" // Accessibility
            >
              <source src={demoVideoUrl} type="video/mp4" /> {/* Specify video type */}
              {/* Add more <source> tags for different video formats if needed (e.g., webm, ogg) */}
              Your browser does not support the video tag.
              {/* Fallback text for older browsers */}
            </video>
          </div>
        </section>
        {/* --- End Video Player Section --- */}


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