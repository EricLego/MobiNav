# File: pedestrians.py
import traci
import config
import random
import routing
import get_coordinates_occupancy
import get_buildings_list

def spawn_pedestrians():
    """Spawn pedestrians dynamically based on building occupancy."""
    net = routing.get_network()

    building_data = get_buildings_list.connect_and_fetch() #gets list of available buildings
    start_lat, start_lon = building_data[1][7], building_data[1][8]
    start_edge, start_edge_position, _ = routing.get_edge_from_gps(start_lat, start_lon)
    end_lat, end_lon = building_data[4][7], building_data[4][8]
    end_edge, end_edge_position, _ = routing.get_edge_from_gps(end_lat, end_lon)
    route_edges = routing.find_route(start_edge, end_edge)
    speed = random.uniform(0.7, 1.2)
    print(f"From {building_data[1][1]} to {building_data[4][1]}")
    print(f"From {start_edge} to {end_edge}")

    try:
        # Add pedestrian to SUMO
        traci.person.add(
            personID='ped_01',
            edgeID=start_edge,
            pos=start_edge_position,
            typeID="ped_pedestrian",
            depart=random.randint(5, 150)
        )

        # Assign walking route
        traci.person.setSpeed('ped_01', speed)
        traci.person.appendWalkingStage(
            personID='ped_01',
            edges=route_edges,
            arrivalPos=end_edge_position,
            #duration=600
        )

    except traci.TraCIException as e:
        print(f"Skipping ped_01 due to error: {e}")

