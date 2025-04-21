from flask import Blueprint, jsonify, request
from app.models import Building, Entrance, Path, Obstacle, ParkingLot, AccessibilityFeature
from app import db
from datetime import datetime
import requests
import os

# Create Blueprint
main = Blueprint('main', __name__)

# --- Get OSRM URL from environment variable ---
# Example: OSRM_URL=http://localhost:5000 in your .env file
OSRM_URL = os.getenv("OSRM_URL", "http://10.96.33.120:5002") # Default to public server if not set


#-------------------------------------------------------------------------
# Building Methods
#-------------------------------------------------------------------------

# GET all buildings
@main.route('/api/buildings', methods=['GET'])
def get_buildings():
    buildings = Building.query.all()
    result = []
    for building in buildings:
        result.append({
            'building_id': building.building_id,
            'name': building.name,
            'address': building.address,
            'street': building.street,
            'city': building.city,
            'state': building.state,
            'zip_code': building.zip_code,
            'latitude': float(building.latitude) if building.latitude else None,
            'longitude': float(building.longitude) if building.longitude else None,
            'updated_at': building.updated_at.isoformat() if building.updated_at else None
        })
    return jsonify(result)

# GET a specific building
@main.route('/api/buildings/<int:building_id>', methods=['GET'])
def get_building(building_id):
    building = Building.query.get_or_404(building_id)
    result = {
        'building_id': building.building_id,
        'name': building.name,
        'address': building.address,
        'street': building.street,
        'city': building.city,
        'state': building.state,
        'zip_code': building.zip_code,
        'latitude': float(building.latitude) if building.latitude else None,
        'longitude': float(building.longitude) if building.longitude else None,
        'updated_at': building.updated_at.isoformat() if building.updated_at else None
    }
    return jsonify(result)

# POST a new building
@main.route('/api/buildings', methods=['POST'])
def create_building():
    data = request.json
    new_building = Building(
        name=data.get('name'),
        address=data.get('address'),
        street=data.get('street'),
        city=data.get('city', 'Marietta'),
        state=data.get('state', 'GA'),
        zip_code=data.get('zip_code', '30060'),
        latitude=data.get('latitude'),
        longitude=data.get('longitude')
    )
    db.session.add(new_building)
    db.session.commit()
    
    return jsonify({
        'building_id': new_building.building_id,
        'name': new_building.name,
        'address': new_building.address,
        'street': new_building.street,
        'city': new_building.city,
        'state': new_building.state,
        'zip_code': new_building.zip_code,
        'latitude': float(new_building.latitude) if new_building.latitude else None,
        'longitude': float(new_building.longitude) if new_building.longitude else None,
        'updated_at': new_building.updated_at.isoformat() if new_building.updated_at else None
    }), 201

# PUT (update) a building
@main.route('/api/buildings/<int:building_id>', methods=['PUT'])
def update_building(building_id):
    building = Building.query.get_or_404(building_id)
    data = request.json
    
    building.name = data.get('name', building.name)
    building.address = data.get('address', building.address)
    building.street = data.get('street', building.street)
    building.city = data.get('city', building.city)
    building.state = data.get('state', building.state)
    building.zip_code = data.get('zip_code', building.zip_code)
    building.latitude = data.get('latitude', building.latitude)
    building.longitude = data.get('longitude', building.longitude)
    
    db.session.commit()
    
    return jsonify({
        'building_id': building.building_id,
        'name': building.name,
        'address': building.address,
        'street': building.street,
        'city': building.city,
        'state': building.state,
        'zip_code': building.zip_code,
        'latitude': float(building.latitude) if building.latitude else None,
        'longitude': float(building.longitude) if building.longitude else None,
        'updated_at': building.updated_at.isoformat() if building.updated_at else None
    })

