import traci
import sumolib
import config
import random
from functools import lru_cache

@lru_cache(maxsize=5000)  # Cache GPS-to-edge lookups
def get_edge_from_gps(lat, lon):

    # Convert GPS coordinates to SUMO network edge.
    adjustment = 0.0004 #small adjustment to move off any internal edges / junctions that will cause error.

    # Convert Decimal to float for conversion
    lat = float(lat)
    lon = float(lon)

    return traci.simulation.convertRoad(lon + adjustment, lat + adjustment, isGeo=True)

def find_route(start_edge, end_edge):
    #Find the routes between two edges.
    route_type = random.choices([1, 3, 5], weights=[0.5, 0.3, 0.2])[0]  # Bias towards best routing types (1 = shortes path, 3 = shortest path with consideration of congestion conditions, 5 = shorted path using historical data)
    route = traci.simulation.findRoute(start_edge, end_edge, vType="ped_pedestrian", depart=0, routingMode=route_type)
    return [edge for edge in route.edges if not edge.startswith(":")]