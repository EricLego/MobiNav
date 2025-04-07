import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AccessibilityContext } from '../App';
import '../styles/Header.css';

const Header = () => {
  const { accessibilitySettings } = useContext(AccessibilityContext);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <Link to="/">
            <img src="/ksu-logo.png" alt="KSU Logo" />
            <span>MobiNav</span>
          </Link>
        </div>
        
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <span className={`menu-icon ${mobileMenuOpen ? 'open' : ''}`}></span>
        </button>
        
        <nav className={`header-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <ul>
            <li>
              <Link 
                to="/" 
                className={location.pathname === '/' ? 'active' : ''}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/map" 
                className={location.pathname === '/map' ? 'active' : ''}
              >
                Map
              </Link>
            </li>
            <li>
              <Link 
                to="/report" 
                className={location.pathname === '/report' ? 'active' : ''}
              >
                Report Obstacles
              </Link>
            </li>
            <li>
              <Link 
                to="/about" 
                className={location.pathname === '/about' ? 'active' : ''}
              >
                About Us
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;