# File: routing.py
import traci
import sumolib
import config

def get_network():
    """Load SUMO network file."""
    return sumolib.net.readNet(config.NET_FILE)

def get_edge_from_gps(lat, lon):
    """Convert GPS coordinates to SUMO network edge."""
    return traci.simulation.convertRoad(lon, lat, isGeo=1)

def find_route(start_edge, end_edge):
    """Find a pedestrian route between two edges."""
    route = traci.simulation.findRoute(start_edge, end_edge, vType="ped_pedestrian", depart=0, routingMode=0)
    return [edge for edge in route.edges if not edge.startswith(":")]  # Remove internal edges