# DELETE a building
@main.route('/api/buildings/<int:building_id>', methods=['DELETE'])
def delete_building(building_id):
    building = Building.query.get_or_404(building_id)

    # --- Check for related items and get their IDs ---
    conflicting_features = AccessibilityFeature.query.filter_by(building_id=building_id).all()
    conflicting_entrances = Entrance.query.filter_by(building_id=building_id).all() # Also check entrances

    has_conflicts = False
    related_items_details = []

    if conflicting_features:
        has_conflicts = True
        feature_ids = [f.feature_id for f in conflicting_features] # Assuming primary key is feature_id
        related_items_details.append(f"Accessibility Features (IDs: {', '.join(map(str, feature_ids))})")

    if conflicting_entrances:
        has_conflicts = True
        entrance_ids = [e.entrance_id for e in conflicting_entrances]
        related_items_details.append(f"Entrances (IDs: {', '.join(map(str, entrance_ids))})")

    if has_conflicts:
        error_message = (
            f"Cannot delete building {building_id} ({building.name}). "
            f"It is still referenced by: {'; '.join(related_items_details)}."
        )
        return jsonify({"error": error_message}), 409 # 409 Conflict

    # --- Proceed with deletion if no related items found ---
    try:
        db.session.delete(building)
        db.session.commit()
        return jsonify({'message': f'Building {building_id} ({building.name}) deleted'}), 200
    except IntegrityError as ie: # Catch specific IntegrityError first
        db.session.rollback()
        # This is a fallback in case the initial check missed something (less likely now)
        print(f"IntegrityError during building deletion commit: {ie}")
        return jsonify({"error": f"Cannot delete building {building_id} due to a database constraint. Please check related items."}), 409
    except Exception as e:
        db.session.rollback()
        print(f"Error during building deletion commit: {e}") # Log other unexpected errors
        return jsonify({"error": f"Failed to delete building {building_id}. An unexpected error occurred."}), 500


#-------------------------------------------------------------------------
# Indoor View Methods
#-------------------------------------------------------------------------

# GET indoor details (floor list) for a specific building
@main.route('/api/buildings/<int:building_id>/indoor', methods=['GET'])
def get_building_indoor_data(building_id):
    building = Building.query.get_or_404(building_id)

    # --- Mock Floor Data (Replace with actual data retrieval later) ---
    # This data should ideally come from your database or a configuration file
    mock_floors = []
    if building_id == 1: # Example: Howell Hall
        mock_floors = [
            {'level': 0, 'name': 'Ground Floor', 'isDefault': True},
            {'level': 1, 'name': 'First Floor'},
            {'level': 2, 'name': 'Second Floor'},
        ]
    elif building_id == 2: # Example: Recreation Center
         mock_floors = [
            {'level': 1, 'name': 'Main Level', 'isDefault': True},
            {'level': 2, 'name': 'Upper Level'},
        ]
    elif building_id == 3: # Example: Engineering Building (Q)
        mock_floors = [
            {'level': 1, 'name': 'First Floor', 'isDefault': True},
            {'level': 2, 'name': 'Second Floor'},
            {'level': 3, 'name': 'Third Floor'},
        ]
    else:
        # Default or empty if no specific mock data exists for the building
        mock_floors = [{'level': 1, 'name': 'Main Floor', 'isDefault': True}]
    # --- End Mock Floor Data ---

    result = {
        'building_id': building.building_id,
        'name': building.name,
        'floors': mock_floors
        # You could add other indoor-specific details here if needed
        # 'defaultViewpoint': { 'lat': ..., 'lng': ..., 'zoom': ... }
    }
    return jsonify(result)

