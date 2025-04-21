import React, { useContext } from 'react';
import { AccessibilityContext } from '../../../App';
import { useObstacleContext } from '../contexts/ObstacleContext';
import './ObstacleReports.css';

const ObstacleReports = ({ onClose, onStartReporting }) => {
  const {
    obstacles, // Use obstacles from context
    isLoadingObstacles, // Use loading state from context
    obstacleError, // Use error state from context
    filter, // Use filter state from context
    sortBy, // Use sort state from context
    setFilter, // Use setter from context
    setSortBy, // Use setter from context
  } = useObstacleContext();

  const { accessibilitySettings } = useContext(AccessibilityContext);

  
  // Function to filter reports
  const filteredReports = obstacles.filter(report => {
    if (filter === 'all') return true;
    if (filter === 'pending') return report.status !== 'Resolved';
    if (filter === 'resolved') return report.status === 'Resolved';
    return true;
  });
  
  // Function to sort reports
  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.reportedAt) - new Date(a.reportedAt);
    }
    if (sortBy === 'severity') {
      const severityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    }
    if (sortBy === 'votes') {
      return b.votes - a.votes;
    }
    return 0;
  });
  
  // Function to get status class for styling
  const getStatusClass = (status) => {
    switch (status) {
      case 'Resolved':
        return 'status-resolved';
      case 'Under Review':
        return 'status-review';
      case 'Pending':
        return 'status-pending';
      default:
        return '';
    }
  };
  
  // Function to get severity class for styling
  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'High':
        return 'severity-high';
      case 'Medium':
        return 'severity-medium';
      case 'Low':
        return 'severity-low';
      default:
        return '';
    }
  };

  // --- Render Logic ---
  if (isLoadingObstacles) {
    return <div>Loading obstacles...</div>; // Or a spinner component
  }

  if (obstacleError) {
    return <div>Error loading obstacles: {obstacleError.message}</div>;
  }

  return (
    <div className={`page-container ${accessibilitySettings.highContrast ? 'high-contrast' : ''} ${accessibilitySettings.largeText ? 'large-text' : ''}`}>
      
      {/* Close Button */}
      {onClose && (
        <button onClick={onClose} className="modal-close-button" aria-label="Close obstacle reports">
          &times;
          {/* <XIcon className="close-icon" /> */}
        </button>
      )}

      <div className="obstacle-reports">
        <div className="report-cta">
          {/* --- Updated onClick handler --- */}
          <button className="report-btn" onClick={onStartReporting}>
            Report a New Obstacle
          </button>
          <p className="report-info">
            Help others by reporting accessibility obstacles on campus!
          </p>
        </div>
        
        {/* --- Controls Section --- */}        
        <div className="report-controls">

        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Reports
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
            onClick={() => setFilter('resolved')}
          >
            Resolved
          </button>
        </div>
        
        <div className="sort-controls">
          <label htmlFor="sort-select">Sort by:</label>
          <select 
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date">Most Recent</option>
            <option value="severity">Severity</option>
            <option value="votes">Most Votes</option>
          </select>
        </div>
      </div>
      
      {/* --- List Section --- */}      
      <div className="reports-list">
        {sortedReports.length > 0 ? (
          sortedReports.map(report => (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <h3>{report.location}</h3>
                <span className={`report-status ${getStatusClass(report.status)}`}>
                  {report.status}
                </span>
              </div>
              
              <p className="report-details">{report.details}</p>
              
              <div className="report-meta">
                <span className={`report-severity ${getSeverityClass(report.severity)}`}>
                  {report.severity}
                </span>
                <span className="report-date">Reported: {report.reportedAt}</span>
                {report.updatedAt && (
                  <span className="report-update">Updated: {report.updatedAt}</span>
                )}
              </div>
              
              <div className="report-actions">
                <button className="vote-btn">
                  <span className="vote-count">{report.votes}</span>
                  <span className="vote-icon">👍</span>
                  Upvote
                </button>
                <button className="share-btn">Share</button>
                <button className="details-btn">View Details</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-reports">
            <p>No reports found matching your filters.</p>
          </div>
        )}
      </div>
      

      </div>
    </div>
  );
};

export default ObstacleReports;