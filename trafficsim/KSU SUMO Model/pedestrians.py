# File: pedestrians.py
import traci
import config
import random
import routing
import get_coordinates_occupancy


def spawn_pedestrians():
    """Spawn pedestrians dynamically based on building occupancy."""
    net = routing.get_network()

    spawning_data = get_coordinates_occupancy.connect_and_fetch()  # gets starting coordinates and occupancy data from database

    # Convert GPS coordinates to SUMO edges
    dest_edge, dest_edge_position, _ = routing.get_edge_from_gps(*config.DESTINATION_LOCATION)

    building_count = 0 # used to identify how many location information rows were pulled from database
    pedestrians_count = 0 #used to keep track of pedestrians to ensure no duplicates during a simulation rum
    for row in spawning_data:
        start_lat = spawning_data[building_count][2]
        start_lon = spawning_data[building_count][3]
        cur_edge, cur_edge_position, _ = routing.get_edge_from_gps(start_lat, start_lon)
        for i in range(spawning_data[building_count][6]): # gets building occupancy information
            ped_id = f"ped_{pedestrians_count + 1}"
            route_edges = routing.find_route(cur_edge, dest_edge)

            # Add pedestrian to SUMO
            traci.person.add(
                personID=ped_id,
                edgeID=cur_edge,
                pos=cur_edge_position,
                typeID="ped_pedestrian",
                depart=random.randint(5, 900)
            )

            # Assign walking route
            traci.person.appendWalkingStage(
                personID=ped_id,
                edges=route_edges,
                arrivalPos=dest_edge_position,
                duration=600
            )
            pedestrians_count += 1
        building_count += 1
