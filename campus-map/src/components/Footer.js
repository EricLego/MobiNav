import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/support">Contact Support</Link></li>
            <li><Link to="/accessibility">Accessibility Policies</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Use</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Resources</h3>
          <ul>
            <li><Link to="/campus-accessibility">Campus Accessibility Map</Link></li>
            <li><Link to="/report-history">Your Reports</Link></li>
            <li><Link to="/feedback">Provide Feedback</Link></li>
            <li><a href="https://www.kennesaw.edu/campus-map/" target="_blank" rel="noopener noreferrer">KSU Maps</a></li>
          </ul>
        </div>
        
        <div className="footer-section branding">
          <div className="footer-logo">
            <img src="/logo.png" alt="MobiNav Logo" />
            <h2>MobiNav</h2>
          </div>
          <p className="tagline">Making campus navigation accessible to everyone.</p>
          <div className="social-links">
            <a href="https://twitter.com/KennesawState" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </a>
            <a href="https://www.facebook.com/KennesawStateUniversity" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
              </svg>
            </a>
            <a href="https://www.instagram.com/kennesawstateuniversity/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="university-logo">
          <img src="/ksu-logo.png" alt="Kennesaw State University" />
        </div>
        <p className="copyright">
          &copy; {new Date().getFullYear()} MobiNav. Kennesaw State University. All rights reserved.
        </p>
        <p className="disclaimer">
          MobiNav is a student-developed project. Not an official KSU application.
        </p>
        <div className="references">
          <h4>References</h4>
          <ul>
            <li><a href="https://www.kennesaw.edu/maps/" target="_blank" rel="noopener noreferrer">KSU Campus Maps</a></li>
            <li><a href="https://developers.google.com/maps" target="_blank" rel="noopener noreferrer">Google Maps Platform</a></li>
            <li><a href="https://react-google-maps-api-docs.netlify.app/" target="_blank" rel="noopener noreferrer">React Google Maps API</a></li>
            <li><a href="https://www.transportation.gov/mission/accessibility" target="_blank" rel="noopener noreferrer">Accessibility Resources</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;