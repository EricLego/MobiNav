const IndoorViewControls = ({ building, floor, onFloorChange, onClose }) => {
    if (!building) return null;
    
    return (
      <div className="indoor-view-overlay">
        <div className="indoor-view-header">
          <h3>{building.name} - Floor {floor}</h3>
          <div className="floor-selector">
            {building.floors.map(floorOption => (
              <button 
                key={floorOption} 
                className={floorOption === floor ? "active" : ""}
                onClick={() => onFloorChange(floorOption)}
              >
                {floorOption}
              </button>
            ))}
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="indoor-map-container">
          <img 
            src={`/indoor-maps/${building.id}/${floor}.png`}
            alt={`Floor plan for ${building.name}, floor ${floor}`}
            className="indoor-map-image"
          />
          {/* Indoor POIs, elevators, obstacles would be rendered as overlays here */}
        </div>
        <div className="indoor-view-legend">
          <div className="legend-item">
            <span className="legend-icon elevator"></span>
            <span>Elevator</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon stairs"></span>
            <span>Stairs</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon restroom"></span>
            <span>Restrooms</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon obstacle"></span>
            <span>Reported Obstacle</span>
          </div>
        </div>
      </div>
    );
  };
  export default IndoorViewControls;