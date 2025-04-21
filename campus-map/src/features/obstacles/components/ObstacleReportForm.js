// src/features/obstacles/components/ObstacleReportForm.js
import React, { useState, useContext } from 'react';
import { AccessibilityContext } from '../../../App'; // Adjust path if needed
import './ObstacleReportForm.css'; // Create this CSS file

const ObstacleReportForm = ({ location, onSubmit, onCancel }) => {
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Medium'); // Default severity
  const [obstacleType, setObstacleType] = useState(''); // e.g., 'Stairs', 'Blocked Path'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { accessibilitySettings } = useContext(AccessibilityContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!description.trim()) {
        setError("Please provide a description.");
        setIsSubmitting(false);
        return;
    }

    const formData = {
      latitude: location.lat,
      longitude: location.lng,
      description,
      severity,
      type: obstacleType, // Or adjust field name based on API
      // Add any other relevant fields like reportedBy, timestamp (API might handle this)
    };

    try {
      // Call the onSubmit prop passed from MainMapInterface
      await onSubmit(formData);
      // Optionally reset form on success (MainMapInterface will likely close it anyway)
      // setDescription('');
      // setSeverity('Medium');
      // setObstacleType('');
    } catch (err) {
      console.error("Form submission error:", err);
      setError(err.message || "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`obstacle-report-form-container ${accessibilitySettings.highContrast ? 'high-contrast' : ''}`}>
      <form onSubmit={handleSubmit} className="obstacle-report-form">
        <h3 className="form-title">Report New Obstacle</h3>
        <p className="form-location-info">
          Location: Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}
        </p>

        {error && <p className="form-error">{error}</p>}

        <div className="form-group">
          <label htmlFor="obstacle-description">Description:</label>
          <textarea
            id="obstacle-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the obstacle (e.g., 'Broken curb cut', 'Construction blocking sidewalk')"
            required
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="obstacle-severity">Severity:</label>
          <select
            id="obstacle-severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            required
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="obstacle-type">Type (Optional):</label>
          <input
            type="text"
            id="obstacle-type"
            value={obstacleType}
            onChange={(e) => setObstacleType(e.target.value)}
            placeholder="e.g., Stairs, Blocked Path, Ice"
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-btn" disabled={isSubmitting}>
            Cancel Form
          </button>
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ObstacleReportForm;