# GET GeoJSON floor plan for a specific floor level
@main.route('/api/buildings/<int:building_id>/floors/<floor_level>', methods=['GET'])
def get_floor_plan(building_id, floor_level):
    # Check if the building exists
    building = Building.query.get_or_404(building_id)

    # --- Mock GeoJSON Data (Replace with actual data retrieval later) ---
    # In a real application, you would load this from a file, database,
    # or generate it based on stored geometry.
    # The structure should be a valid GeoJSON FeatureCollection or Feature.
    mock_geojson = {
        "type": "FeatureCollection",
        "properties": {
            "building_id": building_id,
            "level": floor_level,
            # Optional: Add viewpoint specific to this floor
            "viewpoint": {
                 "center": {"lat": float(building.latitude or 33.9386), "lng": float(building.longitude or -84.5187)},
                 "zoom": 19 # Default zoom for floor plan
            }
        },
        "features": [
            # Example Feature 1: A Room (Polygon)
            {
                "type": "Feature",
                "properties": { "category": "room", "name": f"Room {floor_level}01", "ref": f"{floor_level}01" },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        # Example coordinates (replace with real ones)
                        [float(building.longitude or -84.5187) - 0.0001, float(building.latitude or 33.9386) + 0.0001],
                        [float(building.longitude or -84.5187) + 0.0001, float(building.latitude or 33.9386) + 0.0001],
                        [float(building.longitude or -84.5187) + 0.0001, float(building.latitude or 33.9386) - 0.0001],
                        [float(building.longitude or -84.5187) - 0.0001, float(building.latitude or 33.9386) - 0.0001],
                        [float(building.longitude or -84.5187) - 0.0001, float(building.latitude or 33.9386) + 0.0001]
                    ]]
                }
            },
            # Example Feature 2: An Elevator (Point)
            {
                "type": "Feature",
                "properties": { "category": "elevator", "ref": "EL1", "wheelchair": "yes" },
                "geometry": {
                    "type": "Point",
                    # Example coordinates (replace with real ones)
                    "coordinates": [float(building.longitude or -84.5187), float(building.latitude or 33.9386)]
                }
            }
            # Add more features like walls, doors, stairs, amenities etc.
        ]
    }
    # --- End Mock GeoJSON Data ---

    # Basic check if the requested floor level exists in mock data (optional)
    # You might want more robust checking against the result from the /indoor endpoint
    # if not any(f['level'] == int(floor_level) for f in get_building_indoor_data(building_id).get_json().get('floors', [])):
    #     return jsonify({"error": f"Floor level {floor_level} not found for building {building_id}"}), 404

    # Return the mock GeoJSON
    return jsonify(mock_geojson)


#-------------------------------------------------------------------------
# Entrance Methods
#-------------------------------------------------------------------------

# GET all entrances
@main.route('/api/entrances', methods=['GET'])
def get_entrances():
    entrances = Entrance.query.all()
    result = []
    for entrance in entrances:
        result.append({
            'entrance_id': entrance.entrance_id,
            'building_id': entrance.building_id,
            'entrance_name': entrance.entrance_name,
            'latitude': float(entrance.latitude) if entrance.latitude else None,
            'longitude': float(entrance.longitude) if entrance.longitude else None,
            'floor_level': entrance.floor_level,
            'wheelchair_accessible': entrance.wheelchair_accessible,
            'updated_at': entrance.updated_at.isoformat() if entrance.updated_at else None
        })
    return jsonify(result)

# GET all entrances for a specific building
@main.route('/api/buildings/<int:building_id>/entrances', methods=['GET'])
def get_building_entrances(building_id):
    # First check if the building exists
    building = Building.query.get_or_404(building_id)
    entrances = Entrance.query.filter_by(building_id=building_id).all()
    result = []
    for entrance in entrances:
        result.append({
            'entrance_id': entrance.entrance_id,
            'building_id': entrance.building_id,
            'entrance_name': entrance.entrance_name,
            'latitude': float(entrance.latitude) if entrance.latitude else None,
            'longitude': float(entrance.longitude) if entrance.longitude else None,
            'floor_level': entrance.floor_level,
            'wheelchair_accessible': entrance.wheelchair_accessible,
            'updated_at': entrance.updated_at.isoformat() if entrance.updated_at else None
        })
    return jsonify(result)

# GET a specific entrance
@main.route('/api/entrances/<int:entrance_id>', methods=['GET'])
def get_entrance(entrance_id):
    entrance = Entrance.query.get_or_404(entrance_id)
    result = {
        'entrance_id': entrance.entrance_id,
        'building_id': entrance.building_id,
        'entrance_name': entrance.entrance_name,
        'latitude': float(entrance.latitude) if entrance.latitude else None,
        'longitude': float(entrance.longitude) if entrance.longitude else None,
        'floor_level': entrance.floor_level,
        'wheelchair_accessible': entrance.wheelchair_accessible,
        'updated_at': entrance.updated_at.isoformat() if entrance.updated_at else None
    }
    return jsonify(result)

