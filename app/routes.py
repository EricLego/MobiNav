# Need to edit APIs to make sure that the routing works. 
# This is the main file for the APIs and routing.

from flask import Blueprint, request, jsonify
import os
import requests
from app.models import Obstacle, AccessibilityFeature
from app import db
import math

main = Blueprint("main", __name__)

# Load API key from environment variables
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
if not GOOGLE_MAPS_API_KEY:
    raise ValueError("Missing GOOGLE_MAPS_API_KEY environment variable")

def get_google_route(start, end, wheelchair_accessible=False):
    """
    Fetches an optimized route from Google Maps Directions API.
    :param start: Starting location (latitude,longitude)
    :param end: Destination location (latitude,longitude)
    :param wheelchair_accessible: Boolean indicating if route should be wheelchair accessible
    :return: List of route coordinates
    """
    base_url = "https://maps.googleapis.com/maps/api/directions/json"
    
    params = {
        "origin": f"{start[0]},{start[1]}",
        "destination": f"{end[0]},{end[1]}",
        "mode": "walking",
        "key": GOOGLE_MAPS_API_KEY
    }
    
    # Add accessibility parameters
    if wheelchair_accessible:
        # For Google Maps, specify route preferences to avoid stairs
        # Note: Google doesn't have an explicit wheelchair mode, so we're using alternatives
        params["avoid"] = "highways"  # Avoid highways which might not have sidewalks
        
        # Request alternatives to find routes that might be more accessible
        params["alternatives"] = "true"

    response = requests.get(base_url, params=params)
    data = response.json()

    if data["status"] == "OK":
        # If accessible route is requested, try to find a route that avoids known obstacles
        if wheelchair_accessible and len(data["routes"]) > 1:
            # Get all active obstacles from the database
            obstacles = Obstacle.query.filter_by(active=True).all()
            obstacle_coords = [(o.latitude, o.longitude) for o in obstacles]
            
            # Find route with fewest obstacles near the path
            best_route = None
            min_obstacles = float('inf')
            
            for route_option in data["routes"]:
                route_leg = route_option["legs"][0]
                route_points = [(step["start_location"]["lat"], step["start_location"]["lng"]) for step in route_leg["steps"]]
                route_points.append((route_leg["steps"][-1]["end_location"]["lat"], route_leg["steps"][-1]["end_location"]["lng"]))
                
                # Count obstacles near this route
                obstacles_near_route = count_obstacles_near_route(route_points, obstacle_coords)
                
                if obstacles_near_route < min_obstacles:
                    min_obstacles = obstacles_near_route
                    best_route = route_leg["steps"]
            
            # Use the best route if found, otherwise use the first one
            route = best_route if best_route else data["routes"][0]["legs"][0]["steps"]
        else:
            # Use the first route for non-accessible requests
            route = data["routes"][0]["legs"][0]["steps"]
            
        route_coords = [(step["start_location"]["lat"], step["start_location"]["lng"]) for step in route]
        route_coords.append((route[-1]["end_location"]["lat"], route[-1]["end_location"]["lng"]))  # Add final destination
        return route_coords
    else:
        return {"error": f"Google API Error: {data['status']}"}

def get_osrm_route(start, end, wheelchair_accessible=False):
    """
    Fetches an optimized route using OSRM API.
    :param start: (latitude, longitude)
    :param end: (latitude, longitude)
    :param wheelchair_accessible: Boolean indicating if route should be wheelchair accessible
    :return: List of route coordinates
    """
    # OSRM profile - for wheelchair, we'll use the "foot" profile as base
    profile = "foot"
    
    # Build URL with options
    osrm_url = f"http://router.project-osrm.org/route/v1/{profile}/{start[1]},{start[0]};{end[1]},{end[0]}?overview=full&geometries=geojson"
    
    # For wheelchair accessible routes, we'll add additional options
    # Note that OSRM doesn't have built-in wheelchair accessibility
    # but we can add options like alternatives to find potentially better routes
    if wheelchair_accessible:
        osrm_url += "&alternatives=true"
    
    response = requests.get(osrm_url)
    data = response.json()

    if "routes" in data and len(data["routes"]) > 0:
        if wheelchair_accessible and len(data["routes"]) > 1:
            # Get all active obstacles from the database
            obstacles = Obstacle.query.filter_by(active=True).all()
            obstacle_coords = [(o.latitude, o.longitude) for o in obstacles]
            
            # Find route with fewest obstacles near the path
            best_route = None
            min_obstacles = float('inf')
            
            for route_option in data["routes"]:
                route_coords = [(coord[1], coord[0]) for coord in route_option["geometry"]["coordinates"]]
                
                # Count obstacles near this route
                obstacles_near_route = count_obstacles_near_route(route_coords, obstacle_coords)
                
                if obstacles_near_route < min_obstacles:
                    min_obstacles = obstacles_near_route
                    best_route = route_option
            
            # Use the best route if found, otherwise use the first one
            route = best_route if best_route else data["routes"][0]
        else:
            # Use the first route for non-accessible requests
            route = data["routes"][0]
            
        route_coords = route["geometry"]["coordinates"]
        return [(coord[1], coord[0]) for coord in route_coords]  # Convert [lng, lat] → [lat, lng]
    else:
        return {"error": "OSRM API Error or No Route Found"}

