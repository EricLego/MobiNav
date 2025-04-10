from flask import Blueprint, jsonify, request
from app.models import Building, Entrance, Path, Obstacle
from app import db
from datetime import datetime

# Create Blueprint
main = Blueprint('main', __name__)

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
    db.session.delete(building)
    db.session.commit()
    return jsonify({'message': f'Building {building_id} deleted'}), 200

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
# Route API Methods
#-------------------------------------------------------------------------

# Original /api/get_route endpoint
@main.route("/api/get_route", methods=["GET"])
def get_route():
    """
    API endpoint to get an optimized walking route.
    Requires 'start' and 'end' parameters in 'lat,lng' format.
    Example request: /api/get_route?start=34.0395,-84.5836&end=34.0365,-84.5822
    """
    start = request.args.get("start")
    end = request.args.get("end")
    provider = request.args.get("provider", "google")  # Default to Google API

    if not start or not end:
        return jsonify({"error": "Missing 'start' or 'end' parameters"}), 400

    try:
        start = tuple(map(float, start.split(",")))
        end = tuple(map(float, end.split(",")))

        if provider == "google":
            route = get_google_route(start, end)
        else:
            route = get_osrm_route(start, end)

        return jsonify({"route": route})

    except Exception as e:
        return jsonify({"error": str(e)}), 500