# POST a new entrance
@main.route('/api/entrances', methods=['POST'])
def create_entrance():
    data = request.json
    new_entrance = Entrance(
        building_id=data.get('building_id'),
        entrance_name=data.get('entrance_name', ''),
        latitude=data.get('latitude'),
        longitude=data.get('longitude'),
        floor_level=data.get('floor_level', 1),
        wheelchair_accessible=data.get('wheelchair_accessible', False)
    )
    db.session.add(new_entrance)
    db.session.commit()
    
    return jsonify({
        'entrance_id': new_entrance.entrance_id,
        'building_id': new_entrance.building_id,
        'entrance_name': new_entrance.entrance_name,
        'latitude': float(new_entrance.latitude) if new_entrance.latitude else None,
        'longitude': float(new_entrance.longitude) if new_entrance.longitude else None,
        'floor_level': new_entrance.floor_level,
        'wheelchair_accessible': new_entrance.wheelchair_accessible,
        'updated_at': new_entrance.updated_at.isoformat() if new_entrance.updated_at else None
    }), 201

# PUT (update) an entrance
@main.route('/api/entrances/<int:entrance_id>', methods=['PUT'])
def update_entrance(entrance_id):
    entrance = Entrance.query.get_or_404(entrance_id)
    data = request.json
    
    entrance.building_id = data.get('building_id', entrance.building_id)
    entrance.entrance_name = data.get('entrance_name', entrance.entrance_name)
    entrance.latitude = data.get('latitude', entrance.latitude)
    entrance.longitude = data.get('longitude', entrance.longitude)
    entrance.floor_level = data.get('floor_level', entrance.floor_level)
    entrance.wheelchair_accessible = data.get('wheelchair_accessible', entrance.wheelchair_accessible)
    
    db.session.commit()
    
    return jsonify({
        'entrance_id': entrance.entrance_id,
        'building_id': entrance.building_id,
        'entrance_name': entrance.entrance_name,
        'latitude': float(entrance.latitude) if entrance.latitude else None,
        'longitude': float(entrance.longitude) if entrance.longitude else None,
        'floor_level': entrance.floor_level,
        'wheelchair_accessible': entrance.wheelchair_accessible,
        'updated_at': entrance.updated_at.isoformat() if entrance.updated_at else None
    })

# DELETE an entrance
@main.route('/api/entrances/<int:entrance_id>', methods=['DELETE'])
def delete_entrance(entrance_id):
    entrance = Entrance.query.get_or_404(entrance_id)
    db.session.delete(entrance)
    db.session.commit()
    return jsonify({'message': f'Entrance {entrance_id} deleted'}), 200

#-------------------------------------------------------------------------
# Path Methods
#-------------------------------------------------------------------------

# GET all paths
@main.route('/api/paths', methods=['GET'])
def get_paths():
    paths = Path.query.all()
    result = []
    for path in paths:
        result.append({
            'path_id': path.path_id,
            'start_location_id': path.start_location_id,
            'end_location_id': path.end_location_id,
            'had_incline': path.had_incline,  # Note: field name in schema is 'had_incline'
            'has_stairs': path.has_stairs,
            'is_wheelchair_accessible': path.is_wheelchair_accessible,
            'is_paved': path.is_paved,
            'path_type': path.path_type,
            'distance': float(path.distance) if path.distance else None,
            'updated_at': path.updated_at.isoformat() if path.updated_at else None
        })
    return jsonify(result)

# GET a specific path
@main.route('/api/paths/<int:path_id>', methods=['GET'])
def get_path(path_id):
    path = Path.query.get_or_404(path_id)
    result = {
        'path_id': path.path_id,
        'start_location_id': path.start_location_id,
        'end_location_id': path.end_location_id,
        'had_incline': path.had_incline,
        'has_stairs': path.has_stairs,
        'is_wheelchair_accessible': path.is_wheelchair_accessible,
        'is_paved': path.is_paved,
        'path_type': path.path_type,
        'distance': float(path.distance) if path.distance else None,
        'updated_at': path.updated_at.isoformat() if path.updated_at else None
    }
    return jsonify(result)

