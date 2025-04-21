import React, { useState, useEffect, useContext } from 'react';
import { AccessibilityContext } from '../../../App';
import './ObstacleReports.css';

const ObstacleReports = () => {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'resolved'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'severity'
  
  // Mock data - in a real app, this would come from your API
  useEffect(() => {
    const mockReports = [
      {
        id: 1,
        location: 'Engineering Building',
        details: 'Elevator out of service on 2nd floor',
        reportedBy: 'Student',
        reportedAt: '2025-03-15',
        status: 'Under Review',
        severity: 'High',
        updatedAt: '2025-03-16',
        votes: 12,
      },
      {
        id: 2,
        location: 'Path near Student Center',
        details: 'Construction blocking wheelchair access',
        reportedBy: 'Faculty',
        reportedAt: '2025-03-16',
        status: 'Pending',
        severity: 'High',
        updatedAt: null,
        votes: 5,
      },
      {
        id: 3,
        location: 'Library',
        details: 'Automatic door not functioning',
        reportedBy: 'Staff',
        reportedAt: '2025-03-14',
        status: 'Resolved',
        severity: 'Medium',
        updatedAt: '2025-03-17',
        votes: 3,
      },
      {
        id: 4,
        location: 'Parking Deck A',
        details: 'Handicap parking spaces blocked',
        reportedBy: 'Student',
        reportedAt: '2025-03-17',
        status: 'Under Review',
        severity: 'Medium',
        updatedAt: null,
        votes: 7,
      },
    ];
    
    setReports(mockReports);
  }, []);
  
  // Function to filter reports
  const filteredReports = reports.filter(report => {
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
  
  const { accessibilitySettings } = useContext(AccessibilityContext);

  return (
    <div className={`page-container ${accessibilitySettings.highContrast ? 'high-contrast' : ''} ${accessibilitySettings.largeText ? 'large-text' : ''}`}>
      
      <div className="obstacle-reports">
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
      
      <div className="report-cta">
        <button className="report-btn">
          Report a New Obstacle
        </button>
        <p className="report-info">
          Help others by reporting accessibility obstacles on campus!
        </p>
      </div>
      </div>
    </div>
  );
};

export default ObstacleReports;