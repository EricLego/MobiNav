import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AccessibilityContext } from '../../App';
import useIsMobile from '../../hooks/useIsMobile'; // Import the hook
import SearchBar from '../search/SearchBar';
import './Header.css';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { accessibilitySettings, setAccessibilitySettings } = useContext(AccessibilityContext);
  const dropdownRef = useRef(null);
  const isMobile = useIsMobile(); // Use the hook

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Close mobile menu when a link is clicked (optional but good UX)
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      // Optional: Close mobile menu if clicking outside header on mobile
      // const headerElement = event.target.closest('.header');
      // if (isMobile && mobileMenuOpen && !headerElement) {
      //   setMobileMenuOpen(false);
      // }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef, isMobile, mobileMenuOpen]); // Added dependencies

  // Toggle functions remain the same
  const toggleHighContrast = () => {
    setAccessibilitySettings({
      ...accessibilitySettings,
      highContrast: !accessibilitySettings.highContrast
    });
  };
  const toggleLargeText = () => {
    setAccessibilitySettings({
      ...accessibilitySettings,
      largeText: !accessibilitySettings.largeText
    });
  };
  const toggleScreenReader = () => {
    setAccessibilitySettings({
      ...accessibilitySettings,
      screenReader: !accessibilitySettings.screenReader
    });
  };

  return (
    // Add a class based on mobile state for easier CSS targeting if needed
    <header className={`header ${isMobile ? 'mobile-header' : 'desktop-header'}`}>
      <div className="header-container">
        {/* Logo: Show image always, hide text on mobile */}
        <div className="logo">
          <Link to="/">
            <img src="/logo.png" alt="MobiNav Logo" />
            {!isMobile && <span>MobiNav</span>} {/* Hide text on mobile */}
          </Link>
        </div>

        {/* Mobile Search Bar: Render only on mobile */}
        {isMobile && (
          <div className="mobile-search-wrapper">
            <SearchBar />
          </div>
        )}

        {/* Mobile Menu Button: Render only on mobile */}
        {isMobile && (
          <button
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="sr-only">Menu</span>
            {/* Hamburger/Close Icon */}
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        )}

        {/* Navigation: Adjust class based on mobile state */}
        <nav className={`main-nav ${isMobile ? (mobileMenuOpen ? 'open' : '') : ''}`}>
          {/* Wrap list in a container for better mobile styling */}
          <div className="nav-links-container">
            <ul>
              {/* Add onClick={closeMobileMenu} to links for better mobile UX */}
              <li><Link to="/" onClick={closeMobileMenu}>Home</Link></li>
              <li><Link to="/route" onClick={closeMobileMenu}>Find Route</Link></li>
              <li><Link to="/report" onClick={closeMobileMenu}>Report Obstacle</Link></li>
              <li>
                <div className="dropdown" ref={dropdownRef}>
                  <button
                    className="dropdown-button"
                    onClick={toggleDropdown}
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                  >
                    Accessibility {/* Shortened text for mobile? */}
                    <span className="dropdown-icon">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </button>
                  <div className={`dropdown-content ${dropdownOpen ? 'show' : ''}`}>
                    <div className="accessibility-title">Accessibility Options</div>
                    <div className="setting">
                      <input
                        type="checkbox"
                        id="high-contrast"
                        checked={accessibilitySettings.highContrast}
                        onChange={toggleHighContrast}
                        aria-label="Toggle high contrast mode"
                      />
                      <label htmlFor="high-contrast">High Contrast</label>
                    </div>
                    <div className="setting">
                      <input
                        type="checkbox"
                        id="large-text"
                        checked={accessibilitySettings.largeText}
                        onChange={toggleLargeText}
                        aria-label="Toggle large text mode"
                      />
                      <label htmlFor="large-text">Large Text</label>
                    </div>
                    <div className="setting">
                      <input
                        type="checkbox"
                        id="screen-reader"
                        checked={accessibilitySettings.screenReader}
                        onChange={toggleScreenReader}
                        aria-label="Toggle screen reader support"
                      />
                      <label htmlFor="screen-reader">Screen Reader Support</label>
                    </div>
                  </div>
                </div>
              </li>
              <li><Link to="/login" className="login-button" onClick={closeMobileMenu}>Login / Sign Up</Link></li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
