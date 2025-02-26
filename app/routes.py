# Need to edit APIs to make sure that the routing works. 
# This is the main file for the APIs and routing.

from flask import Blueprint, request, jsonify
import os
import requests

main = Blueprint("main", __name__)

# Load API key from environment variables
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
if not GOOGLE_MAPS_API_KEY:
    raise ValueError("Missing GOOGLE_MAPS_API_KEY environment variable")

def get_google_route(start, end):
    """
    Fetches an optimized route from Google Maps Directions API.
    :param start: Starting location (latitude,longitude)
    :param end: Destination location (latitude,longitude)
    :return: List of route coordinates
    """
    base_url = "https://maps.googleapis.com/maps/api/directions/json"
    
    params = {
        "origin": f"{start[0]},{start[1]}",
        "destination": f"{end[0]},{end[1]}",
        "mode": "walking",  # Change to 'driving' or 'bicycling' if needed
        "key": GOOGLE_MAPS_API_KEY
    }

    response = requests.get(base_url, params=params)
    data = response.json()

    if data["status"] == "OK":
        route = data["routes"][0]["legs"][0]["steps"]
        route_coords = [(step["start_location"]["lat"], step["start_location"]["lng"]) for step in route]
        route_coords.append((route[-1]["end_location"]["lat"], route[-1]["end_location"]["lng"]))  # Add final destination
        return route_coords
    else:
        return {"error": f"Google API Error: {data['status']}"}

def get_osrm_route(start, end):
    """
    Fetches an optimized route using OSRM API.
    :param start: (latitude, longitude)
    :param end: (latitude, longitude)
    :return: List of route coordinates
    """
    osrm_url = f"http://router.project-osrm.org/route/v1/foot/{start[1]},{start[0]};{end[1]},{end[0]}?overview=full&geometries=geojson"

    response = requests.get(osrm_url)
    data = response.json()

    print("OSRM API Response:", data)  # Debugging line

    if "routes" in data and len(data["routes"]) > 0:
        route_coords = data["routes"][0]["geometry"]["coordinates"]
        return [(coord[1], coord[0]) for coord in route_coords]  # Convert [lng, lat] → [lat, lng]
    else:
        return {"error": "OSRM API Error or No Route Found"}

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