# POST a new path
@main.route('/api/paths', methods=['POST'])
def create_path():
    data = request.json
    new_path = Path(
        start_location_id=data.get('start_location_id'),
        end_location_id=data.get('end_location_id'),
        had_incline=data.get('had_incline', False),  # Match field name in schema
        has_stairs=data.get('has_stairs', False),
        is_wheelchair_accessible=data.get('is_wheelchair_accessible', True),
        is_paved=data.get('is_paved', True),
        path_type=data.get('path_type', ['pedestrian']),  # Array in schema
        distance=data.get('distance')
    )
    db.session.add(new_path)
    db.session.commit()
    
    return jsonify({
        'path_id': new_path.path_id,
        'start_location_id': new_path.start_location_id,
        'end_location_id': new_path.end_location_id,
        'had_incline': new_path.had_incline,
        'has_stairs': new_path.has_stairs,
        'is_wheelchair_accessible': new_path.is_wheelchair_accessible,
        'is_paved': new_path.is_paved,
        'path_type': new_path.path_type,
        'distance': float(new_path.distance) if new_path.distance else None,
        'updated_at': new_path.updated_at.isoformat() if new_path.updated_at else None
    }), 201

# PUT (update) a path
@main.route('/api/paths/<int:path_id>', methods=['PUT'])
def update_path(path_id):
    path = Path.query.get_or_404(path_id)
    data = request.json
    
    path.start_location_id = data.get('start_location_id', path.start_location_id)
    path.end_location_id = data.get('end_location_id', path.end_location_id)
    path.had_incline = data.get('had_incline', path.had_incline)
    path.has_stairs = data.get('has_stairs', path.has_stairs)
    path.is_wheelchair_accessible = data.get('is_wheelchair_accessible', path.is_wheelchair_accessible)
    path.is_paved = data.get('is_paved', path.is_paved)
    path.path_type = data.get('path_type', path.path_type)
    path.distance = data.get('distance', path.distance)
    
    db.session.commit()
    
    return jsonify({
        'path_id': path.path_id,
        'start_location_id': path.start_location_id,
        'end_location_id': path.end_location_id,
        'had_incline': path.had_incline,
        'has_stairs': path.has_stairs,
        'is_wheelchair_accessible': path.is_wheelchair_accessible,
        'is_paved': path.is_paved,
        'path_type': path.path_type,
        'distance': float(path.distance) if path.distance else None,
        'updated_at': path.updated_at.isoformat() if path.updated_at else None
    })

# DELETE a path
@main.route('/api/paths/<int:path_id>', methods=['DELETE'])
def delete_path(path_id):
    path = Path.query.get_or_404(path_id)
    db.session.delete(path)
    db.session.commit()
    return jsonify({'message': f'Path {path_id} deleted'}), 200

#-------------------------------------------------------------------------
# Obstacle Methods
#-------------------------------------------------------------------------

# GET all obstacles
@main.route('/api/obstacles', methods=['GET'])
def get_obstacles():
    obstacles = Obstacle.query.all()
    result = []
    for obstacle in obstacles:
        result.append({
            'obstacle_id': obstacle.obstacle_id,
            'latitude': float(obstacle.latitude) if obstacle.latitude else None,
            'longitude': float(obstacle.longitude) if obstacle.longitude else None,
            'user_id': obstacle.user_id,
            'building_id': obstacle.building_id,
            'path_id': obstacle.path_id,
            'entrance_id': obstacle.entrance_id,
            'description': obstacle.description,
            'severity_level': obstacle.severity_level,
            'reported_at': obstacle.reported_at.isoformat() if obstacle.reported_at else None,
            'status': obstacle.status
        })
    return jsonify(result)

# GET a specific obstacle
@main.route('/api/obstacles/<int:obstacle_id>', methods=['GET'])
def get_obstacle(obstacle_id):
    obstacle = Obstacle.query.get_or_404(obstacle_id)
    result = {
        'obstacle_id': obstacle.obstacle_id,
        'latitude': float(obstacle.latitude) if obstacle.latitude else None,
        'longitude': float(obstacle.longitude) if obstacle.longitude else None,
        'user_id': obstacle.user_id,
        'building_id': obstacle.building_id,
        'path_id': obstacle.path_id,
        'entrance_id': obstacle.entrance_id,
        'description': obstacle.description,
        'severity_level': obstacle.severity_level,
        'reported_at': obstacle.reported_at.isoformat() if obstacle.reported_at else None,
        'status': obstacle.status
    }
    return jsonify(result)