def count_obstacles_near_route(route_coords, obstacle_coords, threshold_meters=30):
    """
    Count the number of obstacles that are within a threshold distance of any point on the route.
    
    :param route_coords: List of (lat, lng) coordinates marking the route
    :param obstacle_coords: List of (lat, lng) coordinates marking obstacles
    :param threshold_meters: Distance threshold in meters
    :return: Count of obstacles near the route
    """
    nearby_obstacles = 0
    
    for obstacle_lat, obstacle_lng in obstacle_coords:
        # Check if obstacle is near any point on the route
        for route_lat, route_lng in route_coords:
            # Calculate approximate distance using Haversine formula
            distance = haversine_distance(route_lat, route_lng, obstacle_lat, obstacle_lng)
            if distance <= threshold_meters:
                nearby_obstacles += 1
                break  # Count this obstacle once and move to next
    
    return nearby_obstacles

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    """
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    r = 6371000  # Radius of earth in meters
    return c * r

@main.route("/api/get_route", methods=["GET"])
def get_route():
    """
    API endpoint to get an optimized walking route.
    Requires 'start' and 'end' parameters in 'lat,lng' format.
    Optional 'wheelchair' parameter (true/false) for accessible routes.
    
    Example request: /api/get_route?start=34.0395,-84.5836&end=34.0365,-84.5822&wheelchair=true
    """
    start = request.args.get("start")
    end = request.args.get("end")
    provider = request.args.get("provider", "google")  # Default to Google API
    wheelchair = request.args.get("wheelchair", "false").lower() == "true"  # Default to non-accessible

    if not start or not end:
        return jsonify({"error": "Missing 'start' or 'end' parameters"}), 400

    try:
        start = tuple(map(float, start.split(",")))
        end = tuple(map(float, end.split(",")))

        if provider == "google":
            route = get_google_route(start, end, wheelchair_accessible=wheelchair)
        else:
            route = get_osrm_route(start, end, wheelchair_accessible=wheelchair)

        return jsonify({
            "route": route,
            "accessible": wheelchair
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@main.route("/api/obstacles", methods=["GET"])
def get_obstacles():
    """
    Get all active obstacles.
    Returns a list of obstacle objects.
    """
    obstacles = Obstacle.query.filter_by(active=True).all()
    return jsonify({"obstacles": [obstacle.to_dict() for obstacle in obstacles]})

@main.route("/api/obstacles", methods=["POST"])
def report_obstacle():
    """
    Report a new obstacle on the map.
    Required parameters: latitude, longitude, obstacle_type
    Optional parameters: description, reported_by (user_id)
    """
    data = request.json
    
    if not data or not all(k in data for k in ["latitude", "longitude", "obstacle_type"]):
        return jsonify({"error": "Missing required parameters"}), 400
    
    try:
        obstacle = Obstacle(
            latitude=data["latitude"],
            longitude=data["longitude"],
            obstacle_type=data["obstacle_type"],
            description=data.get("description"),
            reported_by=data.get("reported_by")
        )
        
        db.session.add(obstacle)
        db.session.commit()
        
        return jsonify({"message": "Obstacle reported successfully", "id": obstacle.id}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@main.route("/api/accessibility_features", methods=["GET"])
def get_accessibility_features():
    """
    Get all accessibility features.
    Returns a list of accessibility feature objects.
    """
    features = AccessibilityFeature.query.all()
    return jsonify({"features": [feature.to_dict() for feature in features]})
