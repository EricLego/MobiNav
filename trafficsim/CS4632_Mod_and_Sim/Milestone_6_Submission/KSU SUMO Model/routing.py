import traci
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
    route_options = [1, 3, 5] # Bias towards best routing types (1 = shortes path, 3 = shortest path with consideration of congestion conditions, 5 = shorted path using historical data)
    route_weights = [0.5, 0.3, 0.2]

    for attempt in range(3):
        route_type = random.choices(route_options, weights=route_weights)[0]
        route = traci.simulation.findRoute(start_edge, end_edge, vType="ped_pedestrian", depart=0, routingMode=route_type)

        filtered_route = [edge for edge in route.edges if not edge.startswith(":") and edge not in config.congested_lanes]

        if filtered_route:
            return filtered_route

    return [start_edge, end_edge]