# POST a new obstacle
@main.route('/api/obstacles', methods=['POST'])
def create_obstacle():
    data = request.json
    
    new_obstacle = Obstacle(
        user_id=data.get('user_id'),
        latitude=data.get('latitude'),
        longitude=data.get('longitude'),
        building_id=data.get('building_id'),
        path_id=data.get('path_id'),
        entrance_id=data.get('entrance_id'),
        description=data.get('description', ''),
        severity_level=data.get('severity_level', 1),  # Integer in schema
        reported_at=datetime.now(),
        status=data.get('status', 'Pending')
    )
    db.session.add(new_obstacle)
    db.session.commit()
    
    return jsonify({
        'obstacle_id': new_obstacle.obstacle_id,
        'latitude': float(new_obstacle.latitude) if new_obstacle.latitude else None,
        'longitude': float(new_obstacle.longitude) if new_obstacle.longitude else None,
        'user_id': new_obstacle.user_id,
        'building_id': new_obstacle.building_id,
        'path_id': new_obstacle.path_id,
        'entrance_id': new_obstacle.entrance_id,
        'description': new_obstacle.description,
        'severity_level': new_obstacle.severity_level,
        'reported_at': new_obstacle.reported_at.isoformat() if new_obstacle.reported_at else None,
        'status': new_obstacle.status
    }), 201

# PUT (update) an obstacle
@main.route('/api/obstacles/<int:obstacle_id>', methods=['PUT'])
def update_obstacle(obstacle_id):
    obstacle = Obstacle.query.get_or_404(obstacle_id)
    data = request.json
    
    obstacle.user_id = data.get('user_id', obstacle.user_id)
    obstacle.building_id = data.get('building_id', obstacle.building_id)
    obstacle.path_id = data.get('path_id', obstacle.path_id)
    obstacle.entrance_id = data.get('entrance_id', obstacle.entrance_id)
    obstacle.description = data.get('description', obstacle.description)
    obstacle.severity_level = data.get('severity_level', obstacle.severity_level)
    obstacle.status = data.get('status', obstacle.status)
    
    db.session.commit()
    
    return jsonify({
        'obstacle_id': obstacle.obstacle_id,
        'user_id': obstacle.user_id,
        'building_id': obstacle.building_id,
        'path_id': obstacle.path_id,
        'entrance_id': obstacle.entrance_id,
        'description': obstacle.description,
        'severity_level': obstacle.severity_level,
        'reported_at': obstacle.reported_at.isoformat() if obstacle.reported_at else None,
        'status': obstacle.status
    })

# DELETE an obstacle
@main.route('/api/obstacles/<int:obstacle_id>', methods=['DELETE'])
def delete_obstacle(obstacle_id):
    obstacle = Obstacle.query.get_or_404(obstacle_id)
    db.session.delete(obstacle)
    db.session.commit()
    return jsonify({'message': f'Obstacle {obstacle_id} deleted'}), 200



#-------------------------------------------------------------------------
# Helper Methods
#-------------------------------------------------------------------------

