import React, { useContext } from 'react';
import { AccessibilityContext } from '../../../App';
import { useObstacleContext } from '../contexts/ObstacleContext';
import ObstacleReportCard from './ObstacleReportCard'; // Import the new component
import './ObstacleReports.css';

const ObstacleReports = ({ onClose, onStartReporting }) => {
  const {
    obstacles,
    isLoadingObstacles,
    obstacleError,
    filter,
    sortBy,
    setFilter,
    setSortBy,
  } = useObstacleContext();

  const { accessibilitySettings } = useContext(AccessibilityContext);

  // Function to filter reports (remains the same)
  const filteredReports = obstacles.filter(report => {
    if (filter === 'all') return true;
    // Consider making status check case-insensitive and handle null/undefined status
    const statusLower = report.status?.toLowerCase();
    if (filter === 'pending') return statusLower !== 'resolved';
    if (filter === 'resolved') return statusLower === 'resolved';
    return true; // Default case if filter is unexpected
  });

  // Function to sort reports (remains the same)
  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === 'date') {
      // Handle potential invalid dates
      const dateA = new Date(a.reportedAt);
      const dateB = new Date(b.reportedAt);
      if (isNaN(dateA) && isNaN(dateB)) return 0;
      if (isNaN(dateA)) return 1; // Put invalid dates last
      if (isNaN(dateB)) return -1; // Put invalid dates last
      return dateB - dateA;
    }
    if (sortBy === 'severity') {
      const severityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      // Handle potential missing or different severity values
      const severityA = severityOrder[a.severity] || 0;
      const severityB = severityOrder[b.severity] || 0;
      return severityB - severityA;
    }
    if (sortBy === 'votes') {
      // Handle potential missing votes
      const votesA = a.votes ?? 0;
      const votesB = b.votes ?? 0;
      return votesB - votesA;
    }
    return 0;
  });

  // --- getStatusClass and getSeverityClass functions are removed from here ---

  // --- Render Logic ---
  if (isLoadingObstacles) {
    return <div>Loading obstacles...</div>;
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
        </button>
      )}

      <div className="obstacle-reports">
        <div className="report-cta">
          <button className="report-btn" onClick={onStartReporting}>
            Report a New Obstacle
          </button>
          <p className="report-info">
            Help others by reporting accessibility obstacles on campus!
          </p>
        </div>

        {/* --- Controls Section (remains the same) --- */}
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

        {/* --- List Section (Uses the new component) --- */}
        <div className="reports-list">
          {sortedReports.length > 0 ? (
            sortedReports.map(report => (
              // Use the new ObstacleReportCard component
              <ObstacleReportCard key={report.id || report.obstacle_id} report={report} />
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
