// src/hooks/useIsMobile.js
import { useState, useEffect } from 'react';

const useIsMobile = (breakpoint = 768) => {
  // Initialize state based on current window width
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= breakpoint);

  useEffect(() => {
    // Handler to call on window resize
    const handleResize = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]); // Only re-run effect if breakpoint changes

  return isMobile;
};

export default useIsMobile;
