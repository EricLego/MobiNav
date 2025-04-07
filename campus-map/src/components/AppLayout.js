import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';

const AppLayout = ({ children }) => {
  const location = useLocation();
  
  return (
    <>
      <Header />
      <main className="app-main">
        {children}
      </main>
    </>
  );
};

export default AppLayout;