# --- Helper function to call OSRM ---
def get_osrm_route(start_coords, end_coords, accessibility_params):
    """
    Fetches route from OSRM service.
    start_coords: tuple (lat, lng)
    end_coords: tuple (lat, lng)
    accessibility_params: dict containing preferences like 'avoidStairs'
    """
    # Determine which OSRM profile to use based on accessibility
    # Example: Use 'foot-accessible' profile if avoidStairs is true
    profile = "foot-accessible" if accessibility_params.get("avoidStairs", False) else "foot"
    # Construct OSRM API request URL
    # Format: {osrm_url}/route/v1/{profile}/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson&steps=true
    url = (
        f"{OSRM_URL}/route/v1/{profile}/"
        f"{start_coords[1]},{start_coords[0]};{end_coords[1]},{end_coords[0]}"
        f"?overview=full&geometries=geojson&steps=true" # Request full geometry as GeoJSON and steps
    )

    try:
        print(f"Requesting OSRM URL: {url}") # Log the request URL
        response = requests.get(url, timeout=10) # Add timeout
        response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
        data = response.json()
        print(f"OSRM Response: {data}") # Log the response

        if data.get("code") == "Ok" and data.get("routes"):
            route = data["routes"][0]
            # Extract relevant information
            geometry = route["geometry"]["coordinates"] # GeoJSON format [lng, lat]
            # Convert GeoJSON [lng, lat] to {lat, lng} for frontend
            formatted_geometry = [{"lat": coord[1], "lng": coord[0]} for coord in geometry]

            # Extract steps/instructions if needed
            instructions = []
            if route.get("legs"):
                for leg in route["legs"]:
                    if leg.get("steps"):
                        for step in leg["steps"]:
                            # --- Use .get() for potentially missing keys ---
                            maneuver_data = step.get("maneuver", {}) # Get maneuver safely
                            instructions.append({
                                "maneuver": maneuver_data.get("type", "unknown"), # Get type safely
                                "instruction": maneuver_data.get("instruction", ""), # Get instruction safely, default to ""
                                "distance": step.get("distance", 0), # Get distance safely
                                "duration": step.get("duration", 0), # Get duration safely
                                "name": step.get("name", "")
                            })

            # Extract summary
            summary = {
                "distance": route.get("distance"), # meters
                "duration": route.get("duration") # seconds
            }

            return {
                "geometry": formatted_geometry,
                "instructions": instructions,
                "summary": summary,
                "warnings": [] # TODO: Add logic for warnings based on route properties/obstacles
            }
        else:
            raise Exception(f"OSRM API Error: {data.get('code')} - {data.get('message', 'No route found')}")

    except requests.exceptions.RequestException as e:
        print(f"Error connecting to OSRM: {e}")
        raise Exception(f"Could not connect to routing service: {e}")
    except Exception as e:
        print(f"Error processing OSRM response: {e}")
        raise Exception(f"Error getting route from service: {e}")



#-------------------------------------------------------------------------
# Route API Methods
#-------------------------------------------------------------------------

# Original /api/get_route endpoint
@main.route("/api/get_route", methods=["GET"])
def get_route():
    """
    API endpoint to get an optimized walking route.
    Requires 'start' and 'end' parameters in 'lat,lng' format.
    Optional accessibility parameters: 'avoidStairs=true', etc.
    Example: /api/get_route?start=33.9,-84.5&end=33.91,-84.51&avoidStairs=true
    """
    start = request.args.get("start")
    end = request.args.get("end")

    # --- Parse Accessibility Params ---
    accessibility_params = {
        "avoidStairs": request.args.get("avoidStairs", "false").lower() == "true",
        # Add other params as needed (e.g., maxIncline, preferRamps)
        # "maxIncline": request.args.get("maxIncline", type=int),
    }
    # ---------------------------------


    if not start or not end:
        return jsonify({"error": "Missing 'start' or 'end' parameters"}), 400

    try:
        # Parse coordinates
        start_coords = tuple(map(float, start.split(",")))
        end_coords = tuple(map(float, end.split(",")))

        if len(start_coords) != 2 or len(end_coords) != 2:
             raise ValueError("Coordinates must be in 'lat,lng' format")

        # --- Call the OSRM helper ---
        # Note: We removed the 'provider' logic for now, assuming OSRM
        route_data = get_osrm_route(start_coords, end_coords, accessibility_params)
        # ----------------------------

        return jsonify(route_data) # Return the structured route data

    except ValueError as ve:
         print(f"Value Error: {ve}")
         return jsonify({"error": f"Invalid coordinate format: {ve}"}), 400
    except Exception as e:
        print(f"Routing Error: {e}") # Log the specific error on the server
        # Return a generic error to the client
        return jsonify({"error": f"Failed to calculate route. {str(e)}"}), 500


# Add ParkingLot to your imports at the top of routes.py
# from app.models import Building, Entrance, Path, Obstacle, ParkingLot # Add ParkingLot here
# ... other imports ...

#-------------------------------------------------------------------------
# Parking Lot Methods
#-------------------------------------------------------------------------

