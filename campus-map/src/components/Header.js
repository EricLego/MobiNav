import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AccessibilityContext } from '../App';
import '../styles/Header.css';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { accessibilitySettings, setAccessibilitySettings } = useContext(AccessibilityContext);
  const dropdownRef = useRef(null);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Toggle high contrast mode
  const toggleHighContrast = () => {
    setAccessibilitySettings({
      ...accessibilitySettings,
      highContrast: !accessibilitySettings.highContrast
    });
  };
  
  // Toggle large text mode
  const toggleLargeText = () => {
    setAccessibilitySettings({
      ...accessibilitySettings,
      largeText: !accessibilitySettings.largeText
    });
  };
  
  // Toggle screen reader support
  const toggleScreenReader = () => {
    setAccessibilitySettings({
      ...accessibilitySettings,
      screenReader: !accessibilitySettings.screenReader
    });
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <img src="/logo.png" alt="MobiNav Logo" />
            <span>MobiNav</span>
          </Link>
        </div>
        
        <button className="mobile-menu-button" onClick={toggleMobileMenu} aria-label="Toggle navigation menu" aria-expanded={mobileMenuOpen}>
          <span className="sr-only">Menu</span>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
        
        <nav className={`main-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/route">Find Route</Link></li>
            <li><Link to="/report">Report Obstacle</Link></li>
            <li>
              <div className="dropdown" ref={dropdownRef}>
                <button 
                  className="dropdown-button" 
                  onClick={toggleDropdown}
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                >
                  Accessibility Settings
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
            <li><Link to="/login" className="login-button">Login / Sign Up</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;