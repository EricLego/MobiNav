import React from 'react';
import '../styles/HowItWorks.css';

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: 'Enter your starting point and destination',
      description: 'Use the search function or interactive map to select where you are and where you want to go.',
      icon: '🔍'
    },
    {
      id: 2,
      title: 'Choose your mobility preferences',
      description: 'Select options like wheelchair-accessible routes, avoiding stairs, or preferring elevators.',
      icon: '⚙️'
    },
    {
      id: 3,
      title: 'Get optimized route & accessibility updates',
      description: 'View your custom route with real-time updates about obstacles or closed pathways.',
      icon: '🗺️'
    },
    {
      id: 4,
      title: 'Report obstacles to help others',
      description: 'Contribute to the community by reporting accessibility issues you encounter.',
      icon: '📢'
    }
  ];

  return (
    <div className="how-it-works">
      <div className="steps-container">
        {steps.map(step => (
          <div key={step.id} className="step-card">
            <div className="step-icon">
              <span>{step.icon}</span>
              <div className="step-number">{step.id}</div>
            </div>
            <div className="step-content">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="features-preview">
        <h3>Key Features</h3>
        <ul className="feature-list">
          <li>
            <span className="feature-icon">🚫</span>
            <span className="feature-text">Obstacle alerts and detours</span>
          </li>
          <li>
            <span className="feature-icon">♿</span>
            <span className="feature-text">Wheelchair-accessible pathways</span>
          </li>
          <li>
            <span className="feature-icon">🔔</span>
            <span className="feature-text">Real-time notifications</span>
          </li>
          <li>
            <span className="feature-icon">🏢</span>
            <span className="feature-text">Indoor navigation for buildings</span>
          </li>
          <li>
            <span className="feature-icon">👥</span>
            <span className="feature-text">Community-driven updates</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HowItWorks;