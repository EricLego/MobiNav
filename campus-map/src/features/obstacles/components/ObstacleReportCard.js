// src/features/obstacles/components/ObstacleReportCard.js
import React from 'react';
import './ObstacleReportCard.css'; // Create or reuse styles

// Helper function to get status class for styling
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

// Helper function to get severity class for styling
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

const ObstacleReportCard = ({ report }) => {
  if (!report) {
    return null; // Or some placeholder if a report is expected but missing
  }

  console.log(report);

  // Basic date formatting (consider using a library like date-fns for more robust formatting)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return dateString; // Fallback to original string
    }
  };


  return (
    <div className="report-card"> {/* Use a consistent class name */}
      <div className="report-header">
        {/* Use a more descriptive heading if possible, maybe type + location? */}
        <h3>{report.description || 'Unknown Location'}</h3>
        <span className={`report-status ${getStatusClass(report.status)}`}>
          {report.status || 'Unknown'}
        </span>
      </div>

      <p className="report-image">{report.image || 'No image provided.'}</p>

      <div className="report-meta">
        <span className={`report-severity ${getSeverityClass(report.severity)}`}>
          {report.severity || 'N/A'}
        </span>
        <span className="report-date">Reported: {formatDate(report.reportedAt)}</span>
        {report.updatedAt && (
          <span className="report-update">Updated: {formatDate(report.updatedAt)}</span>
        )}
      </div>

      {/* Consider making actions functional later */}
      <div className="report-actions">
        <button className="vote-btn" disabled> {/* Disable buttons for now */}
          <span className="vote-count">{report.votes ?? 0}</span>
          <span className="vote-icon">👍</span>
          Upvote
        </button>
        <button className="share-btn" disabled>Share</button>
        <button className="details-btn" disabled>View Details</button>
      </div>
    </div>
  );
};

export default ObstacleReportCard;