# GET all parking lots
@main.route('/api/parking_lots', methods=['GET'])
def get_parking_lots():
    try:
        lots = ParkingLot.query.order_by(ParkingLot.name).all() # Order by name for consistency
        return jsonify([lot.to_dict() for lot in lots])
    except Exception as e:
        # Log the error for debugging
        print(f"Error fetching parking lots: {e}")
        return jsonify({"error": "Failed to retrieve parking lots"}), 500

# GET a specific parking lot
@main.route('/api/parking_lots/<int:lot_id>', methods=['GET'])
def get_parking_lot(lot_id):
    try:
        lot = ParkingLot.query.get_or_404(lot_id)
        return jsonify(lot.to_dict())
    except Exception as e:
        print(f"Error fetching parking lot {lot_id}: {e}")
        # get_or_404 handles the Not Found case, this catches other potential errors
        return jsonify({"error": f"Failed to retrieve parking lot {lot_id}"}), 500

# POST a new parking lot
@main.route('/api/parking_lots', methods=['POST'])
def create_parking_lot():
    data = request.json
    if not data or not data.get('name') or data.get('latitude') is None or data.get('longitude') is None:
        return jsonify({"error": "Missing required fields: name, latitude, longitude"}), 400

    try:
        new_lot = ParkingLot(
            name=data['name'],
            latitude=data['latitude'], # Keep as numeric/string, DB handles conversion
            longitude=data['longitude'],
            # Ensure permits is a list, default to empty if not provided
            permits=data.get('permits', []),
            capacity=data.get('capacity') # Optional
        )
        db.session.add(new_lot)
        db.session.commit()
        return jsonify(new_lot.to_dict()), 201
    except Exception as e:
        db.session.rollback() # Rollback in case of error during commit
        print(f"Error creating parking lot: {e}")
        # Check for unique constraint violation (e.g., duplicate name)
        if 'unique constraint' in str(e).lower():
             return jsonify({"error": f"Parking lot with name '{data.get('name')}' already exists."}), 409 # Conflict
        return jsonify({"error": "Failed to create parking lot"}), 500

# PUT (update) a parking lot
@main.route('/api/parking_lots/<int:lot_id>', methods=['PUT'])
def update_parking_lot(lot_id):
    lot = ParkingLot.query.get_or_404(lot_id)
    data = request.json
    if not data:
        return jsonify({"error": "No update data provided"}), 400

    try:
        # Update fields if they are present in the request data
        lot.name = data.get('name', lot.name)
        lot.latitude = data.get('latitude', lot.latitude)
        lot.longitude = data.get('longitude', lot.longitude)
        # Use .get to handle case where 'permits' might not be in update data
        if 'permits' in data:
            lot.permits = data.get('permits', lot.permits) # Allow updating permits
        lot.capacity = data.get('capacity', lot.capacity)
        # updated_at is handled automatically by the trigger/onupdate

        db.session.commit()
        return jsonify(lot.to_dict())
    except Exception as e:
        db.session.rollback()
        print(f"Error updating parking lot {lot_id}: {e}")
        if 'unique constraint' in str(e).lower():
             return jsonify({"error": f"Parking lot name '{data.get('name')}' might already be in use by another lot."}), 409
        return jsonify({"error": f"Failed to update parking lot {lot_id}"}), 500

# DELETE a parking lot
@main.route('/api/parking_lots/<int:lot_id>', methods=['DELETE'])
def delete_parking_lot(lot_id):
    lot = ParkingLot.query.get_or_404(lot_id)
    try:
        db.session.delete(lot)
        db.session.commit()
        return jsonify({'message': f'Parking lot {lot_id} ({lot.name}) deleted'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting parking lot {lot_id}: {e}")
        # Handle potential foreign key constraints if lots are linked elsewhere
        if 'foreign key constraint' in str(e).lower():
            return jsonify({"error": f"Cannot delete parking lot {lot_id} as it might be referenced elsewhere."}), 409
        return jsonify({"error": f"Failed to delete parking lot {lot_id}"}), 500

#-------------------------------------------------------------------------
# End Parking Lot Methods
#-------------------------------------------------------------------------
