import React, { useState, useEffect, useContext, useRef } from 'react';
import { AccessibilityContext, UserPreferencesContext } from '../App';
import Header from './Header';
import '../styles/ObstacleReports.css';

const ObstacleReports = () => {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'resolved'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'severity'
  const [isLoading, setIsLoading] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [formError, setFormError] = useState('');
  const formRef = useRef(null);
  
  // New obstacle form state
  const [newObstacle, setNewObstacle] = useState({
    location: '',
    latitude: '',
    longitude: '',
    obstacle_type: 'construction',
    description: '',
    reported_by: '',
    severity: 'Medium'
  });
  
  // Get API URL from context
  const { API_BASE_URL } = useContext(UserPreferencesContext);
  
  // Fetch obstacles from backend API
  useEffect(() => {
    const fetchObstacles = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL || ''}/api/obstacles`);
        const data = await response.json();
        
        if (data.obstacles) {
          // Transform backend data to match frontend format
          const formattedReports = data.obstacles.map(obstacle => ({
            id: obstacle.id,
            location: obstacle.location,
            details: obstacle.description,
            reportedBy: obstacle.reported_by || 'Anonymous',
            reportedAt: new Date(obstacle.reported_at).toLocaleDateString(),
            status: obstacle.status,
            severity: getSeverityFromType(obstacle.obstacle_type),
            updatedAt: obstacle.updated_at ? new Date(obstacle.updated_at).toLocaleDateString() : null,
            votes: Math.floor(Math.random() * 15), // Placeholder until we implement voting
            obstacle_type: obstacle.obstacle_type,
            latitude: obstacle.latitude,
            longitude: obstacle.longitude
          }));
          
          setReports(formattedReports);
        }
      } catch (error) {
        console.error("Failed to fetch obstacles:", error);
        // If API fails, use mock data as fallback
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
            obstacle_type: 'elevator_outage'
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
            obstacle_type: 'construction'
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
            obstacle_type: 'temporary'
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
            obstacle_type: 'temporary'
          },
        ];
        
        setReports(mockReports);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchObstacles();
  }, [API_BASE_URL]);
  
  // Function to determine severity based on obstacle type
  const getSeverityFromType = (type) => {
    switch (type) {
      case 'elevator_outage':
      case 'stairs_only':
        return 'High';
      case 'construction':
      case 'steep_incline':
        return 'Medium';
      case 'rough_terrain':
      case 'temporary':
      default:
        return 'Low';
    }
  };
  
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
  
  // Function to handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewObstacle(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Basic form validation
    if (!newObstacle.location || !newObstacle.description) {
      setFormError('Please fill out all required fields');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Format the data for API
      const obstacleData = {
        location: newObstacle.location,
        latitude: parseFloat(newObstacle.latitude) || 33.9391, // Default to campus center if not provided
        longitude: parseFloat(newObstacle.longitude) || -84.5197,
        obstacle_type: newObstacle.obstacle_type,
        description: newObstacle.description,
        reported_by: newObstacle.reported_by || 'Anonymous'
      };
      
      // Post to API
      const response = await fetch(`${API_BASE_URL || ''}/api/obstacles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(obstacleData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error submitting report');
      }
      
      const data = await response.json();
      
      // Add the new report to the list with frontend-specific formatting
      const newReport = {
        id: data.id,
        location: data.location,
        details: data.description,
        reportedBy: data.reported_by || 'Anonymous',
        reportedAt: new Date(data.reported_at).toLocaleDateString(),
        status: data.status,
        severity: getSeverityFromType(data.obstacle_type),
        updatedAt: null,
        votes: 0,
        obstacle_type: data.obstacle_type,
        latitude: data.latitude,
        longitude: data.longitude
      };
      
      setReports(prev => [newReport, ...prev]);
      
      // Reset form and close it
      setNewObstacle({
        location: '',
        latitude: '',
        longitude: '',
        obstacle_type: 'construction',
        description: '',
        reported_by: '',
        severity: 'Medium'
      });
      
      setShowReportForm(false);
      
      // Show success message or notification
      alert('Obstacle report submitted successfully!');
      
    } catch (error) {
      console.error('Error submitting obstacle report:', error);
      setFormError(error.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsLoading(false);
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
        
        {isLoading && !showReportForm ? (
          <div className="loading">
            <p>Loading obstacle reports...</p>
          </div>
        ) : (
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
        )}
        
        {showReportForm ? (
          <div className="report-form-container">
            <h2>Report a New Accessibility Obstacle</h2>
            {formError && <div className="form-error">{formError}</div>}
            <form onSubmit={handleSubmit} ref={formRef} className="report-form">
              <div className="form-group">
                <label htmlFor="location">Location*</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={newObstacle.location}
                  onChange={handleInputChange}
                  placeholder="Building or path location"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="latitude">Latitude</label>
                  <input
                    type="number"
                    id="latitude"
                    name="latitude"
                    value={newObstacle.latitude}
                    onChange={handleInputChange}
                    placeholder="e.g. 33.9391"
                    step="0.0001"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="longitude">Longitude</label>
                  <input
                    type="number"
                    id="longitude"
                    name="longitude"
                    value={newObstacle.longitude}
                    onChange={handleInputChange}
                    placeholder="e.g. -84.5197"
                    step="0.0001"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="obstacle_type">Obstacle Type*</label>
                <select
                  id="obstacle_type"
                  name="obstacle_type"
                  value={newObstacle.obstacle_type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="construction">Construction Site</option>
                  <option value="elevator_outage">Elevator Out of Service</option>
                  <option value="stairs_only">Stairs Only (No Ramp)</option>
                  <option value="steep_incline">Steep Incline</option>
                  <option value="rough_terrain">Rough Terrain</option>
                  <option value="pathway_closure">Pathway Closure</option>
                  <option value="temporary">Temporary Obstacle</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description*</label>
                <textarea
                  id="description"
                  name="description"
                  value={newObstacle.description}
                  onChange={handleInputChange}
                  placeholder="Describe the obstacle and how it affects accessibility"
                  rows="4"
                  required
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="reported_by">Your Name (Optional)</label>
                <input
                  type="text"
                  id="reported_by"
                  name="reported_by"
                  value={newObstacle.reported_by}
                  onChange={handleInputChange}
                  placeholder="Anonymous"
                />
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowReportForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="report-cta">
            <button
              className="report-btn"
              onClick={() => setShowReportForm(true)}
            >
              Report a New Obstacle
            </button>
            <p className="report-info">
              Help others by reporting accessibility obstacles on campus!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ObstacleReports;