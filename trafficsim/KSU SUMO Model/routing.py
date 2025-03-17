# File: routing.py
import traci
import sumolib
import config
import random

def get_network():
    """Load SUMO network file."""
    return sumolib.net.readNet(config.NET_FILE)

def get_edge_from_gps(lat, lon):
    """Convert GPS coordinates to SUMO network edge."""
    adjustment = float(0.0005) #adjust GPS coordinates slightly to ensure SUMS does not identify a junction instead of an edge
    lat = float(lat) + adjustment
    lon = float(lon) + adjustment
    return traci.simulation.convertRoad(lon, lat, isGeo=1)

def find_route(start_edge, end_edge):
    """Find a route between two edges."""
    route_type =random.randint(0,4) #assigns random routing type
    route = traci.simulation.findRoute(start_edge, end_edge, vType="ped_pedestrian", depart=0, routingMode=route_type)
    return [edge for edge in route.edges if not edge.startswith(":")]  # Remove internal edges
